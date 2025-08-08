
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Importar global error handler para capturar errores no manejados
import './utils/globalErrorHandler'

// Force rebuild to clear cache references
console.log('Capittal App initializing...');

createRoot(document.getElementById("root")!).render(<App />);
