
# Arreglar pérdida de contactos asignados en tab "Compradores"

## Causa raíz exacta (confirmada en DB)

### El mecanismo de pérdida de datos

La arquitectura usa `mandato_contactos` para almacenar el contacto asignado a cada comprador en un mandato:

```
mandato_contactos
  mandato_id  → mandatos(id)   ON DELETE CASCADE
  contacto_id → contactos(id)  ON DELETE CASCADE  ← PROBLEMA
  rol = 'comprador'
```

**El flujo exacto que causa la pérdida:**

1. Usuario asigna contacto `jlozano@becsa.es` (id: `aa8225d1`) a un comprador del mandato → INSERT en `mandato_contactos`
2. El usuario (o un proceso de limpieza) **elimina** ese contacto de la tabla `contactos`
3. La FK con `ON DELETE CASCADE` elimina la fila de `mandato_contactos` silenciosamente
4. Usuario importa nuevamente `jlozano@becsa.es` → nuevo id `e3cc2a62`
5. El nuevo contacto **NO está vinculado** al mandato → aparece que "desapareció"

### Evidencia directa en los logs

El `audit_logs` muestra el patrón exacto el 2026-02-16:
- `07:57:15` → DELETE contacto `aa8225d1` (jlozano@becsa.es) **que tenía mandato_contactos con mandato b0faf597**
- `07:58:01` → DELETE contacto `e606e965` (Juan Ignacio Colado Sosa)
- `07:59:40` → INSERT contacto nuevo `e3cc2a62` (jlozano@becsa.es, con nuevo id)
- `08:20:07` → DELETE contacto `8c12e7ed` (mcontreras@azvi.es) **que también tenía mandato_contactos**

El mismo usuario `4cd56d34` elimina contactos que previamente estaban asignados como compradores, y luego los re-importa. El CASCADE los borra silenciosamente del mandato.

### Por qué ocurren las eliminaciones

El patrón de uso es: el usuario importa contactos para el mandato, detecta datos incorrectos (emails `xxxxx@gmail.com`, `fffff@gmail.com` de prueba visibles en los datos), los borra, y los re-importa correctamente. Pero los que ya estaban asignados como compradores se pierden.

### Confirmación numérica

Hay **96 rows** en `mandato_contactos` con rol `comprador`, distribuidos en **18 mandatos**. Cada DELETE de un contacto que aparece en esa tabla destruye silenciosamente la vinculación.

---

## Solución completa

### Nivel 1: Cambiar ON DELETE CASCADE → ON DELETE RESTRICT (prevención)

Esta es la corrección más importante. En lugar de borrar la fila de `mandato_contactos` cuando se elimina el contacto, la base de datos debe **bloquear** el DELETE si el contacto está vinculado a mandatos.

```sql
-- Migración: cambiar el comportamiento de la FK
ALTER TABLE mandato_contactos
DROP CONSTRAINT mandato_contactos_contacto_id_fkey;

ALTER TABLE mandato_contactos
ADD CONSTRAINT mandato_contactos_contacto_id_fkey
FOREIGN KEY (contacto_id)
REFERENCES contactos(id)
ON DELETE RESTRICT;   -- Bloquea el DELETE si hay vinculaciones activas
```

**Impacto**: cuando el usuario intente borrar un contacto que está asignado a un mandato, recibirá un error de FK. El frontend debe manejar este error con un mensaje claro: "Este contacto está asignado como comprador en X mandatos. Desvinculalo primero."

### Nivel 2: Trigger de auditoría en mandato_contactos

Tabla `mandato_contactos_audit_log` + trigger `BEFORE DELETE` para registrar qué se borró y quién lo borró:

```sql
CREATE TABLE IF NOT EXISTS mandato_contactos_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandato_contactos_id UUID,
  mandato_id UUID NOT NULL,
  contacto_id UUID NOT NULL,
  rol TEXT,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'DELETE')),
  performed_by UUID,
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  deletion_reason TEXT,        -- 'manual', 'contacto_deleted' (from FK cascade)
  contacto_snapshot JSONB     -- Copy of the contacto data at time of deletion
);

CREATE INDEX idx_mc_audit_mandato ON mandato_contactos_audit_log(mandato_id);
CREATE INDEX idx_mc_audit_contacto ON mandato_contactos_audit_log(contacto_id);
CREATE INDEX idx_mc_audit_date ON mandato_contactos_audit_log(performed_at DESC);
```

```sql
-- Trigger que registra ANTES de cada delete
CREATE OR REPLACE FUNCTION audit_mandato_contactos_delete()
RETURNS TRIGGER AS $$
DECLARE
  v_contacto RECORD;
BEGIN
  SELECT nombre, email, cargo INTO v_contacto
  FROM contactos WHERE id = OLD.contacto_id;
  
  INSERT INTO mandato_contactos_audit_log (
    mandato_contactos_id, mandato_id, contacto_id, rol, action,
    performed_by, deletion_reason, contacto_snapshot
  ) VALUES (
    OLD.id, OLD.mandato_id, OLD.contacto_id, OLD.rol, 'DELETE',
    auth.uid(),
    CASE WHEN NOT EXISTS (SELECT 1 FROM contactos WHERE id = OLD.contacto_id)
         THEN 'contacto_deleted'
         ELSE 'manual'
    END,
    to_jsonb(v_contacto)
  );
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_mandato_contactos_before_delete
BEFORE DELETE ON mandato_contactos
FOR EACH ROW
EXECUTE FUNCTION audit_mandato_contactos_delete();
```

**Nota**: Con `ON DELETE RESTRICT` en vigor, el trigger de auditoría para `contacto_deleted` ya no debería dispararse en condiciones normales. Sirve como doble protección.

### Nivel 3: Hook `useMandatoContactosAudit.ts`

Hook que consulta `mandato_contactos_audit_log` para el mandato dado, permitiendo al usuario ver el historial y restaurar vinculaciones perdidas.

```typescript
export function useMandatoContactosAudit(mandatoId: string | undefined) {
  // useQuery: SELECT * FROM mandato_contactos_audit_log WHERE mandato_id = mandatoId ORDER BY performed_at DESC
  
  // restoreContactoMutation:
  //   1. Verificar que el contacto aún existe en contactos
  //   2. Si no existe: buscar por email en contacto_snapshot → encontrar nuevo contacto → INSERT con nuevo contacto_id
  //   3. Si existe: INSERT en mandato_contactos con contacto_id original
  //   4. Registrar restauración en audit_log
  
  return { auditLog, isLoading, restoreContacto, isRestoring };
}
```

### Nivel 4: Panel de auditoría en la UI del mandato

Añadir una sección "Historial" o un banner de advertencia en el tab "Compradores" cuando hay entradas en `mandato_contactos_audit_log` con `action = 'DELETE'` recientes.

```text
┌─────────────────────────────────────────────────────┐
│ ⚠️ 2 contactos eliminados recientemente             │
│                                                     │
│ jlozano@becsa.es     16 feb    [Restaurar]          │
│ mcontreras@azvi.es   16 feb    [Restaurar]          │
│                                          [Ver todo] │
└─────────────────────────────────────────────────────┘
```

---

## Archivos a crear/modificar

| Archivo | Operación | Descripción |
|---------|-----------|-------------|
| Migración SQL | Crear | RESTRICT + audit table + trigger |
| `src/hooks/useMandatoContactosAudit.ts` | Crear | Hook para audit log + restore |
| `src/components/admin/mandatos/MandatoContactosAuditBanner.tsx` | Crear | Banner de advertencia con botón restaurar |
| `src/hooks/useContactoDelete.ts` | Crear (o modificar componente existente) | Wrapper que verifica mandato_contactos antes de deletear |

---

## Migración SQL completa

```sql
-- PASO 1: Cambiar ON DELETE CASCADE → ON DELETE RESTRICT en mandato_contactos
ALTER TABLE mandato_contactos
  DROP CONSTRAINT mandato_contactos_contacto_id_fkey;

ALTER TABLE mandato_contactos
  ADD CONSTRAINT mandato_contactos_contacto_id_fkey
  FOREIGN KEY (contacto_id)
  REFERENCES contactos(id)
  ON DELETE RESTRICT;

-- PASO 2: Tabla de auditoría
CREATE TABLE IF NOT EXISTS mandato_contactos_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandato_contactos_id UUID,
  mandato_id UUID NOT NULL,
  contacto_id UUID NOT NULL,
  rol TEXT,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'DELETE', 'RESTORE')),
  performed_by UUID,
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  deletion_reason TEXT,
  contacto_snapshot JSONB
);

CREATE INDEX idx_mc_audit_mandato_id ON mandato_contactos_audit_log(mandato_id);
CREATE INDEX idx_mc_audit_contacto_id ON mandato_contactos_audit_log(contacto_id);
CREATE INDEX idx_mc_audit_performed_at ON mandato_contactos_audit_log(performed_at DESC);

-- RLS
ALTER TABLE mandato_contactos_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can read audit log"
  ON mandato_contactos_audit_log FOR SELECT
  TO authenticated
  USING (current_user_can_read());

CREATE POLICY "Trigger can insert audit log"
  ON mandato_contactos_audit_log FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- PASO 3: Trigger de auditoría en DELETE
CREATE OR REPLACE FUNCTION audit_mandato_contactos_delete()
RETURNS TRIGGER AS $$
DECLARE
  v_contacto JSONB;
BEGIN
  SELECT to_jsonb(c) INTO v_contacto
  FROM contactos c WHERE c.id = OLD.contacto_id;

  INSERT INTO mandato_contactos_audit_log (
    mandato_contactos_id,
    mandato_id,
    contacto_id,
    rol,
    action,
    performed_by,
    deletion_reason,
    contacto_snapshot
  ) VALUES (
    OLD.id,
    OLD.mandato_id,
    OLD.contacto_id,
    OLD.rol,
    'DELETE',
    auth.uid(),
    'manual',
    v_contacto
  );
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_mandato_contactos_before_delete
BEFORE DELETE ON mandato_contactos
FOR EACH ROW
EXECUTE FUNCTION audit_mandato_contactos_delete();

-- PASO 4: Trigger de auditoría en INSERT (para completar historial)
CREATE OR REPLACE FUNCTION audit_mandato_contactos_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO mandato_contactos_audit_log (
    mandato_contactos_id, mandato_id, contacto_id, rol, action, performed_by
  ) VALUES (
    NEW.id, NEW.mandato_id, NEW.contacto_id, NEW.rol, 'INSERT', auth.uid()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_mandato_contactos_after_insert
AFTER INSERT ON mandato_contactos
FOR EACH ROW
EXECUTE FUNCTION audit_mandato_contactos_insert();
```

---

## Manejo de errores en el frontend al eliminar contactos

El cambio a `ON DELETE RESTRICT` hará que `DELETE FROM contactos WHERE id = X` falle con error de FK si ese contacto está en `mandato_contactos`. El frontend necesita manejar este error con un mensaje útil.

El archivo que maneja la eliminación de contactos debe capturar el error de FK (código `23503`) y mostrar:

> "Este contacto está asignado como comprador en uno o más mandatos. Ve a la pestaña de Compradores del mandato y desvincula el contacto antes de eliminarlo."

Buscaremos el código que hace `DELETE` de contactos para añadir este manejo de error.

---

## Hook `useMandatoContactosAudit.ts`

```typescript
export function useMandatoContactosAudit(mandatoId: string | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: auditLog = [], isLoading } = useQuery({
    queryKey: ['mandato-contactos-audit', mandatoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mandato_contactos_audit_log')
        .select('*')
        .eq('mandato_id', mandatoId!)
        .order('performed_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!mandatoId,
  });

  // Entries where a contact was deleted (lost)
  const deletedContacts = auditLog.filter(
    entry => entry.action === 'DELETE' &&
    !auditLog.some(e => e.action === 'RESTORE' && e.contacto_id === entry.contacto_id && e.performed_at > entry.performed_at)
  );

  const restoreMutation = useMutation({
    mutationFn: async (entry: AuditEntry) => {
      // 1. Find current contacto by contacto_id or by email from snapshot
      let contactoId = entry.contacto_id;
      const { data: existing } = await supabase
        .from('contactos')
        .select('id')
        .eq('id', contactoId)
        .single();
      
      if (!existing) {
        // Contacto was deleted, try to find by email from snapshot
        const email = entry.contacto_snapshot?.email;
        if (email) {
          const { data: byEmail } = await supabase
            .from('contactos')
            .select('id')
            .eq('email', email)
            .single();
          if (byEmail) contactoId = byEmail.id;
          else throw new Error(`Contacto con email ${email} no encontrado. Créalo primero.`);
        } else {
          throw new Error('No se puede restaurar: contacto eliminado y sin email en el snapshot.');
        }
      }

      // 2. Re-insert mandato_contactos
      const { error } = await supabase
        .from('mandato_contactos')
        .insert({ mandato_id: mandatoId, contacto_id: contactoId, rol: entry.rol || 'comprador' });
      if (error) throw error;

      // 3. Log the restore
      await supabase.from('mandato_contactos_audit_log').insert({
        mandato_id: mandatoId,
        contacto_id: contactoId,
        rol: entry.rol,
        action: 'RESTORE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mandato-contactos-audit', mandatoId] });
      queryClient.invalidateQueries({ queryKey: ['mandato-contactos', mandatoId] });
      toast({ title: '✅ Contacto restaurado correctamente' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error al restaurar', description: error.message, variant: 'destructive' });
    },
  });

  return { auditLog, deletedContacts, isLoading, restoreContacto: restoreMutation.mutate, isRestoring: restoreMutation.isPending };
}
```

---

## Componente `MandatoContactosAuditBanner.tsx`

Panel compacto que se muestra arriba del tab "Compradores" si hay contactos perdidos:

```text
┌─────────────────────────────────────────────────────────────────┐
│ ⚠️ Contactos eliminados recientemente (2)                       │
│ Se detectaron contactos que fueron desasignados por eliminación. │
├──────────────────────────────────────┬──────────────┬───────────┤
│ jlozano@becsa.es                     │ 16 feb 07:58 │ [Restaurar]│
│ mcontreras@azvi.es                   │ 16 feb 08:20 │ [Restaurar]│
└──────────────────────────────────────┴──────────────┴───────────┘
```

---

## Resumen de cambios

- **1 migración SQL**: Cambia la FK de CASCADE → RESTRICT, crea tabla de auditoría y 2 triggers (INSERT + DELETE)
- **1 hook nuevo**: `src/hooks/useMandatoContactosAudit.ts` — consulta audit log + función de restauración
- **1 componente nuevo**: `src/components/admin/mandatos/MandatoContactosAuditBanner.tsx` — banner de alerta + botón restaurar
- **Identificar y modificar el componente de eliminación de contactos**: añadir manejo del error FK `23503` con mensaje en español

## Lo que NO cambia

- `mandato_contactos` en sí: misma estructura, solo cambia el comportamiento de FK
- Las vinculaciones existentes válidas: el RESTRICT solo bloquea futuros DELETEs
- `merge_contactos`: la función ya hace `UPDATE mandato_contactos SET contacto_id = p_target_id` correctamente antes de borrar el source — pero ahora el `DELETE FROM mandato_contactos WHERE contacto_id = p_source_id` es el cleanup de filas no movidas (duplicados), que es correcto. Si existe una fila duplicada, la merge function ya la maneja: `DELETE FROM mandato_contactos WHERE contacto_id = p_source_id` solo borra las que NO se pudieron mover (conflicto único). Con RESTRICT, estos deletes sí podrían fallar si quedan filas que no se pudieron reasignar. Se necesita ajustar el merge_contactos para manejar este edge case.

**Ajuste a `merge_contactos`**: en lugar de `DELETE FROM mandato_contactos WHERE contacto_id = p_source_id` al final, usar DELETE solo de las filas que ya tienen duplicado en target (las que no se pudieron mover). Con la nueva FK RESTRICT, el DELETE fallaría si hay filas pendientes. La función debe usar `DELETE FROM mandato_contactos WHERE contacto_id = p_source_id AND mandato_id IN (SELECT mandato_id FROM mandato_contactos WHERE contacto_id = p_target_id)` — exactamente las que son duplicadas y ya fueron preservadas en el target.

La migración incluirá también este fix al `merge_contactos`.
