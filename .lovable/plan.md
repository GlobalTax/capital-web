
## Plan: hacer la importación resiliente para que no se pare

### Qué está pasando
La importación ya usa lotes de 25 y reintento en sublotes de 5, pero sigue teniendo dos problemas:
1. Si un lote falla del todo, `addCompanies` lanza error y corta la importación completa.
2. No hay pausa entre lotes, así que con ficheros grandes se sigue presionando demasiado a Supabase.
3. `handleConfirmImport` trata la importación como una sola operación “todo o nada”, así que no refleja bien un escenario de avance parcial.

### Enfoque
Cambiar la importación a un modelo de “seguir aunque tarde”:
- procesar en lotes pequeños
- meter una pequeña espera entre lotes
- no abortar toda la importación por un lote fallido
- acumular insertadas, omitidas y errores
- mantener el progreso visible hasta terminar todo el archivo

### Cambios a implementar

#### 1) `src/hooks/useContactLists.ts`
Rehacer `addCompanies` para que devuelva un resultado acumulado en vez de fallar en cuanto un lote dé error:
- mantener lote principal pequeño
- añadir delay entre lotes
- si falla el lote principal, dividirlo en sublotes aún menores
- si incluso un sublote falla, registrar el error y seguir con el siguiente
- reportar progreso real tras cada lote/sublote

Resultado esperado del mutation:
```ts
{
  inserted: number;
  failed: number;
  errors: Array<{ startIndex: number; count: number; message: string }>;
}
```

#### 2) `src/pages/admin/ContactListDetailPage.tsx`
Adaptar `handleConfirmImport` para trabajar con ese resultado parcial:
- no asumir que todo entra correctamente
- mantener `importProgress` vivo durante toda la subida
- al finalizar, mostrar resultado real:
  - cuántas empresas se importaron
  - cuántas no se pudieron insertar
  - detalle resumido de errores
- actualizar `outbound_lists.updated_at` aunque el proceso haya sido parcial pero haya insertado filas
- envolver el flujo en `try/catch/finally` para que nunca se quede la UI bloqueada

#### 3) Resultado visible para el usuario
Aprovechar el modal actual de preview/import para que quede claro que:
- la importación sigue avanzando por bloques
- puede tardar varios minutos con Excels grandes
- aunque un bloque falle, el resto continúa

Si hace falta, ajustar el texto del progreso a algo como:
- “Importando lote X de Y”
- “Subiendo empresas: 325 / 4.820”

### Detalle técnico
La clave es pasar de una importación “transaccional” a una importación “resiliente por lotes”:

```text
archivo validado
  -> lote 1
  -> pausa corta
  -> lote 2
     -> si falla: sublotes
     -> si un sublote falla: registrar error y seguir
  -> lote 3
  ...
  -> resumen final
```

Esto evita que un timeout o una fila problemática tumben todo el proceso.

### Archivos a modificar
- `src/hooks/useContactLists.ts`
- `src/pages/admin/ContactListDetailPage.tsx`

### Resultado esperado
Después del cambio, la importación podrá tardar más, pero seguirá avanzando de forma estable y el usuario verá progreso real hasta el final, incluso si algunos bloques fallan.