import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type {
  FullSlideTemplate, SlideType, BlockConfig,
  SlideBlockKey, CoverBlockKey, SeparatorBlockKey, IndexBlockKey,
} from '../types/slideTemplate';
import {
  BLOCK_LABELS, BLOCK_COLORS, SLIDE_WIDTH, SLIDE_HEIGHT,
  COVER_BLOCK_LABELS, COVER_BLOCK_COLORS,
  INDEX_BLOCK_LABELS, INDEX_BLOCK_COLORS,
  SEPARATOR_BLOCK_LABELS, SEPARATOR_BLOCK_COLORS,
  DEALHUB_SECTIONS,
} from '../types/slideTemplate';
import { SlideBlockProperties } from './SlideBlockProperties';

// Re-export DEALHUB_SECTIONS from the generator for index preview
import { DEALHUB_SECTIONS as SECTIONS_DATA } from '../utils/generateDealhubPptx';

interface SlideTemplateEditorProps {
  template: FullSlideTemplate;
  onChange: (template: FullSlideTemplate) => void;
}

const PREVIEW_W = 720;
const scale = PREVIEW_W / SLIDE_WIDTH;
const PREVIEW_H = SLIDE_HEIGHT * scale;
const toPixels = (inches: number) => inches * scale;

// Mock data
const MOCK_OP = {
  company_name: 'Empresa Ejemplo S.L.',
  sector: 'Tecnología',
  description: 'Empresa líder en soluciones tecnológicas innovadoras con presencia en el mercado nacional desde hace más de 15 años.',
  highlights: ['Crecimiento sostenido del 20% anual', 'Cartera diversificada de clientes', 'Equipo directivo experimentado'],
  revenue: '€12.5M',
  ebitda: '€2.8M',
  margin: '22.4%',
  employees: '85',
};

const OP_BLOCK_KEYS: SlideBlockKey[] = [
  'title', 'description', 'highlights', 'summaryCard',
  'summaryHeader', 'infoRows', 'financialData', 'cta', 'footer',
];

const COVER_EDITABLE_KEYS: CoverBlockKey[] = ['title', 'subtitle', 'quarter', 'divider', 'footer'];
const SEPARATOR_EDITABLE_KEYS: SeparatorBlockKey[] = ['number', 'title', 'subtitle'];

export const SlideTemplateEditor = ({ template, onChange }: SlideTemplateEditorProps) => {
  const [slideType, setSlideType] = useState<SlideType>('operation');
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ key: string; startX: number; startY: number; origX: number; origY: number } | null>(null);
  const [resizing, setResizing] = useState<{ key: string; startX: number; startY: number; origW: number; origH: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get the current block config for the selected block
  const getBlock = useCallback((): BlockConfig | null => {
    if (!selectedBlock) return null;
    switch (slideType) {
      case 'cover': return (template.cover as any)[selectedBlock] ?? null;
      case 'index': return selectedBlock === 'title' ? template.index.title : null;
      case 'separator': return (template.separator as any)[selectedBlock] ?? null;
      case 'operation': return (template.operation as any)[selectedBlock] ?? null;
    }
    return null;
  }, [selectedBlock, slideType, template]);

  const getBlockLabel = (): string => {
    if (!selectedBlock) return '';
    switch (slideType) {
      case 'cover': return (COVER_BLOCK_LABELS as any)[selectedBlock] || selectedBlock;
      case 'index': return (INDEX_BLOCK_LABELS as any)[selectedBlock] || selectedBlock;
      case 'separator': return (SEPARATOR_BLOCK_LABELS as any)[selectedBlock] || selectedBlock;
      case 'operation': return (BLOCK_LABELS as any)[selectedBlock] || selectedBlock;
    }
    return selectedBlock;
  };

  const handleUpdate = useCallback((patch: Partial<BlockConfig>) => {
    if (!selectedBlock) return;
    const newTemplate = { ...template };
    switch (slideType) {
      case 'cover':
        newTemplate.cover = { ...template.cover, [selectedBlock]: { ...(template.cover as any)[selectedBlock], ...patch } };
        break;
      case 'index':
        if (selectedBlock === 'title') {
          newTemplate.index = { ...template.index, title: { ...template.index.title, ...patch } };
        }
        break;
      case 'separator':
        newTemplate.separator = { ...template.separator, [selectedBlock]: { ...(template.separator as any)[selectedBlock], ...patch } };
        break;
      case 'operation':
        newTemplate.operation = { ...template.operation, [selectedBlock]: { ...(template.operation as any)[selectedBlock], ...patch } };
        break;
    }
    onChange(newTemplate);
  }, [selectedBlock, slideType, template, onChange]);

  const getBlockForDrag = (key: string): BlockConfig | null => {
    switch (slideType) {
      case 'cover': return (template.cover as any)[key] ?? null;
      case 'index': return key === 'title' ? template.index.title : null;
      case 'separator': return (template.separator as any)[key] ?? null;
      case 'operation': return (template.operation as any)[key] ?? null;
    }
    return null;
  };

  const handleMouseDown = useCallback((e: React.MouseEvent, key: string, type: 'drag' | 'resize') => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedBlock(key);
    const block = getBlockForDrag(key);
    if (!block) return;
    if (type === 'drag') {
      setDragging({ key, startX: e.clientX, startY: e.clientY, origX: block.x, origY: block.y });
    } else {
      setResizing({ key, startX: e.clientX, startY: e.clientY, origW: block.w, origH: block.h });
    }
  }, [template, slideType]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragging) {
      const dx = (e.clientX - dragging.startX) / scale;
      const dy = (e.clientY - dragging.startY) / scale;
      const block = getBlockForDrag(dragging.key);
      if (!block) return;
      const patch = {
        x: Math.max(0, Math.min(SLIDE_WIDTH - block.w, parseFloat((dragging.origX + dx).toFixed(2)))),
        y: Math.max(0, Math.min(SLIDE_HEIGHT - block.h, parseFloat((dragging.origY + dy).toFixed(2)))),
      };
      // Apply to the right sub-template
      const newTemplate = { ...template };
      switch (slideType) {
        case 'cover':
          newTemplate.cover = { ...template.cover, [dragging.key]: { ...(template.cover as any)[dragging.key], ...patch } };
          break;
        case 'index':
          if (dragging.key === 'title') newTemplate.index = { ...template.index, title: { ...template.index.title, ...patch } };
          break;
        case 'separator':
          newTemplate.separator = { ...template.separator, [dragging.key]: { ...(template.separator as any)[dragging.key], ...patch } };
          break;
        case 'operation':
          newTemplate.operation = { ...template.operation, [dragging.key]: { ...(template.operation as any)[dragging.key], ...patch } };
          break;
      }
      onChange(newTemplate);
    }
    if (resizing) {
      const dx = (e.clientX - resizing.startX) / scale;
      const dy = (e.clientY - resizing.startY) / scale;
      const patch = {
        w: Math.max(0.5, parseFloat((resizing.origW + dx).toFixed(2))),
        h: Math.max(0.2, parseFloat((resizing.origH + dy).toFixed(2))),
      };
      const newTemplate = { ...template };
      switch (slideType) {
        case 'cover':
          newTemplate.cover = { ...template.cover, [resizing.key]: { ...(template.cover as any)[resizing.key], ...patch } };
          break;
        case 'index':
          if (resizing.key === 'title') newTemplate.index = { ...template.index, title: { ...template.index.title, ...patch } };
          break;
        case 'separator':
          newTemplate.separator = { ...template.separator, [resizing.key]: { ...(template.separator as any)[resizing.key], ...patch } };
          break;
        case 'operation':
          newTemplate.operation = { ...template.operation, [resizing.key]: { ...(template.operation as any)[resizing.key], ...patch } };
          break;
      }
      onChange(newTemplate);
    }
  }, [dragging, resizing, template, onChange, slideType]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
    setResizing(null);
  }, []);

  // ─── RENDER HELPERS ───

  const renderDraggableBlock = (
    key: string,
    block: BlockConfig,
    borderColor: string,
    label: string,
    darkBg: boolean,
    content: React.ReactNode
  ) => {
    if (!block.visible) return null;
    const isSelected = selectedBlock === key;
    return (
      <div
        key={key}
        className={cn(
          'absolute cursor-move overflow-hidden transition-shadow',
          isSelected ? 'ring-2 z-20' : 'z-10 hover:ring-1',
          darkBg ? 'text-white' : 'text-foreground'
        )}
        style={{
          left: toPixels(block.x),
          top: toPixels(block.y),
          width: toPixels(block.w),
          height: toPixels(block.h),
          backgroundColor: block.bgColor ? `#${block.bgColor}` : undefined,
          borderColor,
          boxShadow: isSelected ? `0 0 0 2px ${borderColor}` : undefined,
          outline: isSelected ? 'none' : `1px dashed ${borderColor}40`,
        }}
        onMouseDown={e => handleMouseDown(e, key, 'drag')}
        onClick={e => { e.stopPropagation(); setSelectedBlock(key); }}
      >
        <div
          className="absolute -top-4 left-0 px-1 py-0.5 text-[6px] text-white font-semibold rounded-t whitespace-nowrap"
          style={{ backgroundColor: borderColor }}
        >
          {label}
        </div>
        <div className="p-1 h-full flex items-start">{content}</div>
        {isSelected && (
          <div
            className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize"
            style={{ backgroundColor: borderColor }}
            onMouseDown={e => handleMouseDown(e, key, 'resize')}
          />
        )}
      </div>
    );
  };

  // ─── COVER PREVIEW ───
  const renderCoverPreview = () => {
    const c = template.cover;
    const bg = `#${c.background.color}`;
    return (
      <div className="relative w-full h-full" style={{ backgroundColor: bg }}>
        {renderDraggableBlock('title', c.title, COVER_BLOCK_COLORS.title, 'Título', true,
          <span className="font-bold text-[14px] text-white">{(c.title as any).text || 'Capittal Dealhub'}</span>
        )}
        {renderDraggableBlock('subtitle', c.subtitle, COVER_BLOCK_COLORS.subtitle, 'Subtítulo', true,
          <span className="text-[10px] text-white">{(c.subtitle as any).text || 'Open Deals'}</span>
        )}
        {renderDraggableBlock('quarter', c.quarter, COVER_BLOCK_COLORS.quarter, 'Trimestre', true,
          <span className="text-[8px]" style={{ color: `#${c.quarter.color || '8B919B'}` }}>Q1 — 2026</span>
        )}
        {renderDraggableBlock('divider', c.divider, COVER_BLOCK_COLORS.divider, 'Separador', true,
          <div className="w-full h-full" style={{ backgroundColor: `#${c.divider.bgColor || '8B919B'}` }} />
        )}
        {renderDraggableBlock('footer', c.footer, COVER_BLOCK_COLORS.footer, 'Footer', true,
          <span className="text-[6px]" style={{ color: `#${c.footer.color || '8B919B'}` }}>{(c.footer as any).text || 'CAPITTAL'}</span>
        )}
        {/* Background selector */}
        <button
          onClick={e => { e.stopPropagation(); setSelectedBlock('background'); }}
          className={cn(
            'absolute bottom-2 right-2 z-30 px-2 py-1 rounded text-[7px] font-semibold border transition-colors',
            selectedBlock === 'background'
              ? 'bg-white text-gray-900 border-white'
              : 'bg-white/10 text-white/70 border-white/20 hover:bg-white/20'
          )}
        >
          Fondo
        </button>
      </div>
    );
  };

  // ─── INDEX PREVIEW ───
  const renderIndexPreview = () => {
    const idx = template.index;
    const bg = `#${idx.background.color}`;
    return (
      <div className="relative w-full h-full" style={{ backgroundColor: bg }}>
        {renderDraggableBlock('title', idx.title, INDEX_BLOCK_COLORS.title, 'Título', false,
          <span className="font-bold text-[10px]" style={{ color: `#${idx.title.color || '161B22'}` }}>Índice de Oportunidades</span>
        )}
        {/* Cards preview (non-draggable, shows layout) */}
        {SECTIONS_DATA.map((section, i) => {
          const x = idx.cardsStartX + i * (idx.cardW + idx.cardGap);
          return (
            <div
              key={section.key}
              className="absolute rounded overflow-hidden"
              style={{
                left: toPixels(x),
                top: toPixels(idx.cardsStartY),
                width: toPixels(idx.cardW),
                height: toPixels(idx.cardH),
                backgroundColor: `#${idx.cardBgColor}`,
                borderRadius: toPixels(idx.cardRadius),
              }}
            >
              <div className="p-1.5">
                <div className="text-[7px] font-bold" style={{ color: `#${idx.sectionColors[i]}` }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="text-[6px] font-bold mt-0.5" style={{ color: '#161B22' }}>
                  {section.label}
                </div>
                <div className="text-[5px] mt-0.5" style={{ color: '#8B919B' }}>
                  {section.subtitle}
                </div>
              </div>
            </div>
          );
        })}
        <button
          onClick={e => { e.stopPropagation(); setSelectedBlock('background'); }}
          className={cn(
            'absolute bottom-2 right-2 z-30 px-2 py-1 rounded text-[7px] font-semibold border transition-colors',
            selectedBlock === 'background'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-secondary text-foreground border-border hover:bg-secondary/80'
          )}
        >
          Fondo
        </button>
      </div>
    );
  };

  // ─── SEPARATOR PREVIEW ───
  const renderSeparatorPreview = () => {
    const sep = template.separator;
    const bg = `#${sep.background.color}`;
    return (
      <div className="relative w-full h-full" style={{ backgroundColor: bg }}>
        {renderDraggableBlock('number', sep.number, SEPARATOR_BLOCK_COLORS.number, 'Número', true,
          <span className="text-[16px] font-bold" style={{ color: `#${sep.number.color || sep.accentColor}` }}>01</span>
        )}
        {renderDraggableBlock('title', sep.title, SEPARATOR_BLOCK_COLORS.title, 'Título', true,
          <span className="text-[12px] font-bold text-white">Mandatos de Venta</span>
        )}
        {renderDraggableBlock('subtitle', sep.subtitle, SEPARATOR_BLOCK_COLORS.subtitle, 'Subtítulo', true,
          <span className="text-[7px]" style={{ color: `#${sep.subtitle.color || '8B919B'}` }}>Empresas en proceso de venta</span>
        )}
        <button
          onClick={e => { e.stopPropagation(); setSelectedBlock('background'); }}
          className={cn(
            'absolute bottom-2 right-2 z-30 px-2 py-1 rounded text-[7px] font-semibold border transition-colors',
            selectedBlock === 'background'
              ? 'bg-white text-gray-900 border-white'
              : 'bg-white/10 text-white/70 border-white/20 hover:bg-white/20'
          )}
        >
          Fondo
        </button>
      </div>
    );
  };

  // ─── OPERATION PREVIEW ───
  const renderOperationPreview = () => {
    const t = template.operation;
    const isDarkBlock = (key: SlideBlockKey) => ['summaryCard', 'summaryHeader', 'infoRows', 'financialData', 'cta'].includes(key);

    const renderBlockContent = (key: SlideBlockKey) => {
      switch (key) {
        case 'title': return <span className="font-bold text-[10px] truncate">{MOCK_OP.company_name}</span>;
        case 'description': return <span className="text-[7px] leading-tight line-clamp-4">{MOCK_OP.description}</span>;
        case 'highlights':
          return (
            <div className="text-[7px]">
              <div className="font-bold mb-0.5">Aspectos Destacados</div>
              {MOCK_OP.highlights.map((h, i) => <div key={i}>• {h}</div>)}
            </div>
          );
        case 'summaryCard': return <span className="text-[7px] text-white/50">Tarjeta Resumen</span>;
        case 'summaryHeader': return <span className="text-[8px] font-bold text-white">Resumen</span>;
        case 'infoRows':
          return (
            <div className="text-[6px] text-white space-y-0.5">
              <div>Ubicación: España</div>
              <div>Sector: {MOCK_OP.sector}</div>
            </div>
          );
        case 'financialData':
          return (
            <div className="text-[6px] text-white space-y-0.5">
              <div className="font-bold text-[7px] mb-1">Datos Clave</div>
              <div>Facturación: {MOCK_OP.revenue}</div>
              <div>EBITDA: {MOCK_OP.ebitda}</div>
              <div>Margen: {MOCK_OP.margin}</div>
              <div>Empleados: {MOCK_OP.employees}</div>
            </div>
          );
        case 'cta': return <span className="text-[7px] text-white font-bold">{(t.cta as any).text || 'Más Información →'}</span>;
        case 'footer': return <span className="text-[6px]">{(t.footer as any).text || 'CAPITTAL — Información Confidencial'}</span>;
        default: return null;
      }
    };

    return (
      <div className="relative w-full h-full bg-white">
        {OP_BLOCK_KEYS.map(key => {
          const block = t[key];
          if (!block.visible) return null;
          const borderColor = BLOCK_COLORS[key];
          const dark = isDarkBlock(key);
          return renderDraggableBlock(
            key, block, borderColor, BLOCK_LABELS[key], dark,
            key === 'summaryCard'
              ? <div className="w-full h-full" style={{ backgroundColor: `#${block.color || '161B22'}`, borderRadius: toPixels(block.rectRadius || 0.15) }} />
              : renderBlockContent(key)
          );
        })}
      </div>
    );
  };

  // ─── BACKGROUND PROPERTIES (special case) ───
  const renderBackgroundProps = () => {
    if (selectedBlock !== 'background') return null;
    let bgColor = '';
    if (slideType === 'cover') bgColor = template.cover.background.color;
    else if (slideType === 'index') bgColor = template.index.background.color;
    else if (slideType === 'separator') bgColor = template.separator.background.color;
    else return null;

    const updateBg = (color: string) => {
      const newTemplate = { ...template };
      const clean = color.replace('#', '');
      if (slideType === 'cover') newTemplate.cover = { ...template.cover, background: { color: clean } };
      else if (slideType === 'index') newTemplate.index = { ...template.index, background: { color: clean } };
      else if (slideType === 'separator') newTemplate.separator = { ...template.separator, background: { color: clean } };
      onChange(newTemplate);
    };

    return (
      <div className="space-y-4 p-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Color de Fondo</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Color de fondo de la slide</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={`#${bgColor}`}
            onChange={e => updateBg(e.target.value)}
            className="w-8 h-8 rounded border border-border cursor-pointer"
          />
          <input
            value={bgColor}
            onChange={e => updateBg(e.target.value)}
            className="flex h-8 w-full rounded-md border border-border bg-background px-3 py-2 text-xs font-mono"
            maxLength={6}
          />
        </div>
        {/* Index-specific: card colors and dimensions */}
        {slideType === 'index' && (
          <>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tarjetas</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Ancho</label>
                  <input type="number" step={0.1} value={template.index.cardW} onChange={e => onChange({ ...template, index: { ...template.index, cardW: parseFloat(e.target.value) || 2.8 } })} className="flex h-8 w-full rounded-md border border-border bg-background px-2 text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Alto</label>
                  <input type="number" step={0.1} value={template.index.cardH} onChange={e => onChange({ ...template, index: { ...template.index, cardH: parseFloat(e.target.value) || 2.2 } })} className="flex h-8 w-full rounded-md border border-border bg-background px-2 text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Separación</label>
                  <input type="number" step={0.1} value={template.index.cardGap} onChange={e => onChange({ ...template, index: { ...template.index, cardGap: parseFloat(e.target.value) || 0.3 } })} className="flex h-8 w-full rounded-md border border-border bg-background px-2 text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Radio</label>
                  <input type="number" step={0.01} value={template.index.cardRadius} onChange={e => onChange({ ...template, index: { ...template.index, cardRadius: parseFloat(e.target.value) || 0.1 } })} className="flex h-8 w-full rounded-md border border-border bg-background px-2 text-xs" />
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Color Fondo Tarjetas</p>
              <div className="flex items-center gap-2">
                <input type="color" value={`#${template.index.cardBgColor}`} onChange={e => onChange({ ...template, index: { ...template.index, cardBgColor: e.target.value.replace('#', '') } })} className="w-8 h-8 rounded border border-border cursor-pointer" />
                <input value={template.index.cardBgColor} onChange={e => onChange({ ...template, index: { ...template.index, cardBgColor: e.target.value.replace('#', '') } })} className="flex h-8 w-full rounded-md border border-border bg-background px-2 text-xs font-mono" maxLength={6} />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Colores por Sección</p>
              <div className="space-y-2">
                {SECTIONS_DATA.map((s, i) => (
                  <div key={s.key} className="flex items-center gap-2">
                    <input
                      type="color"
                      value={`#${template.index.sectionColors[i]}`}
                      onChange={e => {
                        const colors = [...template.index.sectionColors] as [string, string, string, string];
                        colors[i] = e.target.value.replace('#', '');
                        onChange({ ...template, index: { ...template.index, sectionColors: colors } });
                      }}
                      className="w-6 h-6 rounded border border-border cursor-pointer"
                    />
                    <span className="text-xs text-muted-foreground">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        {/* Separator-specific: accent color */}
        {slideType === 'separator' && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Color de Acento</p>
            <div className="flex items-center gap-2">
              <input type="color" value={`#${template.separator.accentColor}`} onChange={e => onChange({ ...template, separator: { ...template.separator, accentColor: e.target.value.replace('#', '') } })} className="w-8 h-8 rounded border border-border cursor-pointer" />
              <input value={template.separator.accentColor} onChange={e => onChange({ ...template, separator: { ...template.separator, accentColor: e.target.value.replace('#', '') } })} className="flex h-8 w-full rounded-md border border-border bg-background px-2 text-xs font-mono" maxLength={6} />
            </div>
          </div>
        )}
      </div>
    );
  };

  const SLIDE_TYPE_LABELS: Record<SlideType, string> = {
    cover: 'Portada',
    index: 'Índice',
    separator: 'Separador',
    operation: 'Operación',
  };

  return (
    <div className="flex flex-col h-full">
      {/* Slide type tabs */}
      <div className="px-4 pt-3 pb-2 border-b border-border shrink-0">
        <Tabs value={slideType} onValueChange={v => { setSlideType(v as SlideType); setSelectedBlock(null); }}>
          <TabsList className="w-full">
            {(Object.keys(SLIDE_TYPE_LABELS) as SlideType[]).map(k => (
              <TabsTrigger key={k} value={k} className="flex-1 text-xs">{SLIDE_TYPE_LABELS[k]}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Preview area */}
        <div className="flex-1 flex items-center justify-center bg-muted/30 p-4 overflow-hidden min-w-0">
          <div
            ref={containerRef}
            className="relative shadow-lg border border-border overflow-hidden"
            style={{ width: PREVIEW_W, height: PREVIEW_H, userSelect: 'none' }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={() => { if (!dragging && !resizing) setSelectedBlock(null); }}
          >
            {slideType === 'cover' && renderCoverPreview()}
            {slideType === 'index' && renderIndexPreview()}
            {slideType === 'separator' && renderSeparatorPreview()}
            {slideType === 'operation' && renderOperationPreview()}
          </div>
        </div>

        {/* Properties panel */}
        <div className="w-[240px] border-l border-border bg-background shrink-0 overflow-hidden">
          <div className="border-b border-border px-4 py-2.5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Propiedades</h3>
          </div>
          {selectedBlock === 'background' ? (
            renderBackgroundProps()
          ) : (
            <SlideBlockProperties
              selectedBlock={selectedBlock}
              blockLabel={getBlockLabel()}
              block={getBlock()}
              onUpdate={handleUpdate}
            />
          )}
        </div>
      </div>
    </div>
  );
};
