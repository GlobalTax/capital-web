import React, { useState, useEffect, useRef } from 'react';
import { Check, FileText, Building2, Calculator, ChevronRight, Info, TrendingUp, TrendingDown, Minus, ArrowLeft, Shield } from 'lucide-react';
import jsPDF from 'jspdf';
import { SEOHead } from '@/components/seo';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Toaster } from '@/components/ui/sonner';
import { I18nProvider } from '@/shared/i18n/I18nProvider';
import ConfidentialityBlock from '@/components/landing/ConfidentialityBlock';
import CapittalBrief from '@/components/landing/CapittalBrief';

// ── Webhook ──────────────────────────────────────────────
const WEBHOOK_URL = 'TU_URL_WEBHOOK';

// ── Types ────────────────────────────────────────────────
type Step = 1 | 2 | 3;

interface FormData {
  services: string[];
  location: string;
  employees: string;
  revenue: string;
  ebitda: string;
  recurringPct: number;
  growthTrend: string;
  netDebt: string;
  activeClients: string;
}

const INITIAL_FORM: FormData = {
  services: [],
  location: '',
  employees: '',
  revenue: '',
  ebitda: '',
  recurringPct: 70,
  growthTrend: 'Creciendo 5-15%',
  netDebt: '',
  activeClients: '',
};

interface Factor {
  text: string;
  type: 'positive' | 'neutral' | 'negative';
}

interface ValuationResult {
  evL: number;
  evH: number;
  evM: number;
  eqM: number;
  mL: number;
  mM: number;
  mH: number;
  ingRec: number;
  multIngRec: number;
  margen: number;
  revEmp: number;
  factors: Factor[];
}

const SERVICES = [
  'Fiscal',
  'Contable',
  'Laboral/Nóminas',
  'Legal/Jurídico',
  'Auditoría',
  'Consultoría',
  'Seguros',
  'Inmobiliario',
];

const GROWTH_TRENDS = [
  'Decreciendo',
  'Estable',
  'Creciendo 5-15%',
  'Creciendo >15%',
];

// ── Number formatting helpers ────────────────────────────
const formatES = (val: string): string => {
  const num = parseInt(val.replace(/\./g, ''), 10);
  if (isNaN(num) || num === 0) return '';
  return num.toLocaleString('es-ES');
};

const parseES = (val: string): number => {
  const num = parseInt(val.replace(/\./g, ''), 10);
  return isNaN(num) ? 0 : num;
};

// ── Calculation logic ────────────────────────────────────

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round1 = (v: number) => Math.round(v * 10) / 10;

const calculateValuation = (form: FormData): ValuationResult => {
  const revenue = parseES(form.revenue);
  const ebitda = parseES(form.ebitda);
  const employees = parseES(form.employees);
  const netDebt = parseES(form.netDebt);
  const clients = parseES(form.activeClients);
  const rec = form.recurringPct;
  const nServices = form.services.length;

  let baseM: number;
  if (revenue < 500_000) baseM = 3.5;
  else if (revenue < 1_500_000) baseM = 4.25;
  else if (revenue < 3_000_000) baseM = 5.25;
  else if (revenue < 5_000_000) baseM = 6.0;
  else if (revenue < 10_000_000) baseM = 6.75;
  else baseM = 8.0;

  let a = 0;
  if (rec >= 90) a += 0.4;
  else if (rec >= 75) a += 0.2;
  else if (rec >= 60) a += 0.05;
  else if (rec < 40) a -= 0.4;

  if (nServices >= 5) a += 0.3;
  else if (nServices >= 3) a += 0.15;
  else if (nServices === 1) a -= 0.15;
  if (form.services.includes('Auditoría')) a += 0.1;
  if (form.services.includes('Consultoría')) a += 0.15;
  if (form.services.includes('Legal/Jurídico')) a += 0.1;

  if (form.growthTrend === 'Creciendo >15%') a += 0.35;
  else if (form.growthTrend === 'Creciendo 5-15%') a += 0.1;
  else if (form.growthTrend === 'Decreciendo') a -= 0.4;

  const margin = revenue > 0 ? (ebitda / revenue) * 100 : 0;
  if (margin >= 25) a += 0.2;
  else if (margin >= 20) a += 0.1;
  else if (margin < 10) a -= 0.3;

  const revEmp = employees > 0 ? revenue / employees : 0;
  if (revEmp >= 90_000) a += 0.15;
  else if (revEmp < 40_000) a -= 0.15;

  if (clients >= 300) a += 0.15;
  else if (clients > 0 && clients < 50) a -= 0.15;

  a = clamp(a, -1.0, 1.0);

  const mM = clamp(baseM + a, 3.0, 10.0);
  const mL = clamp(round1(mM * 0.88), 2.5, 10.0);
  const mH = clamp(round1(mM * 1.12), 2.5, 10.0);

  const evM = Math.round(ebitda * mM);
  const evL = Math.round(ebitda * mL);
  const evH = Math.round(ebitda * mH);
  const eqM = Math.max(0, evM - netDebt);

  const ingRec = revenue * (rec / 100);
  const multIngRec = ingRec > 0 ? round1(evM / ingRec) : 0;

  const factors: Factor[] = [];

  if (nServices >= 4) factors.push({ text: `Oferta multidisciplinar (${nServices} servicios)`, type: 'positive' });
  else if (nServices >= 2) factors.push({ text: `${nServices} líneas de servicio`, type: 'neutral' });
  else factors.push({ text: 'Servicio único — riesgo de concentración', type: 'negative' });

  if (rec >= 80) factors.push({ text: 'Alta recurrencia — menor riesgo post-venta', type: 'positive' });
  else if (rec >= 60) factors.push({ text: `Recurrencia del ${rec}%`, type: 'neutral' });
  else factors.push({ text: `Baja recurrencia (${rec}%) — mayor riesgo`, type: 'negative' });

  if (form.growthTrend === 'Creciendo >15%') factors.push({ text: 'Crecimiento fuerte (>15%)', type: 'positive' });
  else if (form.growthTrend === 'Creciendo 5-15%') factors.push({ text: 'Crecimiento moderado', type: 'positive' });
  else if (form.growthTrend === 'Estable') factors.push({ text: 'Crecimiento estable', type: 'neutral' });
  else factors.push({ text: 'Facturación decreciente', type: 'negative' });

  if (margin >= 25) factors.push({ text: `Margen EBITDA excelente (${margin.toFixed(0)}%)`, type: 'positive' });
  else if (margin >= 15) factors.push({ text: `Margen EBITDA del ${margin.toFixed(0)}%`, type: 'neutral' });
  else factors.push({ text: `Margen EBITDA bajo (${margin.toFixed(0)}%)`, type: 'negative' });

  if (revenue >= 5_000_000) factors.push({ text: 'Tamaño plataforma — máximo interés PE', type: 'positive' });
  else if (revenue >= 2_000_000) factors.push({ text: 'Tamaño atractivo para compradores', type: 'positive' });
  else if (revenue >= 500_000) factors.push({ text: 'Tamaño bolt-on', type: 'neutral' });
  else factors.push({ text: 'Micro-despacho — mercado limitado', type: 'negative' });

  if (revEmp >= 80_000) factors.push({ text: `Alta productividad (${Math.round(revEmp / 1000)}K€/emp)`, type: 'positive' });
  else if (revEmp > 0 && revEmp < 45_000) factors.push({ text: `Baja productividad (${Math.round(revEmp / 1000)}K€/emp)`, type: 'negative' });

  if (clients >= 300) factors.push({ text: 'Cartera diversificada', type: 'positive' });
  else if (clients > 0 && clients < 50) factors.push({ text: 'Cartera concentrada', type: 'negative' });

  return { evL, evH, evM, eqM, mL, mM, mH, ingRec, multIngRec, margen: margin, revEmp, factors };
};

// ── Components ───────────────────────────────────────────

const Hero = () => (
  <section className="w-full bg-primary">
    <div className="max-w-4xl mx-auto text-center px-4 py-16 sm:py-20">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5 text-primary-foreground">
        ¿Cuánto vale tu asesoría?
      </h1>
      <p className="text-base sm:text-lg max-w-2xl mx-auto text-muted-foreground/80 leading-relaxed">
        Descubre en 2 minutos el valor estimado de tu despacho profesional,
        basado en múltiplos de mercado reales de transacciones en España.
      </p>
    </div>
  </section>
);

const StatsBanner = () => {
  const stats = [
    { value: '6+', label: 'Plataformas PE activas' },
    { value: '11.000+', label: 'Despachos cerrados en España' },
    { value: '3-10x', label: 'EBITDA rango típico' },
  ];
  return (
    <section className="w-full bg-muted/50">
      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 px-4 py-8 sm:py-10">
        {stats.map((s) => (
          <Card key={s.label} className="text-center px-4 py-5">
            <div className="text-2xl sm:text-3xl font-bold mb-1 text-foreground">
              {s.value}
            </div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              {s.label}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};

const Stepper = ({
  current,
  onStepClick,
}: {
  current: Step;
  onStepClick: (s: Step) => void;
}) => {
  const steps: { num: Step; label: string; icon: React.ReactNode }[] = [
    { num: 1, label: 'Tu asesoría', icon: <Building2 size={16} /> },
    { num: 2, label: 'Valoración', icon: <Calculator size={16} /> },
    { num: 3, label: 'Tu informe', icon: <FileText size={16} /> },
  ];

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 py-8">
      {steps.map((s, i) => {
        const completed = s.num < current;
        const active = s.num === current;
        return (
          <React.Fragment key={s.num}>
            {i > 0 && (
              <div className={`hidden sm:block w-10 h-px ${completed ? 'bg-primary' : 'bg-border'}`} />
            )}
            <button
              onClick={() => completed && onStepClick(s.num)}
              disabled={!completed}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-xs
                ${active ? 'bg-primary text-primary-foreground border border-primary' : ''}
                ${completed ? 'bg-primary/10 text-primary border border-primary/30 cursor-pointer' : ''}
                ${!active && !completed ? 'bg-muted text-muted-foreground border border-border cursor-default' : ''}
              `}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold
                  ${completed ? 'bg-primary text-primary-foreground' : ''}
                  ${active ? 'bg-primary-foreground/15 text-primary-foreground' : ''}
                  ${!active && !completed ? 'bg-border text-muted-foreground' : ''}
                `}
              >
                {completed ? <Check size={12} /> : s.num}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ── Step 1 ───────────────────────────────────────────────

const StepOne = ({
  form,
  onChange,
  onNext,
}: {
  form: FormData;
  onChange: (f: Partial<FormData>) => void;
  onNext: () => void;
}) => {
  const toggleService = (s: string) => {
    const next = form.services.includes(s)
      ? form.services.filter((x) => x !== s)
      : [...form.services, s];
    onChange({ services: next });
  };

  const handleNumericBlur = (field: 'revenue' | 'ebitda' | 'netDebt' | 'activeClients' | 'employees') => {
    const formatted = formatES(form[field]);
    onChange({ [field]: formatted });
  };

  const canProceed =
    form.services.length > 0 &&
    form.location.trim() !== '' &&
    parseES(form.employees) > 0 &&
    parseES(form.revenue) > 0 &&
    parseES(form.ebitda) > 0;

  const sliderPct = ((form.recurringPct - 10) / 90) * 100;

  return (
    <Card className="max-w-3xl mx-auto p-6">
      <div className="space-y-6">
        {/* SECCIÓN 1 — Servicios */}
        <div>
          <h3 className="text-lg font-semibold mb-1">Servicios que presta tu asesoría</h3>
          <p className="text-xs text-muted-foreground mb-4">Selecciona todos los que apliquen</p>
          <div className="flex flex-wrap gap-2">
            {SERVICES.map((s) => {
              const active = form.services.includes(s);
              return (
                <Button
                  key={s}
                  type="button"
                  variant={active ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleService(s)}
                  className="rounded-full"
                >
                  {s}
                </Button>
              );
            })}
          </div>
        </div>

        {/* SECCIÓN 2 — Ubicación + Empleados */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Datos generales</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Ubicación *</Label>
              <Input
                id="location"
                type="text"
                value={form.location}
                onChange={(e) => onChange({ location: e.target.value })}
                placeholder="Ciudad o provincia"
              />
            </div>
            <div>
              <Label htmlFor="employees">Número de empleados *</Label>
              <Input
                id="employees"
                type="text"
                inputMode="numeric"
                value={form.employees}
                onChange={(e) => onChange({ employees: e.target.value.replace(/[^\d.]/g, '') })}
                onBlur={() => handleNumericBlur('employees')}
                placeholder="Ej: 25"
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN 3 — Datos financieros */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-1">Datos financieros</h3>
          <p className="text-xs text-muted-foreground mb-4">Último ejercicio fiscal completo</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="revenue">Facturación anual (€) *</Label>
              <Input
                id="revenue"
                type="text"
                inputMode="numeric"
                value={form.revenue}
                onChange={(e) => onChange({ revenue: e.target.value.replace(/[^\d.]/g, '') })}
                onBlur={() => handleNumericBlur('revenue')}
                placeholder="Ej: 1.200.000"
              />
            </div>
            <div>
              <Label htmlFor="ebitda">EBITDA (€) *</Label>
              <Input
                id="ebitda"
                type="text"
                inputMode="numeric"
                value={form.ebitda}
                onChange={(e) => onChange({ ebitda: e.target.value.replace(/[^\d.]/g, '') })}
                onBlur={() => handleNumericBlur('ebitda')}
                placeholder="Ej: 240.000"
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN 4 — Slider recurrencia */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-3">
            <Label>% Ingresos recurrentes</Label>
            <Badge variant="secondary">{form.recurringPct}%</Badge>
          </div>
          <div className="relative">
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={form.recurringPct}
              onChange={(e) => onChange({ recurringPct: Number(e.target.value) })}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, hsl(var(--primary)) ${sliderPct}%, hsl(var(--border)) ${sliderPct}%)`,
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-muted-foreground">10%</span>
            <span className="text-[10px] text-muted-foreground">100%</span>
          </div>
        </div>

        {/* SECCIÓN 5 — Tendencia de crecimiento */}
        <div className="border-t pt-6">
          <Label className="mb-2 block">Tendencia de crecimiento</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {GROWTH_TRENDS.map((g) => {
              const active = form.growthTrend === g;
              return (
                <Button
                  key={g}
                  type="button"
                  variant={active ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onChange({ growthTrend: g })}
                  className="rounded-full"
                >
                  {g}
                </Button>
              );
            })}
          </div>
        </div>

        {/* SECCIÓN 6 — Deuda + Clientes */}
        <div className="border-t pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="netDebt">Deuda financiera neta (€)</Label>
              <Input
                id="netDebt"
                type="text"
                inputMode="numeric"
                value={form.netDebt}
                onChange={(e) => onChange({ netDebt: e.target.value.replace(/[^\d.]/g, '') })}
                onBlur={() => handleNumericBlur('netDebt')}
                placeholder="0 si no hay"
              />
            </div>
            <div>
              <Label htmlFor="activeClients">Clientes activos</Label>
              <Input
                id="activeClients"
                type="text"
                inputMode="numeric"
                value={form.activeClients}
                onChange={(e) => onChange({ activeClients: e.target.value.replace(/[^\d.]/g, '') })}
                onBlur={() => handleNumericBlur('activeClients')}
                placeholder="Ej: 350"
              />
            </div>
          </div>
        </div>

        {/* INFO BOX */}
        <Card className="p-4 bg-muted/50 flex gap-3">
          <Info size={18} className="flex-shrink-0 mt-0.5 text-muted-foreground" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            <strong>¿No tienes el EBITDA exacto?</strong> Beneficio neto + IS + Gastos financieros +
            Amortizaciones. En asesorías bien gestionadas, el margen suele estar entre 15% y 25%.
          </p>
        </Card>

        {/* CTA */}
        <div className="flex justify-end pt-4">
          <Button
            disabled={!canProceed}
            onClick={onNext}
            size="lg"
          >
            Calcular valoración
            <ChevronRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

const fmtEur = (v: number) => v.toLocaleString('es-ES') + ' €';
const fmtEurShort = (v: number) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace('.', ',')}M €`;
  if (v >= 1_000) return `${Math.round(v / 1000)}K €`;
  return fmtEur(v);
};

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  firmName: string;
}

// ── PDF Generation ──────────────────────────────────────
const generateValuationPDF = (result: ValuationResult, form: FormData, contact: ContactForm) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, H = 297;
  const navy = [22, 27, 34] as const;
  const gold = [197, 164, 90] as const;
  const white = [255, 255, 255] as const;
  const gray = [148, 163, 184] as const;
  const grayDark = [88, 96, 110] as const;
  const lightGray = [243, 244, 245] as const;

  const fmtE = (v: number) => v.toLocaleString('es-ES') + ' €';
  const today = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  const revenue = parseES(form.revenue);
  const ebitda = parseES(form.ebitda);
  const netDebt = parseES(form.netDebt);
  const employees = parseES(form.employees);
  const clients = parseES(form.activeClients);

  // ─── PAGE 1 — COVER ───
  doc.setFillColor(...navy);
  doc.rect(0, 0, W, H, 'F');
  doc.setFillColor(...gold);
  doc.rect(0, 0, W, 3, 'F');

  doc.setTextColor(...gold);
  doc.setFontSize(11);
  doc.setFont('Helvetica', 'normal');
  doc.text('CONFIDENCIAL', W / 2, 80, { align: 'center' });

  doc.setTextColor(...white);
  doc.setFontSize(32);
  doc.setFont('Helvetica', 'bold');
  doc.text('Informe de', W / 2, 110, { align: 'center' });
  doc.text('Valoración', W / 2, 125, { align: 'center' });

  doc.setFontSize(16);
  doc.setFont('Helvetica', 'normal');
  doc.text(contact.firmName || 'Asesoría', W / 2, 150, { align: 'center' });

  doc.setTextColor(...gray);
  doc.setFontSize(11);
  doc.text(form.location || '', W / 2, 162, { align: 'center' });
  doc.text(today, W / 2, 172, { align: 'center' });

  doc.setFillColor(...gold);
  doc.rect(85, 195, 40, 0.5, 'F');

  doc.setTextColor(...white);
  doc.setFontSize(14);
  doc.setFont('Helvetica', 'bold');
  doc.text('Capittal', W / 2, 240, { align: 'center' });
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...gray);
  doc.text('Transacciones · M&A · Consulting', W / 2, 248, { align: 'center' });
  doc.text('capittal.es · 934 593 600', W / 2, 256, { align: 'center' });

  // ─── PAGE 2 — VALUATION ───
  doc.addPage();
  doc.setFillColor(...navy);
  doc.rect(0, 0, W, 14, 'F');
  doc.setTextColor(...white);
  doc.setFontSize(7);
  doc.setFont('Helvetica', 'bold');
  doc.text('CAPITTAL  |  INFORME DE VALORACIÓN  |  CONFIDENCIAL', W / 2, 9, { align: 'center' });

  let y = 30;
  doc.setTextColor(...navy);
  doc.setFontSize(9);
  doc.setFont('Helvetica', 'normal');
  doc.text('RANGO DE VALORACIÓN ESTIMADO (ENTERPRISE VALUE)', W / 2, y, { align: 'center' });

  y += 12;
  doc.setFontSize(24);
  doc.setFont('Helvetica', 'bold');
  doc.text(`${fmtE(result.evL)}  –  ${fmtE(result.evH)}`, W / 2, y, { align: 'center' });

  y += 10;
  doc.setFontSize(11);
  doc.setFont('Helvetica', 'normal');
  doc.text(`Valor central estimado: ${fmtE(result.evM)}`, W / 2, y, { align: 'center' });

  y += 14;
  doc.setFillColor(...lightGray);
  doc.rect(20, y, W - 40, 24, 'F');
  doc.setFontSize(8);
  doc.setTextColor(...grayDark);
  const colW = (W - 40) / 3;
  ['Múltiplo aplicado', 'Margen EBITDA', 'Equity Value'].forEach((label, i) => {
    doc.text(label, 20 + colW * i + colW / 2, y + 8, { align: 'center' });
  });
  doc.setTextColor(...navy);
  doc.setFontSize(14);
  doc.setFont('Helvetica', 'bold');
  const mVals = [`${result.mM.toFixed(1)}x`, `${result.margen.toFixed(0)}%`, fmtEurShort(result.eqM)];
  mVals.forEach((v, i) => {
    doc.text(v, 20 + colW * i + colW / 2, y + 19, { align: 'center' });
  });

  y += 34;
  doc.setFontSize(9);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(...navy);
  doc.text('DATOS DE LA ASESORÍA', 20, y);
  y += 6;

  const dataRows = [
    ['Servicios', form.services.join(', ') || '—'],
    ['Ubicación', form.location || '—'],
    ['Empleados', form.employees || '—'],
    ['Facturación', fmtE(revenue)],
    ['EBITDA', fmtE(ebitda)],
    ['Margen EBITDA', `${result.margen.toFixed(1)}%`],
    ['Recurrencia', `${form.recurringPct}%`],
    ['Crecimiento', form.growthTrend],
    ['Deuda neta', netDebt > 0 ? fmtE(netDebt) : '0 €'],
    ['Clientes activos', clients > 0 ? clients.toLocaleString('es-ES') : '—'],
  ];

  doc.setFont('Helvetica', 'normal');
  dataRows.forEach((row, i) => {
    const ry = y + i * 7;
    if (i % 2 === 0) {
      doc.setFillColor(249, 250, 251);
      doc.rect(20, ry - 4, W - 40, 7, 'F');
    }
    doc.setTextColor(...grayDark);
    doc.setFontSize(8);
    doc.text(row[0], 22, ry);
    doc.setTextColor(...navy);
    doc.text(row[1], W - 22, ry, { align: 'right' });
  });

  y += dataRows.length * 7 + 10;
  doc.setFontSize(9);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(...navy);
  doc.text('FACTORES DE VALORACIÓN', 20, y);
  y += 7;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  result.factors.forEach((f) => {
    const dotColor = f.type === 'positive' ? [34, 134, 58] : f.type === 'neutral' ? [217, 119, 6] : [203, 36, 49];
    doc.setFillColor(dotColor[0], dotColor[1], dotColor[2]);
    doc.circle(24, y - 1.2, 1.5, 'F');
    doc.setTextColor(...grayDark);
    doc.text(f.text, 28, y);
    y += 6;
  });

  // ─── PAGE 3 — MARKET CONTEXT ───
  doc.addPage();
  doc.setFillColor(...navy);
  doc.rect(0, 0, W, 14, 'F');
  doc.setTextColor(...white);
  doc.setFontSize(7);
  doc.setFont('Helvetica', 'bold');
  doc.text('CAPITTAL  |  INFORME DE VALORACIÓN  |  CONFIDENCIAL', W / 2, 9, { align: 'center' });

  y = 30;
  doc.setTextColor(...gold);
  doc.setFontSize(12);
  doc.setFont('Helvetica', 'bold');
  doc.text('CONTEXTO DE MERCADO · 2025–2026', W / 2, y, { align: 'center' });

  y += 14;
  doc.setTextColor(...navy);
  doc.setFontSize(9);
  doc.setFont('Helvetica', 'normal');

  const marketParas = [
    'El sector de asesorías y despachos profesionales en España vive un proceso de consolidación sin precedentes. Al menos 6 plataformas respaldadas por fondos de Private Equity buscan activamente firmas para integrar en sus plataformas, generando un entorno de alta competencia por las mejores operaciones.',
    'En España existen más de 11.000 despachos de gestión administrativa y asesoría, la mayoría de los cuales carecen de plan de sucesión definido. La edad media de los socios fundadores supera los 55 años, lo que crea una ventana natural de oportunidad para la transmisión del negocio.',
    'Los compradores valoran especialmente la recurrencia de ingresos, la diversificación de servicios, el margen EBITDA superior al 20%, la base de clientes diversificada y la capacidad de retención del equipo post-transacción. Los múltiplos en España se sitúan entre 3x y 10x EBITDA, dependiendo del tamaño y calidad del despacho.',
  ];

  marketParas.forEach((p) => {
    const lines = doc.splitTextToSize(p, W - 44);
    doc.text(lines, 22, y);
    y += lines.length * 4.5 + 4;
  });

  y += 4;
  doc.setFontSize(9);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(...navy);
  doc.text('PRINCIPALES COMPRADORES', 22, y);
  y += 7;

  const buyers = [
    ['Afianza', 'BlackRock', '59 integraciones · €50M fact. 2024 · Objetivo €100M en 2026'],
    ['Auren', 'Waterland', '€104M fact. · Objetivo duplicar a €200M · 15-18 adquisiciones/año'],
    ['Asenza', 'Ufenau', 'Sagardoy + Carrillo · 250+ profesionales · Objetivo Top 10'],
    ['Adlanter', 'Artá Capital', 'Consolidación multiservicios · Presencia nacional'],
    ['Grant Thornton', 'New Mountain', 'Expansión mid-market · Foco auditoría + consultoría'],
    ['ETL Global', 'KKR', 'Red europea · 250+ oficinas · Crecimiento orgánico + adquisiciones'],
  ];

  doc.setFontSize(7);
  doc.setFont('Helvetica', 'bold');
  doc.setFillColor(...lightGray);
  doc.rect(22, y - 4, W - 44, 6, 'F');
  doc.setTextColor(...grayDark);
  doc.text('Plataforma', 24, y);
  doc.text('Fondo', 56, y);
  doc.text('Datos clave', 86, y);
  y += 7;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  buyers.forEach((b, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(249, 250, 251);
      doc.rect(22, y - 4, W - 44, 7, 'F');
    }
    doc.setTextColor(...navy);
    doc.setFont('Helvetica', 'bold');
    doc.text(b[0], 24, y);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(...gold);
    doc.text(b[1], 56, y);
    doc.setTextColor(...grayDark);
    const keyLines = doc.splitTextToSize(b[2], W - 90);
    doc.text(keyLines, 86, y);
    y += Math.max(keyLines.length * 4, 7);
  });

  y += 8;
  doc.setFontSize(8);
  doc.setTextColor(...grayDark);
  const conclusion = 'Los múltiplos en España (3-10x EBITDA) se sitúan todavía por debajo de los mercados anglosajones (USA/UK: 6-15x), lo que sugiere recorrido al alza a medida que el proceso de consolidación madura.';
  const concLines = doc.splitTextToSize(conclusion, W - 44);
  doc.text(concLines, 22, y);

  // ─── PAGE 4 — NEXT STEPS ───
  doc.addPage();
  doc.setFillColor(...navy);
  doc.rect(0, 0, W, 14, 'F');
  doc.setTextColor(...white);
  doc.setFontSize(7);
  doc.setFont('Helvetica', 'bold');
  doc.text('CAPITTAL  |  INFORME DE VALORACIÓN  |  CONFIDENCIAL', W / 2, 9, { align: 'center' });

  y = 30;
  doc.setTextColor(...gold);
  doc.setFontSize(12);
  doc.setFont('Helvetica', 'bold');
  doc.text('PRÓXIMOS PASOS', W / 2, y, { align: 'center' });

  const pdfSteps = [
    { title: '1. Valoración profesional detallada', desc: 'Realizamos un análisis exhaustivo con DCF, comparables sectoriales y ajustes cualitativos para determinar el rango preciso de valor de tu despacho.' },
    { title: '2. Preparación para la venta', desc: 'Optimizamos la presentación financiera, identificamos palancas de valor y preparamos el cuaderno de venta (Information Memorandum) para maximizar el precio.' },
    { title: '3. Proceso competitivo', desc: 'Contactamos de forma confidencial a los compradores más adecuados, generando competencia entre ellos para obtener las mejores condiciones de precio y estructura.' },
    { title: '4. Cierre y transición', desc: 'Acompañamos la negociación final, la due diligence y la firma, asegurando una transición ordenada para clientes y equipo.' },
  ];

  y += 14;
  pdfSteps.forEach((s) => {
    doc.setTextColor(...navy);
    doc.setFontSize(11);
    doc.setFont('Helvetica', 'bold');
    doc.text(s.title, 22, y);
    y += 6;
    doc.setTextColor(...grayDark);
    doc.setFontSize(8.5);
    doc.setFont('Helvetica', 'normal');
    const sLines = doc.splitTextToSize(s.desc, W - 44);
    doc.text(sLines, 22, y);
    y += sLines.length * 4.5 + 8;
  });

  doc.setFillColor(...gold);
  doc.rect(22, y, W - 44, 0.5, 'F');
  y += 14;

  doc.setTextColor(...navy);
  doc.setFontSize(12);
  doc.setFont('Helvetica', 'bold');
  doc.text('Capittal Transacciones', 22, y);
  y += 8;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...grayDark);
  const contactLines = [
    'Ausiàs March 36, 08010 Barcelona',
    '934 593 600',
    'samuel@capittal.es',
    'capittal.es',
  ];
  contactLines.forEach((l) => {
    doc.text(l, 22, y);
    y += 5.5;
  });

  y += 10;
  doc.setFontSize(6.5);
  doc.setTextColor(160, 160, 160);
  const disclaimer = 'Este informe ha sido elaborado con fines informativos y no constituye una valoración formal, una oferta de compra ni un asesoramiento financiero vinculante. Los múltiplos y rangos utilizados se basan en transacciones públicas y estimaciones de mercado. Capittal Transacciones S.L. no asume responsabilidad por decisiones tomadas en base a este documento. Para una valoración vinculante es necesario un análisis detallado con acceso a la información financiera completa del despacho.';
  const discLines = doc.splitTextToSize(disclaimer, W - 44);
  doc.text(discLines, 22, y);

  const firmSlug = (contact.firmName || 'Asesoria').replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ]/g, '_').replace(/_+/g, '_');
  doc.save(`Valoracion_${firmSlug}_Capittal.pdf`);
};

// ── Step Two ────────────────────────────────────────────
const StepTwo = ({
  result,
  form,
  onBack,
  onDownloaded,
}: {
  result: ValuationResult;
  form: FormData;
  onBack: () => void;
  onDownloaded: (contact: ContactForm) => void;
}) => {
  const ctaRef = useRef<HTMLDivElement>(null);
  const [contact, setContact] = useState<ContactForm>({ name: '', email: '', phone: '', firmName: '' });
  const [downloaded, setDownloaded] = useState(false);

  const scrollToCta = () => ctaRef.current?.scrollIntoView({ behavior: 'smooth' });

  const canDownload = contact.name.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email);

  const handleDownload = () => {
    if (!canDownload) return;
    generateValuationPDF(result, form, contact);
    setDownloaded(true);
    onDownloaded(contact);
  };

  const factorDot = (type: Factor['type']) => {
    const colors: Record<Factor['type'], string> = {
      positive: 'bg-green-600',
      neutral: 'bg-yellow-600',
      negative: 'bg-red-600',
    };
    return <span className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${colors[type]}`} />;
  };

  const marginBenchmark = result.margen >= 25 ? 'Excelente' : result.margen >= 15 ? 'En media' : 'Por debajo';
  const marginBenchColor = result.margen >= 25 ? 'text-green-600' : result.margen >= 15 ? 'text-yellow-600' : 'text-red-600';

  const revEmp = result.revEmp;
  const revEmpPct = Math.min(100, (revEmp / 120_000) * 100);
  const revEmpBg = revEmp >= 70_000 ? 'bg-green-600' : revEmp >= 50_000 ? 'bg-yellow-600' : 'bg-red-600';

  const marketPos = ((result.mM - 3.0) / (10.0 - 3.0)) * 100;

  return (
    <div className="max-w-3xl mx-auto px-4 pb-0">
      {/* ─── 1. HERO ─── */}
      <div className="text-center mb-10 pt-2">
        <p className="text-[10px] uppercase tracking-[0.15em] mb-3 text-muted-foreground">
          Rango de valoración estimado (Enterprise Value)
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-foreground">
          {fmtEur(result.evL)} – {fmtEur(result.evH)}
        </h2>
        <p className="text-sm mb-2 text-muted-foreground">
          Valor central estimado: <strong className="text-foreground">{fmtEur(result.evM)}</strong>
        </p>
        <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          Múltiplos EV/EBITDA · transacciones asesorías España 2023–2026
        </p>
      </div>

      {/* ─── 2. GRID 3 MÉTRICAS ─── */}
      <Card className="grid grid-cols-1 sm:grid-cols-3 mb-8 overflow-hidden">
        {[
          {
            label: 'Múltiplo aplicado',
            value: `${result.mM.toFixed(1)}x`,
            sub: `${result.mL.toFixed(1)}x – ${result.mH.toFixed(1)}x`,
            subClass: 'text-muted-foreground',
          },
          {
            label: 'Margen EBITDA',
            value: `${result.margen.toFixed(0)}%`,
            sub: marginBenchmark,
            subClass: marginBenchColor,
          },
          {
            label: 'Equity Value',
            value: fmtEurShort(result.eqM),
            sub: 'EV – deuda neta',
            subClass: 'text-muted-foreground',
          },
        ].map((m, i) => (
          <div
            key={m.label}
            className={`text-center px-4 py-5 ${i < 2 ? 'border-b sm:border-b-0 sm:border-r' : ''}`}
          >
            <div className="text-[10px] uppercase tracking-[0.1em] mb-2 text-muted-foreground">
              {m.label}
            </div>
            <div className="text-2xl font-bold mb-1 text-foreground">
              {m.value}
            </div>
            <div className={`text-xs ${m.subClass}`}>
              {m.sub}
            </div>
          </div>
        ))}
      </Card>

      {/* ─── 3. BOX INGRESOS RECURRENTES ─── */}
      <Card className="p-6 mb-8 border-dashed bg-muted/30">
        <p className="text-[10px] uppercase tracking-[0.12em] mb-2 text-muted-foreground">
          Múltiplo sobre ingresos recurrentes
        </p>
        <div className="text-3xl font-bold mb-2 text-foreground">
          {result.multIngRec.toFixed(1)}x
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Sobre ingresos recurrentes ({fmtEur(Math.round(result.ingRec))}). Rango habitual en España: 0,7–1,5x honorarios recurrentes.
        </p>
      </Card>

      {/* ─── 4. BARRA FACTURACIÓN/EMPLEADO ─── */}
      <div className="mb-8">
        <div className="flex items-baseline justify-between mb-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Facturación por empleado
          </p>
          <span className="text-sm font-bold text-foreground">
            {Math.round(revEmp / 1000)}K €
          </span>
        </div>
        <div className="w-full h-3 rounded-full overflow-hidden bg-border">
          <div
            className={`h-full rounded-full transition-all ${revEmpBg}`}
            style={{ width: `${revEmpPct}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          {['€30K', '€60K', '€90K', '€120K+'].map((t) => (
            <span key={t} className="text-[9px] text-muted-foreground">{t}</span>
          ))}
        </div>
      </div>

      {/* ─── 5. BARRA POSICIÓN EN MERCADO ─── */}
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.12em] mb-2 text-muted-foreground">
          Posición en el mercado
        </p>
        <div className="relative">
          <div className="w-full h-2 rounded-full bg-gradient-to-r from-border to-primary" />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-background bg-primary shadow-md"
            style={{ left: `calc(${clamp(marketPos, 2, 98)}% - 10px)` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[9px] text-muted-foreground">3.0x</span>
          <span className="text-xs font-semibold text-foreground">
            {result.mM.toFixed(1)}x aplicado
          </span>
          <span className="text-[9px] text-muted-foreground">10.0x</span>
        </div>
      </div>

      {/* ─── 6. FACTORES ─── */}
      <div className="mb-10">
        <p className="text-[10px] uppercase tracking-[0.12em] mb-3 text-muted-foreground">
          Factores de valoración
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {result.factors.map((f, i) => (
            <div key={i} className="flex items-start gap-2.5 py-1.5">
              {factorDot(f.type)}
              <span className="text-sm text-muted-foreground">{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 7. COMPRADORES ACTIVOS ─── */}
      <Card className="p-6 sm:p-8 mb-10 bg-primary text-primary-foreground border-0">
        <p className="text-[10px] uppercase tracking-[0.15em] mb-4 text-primary-foreground/60">
          Compradores activos en España · 2025–2026
        </p>
        <p className="text-sm mb-3 leading-relaxed text-primary-foreground/80">
          Al menos 6 plataformas de Private Equity buscan activamente asesorías y despachos profesionales en España para integrar en sus plataformas de consolidación.
        </p>
        <p className="text-sm mb-6 leading-relaxed text-primary-foreground/80">
          Solo en 2025, Afianza integró 16 firmas en un año. La ventana de oportunidad para vender a múltiplos atractivos es la más favorable de la última década.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              name: 'Afianza',
              backer: 'BlackRock',
              lines: ['59 integraciones', '€50M fact. 2024', 'Objetivo €100M en 2026', '1.200 profesionales'],
            },
            {
              name: 'Auren',
              backer: 'Waterland',
              lines: ['€104M fact.', 'Plan: duplicar a €200M en 3 años', '15-18 adquisiciones/año'],
            },
            {
              name: 'Asenza',
              backer: 'Ufenau',
              lines: ['Sagardoy + Carrillo', '250+ profesionales', 'Objetivo Top 10 España'],
            },
          ].map((card) => (
            <div
              key={card.name}
              className="rounded-lg p-4 bg-primary-foreground/10 border border-primary-foreground/20"
            >
              <div className="mb-2">
                <span className="text-sm font-bold text-primary-foreground">{card.name}</span>
                <span className="text-[10px] ml-1.5 text-primary-foreground/60">({card.backer})</span>
              </div>
              {card.lines.map((l) => (
                <p key={l} className="text-xs leading-relaxed text-primary-foreground/60">· {l}</p>
              ))}
            </div>
          ))}
        </div>
      </Card>

      {/* ─── 8. BOTONES ─── */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft size={14} className="mr-2" />
          Modificar datos
        </Button>
        <Button onClick={scrollToCta}>
          Quiero un informe detallado
          <ChevronRight size={16} className="ml-2" />
        </Button>
      </div>

      {/* ─── 9. CTA SECTION ─── */}
      <Card
        ref={ctaRef}
        className="p-6 sm:p-10 mb-10 bg-primary text-primary-foreground border-0"
      >
        <h3 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-primary-foreground">
          Descarga tu informe de valoración
        </h3>
        <p className="text-sm text-center mb-8 text-primary-foreground/70">
          Recibe un PDF detallado con la valoración completa, comparables de mercado y análisis de factores
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto mb-6">
          <Input
            type="text"
            placeholder="Tu nombre *"
            value={contact.name}
            onChange={(e) => setContact((p) => ({ ...p, name: e.target.value }))}
            className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40"
          />
          <Input
            type="email"
            placeholder="Email profesional *"
            value={contact.email}
            onChange={(e) => setContact((p) => ({ ...p, email: e.target.value }))}
            className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40"
          />
          <Input
            type="tel"
            placeholder="Teléfono"
            value={contact.phone}
            onChange={(e) => setContact((p) => ({ ...p, phone: e.target.value }))}
            className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40"
          />
          <Input
            type="text"
            placeholder="Nombre de tu asesoría"
            value={contact.firmName}
            onChange={(e) => setContact((p) => ({ ...p, firmName: e.target.value }))}
            className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40"
          />
        </div>

        <div className="text-center mb-5">
          <Button
            onClick={handleDownload}
            disabled={!canDownload && !downloaded}
            variant={downloaded ? 'default' : 'secondary'}
            size="lg"
            className={downloaded ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            {downloaded ? '✓ PDF descargado' : 'Descargar informe PDF'}
          </Button>
        </div>

        <div className="flex items-start gap-2 max-w-md mx-auto">
          <Shield size={14} className="flex-shrink-0 mt-0.5 text-primary-foreground/40" />
          <p className="text-[10px] leading-relaxed text-primary-foreground/40">
            Tus datos están protegidos. Los utilizaremos exclusivamente para enviarte el informe de valoración. Puedes ejercer tus derechos RGPD en cualquier momento escribiendo a privacidad@capittal.com.
          </p>
        </div>
      </Card>
    </div>
  );
};

// ── Main ─────────────────────────────────────────────────

const LandingCalculadoraAsesoriasInner = () => {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [result, setResult] = useState<ValuationResult | null>(null);

  const handleChange = (partial: Partial<FormData>) =>
    setForm((prev) => ({ ...prev, ...partial }));

  const handleCalculate = () => {
    const r = calculateValuation(form);
    setResult(r);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setStep(1);
    setResult(null);
  };

  const handleDownloaded = (contact: ContactForm) => {
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const revenue = parseES(form.revenue);
    const ebitda = parseES(form.ebitda);
    const ts = new Date().toISOString();

    const payload = {
      nombre: contact.name,
      email: contact.email,
      tel: contact.phone,
      empresa: contact.firmName,
      ubicacion: form.location,
      servicios: form.services,
      empleados: form.employees,
      facturacion: revenue,
      ebitda,
      margen: result?.margen ?? 0,
      recurrencia: form.recurringPct,
      crecimiento: form.growthTrend,
      deuda: parseES(form.netDebt),
      clientes: parseES(form.activeClients),
      multiplo: result?.mM ?? 0,
      ev_low: result?.evL ?? 0,
      ev_high: result?.evH ?? 0,
      ev_mid: result?.evM ?? 0,
      equity: result?.eqM ?? 0,
      timestamp: ts,
      source: 'calculadora-asesorias',
    };

    console.log('[LEAD_CAPTURED]', JSON.stringify(payload, null, 2));

    fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(err => console.error('[WEBHOOK_ERROR]', err));
  };

  useEffect(() => {
    const hreflangUrls: Record<string, string> = {
      es: 'https://capittal.es/lp/calculadora-asesorias',
      'x-default': 'https://capittal.es/lp/calculadora-asesorias',
    };
    Object.entries(hreflangUrls).forEach(([lang, url]) => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', lang);
      link.setAttribute('href', url);
      document.head.appendChild(link);
    });
    return () => {
      document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((l) => l.remove());
    };
  }, []);

  return (
    <>
      <SEOHead
        title="¿Cuánto vale tu asesoría? | Capittal"
        description="Calcula gratis el valor de tu asesoría o despacho profesional en España. Estimación basada en múltiplos de transacciones reales."
        canonical="https://capittal.es/lp/calculadora-asesorias"
        keywords="valoración asesoría, vender asesoría, cuánto vale mi despacho, valorar gestoría, M&A asesorías España"
      />
      <UnifiedLayout variant="landing">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <h1 className="sr-only">Calculadora de Valoración para Asesorías Profesionales</h1>
        </div>

        <Hero />
        <StatsBanner />

        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Stepper current={step} onStepClick={(s) => { if (s === 1) handleBack(); if (s === 2 && step === 3 && result) setStep(2); }} />
          {step === 1 && (
            <StepOne form={form} onChange={handleChange} onNext={handleCalculate} />
          )}
          {(step === 2 || step === 3) && result && <StepTwo result={result} form={form} onBack={handleBack} onDownloaded={handleDownloaded} />}
        </div>

        <ConfidentialityBlock />
        <CapittalBrief />

        <Toaster />
      </UnifiedLayout>
    </>
  );
};

const LandingCalculadoraAsesorias = () => (
  <I18nProvider>
    <LandingCalculadoraAsesoriasInner />
  </I18nProvider>
);

export default LandingCalculadoraAsesorias;
