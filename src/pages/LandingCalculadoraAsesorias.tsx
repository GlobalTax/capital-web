import React, { useState, useEffect } from 'react';
import { Check, FileText, Building2, Calculator, ChevronRight } from 'lucide-react';
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
  contactName: string;
  email: string;
  phone: string;
  firmName: string;
  firmType: string;
  employees: string;
  revenue: string;
  ebitda: string;
}

const INITIAL_FORM: FormData = {
  contactName: '',
  email: '',
  phone: '',
  firmName: '',
  firmType: '',
  employees: '',
  revenue: '',
  ebitda: '',
};

const FIRM_TYPES = [
  'Asesoría fiscal y contable',
  'Despacho de abogados',
  'Gestoría administrativa',
  'Consultoría de RRHH',
  'Asesoría laboral',
  'Correduría de seguros',
  'Multidisciplinar',
  'Otro',
];

const EMPLOYEE_RANGES = [
  '1-5',
  '6-10',
  '11-25',
  '26-50',
  '51-100',
  '100+',
];

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
  const canProceed =
    form.contactName && form.email && form.firmName && form.firmType && form.employees && form.revenue;

  return (
    <div className="max-w-3xl mx-auto px-4">
      {/* Datos de contacto */}
      <div className="mb-8">
        <h2
          className="text-lg font-semibold mb-4"
          style={{ fontFamily: ff.heading, color: C.navy }}
        >
          Datos de contacto
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel required>Nombre completo</FieldLabel>
            <input
              type="text"
              value={form.contactName}
              onChange={(e) => onChange({ contactName: e.target.value })}
              placeholder="Tu nombre"
              style={inputStyle}
            />
          </div>
          <div>
            <FieldLabel required>Email profesional</FieldLabel>
            <input
              type="email"
              value={form.email}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="tu@despacho.es"
              style={inputStyle}
            />
          </div>
          <div className="sm:col-span-2">
            <FieldLabel>Teléfono</FieldLabel>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              placeholder="+34 600 000 000"
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Datos del despacho */}
      <div className="mb-8">
        <h2
          className="text-lg font-semibold mb-4"
          style={{ fontFamily: ff.heading, color: C.navy }}
        >
          Tu despacho
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel required>Nombre del despacho</FieldLabel>
            <input
              type="text"
              value={form.firmName}
              onChange={(e) => onChange({ firmName: e.target.value })}
              placeholder="Nombre de la firma"
              style={inputStyle}
            />
          </div>
          <div>
            <FieldLabel required>Tipo de despacho</FieldLabel>
            <select
              value={form.firmType}
              onChange={(e) => onChange({ firmType: e.target.value })}
              style={selectStyle}
            >
              <option value="">Selecciona…</option>
              {FIRM_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <FieldLabel required>Número de empleados</FieldLabel>
            <select
              value={form.employees}
              onChange={(e) => onChange({ employees: e.target.value })}
              style={selectStyle}
            >
              <option value="">Selecciona…</option>
              {EMPLOYEE_RANGES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Datos financieros */}
      <div className="mb-8">
        <h2
          className="text-lg font-semibold mb-4"
          style={{ fontFamily: ff.heading, color: C.navy }}
        >
          Datos financieros
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel required>Facturación anual (€)</FieldLabel>
            <input
              type="number"
              value={form.revenue}
              onChange={(e) => onChange({ revenue: e.target.value })}
              placeholder="Ej: 500000"
              style={inputStyle}
            />
          </div>
          <div>
            <FieldLabel>EBITDA anual (€)</FieldLabel>
            <input
              type="number"
              value={form.ebitda}
              onChange={(e) => onChange({ ebitda: e.target.value })}
              placeholder="Ej: 120000"
              style={inputStyle}
            />
          </div>
        </div>
        <p
          className="mt-2 text-xs"
          style={{ fontFamily: ff.body, color: C.gray3 }}
        >
          Si no conoces tu EBITDA, estimaremos un margen medio según tu tipo de despacho.
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
          Ver valoración
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

// ── Step 2 (placeholder) ────────────────────────────────

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
