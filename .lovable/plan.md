

## Problema: Presentaciones no se adjuntan en correos outbound

### Causa raiz

En `send-campaign-outbound-email/index.ts`, las funciones `downloadPdfFromUrl` y `downloadPdfFromStorage` convierten el PDF a base64 usando:

```typescript
const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
```

El operador spread (`...`) sobre un `Uint8Array` grande (>~100KB) excede el limite del call stack de JavaScript. La funcion crashea silenciosamente dentro del `try-catch` y retorna `null`, enviando el email **sin adjuntos**.

### Solucion

Reemplazar la conversion a base64 por una implementacion segura que procese el buffer en chunks:

```typescript
function uint8ArrayToBase64(bytes: Uint8Array): string {
  const CHUNK_SIZE = 0x8000; // 32KB chunks
  let result = '';
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.subarray(i, i + CHUNK_SIZE);
    result += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }
  return btoa(result);
}
```

Aplicar esta funcion en ambos metodos `downloadPdfFromUrl` y `downloadPdfFromStorage`.

Ademas, agregar logs mas explicitos cuando un adjunto falla, para diagnostico futuro.

### Archivo afectado
- `supabase/functions/send-campaign-outbound-email/index.ts` — reemplazar la logica de base64 encoding

### Verificacion
Redesplegar la funcion y probar con un envio individual, verificando los logs para confirmar que los adjuntos se incluyen.

