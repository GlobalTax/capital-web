import React, { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useLandingPageBySlug, useLandingPageConversions } from '@/hooks/useLandingPages';
import { Loader2 } from 'lucide-react';

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

  // Renderizar el HTML del template con la configuración de contenido
  let htmlContent = landingPage.template?.template_html || '';
  
  // Reemplazar variables del template
  if (landingPage.template?.template_config?.fields) {
    landingPage.template.template_config.fields.forEach((field: string) => {
      const value = landingPage.content_config?.[field] || '';
      htmlContent = htmlContent.replace(new RegExp(`{{${field}}}`, 'g'), value);
    });
  }

  // Manejar envío de formularios
  const handleFormSubmit = async (event: Event) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      await trackConversion({
        landing_page_id: landingPage.id,
        conversion_type: 'form_submit',
        form_data: data,
        visitor_id: `visitor_${Date.now()}`,
        session_id: `session_${Date.now()}`,
        conversion_value: 1,
      });

      // Redirigir según configuración del template
      const redirectUrl = landingPage.template?.template_config?.redirect_url;
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        // Mostrar mensaje de éxito o manejar el envío
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
  }, [landingPage.id]);

  return (
    <>
      {/* Meta tags */}
      <head>
        <title>{landingPage.meta_title || landingPage.title}</title>
        <meta name="description" content={landingPage.meta_description || ''} />
        {landingPage.meta_keywords && (
          <meta name="keywords" content={landingPage.meta_keywords.join(', ')} />
        )}
      </head>

      {/* CSS personalizado */}
      {landingPage.custom_css && (
        <style dangerouslySetInnerHTML={{ __html: landingPage.custom_css }} />
      )}

      {/* Contenido de la landing page */}
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />

      {/* JavaScript personalizado */}
      {landingPage.custom_js && (
        <script dangerouslySetInnerHTML={{ __html: landingPage.custom_js }} />
      )}
    </>
  );
};

export default LandingPageView;