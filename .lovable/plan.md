
## Plan: hacer que el Excel de 12.500 empresas vuelva a subir poco a poco

### Qué he encontrado
No parece haber una sola causa. Hay dos problemas mezclados:

1. **Siguen existiendo timeouts de base de datos** durante la importación masiva.
2. **Hay filas con valores numéricos que rompen la inserción**, por ejemplo:
   - `>€195M`
   - `30B`

Ahora mismo el importador solo entiende números “simples” en formato español. Cuando encuentra esos valores, Postgres devuelve `invalid input syntax for type numeric` y falla el bloque.

Además, la importación resiliente actual tiene una limitación importante:
- si falla un **sub-lote de 3 filas**, se marcan las 3 como fallidas
- no baja a **fila individual**
- así que una sola fila mala puede arrastrar varias buenas

### Qué voy a cambiar

#### 1) Robustecer el parseo de números del Excel
Actualizar el parser para aceptar formatos habituales de datasets grandes:
- símbolos y prefijos: `€`, `$`, `>`, `<`, `~`
- sufijos de magnitud:
  - `K` = miles
  - `M` = millones
  - `B` = miles de millones
- comas y puntos mezclados
- espacios y textos decorativos

Ejemplos:
```text
>€195M  -> 195000000
30B     -> 30000000000
1,2M    -> 1200000
2.500k  -> 2500000
```

Si un valor sigue siendo imposible de interpretar, no debe tumbar el lote:
- se convertirá a `null` o
- se registrará como error de fila, según el campo

#### 2) Hacer la importación realmente resiliente
En `useContactLists.ts`, ampliar la estrategia actual:

```text
lote 10
  -> si falla
     sublotes de 3
       -> si falla
          filas de 1 en 1
```

Así:
- una fila mala no bloquea otras 2 buenas
- una fila con timeout o dato corrupto no para la importación completa
- el proceso seguirá avanzando lentamente, pero avanzando

#### 3) Mejorar el resumen de errores reales
En `ContactListDetailPage.tsx`:
- mostrar también los errores que ocurren **durante inserción**
- no solo los de validación previa
- indicar cuántas han entrado, cuántas se han omitido y por qué

Esto ayudará a distinguir:
- “fila mala por dato”
- “fallo puntual por timeout”
- “duplicado”
- “error de base de datos”

#### 4) Mantener el ritmo lento pero estable
Conservar la importación por bloques pequeños, pero preparada para volúmenes grandes:
- lote principal pequeño
- pausa entre lotes
- progreso visible constante
- continuación aunque haya errores parciales

No cambiaría el enfoque a “todo de golpe”; lo correcto aquí es que vaya **subiendo poco a poco**.

### Archivos a tocar
- `src/pages/admin/ContactListDetailPage.tsx`
  - mejorar `parseSpanishNumber`
  - pasar mejor detalle de errores al resultado final
- `src/hooks/useContactLists.ts`
  - añadir fallback hasta fila individual
  - devolver errores más precisos por fila/bloque

### Resultado esperado
Después de esto:
- el Excel grande podrá seguir importándose gradualmente
- valores como `>€195M` o `30B` ya no romperán la subida
- si hay filas realmente malas, se saltarán sin bloquear el resto
- verás progreso real hasta el final, aunque tarde bastante

### Nota técnica
El warning de React sobre `React.Fragment` que aparece en consola no es la causa del fallo de importación. Es ruido aparte y no está relacionado con la subida del Excel.
