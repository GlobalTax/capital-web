import React, { useEffect, useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useLandingPageBySlug, useLandingPageConversions } from '@/hooks/useLandingPages';
import { Loader2 } from 'lucide-react';
import DOMPurify from 'dompurify';

/**
 * Configuración de DOMPurify para sanitización segura de HTML
 * - Solo permite tags y atributos seguros
 * - Bloquea scripts, iframes, y atributos de eventos
 */
const DOMPURIFY_CONFIG = {
  ALLOWED_TAGS: [
    'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'a', 'img', 'ul', 'ol', 'li', 'strong', 'em', 'b', 'i', 'u',
    'br', 'hr', 'blockquote', 'pre', 'code',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
    'form', 'input', 'button', 'label', 'textarea', 'select', 'option',
    'header', 'footer', 'nav', 'main', 'section', 'article', 'aside',
    'figure', 'figcaption', 'video', 'audio', 'source',
  ],
  ALLOWED_ATTR: [
    'class', 'id', 'href', 'src', 'alt', 'title', 'target', 'rel',
    'type', 'name', 'placeholder', 'value', 'required', 'disabled', 'readonly',
    'style', 'width', 'height', 'colspan', 'rowspan',
    'for', 'aria-label', 'aria-describedby', 'role', 'tabindex',
    'data-*', 'action', 'method', 'enctype', 'autocomplete',
  ],
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'link', 'meta', 'base'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout', 
                'onfocus', 'onblur', 'onsubmit', 'onchange', 'oninput'],
  ALLOW_DATA_ATTR: true,
  ADD_ATTR: ['target'], // Allow target="_blank" for links
};

/**
 * Sanitiza CSS eliminando patrones peligrosos
 * - Bloquea expression(), javascript:, @import
 * - Bloquea url() con protocolos peligrosos
 */
const sanitizeCSS = (css: string): string => {
  if (!css) return '';
  
  return css
    // Eliminar expression() (IE legacy XSS)
    .replace(/expression\s*\([^)]*\)/gi, '/* blocked */')
    // Eliminar javascript: en cualquier contexto
    .replace(/javascript\s*:/gi, '/* blocked */')
    // Eliminar vbscript: (IE legacy)
    .replace(/vbscript\s*:/gi, '/* blocked */')
    // Eliminar @import (puede cargar CSS externo malicioso)
    .replace(/@import\s+[^;]+;?/gi, '/* blocked */')
    // Eliminar url() con data: (puede contener scripts)
    .replace(/url\s*\(\s*["']?\s*data\s*:/gi, 'url(/* blocked */')
    // Eliminar -moz-binding (Firefox XSS vector)
    .replace(/-moz-binding\s*:/gi, '/* blocked */')
    // Eliminar behavior: (IE XSS vector)
    .replace(/behavior\s*:/gi, '/* blocked */');
};

const LandingPageView = () => {
  const { slug } = useParams<{ slug: string }>();
  const { landingPage, isLoading, error } = useLandingPageBySlug(slug!);
  const { trackConversion } = useLandingPageConversions();

  // Track page view
  useEffect(() => {
    if (landingPage?.id) {
      trackConversion({
        landing_page_id: landingPage.id,
        conversion_type: 'page_view',
        visitor_id: `visitor_${Date.now()}`,
        session_id: `session_${Date.now()}`,
      });
    }
  }, [landingPage?.id, trackConversion]);

  // Procesar y sanitizar HTML del template
  const sanitizedHtmlContent = useMemo(() => {
    let htmlContent = landingPage?.template?.template_html || '';
    
    // Reemplazar variables del template
    if (landingPage?.template?.template_config?.fields) {
      landingPage.template.template_config.fields.forEach((field: string) => {
        const value = landingPage.content_config?.[field] || '';
        // Sanitizar el valor antes de insertarlo
        const safeValue = DOMPurify.sanitize(String(value), { ALLOWED_TAGS: [] });
        htmlContent = htmlContent.replace(new RegExp(`{{${field}}}`, 'g'), safeValue);
      });
    }

    // Sanitizar el HTML completo
    return DOMPurify.sanitize(htmlContent, DOMPURIFY_CONFIG);
  }, [landingPage?.template?.template_html, landingPage?.template?.template_config, landingPage?.content_config]);

  // Sanitizar CSS personalizado
  const sanitizedCSS = useMemo(() => {
    return sanitizeCSS(landingPage?.custom_css || '');
  }, [landingPage?.custom_css]);

  // Manejar envío de formularios
  const handleFormSubmit = async (event: Event) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    if (!landingPage?.id) return;

    try {
      await trackConversion({
        landing_page_id: landingPage.id,
        conversion_type: 'form_submit',
        form_data: data,
        visitor_id: `visitor_${Date.now()}`,
        session_id: `session_${Date.now()}`,
        conversion_value: 1,
      });

      // Redirigir según configuración del template (validar URL)
      const redirectUrl = landingPage.template?.template_config?.redirect_url;
      if (redirectUrl && isValidRedirectUrl(redirectUrl)) {
        window.location.href = redirectUrl;
      } else {
        // Mostrar mensaje de éxito
        alert('¡Gracias! Nos pondremos en contacto contigo pronto.');
      }
    } catch (error) {
      console.error('Error processing form:', error);
    }
  };

  // Agregar event listeners a los formularios después del render
  useEffect(() => {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('submit', handleFormSubmit);
    });

    return () => {
      forms.forEach(form => {
        form.removeEventListener('submit', handleFormSubmit);
      });
    };
  }, [landingPage?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !landingPage) {
    return <Navigate to="/404" replace />;
  }

  return (
    <>
      {/* Meta tags - estos son seguros ya que React los escapa */}
      <title>{landingPage.meta_title || landingPage.title}</title>

      {/* CSS personalizado sanitizado */}
      {sanitizedCSS && (
        <style dangerouslySetInnerHTML={{ __html: sanitizedCSS }} />
      )}

      {/* Contenido de la landing page sanitizado */}
      <div dangerouslySetInnerHTML={{ __html: sanitizedHtmlContent }} />

      {/* JavaScript personalizado - ELIMINADO por seguridad
          Si se necesita funcionalidad dinámica, usar componentes React
          o una lista blanca de scripts permitidos administrados por el sistema */}
    </>
  );
};

/**
 * Valida que la URL de redirección sea segura
 * - Solo permite URLs relativas o del mismo dominio
 * - Bloquea javascript:, data:, etc.
 */
const isValidRedirectUrl = (url: string): boolean => {
  if (!url) return false;
  
  // Bloquear protocolos peligrosos
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const lowerUrl = url.toLowerCase().trim();
  
  if (dangerousProtocols.some(protocol => lowerUrl.startsWith(protocol))) {
    return false;
  }
  
  // Permitir URLs relativas
  if (url.startsWith('/') && !url.startsWith('//')) {
    return true;
  }
  
  // Permitir URLs del mismo dominio
  try {
    const urlObj = new URL(url, window.location.origin);
    return urlObj.origin === window.location.origin;
  } catch {
    return false;
  }
};

export default LandingPageView;
