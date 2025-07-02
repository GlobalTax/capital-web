import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  template_type: 'campaign' | 'automation' | 'transactional';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  template_id?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
  target_lists: string[];
  target_segments: string[];
  scheduled_at?: string;
  sent_at?: string;
  recipients_count: number;
  sent_count: number;
  opened_count: number;
  clicked_count: number;
  bounced_count: number;
  unsubscribed_count: number;
  open_rate: number;
  click_rate: number;
  bounce_rate: number;
  created_at: string;
  updated_at: string;
}

export const useEmailMarketing = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch templates
  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates((data || []) as EmailTemplate[]);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las plantillas",
        variant: "destructive"
      });
    }
  };

  // Fetch campaigns
  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns((data || []) as EmailCampaign[]);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las campañas",
        variant: "destructive"
      });
    }
  };

  // Create template
  const createTemplate = async (templateData: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .insert([templateData])
        .select()
        .single();

      if (error) throw error;
      
      await fetchTemplates();
      toast({
        title: "Plantilla creada",
        description: "La plantilla se ha creado correctamente"
      });
      
      return data;
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la plantilla",
        variant: "destructive"
      });
    }
  };

  // Create campaign
  const createCampaign = async (campaignData: Omit<EmailCampaign, 'id' | 'created_at' | 'updated_at' | 'recipients_count' | 'sent_count' | 'opened_count' | 'clicked_count' | 'bounced_count' | 'unsubscribed_count' | 'open_rate' | 'click_rate' | 'bounce_rate'>) => {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .insert([campaignData])
        .select()
        .single();

      if (error) throw error;
      
      await fetchCampaigns();
      toast({
        title: "Campaña creada",
        description: "La campaña se ha creado correctamente"
      });
      
      return data;
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la campaña",
        variant: "destructive"
      });
    }
  };

  // Update campaign status
  const updateCampaignStatus = async (campaignId: string, status: EmailCampaign['status']) => {
    try {
      const { error } = await supabase
        .from('email_campaigns')
        .update({ status })
        .eq('id', campaignId);

      if (error) throw error;
      
      await fetchCampaigns();
      toast({
        title: "Estado actualizado",
        description: "El estado de la campaña se ha actualizado"
      });
    } catch (error) {
      console.error('Error updating campaign status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive"
      });
    }
  };

  // Get campaign analytics
  const getCampaignAnalytics = (campaign: EmailCampaign) => {
    return {
      deliveryRate: campaign.recipients_count > 0 
        ? ((campaign.sent_count - campaign.bounced_count) / campaign.recipients_count * 100).toFixed(1)
        : '0',
      openRate: campaign.open_rate.toFixed(1),
      clickRate: campaign.click_rate.toFixed(1),
      unsubscribeRate: campaign.recipients_count > 0
        ? (campaign.unsubscribed_count / campaign.recipients_count * 100).toFixed(1)
        : '0'
    };
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchTemplates(),
        fetchCampaigns()
      ]);
      setIsLoading(false);
    };

    loadData();
  }, []);

  return {
    templates,
    campaigns,
    isLoading,
    createTemplate,
    createCampaign,
    updateCampaignStatus,
    getCampaignAnalytics,
    refetch: async () => {
      await Promise.all([fetchTemplates(), fetchCampaigns()]);
    }
  };
};