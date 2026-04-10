import React, { useState, useEffect } from 'react';
import { Check, FileText, Building2, Calculator, ChevronRight, Info, TrendingUp, TrendingDown, Minus, ArrowLeft } from 'lucide-react';
import { SEOHead } from '@/components/seo';

// ── Palette ──────────────────────────────────────────────
const C = {
  navy: '#161B22',
  gold: '#C5A45A',
  gray1: '#58606E',
  gray2: '#6B7280',
  gray3: '#8B919B',
  bg1: '#F3F4F5',
  bg2: '#F9FAFB',
  border1: '#E2E4E8',
  border2: '#EEEFF1',
  white: '#FFFFFF',
} as const;

// ── Font helpers ─────────────────────────────────────────
const ff = {
  heading: "'Playfair Display', serif",
  body: "'DM Sans', sans-serif",
  mono: "'Roboto Mono', monospace",
};

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

  // Base multiple by revenue size
  let baseM: number;
  if (revenue < 500_000) baseM = 3.5;
  else if (revenue < 1_500_000) baseM = 4.25;
  else if (revenue < 3_000_000) baseM = 5.25;
  else if (revenue < 5_000_000) baseM = 6.0;
  else if (revenue < 10_000_000) baseM = 6.75;
  else baseM = 8.0;

  // Quality adjustments
  let a = 0;

  // Recurrence
  if (rec >= 90) a += 0.4;
  else if (rec >= 75) a += 0.2;
  else if (rec >= 60) a += 0.05;
  else if (rec < 40) a -= 0.4;

  // Services
  if (nServices >= 5) a += 0.3;
  else if (nServices >= 3) a += 0.15;
  else if (nServices === 1) a -= 0.15;
  if (form.services.includes('Auditoría')) a += 0.1;
  if (form.services.includes('Consultoría')) a += 0.15;
  if (form.services.includes('Legal/Jurídico')) a += 0.1;

  // Growth
  if (form.growthTrend === 'Creciendo >15%') a += 0.35;
  else if (form.growthTrend === 'Creciendo 5-15%') a += 0.1;
  else if (form.growthTrend === 'Decreciendo') a -= 0.4;

  // EBITDA margin
  const margin = revenue > 0 ? (ebitda / revenue) * 100 : 0;
  if (margin >= 25) a += 0.2;
  else if (margin >= 20) a += 0.1;
  else if (margin < 10) a -= 0.3;

  // Productivity
  const revEmp = employees > 0 ? revenue / employees : 0;
  if (revEmp >= 90_000) a += 0.15;
  else if (revEmp < 40_000) a -= 0.15;

  // Portfolio
  if (clients >= 300) a += 0.15;
  else if (clients > 0 && clients < 50) a -= 0.15;

  // Cap adjustment
  a = clamp(a, -1.0, 1.0);

  // Central multiple
  const mM = clamp(baseM + a, 3.0, 10.0);
  const mL = clamp(round1(mM * 0.88), 2.5, 10.0);
  const mH = clamp(round1(mM * 1.12), 2.5, 10.0);

  const evM = Math.round(ebitda * mM);
  const evL = Math.round(ebitda * mL);
  const evH = Math.round(ebitda * mH);
  const eqM = Math.max(0, evM - netDebt);

  const ingRec = revenue * (rec / 100);
  const multIngRec = ingRec > 0 ? round1(evM / ingRec) : 0;

  // Factors
  const factors: Factor[] = [];

  // Services factor
  if (nServices >= 4) factors.push({ text: `Oferta multidisciplinar (${nServices} servicios)`, type: 'positive' });
  else if (nServices >= 2) factors.push({ text: `${nServices} líneas de servicio`, type: 'neutral' });
  else factors.push({ text: 'Servicio único — riesgo de concentración', type: 'negative' });

  // Recurrence
  if (rec >= 80) factors.push({ text: 'Alta recurrencia — menor riesgo post-venta', type: 'positive' });
  else if (rec >= 60) factors.push({ text: `Recurrencia del ${rec}%`, type: 'neutral' });
  else factors.push({ text: `Baja recurrencia (${rec}%) — mayor riesgo`, type: 'negative' });

  // Growth
  if (form.growthTrend === 'Creciendo >15%') factors.push({ text: 'Crecimiento fuerte (>15%)', type: 'positive' });
  else if (form.growthTrend === 'Creciendo 5-15%') factors.push({ text: 'Crecimiento moderado', type: 'positive' });
  else if (form.growthTrend === 'Estable') factors.push({ text: 'Crecimiento estable', type: 'neutral' });
  else factors.push({ text: 'Facturación decreciente', type: 'negative' });

  // Margin
  if (margin >= 25) factors.push({ text: `Margen EBITDA excelente (${margin.toFixed(0)}%)`, type: 'positive' });
  else if (margin >= 15) factors.push({ text: `Margen EBITDA del ${margin.toFixed(0)}%`, type: 'neutral' });
  else factors.push({ text: `Margen EBITDA bajo (${margin.toFixed(0)}%)`, type: 'negative' });

  // Size
  if (revenue >= 5_000_000) factors.push({ text: 'Tamaño plataforma — máximo interés PE', type: 'positive' });
  else if (revenue >= 2_000_000) factors.push({ text: 'Tamaño atractivo para compradores', type: 'positive' });
  else if (revenue >= 500_000) factors.push({ text: 'Tamaño bolt-on', type: 'neutral' });
  else factors.push({ text: 'Micro-despacho — mercado limitado', type: 'negative' });

  // Productivity
  if (revEmp >= 80_000) factors.push({ text: `Alta productividad (${Math.round(revEmp / 1000)}K€/emp)`, type: 'positive' });
  else if (revEmp > 0 && revEmp < 45_000) factors.push({ text: `Baja productividad (${Math.round(revEmp / 1000)}K€/emp)`, type: 'negative' });

  // Portfolio
  if (clients >= 300) factors.push({ text: 'Cartera diversificada', type: 'positive' });
  else if (clients > 0 && clients < 50) factors.push({ text: 'Cartera concentrada', type: 'negative' });

  return { evL, evH, evM, eqM, mL, mM, mH, ingRec, multIngRec, margen: margin, revEmp, factors };
};

// ── Components ───────────────────────────────────────────

const Header = () => (
  <header
    className="w-full border-b"
    style={{ borderColor: C.border2, background: C.white }}
  >
    <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-4 sm:px-6">
      <div className="flex items-center gap-3">
        <span
          className="text-xl font-bold"
          style={{ fontFamily: ff.body, letterSpacing: '2px', color: C.navy }}
        >
          Capittal
        </span>
        <span
          className="text-[11px] hidden sm:inline"
          style={{ fontFamily: ff.mono, color: C.gray2 }}
        >
          M&A · Consulting
        </span>
      </div>
      <span
        className="text-xs px-3 py-1 rounded-full border"
        style={{
          fontFamily: ff.mono,
          color: C.gold,
          borderColor: C.gold,
          background: `${C.gold}0D`,
        }}
      >
        Herramienta gratuita
      </span>
    </div>
  </header>
);

const Hero = () => (
  <section className="w-full" style={{ background: C.navy }}>
    <div className="max-w-4xl mx-auto text-center px-4 py-16 sm:py-20">
      <h1
        className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5"
        style={{ fontFamily: ff.heading, color: C.white }}
      >
        ¿Cuánto vale tu asesoría?
      </h1>
      <p
        className="text-base sm:text-lg max-w-2xl mx-auto"
        style={{ fontFamily: ff.body, color: C.gray3, lineHeight: 1.7 }}
      >
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
    <section className="w-full" style={{ background: C.bg1 }}>
      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 px-4 py-8 sm:py-10">
        {stats.map((s) => (
          <div
            key={s.label}
            className="text-center rounded-lg px-4 py-5 border"
            style={{ background: C.white, borderColor: C.border2 }}
          >
            <div
              className="text-2xl sm:text-3xl font-bold mb-1"
              style={{ fontFamily: ff.heading, color: C.navy }}
            >
              {s.value}
            </div>
            <div
              className="text-xs uppercase tracking-wider"
              style={{ fontFamily: ff.mono, color: C.gray2 }}
            >
              {s.label}
            </div>
          </div>
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
              <div
                className="hidden sm:block w-10 h-px"
                style={{ background: completed ? C.gold : C.border1 }}
              />
            )}
            <button
              onClick={() => completed && onStepClick(s.num)}
              disabled={!completed}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
              style={{
                fontFamily: ff.mono,
                fontSize: '12px',
                cursor: completed ? 'pointer' : 'default',
                background: active ? `${C.navy}` : completed ? `${C.gold}12` : C.bg2,
                color: active ? C.white : completed ? C.gold : C.gray3,
                border: `1px solid ${active ? C.navy : completed ? `${C.gold}30` : C.border2}`,
              }}
            >
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{
                  background: completed ? C.gold : active ? 'rgba(255,255,255,0.15)' : C.border2,
                  color: completed ? C.white : active ? C.white : C.gray3,
                }}
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

// ── Form field helpers ───────────────────────────────────

const FieldLabel = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label
    className="block text-[11px] uppercase tracking-wider mb-1.5"
    style={{ fontFamily: ff.mono, color: C.gray2 }}
  >
    {children}
    {required && <span style={{ color: C.gold }}> *</span>}
  </label>
);

const inputStyle: React.CSSProperties = {
  fontFamily: ff.body,
  fontSize: '14px',
  color: C.navy,
  background: C.white,
  border: `1px solid ${C.border1}`,
  borderRadius: '8px',
  padding: '10px 12px',
  width: '100%',
  outline: 'none',
  transition: 'border-color 0.15s',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none' as const,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: '32px',
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
    <div className="max-w-3xl mx-auto px-4">
      {/* SECCIÓN 1 — Servicios */}
      <div className="mb-8">
        <h2
          className="text-lg font-semibold mb-1"
          style={{ fontFamily: ff.heading, color: C.navy }}
        >
          Servicios que presta tu asesoría
        </h2>
        <p className="text-xs mb-4" style={{ fontFamily: ff.mono, color: C.gray3 }}>
          Selecciona todos los que apliquen
        </p>
        <div className="flex flex-wrap gap-2">
          {SERVICES.map((s) => {
            const active = form.services.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleService(s)}
                className="px-4 py-2 rounded-full text-sm transition-all"
                style={{
                  fontFamily: ff.body,
                  border: `1px solid ${active ? C.navy : C.border1}`,
                  background: active ? C.navy : C.white,
                  color: active ? C.white : C.gray1,
                  cursor: 'pointer',
                }}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECCIÓN 2 — Ubicación + Empleados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div>
          <FieldLabel required>Ubicación</FieldLabel>
          <input
            type="text"
            value={form.location}
            onChange={(e) => onChange({ location: e.target.value })}
            placeholder="Ciudad o provincia"
            style={inputStyle}
          />
        </div>
        <div>
          <FieldLabel required>Número de empleados</FieldLabel>
          <input
            type="text"
            inputMode="numeric"
            value={form.employees}
            onChange={(e) => onChange({ employees: e.target.value.replace(/[^\d.]/g, '') })}
            onBlur={() => handleNumericBlur('employees')}
            placeholder="Ej: 25"
            style={inputStyle}
          />
        </div>
      </div>

      {/* DIVISOR */}
      <div className="mb-8" style={{ borderTop: `1px dashed ${C.border1}` }} />

      {/* SECCIÓN 3 — Datos financieros */}
      <div className="mb-8">
        <h2
          className="text-lg font-semibold mb-1"
          style={{ fontFamily: ff.heading, color: C.navy }}
        >
          Datos financieros
        </h2>
        <p className="text-xs mb-4" style={{ fontFamily: ff.mono, color: C.gray3 }}>
          Último ejercicio fiscal completo
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel required>Facturación anual (€)</FieldLabel>
            <input
              type="text"
              inputMode="numeric"
              value={form.revenue}
              onChange={(e) => onChange({ revenue: e.target.value.replace(/[^\d.]/g, '') })}
              onBlur={() => handleNumericBlur('revenue')}
              placeholder="Ej: 1.200.000"
              style={inputStyle}
            />
          </div>
          <div>
            <FieldLabel required>EBITDA (€)</FieldLabel>
            <input
              type="text"
              inputMode="numeric"
              value={form.ebitda}
              onChange={(e) => onChange({ ebitda: e.target.value.replace(/[^\d.]/g, '') })}
              onBlur={() => handleNumericBlur('ebitda')}
              placeholder="Ej: 240.000"
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* SECCIÓN 4 — Slider recurrencia */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <FieldLabel>% Ingresos recurrentes</FieldLabel>
          <span
            className="text-sm px-2 py-0.5 rounded"
            style={{
              fontFamily: ff.mono,
              color: C.navy,
              background: C.bg1,
              border: `1px solid ${C.border2}`,
            }}
          >
            {form.recurringPct}%
          </span>
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
              background: `linear-gradient(to right, ${C.navy} ${sliderPct}%, ${C.border1} ${sliderPct}%)`,
            }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px]" style={{ fontFamily: ff.mono, color: C.gray3 }}>10%</span>
          <span className="text-[10px]" style={{ fontFamily: ff.mono, color: C.gray3 }}>100%</span>
        </div>
      </div>

      {/* SECCIÓN 5 — Tendencia de crecimiento */}
      <div className="mb-8">
        <FieldLabel>Tendencia de crecimiento</FieldLabel>
        <div className="flex flex-wrap gap-2 mt-2">
          {GROWTH_TRENDS.map((g) => {
            const active = form.growthTrend === g;
            return (
              <button
                key={g}
                type="button"
                onClick={() => onChange({ growthTrend: g })}
                className="px-4 py-2 rounded-full text-sm transition-all"
                style={{
                  fontFamily: ff.body,
                  border: `1px solid ${active ? C.navy : C.border1}`,
                  background: active ? C.navy : C.white,
                  color: active ? C.white : C.gray1,
                  cursor: 'pointer',
                }}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECCIÓN 6 — Deuda + Clientes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div>
          <FieldLabel>Deuda financiera neta (€)</FieldLabel>
          <input
            type="text"
            inputMode="numeric"
            value={form.netDebt}
            onChange={(e) => onChange({ netDebt: e.target.value.replace(/[^\d.]/g, '') })}
            onBlur={() => handleNumericBlur('netDebt')}
            placeholder="0 si no hay"
            style={inputStyle}
          />
        </div>
        <div>
          <FieldLabel>Clientes activos</FieldLabel>
          <input
            type="text"
            inputMode="numeric"
            value={form.activeClients}
            onChange={(e) => onChange({ activeClients: e.target.value.replace(/[^\d.]/g, '') })}
            onBlur={() => handleNumericBlur('activeClients')}
            placeholder="Ej: 350"
            style={inputStyle}
          />
        </div>
      </div>

      {/* INFO BOX */}
      <div
        className="rounded-lg p-4 mb-8 flex gap-3"
        style={{ background: C.bg2, border: `1px solid ${C.border1}` }}
      >
        <Info size={18} className="flex-shrink-0 mt-0.5" style={{ color: C.gray2 }} />
        <p className="text-xs leading-relaxed" style={{ fontFamily: ff.body, color: C.gray2 }}>
          <strong>¿No tienes el EBITDA exacto?</strong> Beneficio neto + IS + Gastos financieros +
          Amortizaciones. En asesorías bien gestionadas, el margen suele estar entre 15% y 25%.
        </p>
      </div>

      {/* CTA */}
      <div className="flex justify-end pb-10">
        <button
          disabled={!canProceed}
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all"
          style={{
            fontFamily: ff.body,
            background: canProceed ? C.navy : C.border1,
            color: canProceed ? C.white : C.gray3,
            cursor: canProceed ? 'pointer' : 'not-allowed',
          }}
        >
          Calcular valoración
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

const StepTwo = ({ onBack }: { onBack: () => void }) => {
  const placeholders = [
    { label: 'Valoración por facturación', value: '—' },
    { label: 'Valoración por EBITDA', value: '—' },
    { label: 'Rango estimado', value: '—' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 pb-10">
      <h2
        className="text-2xl font-bold text-center mb-2"
        style={{ fontFamily: ff.heading, color: C.navy }}
      >
        Valoración estimada
      </h2>
      <p
        className="text-center text-sm mb-8"
        style={{ fontFamily: ff.body, color: C.gray2 }}
      >
        Basada en múltiplos de transacciones reales en el sector
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {placeholders.map((p) => (
          <div
            key={p.label}
            className="text-center rounded-lg p-6 border"
            style={{ background: C.bg2, borderColor: C.border2 }}
          >
            <div
              className="text-3xl font-bold mb-2"
              style={{ fontFamily: ff.heading, color: C.navy }}
            >
              {p.value}
            </div>
            <div
              className="text-[11px] uppercase tracking-wider"
              style={{ fontFamily: ff.mono, color: C.gray2 }}
            >
              {p.label}
            </div>
          </div>
        ))}
      </div>

      {/* CTA download */}
      <div
        className="rounded-lg border p-6 text-center mb-8"
        style={{ borderColor: C.border1, background: C.bg2 }}
      >
        <FileText size={32} className="mx-auto mb-3" style={{ color: C.gray3 }} />
        <p
          className="text-sm mb-4"
          style={{ fontFamily: ff.body, color: C.gray2 }}
        >
          Recibe un informe detallado en PDF con la valoración completa de tu despacho
        </p>
        <button
          disabled
          className="px-6 py-3 rounded-lg text-sm font-semibold"
          style={{
            fontFamily: ff.body,
            background: C.border1,
            color: C.gray3,
            cursor: 'not-allowed',
          }}
        >
          Descargar informe PDF
        </button>
      </div>

      <div className="flex justify-start">
        <button
          onClick={onBack}
          className="text-sm underline"
          style={{ fontFamily: ff.body, color: C.gray2 }}
        >
          ← Volver al formulario
        </button>
      </div>
    </div>
  );
};

// ── Footer ───────────────────────────────────────────────

const Footer = () => (
  <footer className="w-full border-t" style={{ borderColor: C.border2, background: C.bg2 }}>
    <div className="max-w-4xl mx-auto px-4 py-8 text-center">
      <p
        className="text-xs mb-3 max-w-2xl mx-auto"
        style={{ fontFamily: ff.body, color: C.gray3, lineHeight: 1.6 }}
      >
        Esta herramienta ofrece una estimación orientativa basada en múltiplos de mercado.
        No constituye una valoración formal ni una oferta de compra. Los resultados son
        aproximados y pueden variar en función de factores específicos de cada despacho.
      </p>
      <p
        className="text-[11px]"
        style={{ fontFamily: ff.mono, color: C.gray3 }}
      >
        © {new Date().getFullYear()} Capittal Transacciones S.L. — Barcelona
      </p>
    </div>
  </footer>
);

// ── Main ─────────────────────────────────────────────────

const LandingCalculadoraAsesorias = () => {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);

  const handleChange = (partial: Partial<FormData>) =>
    setForm((prev) => ({ ...prev, ...partial }));

  useEffect(() => {
    // hreflang
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
      <div
        className="min-h-screen flex flex-col"
        style={{ fontFamily: ff.body, background: C.white }}
      >
        <Header />
        <Hero />
        <StatsBanner />
        <main className="flex-1" style={{ background: C.white }}>
          <Stepper current={step} onStepClick={setStep} />
          {step === 1 && (
            <StepOne form={form} onChange={handleChange} onNext={() => setStep(2)} />
          )}
          {step === 2 && <StepTwo onBack={() => setStep(1)} />}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default LandingCalculadoraAsesorias;
