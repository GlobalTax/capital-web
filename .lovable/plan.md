

## Asegurar vista agrupada por defecto en Campañas

### Situación actual
El código ya tiene `'grouped'` como valor por defecto, pero si en algún momento el usuario cambió a vista plana, el valor `'flat'` queda guardado en `localStorage` y se usa en cargas futuras.

### Cambio

**`src/pages/admin/CampanasValoracion.tsx`** (línea 43-44)

Forzar que el valor inicial sea siempre `'grouped'`, ignorando el valor de localStorage:

```typescript
const [viewMode, setViewMode] = useState<'flat' | 'grouped'>('grouped');
```

Esto hará que cada vez que se entre a la página, se muestre agrupada por sector. El usuario puede cambiar a vista plana durante la sesión, pero al volver siempre verá la agrupada primero.

