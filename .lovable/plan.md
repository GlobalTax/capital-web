

## Plan: Sistema de Agentes IA en Admin

### Concepto

Un sistema de agentes IA configurables desde el panel de administracion, con tres capas:

1. **Panel de gestion de agentes** (nueva seccion en Admin)
2. **Widget flotante de chat** (disponible en todo el Admin)
3. **Ejecucion automatica backend** (cron jobs para agentes autonomos)

### Arquitectura

```text
┌──────────────────────────────────────┐
│         ADMIN UI                     │
│  ┌──────────┐  ┌──────────────────┐  │
│  │ Agents   │  │ Floating Widget  │  │
│  │ Manager  │  │ (chat con agente)│  │
│  └──────────┘  └──────────────────┘  │
└───────────┬──────────────┬───────────┘
            │              │
     ┌──────▼──────────────▼──────┐
     │   Edge Function: ai-agent  │
     │  (routing + tool calling)  │
     └────────────┬───────────────┘
                  │
     ┌────────────▼───────────────┐
     │   ai-helper.ts (Claude)    │
     │   + Tool definitions       │
     │   + DB access (Supabase)   │
     └────────────────────────────┘
```

### Fase 1 — Infraestructura (esta implementacion)

#### 1. Tabla `ai_agents` (migracion)

```sql
create table public.ai_agents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  system_prompt text not null,
  model text default 'claude-sonnet-4-20250514',
  temperature numeric default 0.3,
  tools text[] default '{}',  -- nombres de tools habilitadas
  is_active boolean default true,
  agent_type text check (agent_type in ('conversational', 'automated', 'hybrid')) default 'conversational',
  schedule text,  -- cron expression para agentes automaticos (null = solo manual)
  max_tokens integer default 4096,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references auth.users(id)
);

alter table public.ai_agents enable row level security;
create policy "Admins manage agents" on public.ai_agents
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
```

#### 2. Tabla `ai_agent_conversations` (historial)

```sql
create table public.ai_agent_conversations (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references public.ai_agents(id) on delete cascade,
  user_id uuid references auth.users(id),
  messages jsonb not null default '[]',
  summary text,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.ai_agent_conversations enable row level security;
create policy "Users manage own conversations" on public.ai_agent_conversations
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
```

#### 3. Edge Function `ai-agent` (nueva)

Funcion central que:
- Recibe `agent_id` + `message` + `conversation_id` opcional
- Carga la config del agente desde DB
- Ejecuta `callAI()` con el system prompt y tools del agente
- Tools disponibles (tool calling de Claude):
  - `query_leads`: consultar leads con filtros
  - `query_valuations`: consultar valoraciones
  - `query_contacts`: buscar contactos
  - `send_email`: enviar email via Resend
  - `generate_content`: generar contenido (blog, email)
  - `update_lead_status`: cambiar estado de lead
  - `get_dashboard_stats`: obtener metricas del dashboard
- Guarda la conversacion en `ai_agent_conversations`
- Streaming de respuesta via SSE

#### 4. Panel Admin — Gestion de Agentes

**Ruta**: `/admin/ai-agents`

**Componentes**:
- `AIAgentsManager.tsx`: Lista de agentes con CRUD
  - Crear/editar agente: nombre, prompt, modelo, tools habilitadas, tipo, schedule
  - Toggle activo/inactivo
  - Ver historial de conversaciones
- `AgentEditor.tsx`: Formulario completo de configuracion
  - Editor de system prompt con preview
  - Selector de tools (checkboxes)
  - Selector de modelo (Claude, Gemini, OpenAI)
  - Config de temperatura y tokens
  - Para agentes automaticos: selector de cron schedule

**Agentes preconfigurados** (seed data):
1. **Asistente de Ventas**: Analiza leads, sugiere acciones, prepara argumentarios
2. **Analista de Datos**: Consulta metricas, genera insights, crea reportes
3. **Content Manager**: Genera posts, emails, propuestas
4. **Lead Qualifier**: Evalua y puntua leads automaticamente

#### 5. Widget flotante de chat

- `AdminAIChatWidget.tsx`: Boton flotante (esquina inferior derecha)
- Selector de agente activo
- Chat con streaming (SSE)
- Muestra tool calls ejecutados (transparencia)
- Historial de conversaciones persistente
- Visible en todas las paginas del admin

#### 6. Sidebar — Nueva seccion

Anadir en `sidebar-config.ts` seccion "IA & Agentes" con:
- Agentes IA → `/admin/ai-agents`
- AI Content Studio (existente)
- AI Usage (existente)

### Archivos nuevos
- `supabase/functions/ai-agent/index.ts` — Edge Function principal
- `supabase/functions/_shared/agent-tools.ts` — Definiciones de tools
- `src/components/admin/agents/AIAgentsManager.tsx` — Panel de gestion
- `src/components/admin/agents/AgentEditor.tsx` — Editor de agente
- `src/components/admin/agents/AgentChatWidget.tsx` — Widget flotante
- `src/components/admin/agents/AgentToolsSelector.tsx` — Selector de tools
- `src/hooks/useAIAgents.ts` — Hook CRUD de agentes
- `src/hooks/useAgentChat.ts` — Hook de chat con streaming

### Archivos modificados
- `src/features/admin/config/sidebar-config.ts` — Nueva seccion
- `src/pages/admin/` — Nueva ruta para agentes

### Fases futuras (no incluidas ahora)
- Fase 2: Ejecucion automatica con pg_cron para agentes scheduled
- Fase 3: MCP tools para conectar con servicios externos
- Fase 4: Agentes con memoria a largo plazo (RAG)

### Nota de seguridad
- Auth obligatoria (JWT + admin check) en la Edge Function
- RLS en ambas tablas
- Tools restringidas a operaciones de lectura inicialmente, con acciones de escritura requiriendo confirmacion

