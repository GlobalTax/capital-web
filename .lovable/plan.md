

## Analisis profundo y mejoras del sistema de Agentes IA

### Problemas detectados

#### 1. Sin streaming — UX pobre
El chat espera la respuesta completa (incluyendo tool calls iterativos) antes de mostrar nada. En llamadas con tools, el usuario puede esperar 10-20 segundos sin feedback.

#### 2. Historial de conversaciones no visible
Las conversaciones se guardan en DB pero no hay UI para verlas, retomarlas ni gestionarlas. Cada vez que cierras el widget se pierde el contexto visual.

#### 3. Tool calling simulado, no nativo
El tool calling usa un hack: inyecta resultados como mensajes `user` en lugar de usar el formato nativo de Claude (`tool_use`/`tool_result`). Esto confunde al modelo y reduce la calidad.

#### 4. Sin confirmacion para acciones destructivas
`update_lead_status` se ejecuta directamente sin pedir confirmacion al usuario, a pesar de que la descripcion dice "requiere confirmacion".

#### 5. Solo 6 tools — faltan operaciones clave
No hay tools para: crear leads, enviar emails (Resend), consultar pipeline, obtener detalle de un lead/valoracion individual, o buscar en blog.

#### 6. Sin memoria a largo plazo
Cada conversacion crece indefinidamente en JSONB. No hay resumen ni truncamiento, lo que causara errores de context window y costes elevados.

#### 7. Widget no persiste entre navegaciones
El estado del widget (mensajes, agente seleccionado) se pierde al navegar entre paginas del admin.

#### 8. Sin metricas de agentes
No hay dashboard de uso por agente: cuantas conversaciones, tokens consumidos, herramientas mas usadas.

---

### Plan de mejoras (priorizado)

#### Fase A — Mejoras criticas (esta implementacion)

**1. Streaming SSE en el chat**
- Modificar `ai-agent/index.ts` para devolver un stream SSE cuando no hay tool calls
- Actualizar `useAgentChat.ts` con parsing SSE token-by-token
- Mostrar respuesta progresiva en el widget

**2. Tool calling nativo de Claude**
- En `ai-helper.ts`, cuando el provider es Anthropic, usar el formato nativo `tool_use`/`tool_result` en lugar de inyectar como mensajes user
- Esto mejora significativamente la calidad de las respuestas con tools

**3. Confirmacion para tools de escritura**
- El agente debe devolver una accion pendiente cuando llame a `update_lead_status`
- El widget muestra un boton "Confirmar / Cancelar" antes de ejecutar
- Nueva tool `send_email` con el mismo patron de confirmacion

**4. Persistencia del widget entre navegaciones**
- Mover el estado del chat (mensajes, agente, conversationId) a un Context Provider en AdminLayout
- El widget mantiene la conversacion al navegar

**5. Gestion de historial de conversaciones**
- Anadir panel lateral en el widget con lista de conversaciones previas
- Boton "Nueva conversacion" y opcion de retomar una anterior
- Endpoint para listar conversaciones del usuario

**6. Nuevas tools**
- `get_lead_detail`: Obtener toda la info de un lead por ID
- `search_pipeline`: Consultar leads por columna del pipeline
- `send_email`: Enviar email via Resend (con confirmacion)
- `create_lead_note`: Anadir nota a un lead
- `query_blog_posts`: Buscar posts del blog

**7. Truncamiento de contexto**
- Cuando la conversacion supere 20 mensajes, resumir los primeros 15 con una llamada AI y mantener solo el resumen + ultimos 5 mensajes
- Guardar el resumen en el campo `summary` de `ai_agent_conversations`

#### Fase B — Mejoras de valor (siguiente iteracion)

**8. Metricas por agente**
- Dashboard en `/admin/ai-agents` con: conversaciones totales, tokens consumidos, tools mas usadas, coste estimado por agente
- Datos desde `ai_usage_logs` filtrando por `function_name = 'ai-agent:NombreAgente'`

**9. Templates de prompts**
- Biblioteca de system prompts predefinidos que el admin puede clonar y personalizar
- Prompts optimizados para cada caso de uso (ventas, soporte, analisis)

**10. Agentes automaticos funcionales**
- Implementar ejecucion via cron (pg_cron o scheduled Edge Function)
- El agente automatico recibe un prompt trigger y ejecuta sus tools
- Resultados enviados por email o guardados en una tabla de reportes

### Archivos afectados (Fase A)

| Archivo | Cambio |
|---|---|
| `supabase/functions/ai-agent/index.ts` | Streaming SSE + confirmacion de tools |
| `supabase/functions/_shared/agent-tools.ts` | 5 nuevas tools + flag `requiresConfirmation` |
| `supabase/functions/_shared/ai-helper.ts` | Tool calling nativo Anthropic |
| `src/hooks/useAgentChat.ts` | Parsing SSE + persistencia conversaciones |
| `src/components/admin/agents/AgentChatWidget.tsx` | Streaming UI + historial + confirmacion |
| `src/components/admin/agents/AgentToolsSelector.tsx` | Nuevas tools en el selector |
| `src/contexts/AgentChatContext.tsx` | Nuevo context para persistencia entre paginas |
| `src/features/admin/components/AdminLayout.tsx` | Wrap con AgentChatContext |
| Migracion SQL | Indice en `ai_agent_conversations(user_id)` |

### Resultado esperado
Un sistema de agentes con respuestas en tiempo real (streaming), herramientas potentes con confirmacion de seguridad, historial persistente, y contexto que no se pierde al navegar.

