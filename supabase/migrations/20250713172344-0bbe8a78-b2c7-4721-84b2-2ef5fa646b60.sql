-- Crear tabla workflow_executions que falta para el sistema de lead tracking
CREATE TABLE public.workflow_executions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    workflow_id UUID NOT NULL,
    lead_score_id UUID NULL,
    trigger_data JSONB NULL DEFAULT '{}',
    total_actions INTEGER NULL DEFAULT 0,
    completed_actions INTEGER NULL DEFAULT 0,
    execution_status TEXT NOT NULL DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE NULL,
    error_message TEXT NULL,
    execution_result JSONB NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para optimizar consultas
CREATE INDEX idx_workflow_executions_workflow_id ON public.workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_lead_score_id ON public.workflow_executions(lead_score_id);
CREATE INDEX idx_workflow_executions_status ON public.workflow_executions(execution_status);
CREATE INDEX idx_workflow_executions_started_at ON public.workflow_executions(started_at);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_workflow_executions_updated_at
    BEFORE UPDATE ON public.workflow_executions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- RLS para workflow_executions
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - Solo admins pueden gestionar executions
CREATE POLICY "Admins can manage workflow executions" 
ON public.workflow_executions 
FOR ALL 
USING (current_user_is_admin());

-- Sistema puede insertar workflow executions
CREATE POLICY "System can insert workflow executions" 
ON public.workflow_executions 
FOR INSERT 
WITH CHECK (true);

-- Agregar foreign keys si las tablas relacionadas existen
DO $$
BEGIN
    -- Solo agregar FK si la tabla automation_workflows existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'automation_workflows' AND table_schema = 'public') THEN
        ALTER TABLE public.workflow_executions 
        ADD CONSTRAINT fk_workflow_executions_workflow_id 
        FOREIGN KEY (workflow_id) REFERENCES public.automation_workflows(id) ON DELETE CASCADE;
    END IF;
    
    -- Solo agregar FK si la tabla lead_scores existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lead_scores' AND table_schema = 'public') THEN
        ALTER TABLE public.workflow_executions 
        ADD CONSTRAINT fk_workflow_executions_lead_score_id 
        FOREIGN KEY (lead_score_id) REFERENCES public.lead_scores(id) ON DELETE SET NULL;
    END IF;
END $$;