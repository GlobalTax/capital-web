import { useEffect } from 'react';
import { TrackingConfigService } from '@/services/TrackingConfigService';

/**
 * TrackingInitializer - Inicializa scripts de tracking con CMP (Cookiebot)
 * Cumple con RGPD - solo carga scripts tras consentimiento de marketing
 */
export const TrackingInitializer = () => {
  useEffect(() => {
    const initializeTracking = async () => {
      const currentHost = window.location.hostname;
      const isTrackingEnabled = TrackingConfigService.shouldEnableTracking();
      
      console.log('[Tracking] 🌐 Current host:', currentHost);
      console.log('[Tracking] 🎯 Tracking enabled:', isTrackingEnabled);
      
      // Solo cargar en dominios permitidos
      if (!isTrackingEnabled) {
        console.log('[Tracking] ❌ Disabled - not in allowed domain');
        return;
      }

      // Cargar configuración de tracking
      const config = await TrackingConfigService.loadConfiguration();
      console.log('[Tracking] Configuration loaded:', {
        hasPixel: !!config.facebookPixelId,
        hasGA: !!config.googleAnalyticsId,
        hasGTM: !!config.googleTagManagerId,
        hasCMP: !!config.cookiebotId,
        cmpEnabled: config.enableCMP
      });

      // ========== COOKIEBOT CMP (Consent Management Platform) ==========
      if (config.enableCMP && config.cookiebotId) {
        const cookiebotId = config.cookiebotId;
        
        if ((window as any).Cookiebot) {
          console.log('[Tracking] Cookiebot already loaded');
        } else {
          // Cargar script de Cookiebot
          const cookiebotScript = document.createElement('script');
          cookiebotScript.id = 'Cookiebot';
          cookiebotScript.src = 'https://consent.cookiebot.com/uc.js';
          cookiebotScript.setAttribute('data-cbid', cookiebotId);
          cookiebotScript.setAttribute('data-blockingmode', 'auto');
          cookiebotScript.type = 'text/javascript';
          document.head.appendChild(cookiebotScript);
          
          // Helper global para desarrollo: mostrar banner manualmente
          (window as any).showCookieBanner = () => {
            if ((window as any).Cookiebot?.show) {
              (window as any).Cookiebot.show();
              console.log('[Tracking] 🍪 Banner shown manually');
            } else {
              console.warn('[Tracking] ⚠️ Cookiebot not loaded yet');
            }
          };
          
          console.log('✅ [Tracking] Cookiebot CMP initialized:', cookiebotId);
          console.log('💡 [Tracking] Tip: Run window.showCookieBanner() to show banner manually');
        }
      }

      // ========== FUNCIONES DE CARGA DE TRACKING ==========
      // Estas funciones se ejecutarán SOLO tras consentimiento
      
      const loadMetaPixel = () => {
        if (!config.facebookPixelId || (window as any).fbq) return;
        
        const pixelId = config.facebookPixelId;
        const script = document.createElement('script');
        script.id = 'facebook-pixel-script';
        script.textContent = `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
          (window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}', {
            autoConfig: true,
            debug: false
          });
          fbq('track', 'PageView');
        `;
        document.head.appendChild(script);
        
        const noscript = document.createElement('noscript');
        noscript.innerHTML = `<img height="1" width="1" style="display:none" 
          src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1" />`;
        document.body.appendChild(noscript);
        
        console.log('✅ [Tracking] Meta Pixel loaded with Advanced Matching:', pixelId);
      };

      const loadGoogleAnalytics = () => {
        if (!config.googleAnalyticsId || (window as any).gtag) return;
        
        const gaId = config.googleAnalyticsId;
        const gaScript = document.createElement('script');
        gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        gaScript.async = true;
        document.head.appendChild(gaScript);

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
        
        console.log('✅ [Tracking] Google Analytics loaded:', gaId);
      };

      const loadGoogleTagManager = () => {
        if (!config.googleTagManagerId || (window as any).google_tag_manager) return;
        
        const gtmId = config.googleTagManagerId;
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
        
        const gtmNoscript = document.createElement('noscript');
        gtmNoscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
          height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
        document.body.appendChild(gtmNoscript);
        
        console.log('✅ [Tracking] Google Tag Manager loaded:', gtmId);
      };

      // ========== GESTIÓN DE CONSENTIMIENTO ==========
      if (config.enableCMP && config.cookiebotId) {
        // Esperar a que Cookiebot esté disponible
        const checkCookiebot = setInterval(() => {
          if ((window as any).Cookiebot) {
            clearInterval(checkCookiebot);
            
            // Verificar consentimiento actual
            const cookiebot = (window as any).Cookiebot;
            
            const checkAndLoadScripts = () => {
              console.log('[Tracking] 🔍 Checking consent status:', {
                marketing: cookiebot.consent?.marketing,
                statistics: cookiebot.consent?.statistics,
                preferences: cookiebot.consent?.preferences,
                necessary: cookiebot.consent?.necessary
              });
              
              // Cargar scripts solo si hay consentimiento de marketing
              if (cookiebot.consent?.marketing) {
                console.log('[Tracking] ✅ Marketing consent granted - loading Meta Pixel');
                loadMetaPixel();
              } else {
                console.log('[Tracking] ⏸️ Marketing consent not granted - Meta Pixel blocked');
              }
              
              // Cargar analytics solo si hay consentimiento de estadísticas
              if (cookiebot.consent?.statistics) {
                console.log('[Tracking] ✅ Statistics consent granted - loading GA & GTM');
                loadGoogleAnalytics();
                loadGoogleTagManager();
              } else {
                console.log('[Tracking] ⏸️ Statistics consent not granted - GA & GTM blocked');
              }
            };
            
            // Verificar consentimiento inicial
            if (cookiebot.consent) {
              checkAndLoadScripts();
            }
            
            // Escuchar eventos de consentimiento
            window.addEventListener('CookiebotOnAccept', () => {
              console.log('[Tracking] User accepted cookies');
              checkAndLoadScripts();
            });
            
            window.addEventListener('CookiebotOnDecline', () => {
              console.log('[Tracking] User declined cookies');
            });
            
            console.log('✅ [Tracking] Cookiebot consent listeners configured');
          }
        }, 100);
        
        // Timeout después de 5 segundos
        setTimeout(() => clearInterval(checkCookiebot), 5000);
      } else {
        // Si CMP está deshabilitado, cargar directamente (modo legacy)
        console.warn('[Tracking] CMP disabled - loading scripts directly (not RGPD compliant)');
        loadMetaPixel();
        loadGoogleAnalytics();
        loadGoogleTagManager();
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
