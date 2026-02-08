

## Hacer las "Service Pills" editables desde la intranet

### Problema

Los tres enlaces del hero ("Venta de empresas", "Mandatos de compra", "Valoracion & Due Diligence") estan escritos directamente en el codigo. No se pueden cambiar desde el panel de administracion.

### Solucion

Crear una tabla `hero_service_pills` en la base de datos y un gestor en la intranet para editarlas. El componente Hero leera las pills de la base de datos en lugar de tenerlas hardcodeadas.

### Cambios

**1. Nueva tabla `hero_service_pills`** (SQL)
- Campos: `id`, `label` (texto del boton), `url` (enlace), `display_order`, `is_active`, `created_at`
- RLS habilitado: lectura publica, escritura solo para admins
- Se insertan las 3 pills actuales como datos iniciales

**2. Componente Hero (`src/components/Hero.tsx`)**
- Nuevo query para cargar las pills desde `hero_service_pills`
- Reemplazar los 3 Links hardcodeados por un `.map()` sobre los datos de la base de datos
- Mantener el mismo estilo visual (pills con fondo blanco semitransparente, separadas por puntos)

**3. Nuevo gestor en admin (`src/components/admin/HeroServicePillsManager.tsx`)**
- Lista de pills con drag & drop para reordenar (como el gestor de slides existente)
- Formulario para editar label y URL de cada pill
- Botones para activar/desactivar y eliminar
- Boton para anadir nuevas pills

**4. Integrar en el panel admin**
- Anadir una pestana o seccion en la pagina donde se gestionan los hero slides
- Enlazar el nuevo componente HeroServicePillsManager

### Seccion tecnica

**Tabla SQL:**
```sql
CREATE TABLE hero_service_pills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE hero_service_pills ENABLE ROW LEVEL SECURITY;
-- Lectura publica
CREATE POLICY "Public read" ON hero_service_pills FOR SELECT USING (true);
-- Escritura admin
CREATE POLICY "Admin write" ON hero_service_pills FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

-- Datos iniciales
INSERT INTO hero_service_pills (label, url, display_order) VALUES
  ('Venta de empresas', '/venta-empresas', 0),
  ('Mandatos de compra', '/mandatos-compra', 1),
  ('Valoracion & Due Diligence', '/servicios/valoraciones', 2);
```

**Hero.tsx - Query y render:**
```tsx
const { data: servicePills = [] } = useQuery({
  queryKey: ['hero_service_pills'],
  queryFn: async () => {
    const { data } = await supabase
      .from('hero_service_pills')
      .select('*')
      .eq('is_active', true)
      .order('display_order');
    return data || [];
  }
});

// En el render, reemplazar los Links hardcodeados:
{servicePills.map((pill, i) => (
  <React.Fragment key={pill.id}>
    {i > 0 && <span className="text-muted-foreground/40">·</span>}
    <Link to={pill.url} className="...estilos actuales...">
      {pill.label}
    </Link>
  </React.Fragment>
))}
```

