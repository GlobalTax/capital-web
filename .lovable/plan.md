
He revisado el código, la consulta a Supabase y el estado actual de `topbar_group_companies`.

Problema real:
- El cambio anterior se hizo sobre la fila equivocada.
- Ahora mismo en base de datos existen estas filas:
  - `Capittal` → `https://capittal.es`
  - `Navarro Tax & Legal` → `https://nvrro.es/`
  - `Global.nrro` → `https://global.nrro.es/`
- En el dropdown, el enlace que sigues viendo con error es `Global.nrro`, y esa fila todavía apunta a `https://global.nrro.es/`.

Además, he detectado un warning aparte en `TopBar.tsx`:
- `Invalid prop supplied to React.Fragment`
- No parece ser la causa del enlace incorrecto, pero conviene corregirlo porque ensucia consola y puede romper atributos inyectados por Lovable.

Plan corregido:

1. Corregir el dato correcto en Supabase
- Actualizar la fila `Global.nrro` para que su `url` sea `https://nvrro.es/`.
- No tocar `Navarro Tax & Legal` si también debe seguir apuntando a esa misma URL.

2. Revisar si debe haber dos entradas o una sola
- Si quieres mantener ambas opciones en el dropdown:
  - `Global.nrro` → `https://nvrro.es/`
  - `Navarro Tax & Legal` → `https://nvrro.es/`
- Si en realidad son duplicadas y solo debe aparecer una:
  - eliminar u ocultar una de las dos entradas (`is_active = false` en la que sobre).

3. Corregir la advertencia de React en el TopBar
- Ajustar el render de `TopBar.tsx` para no pasar props extra a `React.Fragment`.
- Esto elimina el warning actual en consola y deja el componente limpio.

4. Verificación
- Confirmar que al abrir el dropdown en `/oportunidades`, el item `Global.nrro` navega a `https://nvrro.es/`.
- Confirmar también que no quedan enlaces duros inconsistentes en frontend.

Detalles técnicos:
- No hace falta una migración de esquema.
- Esto es un cambio de datos en una tabla existente.
- El error anterior vino de actualizar `name = 'Navarro Tax & Legal'` en vez de `name = 'Global.nrro'`.
- La tabla tiene RLS y solo admins pueden gestionarla desde cliente, así que la actualización debe hacerse por la vía correcta de datos/autorización, no como cambio de estructura.

Archivos/zonas implicadas:
- `src/hooks/useTopBarConfig.ts` — consume `topbar_group_companies`
- `src/components/header/TopBar.tsx` — warning de `React.Fragment`
- tabla `public.topbar_group_companies` — dato incorrecto en la fila `Global.nrro`
