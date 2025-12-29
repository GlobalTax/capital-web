import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AcquisitionChannel {
  id: string;
  name: string;
  category: 'paid' | 'organic' | 'referral' | 'direct' | 'other';
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ChannelCategory = AcquisitionChannel['category'];

export const CATEGORY_LABELS: Record<ChannelCategory, string> = {
  paid: 'Paid',
  organic: 'Orgánico',
  referral: 'Referido',
  direct: 'Directo',
  other: 'Otro',
};

export const CATEGORY_COLORS: Record<ChannelCategory, string> = {
  paid: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  organic: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  referral: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  direct: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  other: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
};

export function useAcquisitionChannels() {
  const queryClient = useQueryClient();

  const { data: channels = [], isLoading, error } = useQuery({
    queryKey: ['acquisition-channels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('acquisition_channels')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as AcquisitionChannel[];
    },
  });

  const createChannel = useMutation({
    mutationFn: async (channel: { name: string; category: ChannelCategory }) => {
      const { data, error } = await supabase
        .from('acquisition_channels')
        .insert({
          name: channel.name,
          category: channel.category,
          display_order: channels.length + 1,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acquisition-channels'] });
    },
  });

  const updateChannel = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AcquisitionChannel> & { id: string }) => {
      const { data, error } = await supabase
        .from('acquisition_channels')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acquisition-channels'] });
    },
  });

  const deleteChannel = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('acquisition_channels')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acquisition-channels'] });
    },
  });

  const channelsByCategory = channels.reduce((acc, channel) => {
    if (!acc[channel.category]) {
      acc[channel.category] = [];
    }
    acc[channel.category].push(channel);
    return acc;
  }, {} as Record<ChannelCategory, AcquisitionChannel[]>);

  return {
    channels,
    channelsByCategory,
    isLoading,
    error,
    createChannel,
    updateChannel,
    deleteChannel,
  };
}
