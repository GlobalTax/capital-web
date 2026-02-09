

## Fix: "Guardar valoracion" falla con "value too long for type character varying(32)"

### Causa raiz confirmada

La columna `unique_token` en la tabla `company_valuations` esta definida como `varchar(32)`.

Existe un trigger (`set_valuation_signed_token`) que se ejecuta en cada INSERT. Si `unique_token` es NULL, llama a `generate_signed_valuation_token()` que genera un token en formato:

```
uuid|timestamp|hmac_signature_base64
```

Ejemplo: `550e8400-e29b-41d4-a716-446655440000|1707483600.123|base64sig...`

Esto produce un string de 100+ caracteres que no cabe en varchar(32).

Cuando el admin usa la calculadora manual:

1. El frontend inserta en `company_valuations` SIN `unique_token` (es NULL)
2. El trigger dispara `generate_signed_valuation_token()` que genera un token largo
3. El token no cabe en varchar(32) y Postgres lanza el error
4. El fallback (Edge Function `submit-valuation`) genera su propio token de exactamente 32 chars, pero tambien falla porque la Edge Function tambien intenta insertar y el mismo trigger se dispara si el token no se setea antes

### Solucion

**1. Migracion SQL: Cambiar `unique_token` de `varchar(32)` a `text`**

```sql
ALTER TABLE company_valuations ALTER COLUMN unique_token TYPE text;
```

Esto permite que tanto los tokens firmados del trigger (largos) como los tokens de 32 chars de la Edge Function funcionen sin conflicto.

No se pierden datos existentes (todos los tokens actuales son de 32 chars y siguen siendo validos).

**2. No se toca codigo**

- El frontend, hooks, edge functions y trigger siguen igual
- Los tokens existentes de 32 chars siguen funcionando
- Los nuevos tokens firmados (mas largos) tambien funcionaran
- Los filtros, paginacion, y toda la UI quedan intactos

### Validacion

- Caso A: Insert directo desde frontend (sin unique_token) -> trigger genera token firmado largo -> ahora cabe en `text` -> funciona
- Caso B: Edge Function genera token de 32 chars -> sigue funcionando
- Caso C: Registros historicos con tokens de 32 chars -> sin cambios

### Archivo afectado

- 1 migracion SQL (ALTER TABLE)
- 0 archivos de codigo modificados

