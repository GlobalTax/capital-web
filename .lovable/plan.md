

## Insertar equipo completo de nrro.es en Capittal

### Contexto
La pagina de equipo de nrro.es muestra 35 profesionales. Actualmente en la base de datos de Capittal solo hay 7. Hay que insertar los 28 miembros restantes y ajustar el componente para mostrar la nueva seccion "Servicios Globales".

### 1. Insertar 28 nuevos miembros en la tabla `team_members`

Se insertaran con los datos extraidos directamente de nrro.es: nombre, nivel (como position), email, imagen (URL de Supabase de nrro.es) y seccion mapeada a las divisiones de Capittal.

**Mapeo de secciones nrro.es a Capittal:**
- CONTABILIDAD / FISCALIDAD --> "Fiscal y Contable"
- LABORAL --> "Laboral"  
- M&A --> "M&A"
- SERVICIOS GLOBALES / sin seccion --> "Servicios Globales"

**Miembros nuevos por division:**

**M&A** (3 nuevos, se suman a los 5 existentes = 8 total):
- Marina Gonzalez (Asociado)
- Julia Estelle (Junior)
- Albert Tico (Master Scholar)

**Fiscal y Contable** (11 nuevos):
- Claudia Martin, Jose Maria, Maria Leon, Pepe Rico, Ana Ramirez, Rosa Rodriguez, Yolanda Pescador, Vasyl Lenko, Paula Cardenas, Clara Bellonch, Nil Moreno, Pol Fontclara

**Laboral** (14 nuevos):
- Joan Salvo, Magda Vidueira, Estel Borrell, Monica Castro, Raul Rubio, Adrian Munoz, Irene Velarde, Adrian Montero, Raquel Chica, Alejandro Brotons, Yasmina Aguilera, Eric Abellan, Laia Moll, Pilar D'Ambrosio

**Servicios Globales** (8 nuevos):
- Jordi Mayoral, Anabel Raso, Alberto Vicente, Gemma Zalacain, Pau Valls, Cinthia Sanchez, Aitana Lopez, Maria Ventin, Lucia Linares, Blanca Salvo

Cada miembro se insertara con:
- `name`: Nombre completo
- `position`: Nivel (Senior, Asociado, Junior, Master Scholar)
- `email`: Email de nrro.es
- `image_url`: URL de la imagen alojada en el Supabase de nrro.es
- `section`: La seccion mapeada (Fiscal y Contable, Laboral, M&A, Servicios Globales)
- `is_active`: true
- `display_order`: Asignado secuencialmente dentro de cada seccion

### 2. Actualizar el componente `Team.tsx`

Cambios minimos:
- Anadir "Servicios Globales" al `SECTION_CONFIG` con icono apropiado (por ejemplo, `Globe` o `Users`) y orden 5
- Importar el icono adicional necesario

### 3. Resultado esperado

La pagina de equipo mostrara aproximadamente 35 profesionales organizados en 6 secciones:
- Socios (2)
- Division M&A (8)
- Division Fiscal y Contable (12)
- Division Laboral (14)
- Division Servicios Globales (10+)

El contador del header mostrara "35+ profesionales" de forma dinamica.

### Archivos afectados
- Base de datos `team_members` -- INSERT de ~28 nuevos registros
- `src/components/Team.tsx` -- Anadir seccion "Servicios Globales" al SECTION_CONFIG

### Nota importante
Las imagenes estan alojadas en el Supabase de nrro.es (dominio `zntotcpagkunvkwpubqu.supabase.co`). Si en el futuro esas URLs dejan de estar disponibles, habria que migrar las imagenes al storage de Capittal.

