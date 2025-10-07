import { useEffect } from 'react';
import { TrackingConfigService } from '@/services/TrackingConfigService';

/**
 * TrackingInitializer - Inicializa scripts de tracking (Meta Pixel, GA4, GTM)
 * Se ejecuta en todas las páginas excepto /admin/*
 */
export const TrackingInitializer = () => {
  useEffect(() => {
    const initializeTracking = async () => {
      // Solo cargar en dominios permitidos (capittal.es y localhost)
      if (!TrackingConfigService.shouldEnableTracking()) {
        console.log('[Tracking] Disabled - not in allowed domain');
        return;
      }

      // Cargar configuración de tracking
      const config = await TrackingConfigService.loadConfiguration();
      console.log('[Tracking] Configuration loaded:', {
        hasPixel: !!config.facebookPixelId,
        hasGA: !!config.googleAnalyticsId,
        hasGTM: !!config.googleTagManagerId
      });

      // ========== META PIXEL (FACEBOOK) ==========
      if (config.facebookPixelId) {
        const pixelId = config.facebookPixelId;
        
        // Verificar si ya está cargado
        if ((window as any).fbq) {
          console.log('[Tracking] Facebook Pixel already loaded');
        } else {
          // Crear e inyectar el script del Meta Pixel
          const script = document.createElement('script');
          script.id = 'facebook-pixel-script';
          script.textContent = `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `;
          document.head.appendChild(script);
          
          // Agregar noscript fallback para navegadores sin JavaScript
          const noscript = document.createElement('noscript');
          noscript.innerHTML = `<img height="1" width="1" style="display:none" 
            src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1" />`;
          document.body.appendChild(noscript);
          
          console.log('✅ [Tracking] Facebook Pixel initialized:', pixelId);
        }
      }

      // ========== GOOGLE ANALYTICS (GA4) ==========
      if (config.googleAnalyticsId) {
        const gaId = config.googleAnalyticsId;
        
        // Verificar si ya está cargado
        if ((window as any).gtag) {
          console.log('[Tracking] Google Analytics already loaded');
        } else {
          // Cargar script de gtag.js
          const gaScript = document.createElement('script');
          gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
          gaScript.async = true;
          document.head.appendChild(gaScript);

          // Configurar GA4
          const gaConfigScript = document.createElement('script');
          gaConfigScript.id = 'google-analytics-config';
          gaConfigScript.textContent = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              'send_page_view': true,
              'anonymize_ip': true
            });
          `;
          document.head.appendChild(gaConfigScript);
          
          console.log('✅ [Tracking] Google Analytics initialized:', gaId);
        }
      }

      // ========== GOOGLE TAG MANAGER (GTM) ==========
      if (config.googleTagManagerId) {
        const gtmId = config.googleTagManagerId;
        
        // Verificar si ya está cargado
        if ((window as any).google_tag_manager) {
          console.log('[Tracking] Google Tag Manager already loaded');
        } else {
          // Inyectar GTM en el head
          const gtmScript = document.createElement('script');
          gtmScript.id = 'google-tag-manager';
          gtmScript.textContent = `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `;
          document.head.appendChild(gtmScript);
          
          // Agregar noscript fallback para GTM
          const gtmNoscript = document.createElement('noscript');
          gtmNoscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
            height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
          document.body.appendChild(gtmNoscript);
          
          console.log('✅ [Tracking] Google Tag Manager initialized:', gtmId);
        }
      }

      // ========== LINKEDIN INSIGHT TAG ==========
      if (config.linkedInInsightTag) {
        const linkedInId = config.linkedInInsightTag;
        
        if ((window as any)._linkedin_data_partner_ids) {
          console.log('[Tracking] LinkedIn Insight Tag already loaded');
        } else {
          const linkedInScript = document.createElement('script');
          linkedInScript.type = 'text/javascript';
          linkedInScript.textContent = `
            _linkedin_partner_id = "${linkedInId}";
            window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
            window._linkedin_data_partner_ids.push(_linkedin_partner_id);
          `;
          document.head.appendChild(linkedInScript);

          const linkedInTag = document.createElement('script');
          linkedInTag.type = 'text/javascript';
          linkedInTag.async = true;
          linkedInTag.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
          document.head.appendChild(linkedInTag);
          
          console.log('✅ [Tracking] LinkedIn Insight Tag initialized:', linkedInId);
        }
      }

      // ========== HOTJAR ==========
      if (config.hotjarId && config.enableHeatmaps) {
        const hotjarId = config.hotjarId;
        
        if ((window as any).hj) {
          console.log('[Tracking] Hotjar already loaded');
        } else {
          const hotjarScript = document.createElement('script');
          hotjarScript.textContent = `
            (function(h,o,t,j,a,r){
              h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
              h._hjSettings={hjid:${hotjarId},hjsv:6};
              a=o.getElementsByTagName('head')[0];
              r=o.createElement('script');r.async=1;
              r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
              a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
          `;
          document.head.appendChild(hotjarScript);
          
          console.log('✅ [Tracking] Hotjar initialized:', hotjarId);
        }
      }

      console.log('✅ [Tracking] All tracking scripts initialized successfully');
    };

    // Ejecutar inicialización
    initializeTracking().catch(error => {
      console.error('❌ [Tracking] Error initializing tracking scripts:', error);
    });
  }, []); // Solo ejecutar una vez al montar

  return null;
};
