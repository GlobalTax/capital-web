import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { SlideTemplate, SlideBlockKey } from '../types/slideTemplate';
import { BLOCK_LABELS, BLOCK_COLORS, SLIDE_WIDTH, SLIDE_HEIGHT } from '../types/slideTemplate';
import { SlideBlockProperties } from './SlideBlockProperties';

interface SlideTemplateEditorProps {
  template: SlideTemplate;
  onChange: (template: SlideTemplate) => void;
}

// Mock data for preview
const MOCK_OP = {
  company_name: 'Empresa Ejemplo S.L.',
  sector: 'Tecnología',
  description: 'Empresa líder en soluciones tecnológicas innovadoras con presencia en el mercado nacional desde hace más de 15 años. Ofrece servicios de consultoría, desarrollo de software y transformación digital.',
  highlights: ['Crecimiento sostenido del 20% anual', 'Cartera diversificada de clientes', 'Equipo directivo experimentado'],
  revenue: '€12.5M',
  ebitda: '€2.8M',
  margin: '22.4%',
  employees: '85',
};

const BLOCK_KEYS: SlideBlockKey[] = [
  'title', 'description', 'highlights', 'summaryCard',
  'summaryHeader', 'infoRows', 'financialData', 'cta', 'footer',
];

export const SlideTemplateEditor = ({ template, onChange }: SlideTemplateEditorProps) => {
  const [selectedBlock, setSelectedBlock] = useState<SlideBlockKey | null>(null);
  const [dragging, setDragging] = useState<{ key: SlideBlockKey; startX: number; startY: number; origX: number; origY: number } | null>(null);
  const [resizing, setResizing] = useState<{ key: SlideBlockKey; startX: number; startY: number; origW: number; origH: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scale factor: map inches to pixels in preview
  const PREVIEW_W = 720;
  const scale = PREVIEW_W / SLIDE_WIDTH;
  const PREVIEW_H = SLIDE_HEIGHT * scale;

  const toPixels = (inches: number) => inches * scale;

  const handleMouseDown = useCallback((e: React.MouseEvent, key: SlideBlockKey, type: 'drag' | 'resize') => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedBlock(key);
    const block = template[key];
    if (type === 'drag') {
      setDragging({ key, startX: e.clientX, startY: e.clientY, origX: block.x, origY: block.y });
    } else {
      setResizing({ key, startX: e.clientX, startY: e.clientY, origW: block.w, origH: block.h });
    }
  }, [template]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragging) {
      const dx = (e.clientX - dragging.startX) / scale;
      const dy = (e.clientY - dragging.startY) / scale;
      const block = template[dragging.key];
      onChange({
        ...template,
        [dragging.key]: {
          ...block,
          x: Math.max(0, Math.min(SLIDE_WIDTH - block.w, parseFloat((dragging.origX + dx).toFixed(2)))),
          y: Math.max(0, Math.min(SLIDE_HEIGHT - block.h, parseFloat((dragging.origY + dy).toFixed(2)))),
        },
      });
    }
    if (resizing) {
      const dx = (e.clientX - resizing.startX) / scale;
      const dy = (e.clientY - resizing.startY) / scale;
      const block = template[resizing.key];
      onChange({
        ...template,
        [resizing.key]: {
          ...block,
          w: Math.max(0.5, parseFloat((resizing.origW + dx).toFixed(2))),
          h: Math.max(0.2, parseFloat((resizing.origH + dy).toFixed(2))),
        },
      });
    }
  }, [dragging, resizing, template, onChange, scale]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
    setResizing(null);
  }, []);

  const renderBlockContent = (key: SlideBlockKey) => {
    switch (key) {
      case 'title':
        return <span className="font-bold text-[10px] truncate">{MOCK_OP.company_name}</span>;
      case 'description':
        return <span className="text-[7px] leading-tight line-clamp-4">{MOCK_OP.description}</span>;
      case 'highlights':
        return (
          <div className="text-[7px]">
            <div className="font-bold mb-0.5">Aspectos Destacados</div>
            {MOCK_OP.highlights.map((h, i) => <div key={i}>• {h}</div>)}
          </div>
        );
      case 'summaryCard':
        return <span className="text-[7px] text-white/50">Tarjeta Resumen</span>;
      case 'summaryHeader':
        return <span className="text-[8px] font-bold text-white">Resumen</span>;
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
      case 'cta':
        return <span className="text-[7px] text-white font-bold">{(template.cta as any).text || 'Más Información →'}</span>;
      case 'footer':
        return <span className="text-[6px]">{(template.footer as any).text || 'CAPITTAL — Información Confidencial'}</span>;
      default:
        return null;
    }
  };

  const isDarkBlock = (key: SlideBlockKey) => ['summaryCard', 'summaryHeader', 'infoRows', 'financialData', 'cta'].includes(key);

  return (
    <div className="flex gap-0 h-full">
      {/* Preview area */}
      <div className="flex-1 flex items-center justify-center bg-muted/30 p-4 overflow-hidden min-w-0">
        <div
          ref={containerRef}
          className="relative bg-white shadow-lg border border-border"
          style={{ width: PREVIEW_W, height: PREVIEW_H, userSelect: 'none' }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={() => { if (!dragging && !resizing) setSelectedBlock(null); }}
        >
          {BLOCK_KEYS.map(key => {
            const block = template[key];
            if (!block.visible) return null;
            const isSelected = selectedBlock === key;
            const borderColor = BLOCK_COLORS[key];
            const dark = isDarkBlock(key);

            return (
              <div
                key={key}
                className={cn(
                  'absolute cursor-move overflow-hidden transition-shadow',
                  isSelected ? 'ring-2 z-20' : 'z-10 hover:ring-1',
                  dark ? 'text-white' : 'text-foreground'
                )}
                style={{
                  left: toPixels(block.x),
                  top: toPixels(block.y),
                  width: toPixels(block.w),
                  height: toPixels(block.h),
                  backgroundColor: key === 'summaryCard' ? `#${block.color || '161B22'}` : undefined,
                  borderColor,
                  boxShadow: isSelected ? `0 0 0 2px ${borderColor}` : undefined,
                  outline: isSelected ? 'none' : `1px dashed ${borderColor}40`,
                }}
                onMouseDown={e => handleMouseDown(e, key, 'drag')}
                onClick={e => { e.stopPropagation(); setSelectedBlock(key); }}
              >
                {/* Label chip */}
                <div
                  className="absolute -top-4 left-0 px-1 py-0.5 text-[6px] text-white font-semibold rounded-t whitespace-nowrap"
                  style={{ backgroundColor: borderColor }}
                >
                  {BLOCK_LABELS[key]}
                </div>

                {/* Content */}
                <div className="p-1 h-full flex items-start">
                  {renderBlockContent(key)}
                </div>

                {/* Resize handle */}
                {isSelected && (
                  <div
                    className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize"
                    style={{ backgroundColor: borderColor }}
                    onMouseDown={e => handleMouseDown(e, key, 'resize')}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Properties panel */}
      <div className="w-[240px] border-l border-border bg-background shrink-0 overflow-hidden">
        <div className="border-b border-border px-4 py-2.5">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Propiedades</h3>
        </div>
        <SlideBlockProperties
          selectedBlock={selectedBlock}
          template={template}
          onChange={onChange}
        />
      </div>
    </div>
  );
};
