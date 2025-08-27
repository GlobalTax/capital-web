
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('Capittal App initializing...');

// Inicialización optimizada y lazy
const initializeApp = async () => {
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

    console.log('Capittal App initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Capittal App:', error);
    
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

// Inicializar la aplicación
initializeApp();
