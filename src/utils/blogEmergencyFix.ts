import { performDeepCleanup, quickCleanup } from './emergencyCleanup';

export const fixBlogApp = async () => {
  try {
    console.log('🚨 Aplicando corrección de emergencia para el blog...');
    
    // Limpieza rápida primero
    await quickCleanup();
    
    // Limpieza profunda si es necesario
    await performDeepCleanup({
      clearServiceWorker: true,
      clearAllCaches: true,
      forceReload: true
    });
    
    console.log('✅ Corrección de emergencia aplicada correctamente');
  } catch (error) {
    console.error('❌ Error al aplicar corrección de emergencia:', error);
    // Forzar recarga como último recurso
    window.location.reload();
  }
};

// Ejecutar automáticamente si detectamos errores del Select
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (event.error?.message?.includes('Select.Item') && 
        event.error?.message?.includes('empty string')) {
      console.log('🔧 Error del Select detectado, aplicando corrección...');
      fixBlogApp();
    }
  });
}