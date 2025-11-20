
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { validateSupabaseConfig } from '@/config/supabase'
import { devValidateTranslations } from '@/utils/i18n-validator'

// Validar traducciones en desarrollo
devValidateTranslations();

// Inicialización simplificada y directa
const initializeApp = () => {
  try {
    // Validación básica de Supabase (síncrona)
    validateSupabaseConfig();
    
    // Verificar que el DOM está listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', renderApp);
    } else {
      renderApp();
    }
  } catch (error) {
    console.error('Error durante la inicialización:', error);
    showErrorFallback();
  }
};

const renderApp = () => {
  try {
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new Error('Root element not found');
    }

    const root = createRoot(rootElement);
    root.render(<App />);
    console.log('✅ Capittal App iniciado correctamente');
  } catch (error) {
    console.error('Error al renderizar la aplicación:', error);
    showErrorFallback();
  }
};

const showErrorFallback = () => {
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
};

// Inicializar la aplicación inmediatamente
initializeApp();
