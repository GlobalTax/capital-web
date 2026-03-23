import React, { useMemo, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOutboundPipelineStages, OutboundPipelineStage } from '@/hooks/useOutboundPipelineStages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Building2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { toast } from 'sonner';

interface PipelineCompany {
  id: string;
  company_name: string;
  campaign_id: string;
  campaign_name: string;
  seguimiento_estado: string | null;
}

interface OutboundPipelineSectionProps {
  enabledCampaignIds: string[];
}

export function OutboundPipelineSection({ enabledCampaignIds }: OutboundPipelineSectionProps) {
  const { activeStages, isLoading: stagesLoading } = useOutboundPipelineStages();
  const queryClient = useQueryClient();

  const { data: companies = [], isLoading: companiesLoading } = useQuery<PipelineCompany[]>({
    queryKey: ['outbound-pipeline-companies', enabledCampaignIds],
    queryFn: async () => {
      if (!enabledCampaignIds.length) return [];
      const { data, error } = await (supabase as any)
        .from('valuation_campaign_companies')
        .select('id, company_name, campaign_id, seguimiento_estado')
        .in('campaign_id', enabledCampaignIds);
      if (error) throw error;

      // Get campaign names
      const { data: campaigns } = await (supabase as any)
        .from('valuation_campaigns')
        .select('id, name')
        .in('id', enabledCampaignIds);
      const nameMap: Record<string, string> = {};
      (campaigns || []).forEach((c: any) => { nameMap[c.id] = c.name; });

      return (data || []).map((c: any) => ({
        ...c,
        campaign_name: nameMap[c.campaign_id] || '',
      }));
    },
    staleTime: 30_000,
    enabled: enabledCampaignIds.length > 0,
  });

  const grouped = useMemo(() => {
    const map: Record<string, PipelineCompany[]> = {};
    activeStages.forEach(s => { map[s.stage_key] = []; });
    companies.forEach(c => {
      const key = c.seguimiento_estado || 'sin_respuesta';
      if (map[key]) map[key].push(c);
      else if (map['sin_respuesta']) map['sin_respuesta'].push(c);
    });
    return map;
  }, [companies, activeStages]);

  const handleDragEnd = useCallback(async (result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;

    const newStageKey = destination.droppableId;
    const company = companies.find(c => c.id === draggableId);
    if (!company || company.seguimiento_estado === newStageKey) return;

    // Optimistic update
    queryClient.setQueryData<PipelineCompany[]>(
      ['outbound-pipeline-companies', enabledCampaignIds],
      (old) => old?.map(c => c.id === draggableId ? { ...c, seguimiento_estado: newStageKey } : c) || []
    );

    const { error } = await (supabase as any)
      .from('valuation_campaign_companies')
      .update({ seguimiento_estado: newStageKey })
      .eq('id', draggableId);

    if (error) {
      toast.error('Error al mover empresa');
      queryClient.invalidateQueries({ queryKey: ['outbound-pipeline-companies'] });
    } else {
      queryClient.invalidateQueries({ queryKey: ['outbound-summary-raw'] });
    }
  }, [companies, enabledCampaignIds, queryClient]);

  if (stagesLoading || companiesLoading) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Pipeline de Seguimiento</CardTitle>
      </CardHeader>
      <CardContent className="p-0 pb-2">
        <DragDropContext onDragEnd={handleDragEnd}>
          <ScrollArea className="w-full">
            <div className="flex gap-3 px-4 pb-2 min-w-max">
              {activeStages.filter(s => s.stage_key !== 'sin_respuesta').map(stage => (
                <PipelineColumn
                  key={stage.id}
                  stage={stage}
                  companies={grouped[stage.stage_key] || []}
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </DragDropContext>
      </CardContent>
    </Card>
  );
}

function PipelineColumn({ stage, companies }: { stage: OutboundPipelineStage; companies: PipelineCompany[] }) {
  const IconComponent = (LucideIcons as any)[stage.icon] || LucideIcons.Circle;

  return (
    <div className="flex flex-col w-[240px] shrink-0">
      <div
        className="flex items-center justify-between px-3 py-2 rounded-t-lg border-b"
        style={{ backgroundColor: `${stage.color}15` }}
      >
        <div className="flex items-center gap-1.5">
          <IconComponent className="h-3.5 w-3.5" style={{ color: stage.color }} />
          <span className="text-xs font-medium" style={{ color: stage.color }}>{stage.label}</span>
        </div>
        <Badge variant="secondary" className="text-[10px] px-1.5 h-5">{companies.length}</Badge>
      </div>

      <Droppable droppableId={stage.stage_key}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-[120px] max-h-[300px] overflow-y-auto rounded-b-lg border border-t-0 p-1.5 space-y-1.5 transition-colors ${
              snapshot.isDraggingOver ? 'bg-primary/5 border-primary/30' : 'bg-muted/20 border-border'
            }`}
          >
            {companies.length === 0 ? (
              <div className="flex items-center justify-center h-16 text-[10px] text-muted-foreground">
                Sin empresas
              </div>
            ) : (
              companies.map((c, i) => (
                <Draggable key={c.id} draggableId={c.id} index={i}>
                  {(prov, snap) => (
                    <div
                      ref={prov.innerRef}
                      {...prov.draggableProps}
                      {...prov.dragHandleProps}
                      className={`bg-background border border-border rounded-md px-2.5 py-1.5 cursor-grab text-xs ${
                        snap.isDragging ? 'shadow-md ring-1 ring-primary/20' : 'hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="font-medium truncate">{c.company_name}</span>
                      </div>
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 mt-0.5 max-w-full truncate font-normal text-muted-foreground">
                        {c.campaign_name}
                      </Badge>
                    </div>
                  )}
                </Draggable>
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
