/**
 * Convierte Blob a Base64 con compatibilidad cross-browser
 * Optimizado para Safari/Edge móvil con fallback automático
 * 
 * @param blob - Blob a convertir
 * @param timeout - Timeout en milisegundos (default: 8000ms)
 * @returns Promise<string> - String Base64 sin prefijo data:
 */
export const blobToBase64 = async (
  blob: Blob, 
  timeout: number = 8000
): Promise<string> => {
  // MÉTODO 1: arrayBuffer() - Más rápido y compatible con Safari/Edge
  try {
    console.log('🔄 [BLOB] Convirtiendo con arrayBuffer()...');
    const arrayBuffer = await Promise.race([
      blob.arrayBuffer(),
      new Promise<ArrayBuffer>((_, reject) => 
        setTimeout(() => reject(new Error('arrayBuffer timeout')), timeout)
      )
    ]);
    
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    const chunkSize = 8192; // Procesar en chunks para evitar stack overflow
    
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
      binary += String.fromCharCode(...chunk);
    }
    
    const base64 = btoa(binary);
    console.log('✅ [BLOB] Conversión exitosa con arrayBuffer()');
    return base64;
  } catch (arrayBufferError) {
    console.warn('⚠️ [BLOB] arrayBuffer falló, intentando FileReader...', arrayBufferError);
  }
  
  // MÉTODO 2: FileReader con timeout - Fallback
  try {
    console.log('🔄 [BLOB] Convirtiendo con FileReader...');
    const base64 = await Promise.race([
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          const base64 = (dataUrl.split(',')[1]) || '';
          resolve(base64);
        };
        reader.onerror = () => reject(new Error('FileReader error'));
        reader.readAsDataURL(blob);
      }),
      new Promise<string>((_, reject) => 
        setTimeout(() => reject(new Error('FileReader timeout')), timeout)
      )
    ]);
    
    console.log('✅ [BLOB] Conversión exitosa con FileReader');
    return base64;
  } catch (fileReaderError) {
    console.error('❌ [BLOB] Ambos métodos fallaron:', fileReaderError);
    throw new Error(`No se pudo convertir blob a base64: ${fileReaderError instanceof Error ? fileReaderError.message : 'Unknown error'}`);
  }
};
