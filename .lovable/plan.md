

# Plan: Corregir Error 400 en Query de cr_portfolio

## Diagnostico

La query en `useCRPortfolioList.ts` usa un join con sintaxis de foreign key:
```
pe_sector_taxonomy!cr_portfolio_sector_pe_fkey(name_es)
```

Pero **no existe** ninguna foreign key constraint entre `cr_portfolio.sector_pe` y `pe_sector_taxonomy.id` en la base de datos. PostgREST devuelve 400 porque no puede resolver esa referencia.

Ambas columnas son de tipo `text`, por lo que el FK es viable.

## Solucion

### Migracion SQL

Crear la foreign key que falta:

```sql
ALTER TABLE cr_portfolio
ADD CONSTRAINT cr_portfolio_sector_pe_fkey
FOREIGN KEY (sector_pe) REFERENCES pe_sector_taxonomy(id)
ON DELETE SET NULL;
```

Esto permite que PostgREST resuelva el join automaticamente sin cambiar ninguna linea de codigo TypeScript.

## Archivos a Modificar

| Recurso | Cambio |
|---------|--------|
| SQL Migration | Crear constraint `cr_portfolio_sector_pe_fkey` |

No se requieren cambios en el codigo TypeScript. El hook `useCRPortfolioList.ts` ya esta escrito correctamente -- solo faltaba la constraint en la base de datos.

## Verificacion

Tras la migracion, la query a `/admin/cr-directory` dejara de devolver 400 y mostrara los nombres de sector PE resueltos desde `pe_sector_taxonomy.name_es`.

