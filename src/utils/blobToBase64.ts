/**
 * Convierte Blob a Base64 con compatibilidad cross-browser
 * Optimizado para Safari/Edge móvil con fallback automático
 * 
 * @param blob - Blob a convertir
 * @param timeout - Timeout en milisegundos (default: dinámico según navegador)
 * @returns Promise<string> - String Base64 sin prefijo data:
 */
export const blobToBase64 = async (
  blob: Blob, 
  timeout?: number
): Promise<string> => {
  // Detectar navegadores WebKit (Safari/Edge iOS) para timeout más largo
  const isWebKit = /AppleWebKit/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
  const defaultTimeout = isWebKit ? 15000 : 8000; // 15s para WebKit, 8s para otros
  const effectiveTimeout = timeout ?? defaultTimeout;
  
  console.log(`🔄 [BLOB] Navegador detectado: ${isWebKit ? 'WebKit (Safari/Edge)' : 'Otro'}, timeout: ${effectiveTimeout}ms`);
  console.log(`📦 [BLOB] Tamaño del blob: ${blob.size} bytes (${(blob.size / 1024).toFixed(2)} KB)`);
  const startTime = performance.now();
  // MÉTODO 1: arrayBuffer() - Más rápido y compatible con Safari/Edge
  try {
    console.log('🔄 [BLOB] Convirtiendo con arrayBuffer()...');
    const arrayBuffer = await Promise.race([
      blob.arrayBuffer(),
      new Promise<ArrayBuffer>((_, reject) => 
        setTimeout(() => reject(new Error('arrayBuffer timeout')), effectiveTimeout)
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
    const elapsedTime = performance.now() - startTime;
    console.log(`✅ [BLOB] Conversión exitosa con arrayBuffer() en ${elapsedTime.toFixed(0)}ms`);
    console.log(`📊 [BLOB] Base64 generado: ${base64.length} caracteres`);
    return base64;
  } catch (arrayBufferError) {
    const elapsedTime = performance.now() - startTime;
    console.warn(`⚠️ [BLOB] arrayBuffer falló después de ${elapsedTime.toFixed(0)}ms, intentando FileReader...`, arrayBufferError);
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
        setTimeout(() => reject(new Error('FileReader timeout')), effectiveTimeout)
      )
    ]);
    
    const elapsedTime = performance.now() - startTime;
    console.log(`✅ [BLOB] Conversión exitosa con FileReader en ${elapsedTime.toFixed(0)}ms`);
    console.log(`📊 [BLOB] Base64 generado: ${base64.length} caracteres`);
    return base64;
  } catch (fileReaderError) {
    const elapsedTime = performance.now() - startTime;
    console.error(`❌ [BLOB] Ambos métodos fallaron después de ${elapsedTime.toFixed(0)}ms:`, fileReaderError);
    throw new Error(`No se pudo convertir blob a base64: ${fileReaderError instanceof Error ? fileReaderError.message : 'Unknown error'}`);
  }
};
