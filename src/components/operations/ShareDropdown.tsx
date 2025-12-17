import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Share2, Mail, MessageCircle, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ShareDropdownProps {
  operationId: string;
  operationName: string;
  className?: string;
  triggerClassName?: string;
  iconClassName?: string;
}

// Generate or retrieve session ID for tracking
const getSessionId = (): string => {
  const key = 'marketplace_session_id';
  let sessionId = sessionStorage.getItem(key);
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    sessionStorage.setItem(key, sessionId);
  }
  
  return sessionId;
};

const ShareDropdown: React.FC<ShareDropdownProps> = ({
  operationId,
  operationName,
  className = '',
  triggerClassName = 'p-2 rounded-full bg-white/90 hover:bg-white shadow-sm transition-all hover:scale-110',
  iconClassName = 'h-4 w-4 text-gray-400 hover:text-blue-500',
}) => {
  const [copied, setCopied] = React.useState(false);

  const shareUrl = `${window.location.origin}/oportunidades?op=${operationId}`;
  const shareTitle = `Oportunidad de inversión: ${operationName}`;
  const shareText = `Te comparto esta oportunidad de inversión en Capittal:\n\n${operationName}\n\n${shareUrl}`;

  // Track share event to database
  const trackShare = async (method: 'whatsapp' | 'email' | 'copy_link') => {
    try {
      await supabase.from('operation_shares').insert({
        operation_id: operationId,
        share_method: method,
        session_id: getSessionId(),
        source_page: window.location.pathname,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
      });
    } catch (error) {
      console.warn('Failed to track share event:', error);
    }
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Enlace copiado al portapapeles');
      trackShare('copy_link');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      textArea.style.cssText = 'position:fixed;opacity:0;';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      toast.success('Enlace copiado al portapapeles');
      trackShare('copy_link');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    trackShare('whatsapp');
    toast.success('Abriendo WhatsApp...');
  };

  const handleEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const subject = encodeURIComponent(shareTitle);
    const body = encodeURIComponent(shareText);
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
    trackShare('email');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={triggerClassName}
          aria-label="Compartir operación"
          onClick={(e) => e.stopPropagation()}
        >
          <Share2 className={iconClassName} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className={`w-48 bg-white z-50 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuItem 
          onClick={handleCopyLink}
          className="cursor-pointer gap-2"
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copied ? 'Copiado' : 'Copiar enlace'}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleWhatsApp}
          className="cursor-pointer gap-2"
        >
          <MessageCircle className="h-4 w-4 text-green-600" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleEmail}
          className="cursor-pointer gap-2"
        >
          <Mail className="h-4 w-4 text-blue-600" />
          Email
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareDropdown;
