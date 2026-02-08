

## Transmitir sensacion de equipo grande y multidisciplinar

### Objetivo
Redisenar la pagina de equipo para que el visitante perciba un equipo amplio, estructurado y multidisciplinar, combinando los miembros actuales de Capittal con el equipo de Navarro Tax and Legal, y organizandolos por divisiones con indicadores de escala.

### Cambios propuestos

**1. Ampliar la base de datos con miembros de Navarro Tax and Legal**

Anadir nuevos miembros del equipo en la tabla `team_members` con secciones diferenciadas:

- **Seccion "Socios"**: Los socios principales (Lluis Montanya, Samuel L. Navarro) se mueven a esta seccion destacada
- **Seccion "M&A"**: El resto del equipo actual de Capittal (Aleix Miro, Marc Tico, Oriol Iglesias, Marc Canet, Marcel Padros)
- **Seccion "Fiscal y Contable"**: Nuevos miembros del equipo de Navarro Tax and Legal (se necesitara que proporciones nombres, cargos y fotos)
- **Seccion "Laboral"**: Miembros del area laboral de Navarro Tax and Legal
- **Seccion "Legal"**: Miembros del area juridica

Se actualizara el campo `section` de los miembros existentes y se insertaran los nuevos.

**2. Redisenar el componente Team.tsx**

Cambios visuales y estructurales:

- **Header renovado**: Titulo "Nuestro Equipo" con subtitulo que mencione "Un equipo multidisciplinar de +20 profesionales del Grupo Navarro" (el numero se calculara dinamicamente segun los miembros en la DB)
- **Contador animado**: Mostrar el numero total de profesionales de forma prominente, similar al estilo de Norgestion ("Un grupo de X profesionales")
- **Organizacion por secciones**: Mostrar el equipo agrupado por division con cabeceras claras:
  - Socios (cards mas grandes, destacados)
  - Division M&A (Capittal)
  - Division Fiscal y Contable
  - Division Laboral
  - Division Legal
- **Cards diferenciadas para socios**: Los socios tendran un tamano mayor y un diseno mas destacado (similar al estilo de Norgestion donde el Presidente aparece primero y mas grande)
- **Estadisticas del grupo**: Actualizar los contadores del header para reflejar el grupo completo

**3. Actualizar las estadisticas del header**

Cambiar las stats actuales para que reflejen el grupo:
- "25+ Anos Experiencia" (se mantiene)
- Nuevo: "X+ Profesionales" (numero dinamico basado en la DB)
- "100+ Transacciones" (se mantiene)
- Sustituir "98,7% Tasa Exito" por "3 Divisiones" o similar para reforzar la multidisciplinariedad

**4. Anadir banner del grupo bajo el equipo**

Despues de las secciones de equipo, anadir un bloque que diga:
"Capittal es la division de M&A de Navarro Tax and Legal. Juntos ofrecemos un servicio integral: financiero, fiscal, laboral y legal."
Con enlace a nrro.es.

### Archivos afectados

- `src/components/Team.tsx` -- Rediseno del componente con secciones, cards diferenciadas para socios, contador dinamico y banner del grupo
- Base de datos `team_members` -- Actualizar secciones de los miembros existentes e insertar nuevos miembros de Navarro Tax and Legal

### Prerequisito importante

Para anadir miembros reales de Navarro Tax and Legal, necesitare que proporciones:
- Nombres y cargos de los profesionales a incluir
- Fotos (URLs o archivos)
- A que division pertenecen (Fiscal, Laboral, Legal)

Si prefieres avanzar sin esos datos todavia, puedo hacer el rediseno estructural con los 7 miembros actuales reorganizados en secciones (Socios / Equipo M&A) y dejar las secciones de Navarro Tax and Legal preparadas para cuando tengas los datos.

