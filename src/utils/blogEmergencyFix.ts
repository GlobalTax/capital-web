import { performDeepCleanup, quickCleanup } from './emergencyCleanup';

export const fixBlogApp = async () => {
  try {
    console.log('🚨 Aplicando corrección de emergencia para el blog...');
    
    // Limpieza rápida solamente para evitar bucles
    await quickCleanup();
    
    console.log('✅ Corrección de emergencia aplicada correctamente');
  } catch (error) {
    console.error('❌ Error al aplicar corrección de emergencia:', error);
  }
};

// Solo registrar el listener de errores en desarrollo
if (import.meta.env.DEV && typeof window !== 'undefined') {
  let errorCount = 0;
  const maxErrors = 3;
  
  window.addEventListener('error', (event) => {
    if (errorCount >= maxErrors) {
      console.log('🛑 Máximo de errores alcanzado, evitando más correcciones');
      return;
    }
    
    if (event.error?.message?.includes('Select.Item') || 
        event.error?.message?.includes('empty string') ||
        event.error?.message?.includes('404') ||
        event.error?.message?.includes('502')) {
      console.log('🔧 Error detectado, aplicando corrección...', event.error?.message);
      errorCount++;
      fixBlogApp();
    }
  });
}