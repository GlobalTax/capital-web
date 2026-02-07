

## Plan: Soporte para pegar imagenes desde el portapapeles (Herramienta de Recortes)

### Que se hara

Anadir la capacidad de pegar imagenes directamente con **Ctrl+V** en la zona de upload del panel Dealsuite. Esto permite usar la Herramienta de Recortes de Windows (o cualquier captura al portapapeles) sin necesidad de guardar el archivo primero.

### Cambio unico: `src/components/admin/DealsuiteSyncPanel.tsx`

1. **Listener de `paste`**: Anadir un `useEffect` que escuche el evento `paste` en el documento. Cuando el usuario pegue una imagen desde el portapapeles:
   - Se lee el item de tipo `image/*` del `clipboardData`
   - Se convierte a base64 con `FileReader`
   - Se establece `imagePreview` e `imageBase64` (mismo flujo que el drag & drop actual)

2. **Texto informativo**: Actualizar el texto de la zona de drop para indicar que tambien se puede pegar:
   - De: *"Arrastra una captura o haz clic para seleccionar"*
   - A: *"Arrastra, haz clic o pega (Ctrl+V) una captura"*

### Detalles tecnicos

```text
useEffect:
  document.addEventListener('paste', handlePaste)
  
handlePaste(e: ClipboardEvent):
  - Buscar item de tipo image/* en e.clipboardData.items
  - Obtener el File con item.getAsFile()
  - Leer con FileReader.readAsDataURL()
  - Setear imagePreview + imageBase64
  - Limpiar extractedDeal anterior
```

- Solo se activa cuando no hay imagen cargada (para evitar sobreescrituras accidentales)
- Se limpia el listener en el cleanup del useEffect
- No se necesitan cambios en la edge function ni en la base de datos
