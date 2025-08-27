
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Declarar tipos globales para TypeScript
declare global {
  interface Window {
    __CAPITTAL_INITIALIZED__?: boolean;
    __CAPITTAL_INITIALIZING__?: boolean;
  }
}

// Inicialización optimizada y lazy con singleton pattern
const initializeApp = async () => {
  // Doble verificación del flag
  if (window.__CAPITTAL_INITIALIZED__) {
    console.log('Capittal App already initialized during async load, skipping...');
    return;
  }
  
  // Marcar como inicializando inmediatamente
  window.__CAPITTAL_INITIALIZING__ = true;
  try {
    // Inicializar orquestador de startup primero
    const { startupOrchestrator } = await import('./core/startup/StartupOrchestrator');
    await startupOrchestrator.initialize();

    // Importar error handler optimizado de forma lazy
    const { optimizedErrorHandler } = await import('./utils/optimizedErrorHandler');
    
    // Verificar que el DOM está listo
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve);
      });
    }

    // Renderizar la aplicación
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new Error('Root element not found');
    }

    const root = createRoot(rootElement);
    root.render(<App />);

    // Marcar como completamente inicializado
    window.__CAPITTAL_INITIALIZED__ = true;
    window.__CAPITTAL_INITIALIZING__ = false;
    console.log('Capittal App initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Capittal App:', error);
    
    // Reset flags en caso de error
    window.__CAPITTAL_INITIALIZED__ = false;
    window.__CAPITTAL_INITIALIZING__ = false;
    
    // Fallback simple en caso de error crítico
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui;">
          <div style="text-align: center; color: #374151;">
            <h1 style="font-size: 2rem; margin-bottom: 1rem;">Error de inicialización</h1>
            <p style="margin-bottom: 1rem;">Ha ocurrido un error al cargar la aplicación.</p>
            <button onclick="window.location.reload()" style="padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 0.5rem; cursor: pointer;">
              Recargar página
            </button>
          </div>
        </div>
      `;
    }
  }
};

// Global flag para prevenir múltiples inicializaciones
(() => {
  if (window.__CAPITTAL_INITIALIZED__) {
    console.log('Capittal App already initialized, skipping...');
    return;
  }
  
  console.log('Capittal App initializing...');
  
  // Inicializar la aplicación solo si no está ya inicializada o inicializándose
  if (!window.__CAPITTAL_INITIALIZED__ && !window.__CAPITTAL_INITIALIZING__) {
    initializeApp();
  }
})();
