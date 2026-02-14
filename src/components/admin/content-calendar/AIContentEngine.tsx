import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2, Plus, Zap, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePESectorIntelligence, type PESectorIntelligence, type ContentCalendarItem, type ContentChannel } from '@/hooks/useContentCalendar';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const CHANNEL_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  linkedin_company: { label: 'LinkedIn Empresa', emoji: '🏢', color: 'bg-blue-100 text-blue-700' },
  linkedin_personal: { label: 'LinkedIn Personal', emoji: '👤', color: 'bg-cyan-100 text-cyan-700' },
  blog: { label: 'Blog / Web', emoji: '📝', color: 'bg-emerald-100 text-emerald-700' },
  newsletter: { label: 'Newsletter', emoji: '📧', color: 'bg-purple-100 text-purple-700' },
  crm_internal: { label: 'CRM Interno', emoji: '🔒', color: 'bg-slate-100 text-slate-600' },
};

interface GeneratedIdea {
  title: string;
  channel: ContentChannel;
  content_type: string;
  linkedin_format?: string;
  target_audience?: string;
  priority: string;
  category: string;
  notes: string;
  key_data?: string;
  target_keywords?: string[];
  meta_title?: string;
  meta_description?: string;
}

interface AIContentEngineProps {
  onAddToCalendar: (data: Partial<ContentCalendarItem>) => void;
}

const INITIAL_IDEAS: Partial<ContentCalendarItem>[] = [
  { title: '¿Por qué los fondos de inversión están comprando asesorías fiscales?', channel: 'linkedin_company', content_type: 'linkedin_post', linkedin_format: 'long_text', target_audience: 'sellers', priority: 'high', category: 'Despachos profesionales', notes: '11 de 30 top CPAs en EE.UU. ya son propiedad de PE. Conectar con España: Afianza, Adlanter, ETL.', key_data: '11 de las 30 mayores CPAs de EE.UU. = propiedad de PE', target_keywords: ['M&A asesorías', 'PE despachos', 'vender asesoría'], status: 'idea' },
  { title: 'El mapa de compradores activos en España: Afianza, Adlanter, ETL, Talenom, Asenza', channel: 'linkedin_company', content_type: 'carousel', linkedin_format: 'carousel', target_audience: 'sellers', priority: 'high', category: 'Despachos profesionales', notes: 'Carrusel 5-7 slides con cada comprador, fondo detrás y tamaño objetivo.', key_data: '5+ compradores activos en España', status: 'idea' },
  { title: 'Qué es un múltiplo EV/EBITDA explicado para empresarios', channel: 'linkedin_company', content_type: 'linkedin_post', linkedin_format: 'long_text', target_audience: 'sellers', priority: 'medium', category: 'General M&A', notes: 'Educativo. Rangos 6x-18x por sector. Lenguaje accesible.', key_data: 'Rangos 6x-18x EBITDA por sector', status: 'idea' },
  { title: 'Agroalimentación española: el nuevo foco del PE europeo', channel: 'linkedin_company', content_type: 'linkedin_post', linkedin_format: 'infographic', target_audience: 'sellers', priority: 'high', category: 'Alimentación', notes: 'Roland Berger: Iberia = máxima convicción PE en Europa para agroalimentación.', key_data: 'Península Ibérica = mercado de mayor convicción PE', status: 'idea' },
  { title: 'Servicios de campo: el sector que nadie ve pero donde PE invierte $650.000M', channel: 'linkedin_company', content_type: 'carousel', linkedin_format: 'carousel', target_audience: 'sellers', priority: 'high', category: 'Servicios empresariales', notes: 'HVAC, cubiertas, protección incendios. +229% plataformas en 24 meses.', key_data: '$650.000M mercado, +229% plataformas', status: 'idea' },
  { title: 'Caso: de asesoría local a plataforma nacional', channel: 'linkedin_personal', content_type: 'linkedin_post', linkedin_format: 'storytelling', target_audience: 'sellers', priority: 'medium', category: 'Despachos profesionales', notes: 'Caso anónimo. Múltiplo real, proceso, resultado. Tono personal.', key_data: 'Múltiplo 8x EBITDA', status: 'idea' },
  { title: 'España bate récord de fundraising PE: €4.070M (+50%)', channel: 'linkedin_company', content_type: 'linkedin_post', linkedin_format: 'data_highlight', target_audience: 'sellers', priority: 'high', category: 'General M&A', notes: '+50% interanual, mayor registro histórico. ¿Qué significa para las PYMEs?', key_data: '€4.070M fundraising PE España (+50%)', status: 'idea' },
  { title: 'Clínicas dentales: 130 DSOs respaldadas por PE', channel: 'linkedin_company', content_type: 'linkedin_post', linkedin_format: 'long_text', target_audience: 'sellers', priority: 'high', category: 'Salud', notes: '161 operaciones en 2024, múltiplos 9-12x EBITDA.', key_data: '130 DSOs, 161 operaciones 2024', status: 'idea' },
  { title: '3 señales de que tu sector está a punto de consolidarse', channel: 'linkedin_personal', content_type: 'linkedin_post', linkedin_format: 'opinion', target_audience: 'sellers', priority: 'medium', category: 'General M&A', notes: 'Checklist para empresarios. Fases de consolidación.', key_data: 'Fases de consolidación sectorial', status: 'idea' },
  { title: 'Facility management y seguridad: la ola que viene', channel: 'linkedin_company', content_type: 'linkedin_post', linkedin_format: 'long_text', target_audience: 'sellers', priority: 'medium', category: 'Servicios empresariales', notes: 'ISS, Sodexo + nuevos PE entrando. Gran fragmentación.', key_data: 'Mercado altamente fragmentado', status: 'idea' },
  { title: '¿Cuánto vale una clínica dental? Múltiplos reales', channel: 'linkedin_company', content_type: 'carousel', linkedin_format: 'carousel', target_audience: 'sellers', priority: 'high', category: 'Salud', notes: '7-12x EBITDA según tamaño. Carrusel 8-10 slides con rangos.', key_data: '7-12x EBITDA según tamaño', status: 'idea' },
  { title: 'Talenom: la finlandesa que compra asesorías en España', channel: 'linkedin_company', content_type: 'linkedin_post', linkedin_format: 'long_text', target_audience: 'sellers', priority: 'medium', category: 'Despachos profesionales', notes: 'Expansión desde Finlandia a España. Caso de internacionalización.', key_data: 'Expansión cross-border PE', status: 'idea' },
  { title: 'Qué busca un fondo de inversión en tu empresa', channel: 'linkedin_personal', content_type: 'linkedin_post', linkedin_format: 'opinion', target_audience: 'sellers', priority: 'high', category: 'General M&A', notes: 'Recurrencia, fragmentación, base clientes. Tono personal.', key_data: 'Factores clave de valoración PE', status: 'idea' },
  { title: 'Veterinario: IVC Evidensia hace 300 adquisiciones/año', channel: 'linkedin_company', content_type: 'linkedin_post', linkedin_format: 'data_highlight', target_audience: 'sellers', priority: 'medium', category: 'Salud', notes: '2.500 centros, 20 países, EQT detrás.', key_data: '300 adquisiciones/año, 2.500 centros', status: 'idea' },
  { title: 'Nord Anglia: mayor operación PE en Europa 2024 ($14.500M)', channel: 'linkedin_company', content_type: 'linkedin_post', linkedin_format: 'long_text', target_audience: 'buyers', priority: 'medium', category: 'Educación', notes: '80+ colegios premium. Educación como activo PE.', key_data: '$14.500M, 80+ colegios', status: 'idea' },
  { title: 'Cómo preparar tu empresa para una venta: guía práctica', channel: 'linkedin_company', content_type: 'carousel', linkedin_format: 'carousel', target_audience: 'sellers', priority: 'high', category: 'General M&A', notes: 'Checklist operativo para empresarios. Carrusel visual.', key_data: 'Checklist de preparación para venta', status: 'idea' },
  { title: 'Applus+: el caso español de TIC global comprado por PE', channel: 'linkedin_company', content_type: 'linkedin_post', linkedin_format: 'long_text', target_audience: 'sellers', priority: 'medium', category: 'Servicios empresariales', notes: 'PAI Partners, OPA. Caso de éxito español.', key_data: 'OPA de PAI Partners', status: 'idea' },
  { title: 'PE en salud mental: autismo, adicciones, salud conductual', channel: 'linkedin_company', content_type: 'linkedin_post', linkedin_format: 'long_text', target_audience: 'sellers', priority: 'medium', category: 'Salud', notes: 'Mandatos ABA en 50 estados. Mercado emergente.', key_data: 'Mandatos ABA en 50 estados', status: 'idea' },
  { title: 'Predicción: los 5 subsectores que explotarán en España en 2026', channel: 'linkedin_personal', content_type: 'linkedin_post', linkedin_format: 'opinion', target_audience: 'sellers', priority: 'urgent', category: 'General M&A', notes: 'Cubiertas, HVAC, CPA, dental, agro. Opinión personal con datos.', key_data: '5 subsectores clave 2026', status: 'idea' },
  { title: 'Lo que he aprendido de 50 empresarios que vendieron su empresa', channel: 'linkedin_personal', content_type: 'linkedin_post', linkedin_format: 'storytelling', target_audience: 'sellers', priority: 'high', category: 'General M&A', notes: 'Storytelling. Reflexiones personales. Lecciones aprendidas.', key_data: '50 operaciones de venta', status: 'idea' },
];

const AIContentEngine: React.FC<AIContentEngineProps> = ({ onAddToCalendar }) => {
  const { sectors } = usePESectorIntelligence();
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<GeneratedIdea[]>([]);
  const [isLoadingInitial, setIsLoadingInitial] = useState(false);

  const handleGenerateIdeas = async () => {
    setIsGenerating(true);
    try {
      const sectorContext = selectedSector !== 'all'
        ? sectors.find(s => s.id === selectedSector)
        : null;

      const { data, error } = await supabase.functions.invoke('generate-content-calendar-ai', {
        body: {
          mode: 'generate_ideas',
          sector_context: sectorContext ? {
            sector: sectorContext.sector,
            subsector: sectorContext.subsector,
            vertical: sectorContext.vertical,
            pe_thesis: sectorContext.pe_thesis,
            quantitative_data: sectorContext.quantitative_data,
            active_pe_firms: sectorContext.active_pe_firms,
            multiples_valuations: sectorContext.multiples_valuations,
            consolidation_phase: sectorContext.consolidation_phase,
            geography: sectorContext.geography,
          } : null,
          channel_filter: channelFilter,
        },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setGeneratedIdeas(data.result.ideas || []);
      toast.success(`${data.result.ideas?.length || 0} ideas generadas`);
    } catch (e: any) {
      toast.error(e.message || 'Error generando ideas');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadInitialPlan = async () => {
    setIsLoadingInitial(true);
    try {
      for (const idea of INITIAL_IDEAS) {
        onAddToCalendar(idea);
        await new Promise(r => setTimeout(r, 100));
      }
      toast.success(`${INITIAL_IDEAS.length} ideas del plan inicial cargadas`);
    } catch (e: any) {
      toast.error('Error cargando plan inicial');
    } finally {
      setIsLoadingInitial(false);
    }
  };

  const handleAddIdea = (idea: GeneratedIdea) => {
    onAddToCalendar({
      title: idea.title,
      channel: idea.channel as ContentChannel,
      content_type: idea.content_type as any,
      linkedin_format: idea.linkedin_format as any,
      target_audience: (idea.target_audience || 'sellers') as any,
      priority: idea.priority as any,
      category: idea.category,
      notes: idea.notes,
      key_data: idea.key_data || null,
      target_keywords: idea.target_keywords || [],
      meta_title: idea.meta_title || null,
      meta_description: idea.meta_description || null,
      status: 'idea',
    });
    setGeneratedIdeas(prev => prev.filter(i => i.title !== idea.title));
    toast.success('Idea añadida al calendario');
  };

  const uniqueSectors = [...new Set(sectors.map(s => `${s.sector} - ${s.subsector}`))];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-dashed border-2 border-primary/20 hover:border-primary/40 transition-colors">
          <CardContent className="p-6 text-center space-y-3">
            <Zap className="h-8 w-8 mx-auto text-primary" />
            <div>
              <h3 className="font-semibold">Cargar Plan Inicial (20 ideas)</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Carga las 20 ideas del banco estratégico: LinkedIn, Blog, Newsletter
              </p>
            </div>
            <Button onClick={handleLoadInitialPlan} disabled={isLoadingInitial} className="w-full">
              {isLoadingInitial ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Cargar 20 Ideas
            </Button>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2 border-primary/20 hover:border-primary/40 transition-colors">
          <CardContent className="p-6 text-center space-y-3">
            <Sparkles className="h-8 w-8 mx-auto text-primary" />
            <div>
              <h3 className="font-semibold">Generar Ideas con IA</h3>
              <p className="text-xs text-muted-foreground mt-1">
                La IA analiza los sectores PE y genera ideas de contenido
              </p>
            </div>
            <div className="flex gap-2">
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger className="h-9 text-xs flex-1"><SelectValue placeholder="Sector" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los sectores</SelectItem>
                  {sectors.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.subsector}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={channelFilter} onValueChange={setChannelFilter}>
                <SelectTrigger className="h-9 text-xs w-[160px]"><SelectValue placeholder="Canal" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.entries(CHANNEL_CONFIG).filter(([k]) => k !== 'crm_internal').map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.emoji} {v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerateIdeas} disabled={isGenerating} className="w-full">
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
              Generar Ideas
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Generated Ideas */}
      {generatedIdeas.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {generatedIdeas.length} ideas generadas
            </h3>
            <Button size="sm" variant="outline" onClick={() => {
              generatedIdeas.forEach(idea => handleAddIdea(idea));
            }}>
              <Plus className="h-3 w-3 mr-1" /> Añadir todas
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {generatedIdeas.map((idea, idx) => {
              const ch = CHANNEL_CONFIG[idea.channel] || CHANNEL_CONFIG.blog;
              return (
                <Card key={idx} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-medium flex-1">{idea.title}</h4>
                      <Button size="sm" variant="outline" className="h-7 text-xs shrink-0" onClick={() => handleAddIdea(idea)}>
                        <Plus className="h-3 w-3 mr-1" /> Añadir
                      </Button>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                      <Badge className={cn('text-[10px]', ch.color)}>
                        {ch.emoji} {ch.label}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">{idea.content_type}</Badge>
                      {idea.key_data && (
                        <Badge variant="secondary" className="text-[10px]">📊 {idea.key_data.substring(0, 40)}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{idea.notes}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIContentEngine;
