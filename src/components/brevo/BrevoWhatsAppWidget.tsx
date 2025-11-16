import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Brevo WhatsApp Widget Component
 * 
 * Carga el widget de conversaciones de Brevo (WhatsApp)
 * Solo se carga en rutas públicas (excluye /admin y /auth)
 */
const BrevoWhatsAppWidget = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Excluir rutas de administración y autenticación
    const excludedPaths = ['/admin', '/auth'];
    const shouldLoad = !excludedPaths.some(path => location.pathname.startsWith(path));
    
    if (!shouldLoad) {
      return;
    }

    // Evitar cargar el script múltiples veces
    if (window.BrevoConversationsID) {
      return;
    }

    // Cargar script de Brevo Conversations
    (function(d, w, c) {
      w.BrevoConversationsID = '68af2b16c62a3d2cd5046deb';
      w[c] = w[c] || function() {
        (w[c].q = w[c].q || []).push(arguments);
      };
      const s = d.createElement('script');
      s.async = true;
      s.src = 'https://conversations-widget.brevo.com/brevo-conversations.js';
      if (d.head) d.head.appendChild(s);
    })(document, window, 'BrevoConversations');

    // Cleanup: el widget persiste entre navegaciones, así que no necesitamos limpiarlo
  }, [location.pathname]);

  return null;
};

// Declaración de tipos para TypeScript
declare global {
  interface Window {
    BrevoConversationsID?: string;
    BrevoConversations?: (...args: any[]) => void;
  }
}

export default BrevoWhatsAppWidget;
