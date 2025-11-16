/**
 * Global Window Type Extensions
 * Declaraciones de tipos para scripts de terceros y tracking
 */

declare global {
  interface Window {
    // Brevo SDK (tracking, forms, analytics)
    Brevo?: any[];
    
    // Brevo Conversations (WhatsApp widget)
    BrevoConversationsID?: string;
    BrevoConversations?: (...args: any[]) => void;
    
    // Google Analytics & Tag Manager
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    google_tag_manager?: any;
    
    // Facebook Pixel
    fbq?: (...args: any[]) => void;
    _fbq?: any;
    
    // Cookiebot CMP
    Cookiebot?: {
      consent?: {
        marketing?: boolean;
        statistics?: boolean;
        preferences?: boolean;
        necessary?: boolean;
      };
      show?: () => void;
      renew?: () => void;
    };
    
    // LinkedIn Insight Tag
    _linkedin_data_partner_ids?: string[];
    _linkedin_partner_id?: string;
    
    // Hotjar
    hj?: (...args: any[]) => void;
    _hjSettings?: {
      hjid: number;
      hjsv: number;
    };
    
    // Helpers de desarrollo
    showCookieBanner?: () => void;
  }
}

export {};
