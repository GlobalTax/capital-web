
## Plan: Edicion Inline de Financials y Creacion Rapida de Leads

Se implementaran dos mejoras en la ficha de leads:
1. **Edicion inline de campos financieros** (Facturacion, EBITDA, Valoracion) directamente en la ficha
2. **Acceso rapido para crear leads** desde la ficha actual

---

### Arquitectura Propuesta

```text
+-------------------------+     +---------------------------+
|   LeadDetailPage        |     |  company_valuations       |
+-------------------------+     +---------------------------+
|  - EditableCurrency     |---->|  revenue, ebitda,         |
|    (Facturacion, EBITDA)|     |  final_valuation          |
|  - QuickLeadActions     |     +---------------------------+
|    (+Nuevo Lead btn)    |
+-------------------------+
           |
           v
+-------------------------+
|  useContactInlineUpdate |
+-------------------------+
|  - update(id, origin,   |
|    field, value)        |
+-------------------------+
```

---

### Cambios a Implementar

#### 1. Seccion de Datos de Valoracion con Edicion Inline

Reemplazar la visualizacion estatica de `revenue`, `ebitda` y `final_valuation` por componentes `EditableCurrency` que permitan edicion click-to-edit.

**Archivo**: `src/pages/admin/LeadDetailPage.tsx`

**Cambios en imports:**
- Importar `EditableCurrency` desde `@/components/admin/shared/EditableCurrency`
- Importar `useContactInlineUpdate` desde `@/hooks/useInlineUpdate`

**Cambios en el componente (lineas 568-606):**

Antes:
```tsx
{lead.revenue && (
  <div>
    <p className="text-sm font-medium mb-1">Facturacion</p>
    <p className="text-sm text-muted-foreground">
      {new Intl.NumberFormat('es-ES', {...}).format(lead.revenue)}
    </p>
  </div>
)}
```

Despues:
```tsx
<div>
  <p className="text-sm font-medium mb-1">Facturacion</p>
  <EditableCurrency
    value={lead.revenue}
    onSave={(v) => handleFinancialUpdate('revenue', v)}
    emptyText="Sin datos"
    compact
  />
</div>
```

**Nueva funcion handler:**
```tsx
const { update: updateLead } = useContactInlineUpdate();

const handleFinancialUpdate = async (field: string, value: number) => {
  await updateLead(lead.id, lead.origin, field, value || null);
  refetch();
};
```

#### 2. Boton de Creacion Rapida de Leads

Anadir un boton en el header de la ficha para crear un nuevo lead, lo que facilitara el flujo de trabajo sin tener que volver a la tabla principal.

**Ubicacion**: Header de la pagina (junto a "Archivar" y "Enviar a Brevo")

**Componente propuesto:**
```tsx
<Button 
  variant="outline"
  onClick={() => navigate('/admin/contacts', { state: { openNewLead: true } })}
>
  <Plus className="mr-2 h-4 w-4" />
  Nuevo Lead
</Button>
```

Alternativamente, se puede usar un `Dialog` inline para crear el lead sin salir de la pagina actual:
- Reutilizar el formulario de `ContactEditForm` o similar
- Abrir modal con campos basicos: Nombre, Email, Telefono, Empresa

#### 3. Estructura Final de la Card de Valoracion

```tsx
<Card>
  <CardHeader>
    <CardTitle>Datos de Valoracion</CardTitle>
  </CardHeader>
  <CardContent className="space-y-3">
    <div className="grid grid-cols-2 gap-4">
      {/* Industria - solo lectura */}
      {lead.industry && (
        <div>
          <p className="text-sm font-medium mb-1">Industria</p>
          <p className="text-sm text-muted-foreground">{lead.industry}</p>
        </div>
      )}
      
      {/* Empleados - solo lectura */}
      {lead.employee_range && (
        <div>
          <p className="text-sm font-medium mb-1">Empleados</p>
          <p className="text-sm text-muted-foreground">{lead.employee_range}</p>
        </div>
      )}
      
      {/* Facturacion - EDITABLE */}
      <div>
        <p className="text-sm font-medium mb-1">Facturacion</p>
        <EditableCurrency
          value={lead.revenue}
          onSave={(v) => handleFinancialUpdate('revenue', v)}
          emptyText="Clic para anadir"
          compact
        />
      </div>
      
      {/* EBITDA - EDITABLE */}
      <div>
        <p className="text-sm font-medium mb-1">EBITDA</p>
        <EditableCurrency
          value={lead.ebitda}
          onSave={(v) => handleFinancialUpdate('ebitda', v)}
          emptyText="Clic para anadir"
          compact
        />
      </div>
      
      {/* Valoracion Final - EDITABLE */}
      <div className="col-span-2">
        <p className="text-sm font-medium mb-1">Valoracion Final</p>
        <EditableCurrency
          value={lead.final_valuation}
          onSave={(v) => handleFinancialUpdate('final_valuation', v)}
          emptyText="Clic para anadir"
          compact
          displayClassName="text-primary font-semibold"
        />
      </div>
    </div>
  </CardContent>
</Card>
```

---

### Secuencia de Implementacion

1. Importar componentes y hooks necesarios en `LeadDetailPage.tsx`
2. Crear funcion `handleFinancialUpdate` usando `useContactInlineUpdate`
3. Reemplazar campos estaticos por `EditableCurrency` en seccion Valoracion
4. Replicar el mismo patron para leads de tipo `advisor` (mismos campos)
5. Anadir boton "Nuevo Lead" en el header
6. Opcional: Crear dialog de creacion rapida de lead

---

### Resultado Visual Esperado

- Los valores financieros mostraran un borde punteado cuando esten vacios
- Al hacer hover, aparecera un icono de lapiz indicando que es editable
- Al hacer clic, se convertira en un input de moneda
- Al pulsar Enter o al perder el foco, se guardara automaticamente
- Feedback visual: indicador de guardado y confirmacion

---

### Consideraciones Tecnicas

- **Hook existente**: Se reutiliza `useContactInlineUpdate` que ya mapea correctamente los campos segun el origen del lead
- **Tipos soportados**: Funciona para leads de origen `valuation` y `advisor` que tienen campos financieros
- **Cache**: El hook usa optimistic updates con React Query para UI instantanea
- **Validacion**: `EditableCurrency` normaliza automaticamente el input europeo (1.500.000,50)
- **Rollback**: Si falla la actualizacion, se revierte al valor anterior

---

### Alternativa Avanzada: Panel de Financials Colapsable

Para una mejor UX, se podria crear un componente `LeadFinancialsPanel` que agrupe todos los campos editables con un diseno mas compacto:

```text
+--------------------------------------------+
| Datos Financieros                      [v] |
+--------------------------------------------+
| Facturacion     EBITDA      Valoracion     |
| [1.5M€]         [80K€]      [2.1M€]        |
+--------------------------------------------+
```

Esto seguiria el patron de `CorporateBuyerDetailPage` con su seccion de criterios financieros.
