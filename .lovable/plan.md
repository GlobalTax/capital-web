
## Eliminar a Marc (marc@capittal.es)

### Accion
Eliminar el registro de **Marc** (`marc@capittal.es`, rol: asesor) de la tabla `email_recipients_config`.

### Detalle tecnico
Ejecutar un DELETE sobre `email_recipients_config` con id `937bee85-f4ab-427f-9d49-1c2dbcbaea00`.

```sql
DELETE FROM email_recipients_config WHERE id = '937bee85-f4ab-427f-9d49-1c2dbcbaea00';
```

### Notas
- No tiene registros en `team_members`, solo en `email_recipients_config`.
- Albert ya fue eliminado previamente por el usuario.
- No hay cambios de esquema, solo eliminacion de datos.
