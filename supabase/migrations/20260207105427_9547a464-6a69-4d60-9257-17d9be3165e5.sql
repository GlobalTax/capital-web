
-- =============================================
-- Tabla: paused_reasons (catálogo de motivos)
-- =============================================
CREATE TABLE public.paused_reasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.paused_reasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view paused_reasons"
  ON public.paused_reasons FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert paused_reasons"
  ON public.paused_reasons FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update paused_reasons"
  ON public.paused_reasons FOR UPDATE
  TO authenticated
  USING (true);

-- Seed inicial
INSERT INTO public.paused_reasons (name, sort_order) VALUES
  ('Timing - El cliente aún no quiere vender', 1),
  ('Empresa no preparada para venderse', 2),
  ('Sin comprador adecuado ahora', 3),
  ('Otros', 99);

-- =============================================
-- Tabla: deal_paused_items (registros de pausas)
-- =============================================
CREATE TABLE public.deal_paused_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  reason_id UUID NOT NULL REFERENCES public.paused_reasons(id),
  notes TEXT,
  reminder_at TIMESTAMPTZ,
  reminder_text TEXT,
  status TEXT NOT NULL DEFAULT 'paused' CHECK (status IN ('paused', 'reactivated')),
  reactivated_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Solo 1 pausa activa por empresa
CREATE UNIQUE INDEX uq_deal_paused_active_per_company
  ON public.deal_paused_items (company_id)
  WHERE status = 'paused';

-- Índices útiles
CREATE INDEX idx_deal_paused_status ON public.deal_paused_items (status);
CREATE INDEX idx_deal_paused_reminder ON public.deal_paused_items (reminder_at) WHERE status = 'paused';

ALTER TABLE public.deal_paused_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view deal_paused_items"
  ON public.deal_paused_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert deal_paused_items"
  ON public.deal_paused_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update deal_paused_items"
  ON public.deal_paused_items FOR UPDATE
  TO authenticated
  USING (true);

-- Trigger para updated_at
CREATE TRIGGER update_deal_paused_items_updated_at
  BEFORE UPDATE ON public.deal_paused_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
