

## Fix deduplicación + marcado automático de nuevos duplicados

### Problema actual
La lógica de protección global impide eliminar duplicados reales: si el contacto A es "keeper" en el grupo de email pero también aparece como duplicado en el grupo de teléfono (donde B es el keeper), A queda protegido y ambos sobreviven. No se eliminan duplicados en la práctica.

### Solución: dos partes

---

**Parte 1: Reescribir la lógica de deduplicación (client-side)**

**Archivo: `src/components/admin/contacts-v2/DuplicatesDialog.tsx`**

Cambiar de "grupos independientes" a **componentes conectados** (union-find):

1. Construir un grafo donde dos contactos están conectados si comparten email, CIF o teléfono normalizado
2. Encontrar componentes conectados (clusters)
3. Cada cluster = 1 entidad real → conservar el mejor registro (más campos + más reciente), eliminar el resto
4. Mostrar los clusters en el diálogo con el campo(s) que coinciden
5. Al eliminar, simplemente soft-delete todos menos el elegido por cluster — sin protección cruzada porque cada contacto pertenece a exactamente 1 cluster

Esto garantiza que si A=B por email y B=C por teléfono, los tres se agrupan juntos y solo queda 1.

---

**Parte 2: Marcar nuevos duplicados automáticamente**

**Migración SQL**: Añadir columna `is_possible_duplicate BOOLEAN DEFAULT false` a `company_valuations` y `contact_leads`.

**Trigger SQL** en ambas tablas: al insertar un nuevo registro, comprobar si ya existe otro con mismo email (normalizado), CIF o teléfono. Si hay coincidencia, marcar `is_possible_duplicate = true` en el nuevo registro.

```sql
CREATE OR REPLACE FUNCTION mark_duplicate_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM company_valuations 
    WHERE id != NEW.id AND is_deleted = false
    AND (LOWER(email) = LOWER(NEW.email) 
      OR (cif IS NOT NULL AND cif = NEW.cif)
      OR (phone IS NOT NULL AND phone = NEW.phone))
    LIMIT 1
  ) OR EXISTS (
    SELECT 1 FROM contact_leads
    WHERE id != NEW.id AND is_deleted = false  
    AND (LOWER(email) = LOWER(NEW.email)
      OR (cif IS NOT NULL AND cif = NEW.cif)
      OR (phone IS NOT NULL AND phone = NEW.phone))
    LIMIT 1
  ) THEN
    NEW.is_possible_duplicate := true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**UI**: En la tabla de contactos (ContactRow), mostrar un indicador visual (badge naranja "Duplicado") cuando `is_possible_duplicate = true`. Añadir el campo al tipo `Contact` y al transform.

---

### Resultado
- El botón "Duplicados" ahora sí elimina todos los duplicados dejando exactamente 1 por entidad
- Los nuevos leads que entren duplicados quedarán marcados automáticamente con un badge visible

