/**
 * Agent Tools — Definitions and execution for AI Agent tool calling
 * Tools allow agents to query data, update records, and perform actions
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

export interface AgentToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

// ─── Tool Definitions (Claude-compatible) ─────────────────────────

export const AVAILABLE_TOOLS: Record<string, AgentToolDefinition> = {
  query_leads: {
    name: 'query_leads',
    description: 'Search and query leads from the database. Can filter by status, date range, source, etc.',
    parameters: {
      type: 'object',
      properties: {
        status: { type: 'string', description: 'Filter by lead status (e.g. new, contacted, qualified, converted)' },
        limit: { type: 'number', description: 'Max results to return (default 10)' },
        search: { type: 'string', description: 'Search by name, email, or company' },
        date_from: { type: 'string', description: 'Filter leads created after this date (ISO format)' },
      },
      required: [],
    },
  },
  query_valuations: {
    name: 'query_valuations',
    description: 'Query company valuations from the database. Returns valuation data including company name, revenue, EBITDA, and final valuation.',
    parameters: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Max results (default 10)' },
        search: { type: 'string', description: 'Search by company name or contact name' },
        min_valuation: { type: 'number', description: 'Minimum final valuation filter' },
      },
      required: [],
    },
  },
  query_contacts: {
    name: 'query_contacts',
    description: 'Search contacts (contactos) in the CRM database.',
    parameters: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Search by name, email, or company' },
        limit: { type: 'number', description: 'Max results (default 10)' },
      },
      required: [],
    },
  },
  get_dashboard_stats: {
    name: 'get_dashboard_stats',
    description: 'Get key dashboard metrics: total leads, valuations, blog views, recent activity counts.',
    parameters: {
      type: 'object',
      properties: {
        period: { type: 'string', description: 'Time period: today, week, month, all (default: month)' },
      },
      required: [],
    },
  },
  generate_content: {
    name: 'generate_content',
    description: 'Generate text content like email drafts, blog outlines, or lead summaries.',
    parameters: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['email', 'blog_outline', 'lead_summary', 'proposal'], description: 'Type of content to generate' },
        context: { type: 'string', description: 'Additional context for the content generation' },
        tone: { type: 'string', enum: ['formal', 'casual', 'professional'], description: 'Tone of the content' },
      },
      required: ['type'],
    },
  },
  update_lead_status: {
    name: 'update_lead_status',
    description: 'Update the status of a lead. Requires confirmation from the user before executing.',
    parameters: {
      type: 'object',
      properties: {
        lead_id: { type: 'string', description: 'UUID of the lead to update' },
        new_status: { type: 'string', description: 'New status value' },
      },
      required: ['lead_id', 'new_status'],
    },
  },
};

// ─── Tool Execution ─────────────────────────────────────────────

export async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
  adminClient: ReturnType<typeof createClient>
): Promise<string> {
  try {
    switch (toolName) {
      case 'query_leads':
        return await executeQueryLeads(args, adminClient);
      case 'query_valuations':
        return await executeQueryValuations(args, adminClient);
      case 'query_contacts':
        return await executeQueryContacts(args, adminClient);
      case 'get_dashboard_stats':
        return await executeGetDashboardStats(args, adminClient);
      case 'generate_content':
        return JSON.stringify({ note: 'Content generation is handled by the agent itself based on the context provided.', context: args.context, type: args.type });
      case 'update_lead_status':
        return await executeUpdateLeadStatus(args, adminClient);
      default:
        return JSON.stringify({ error: `Unknown tool: ${toolName}` });
    }
  } catch (error) {
    return JSON.stringify({ error: `Tool execution failed: ${error.message}` });
  }
}

// ─── Individual tool implementations ─────────────────────────────

async function executeQueryLeads(args: Record<string, unknown>, client: ReturnType<typeof createClient>): Promise<string> {
  let query = client
    .from('acquisition_leads')
    .select('id, full_name, email, company, status, created_at, company_sector, ai_tags')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit((args.limit as number) || 10);

  if (args.status) query = query.eq('status', args.status as string);
  if (args.search) query = query.or(`full_name.ilike.%${args.search}%,email.ilike.%${args.search}%,company.ilike.%${args.search}%`);
  if (args.date_from) query = query.gte('created_at', args.date_from as string);

  const { data, error } = await query;
  if (error) return JSON.stringify({ error: error.message });
  return JSON.stringify({ leads: data, count: data?.length || 0 });
}

async function executeQueryValuations(args: Record<string, unknown>, client: ReturnType<typeof createClient>): Promise<string> {
  let query = client
    .from('company_valuations')
    .select('id, company_name, contact_name, email, revenue, ebitda, final_valuation, industry, created_at')
    .order('created_at', { ascending: false })
    .limit((args.limit as number) || 10);

  if (args.search) query = query.or(`company_name.ilike.%${args.search}%,contact_name.ilike.%${args.search}%`);
  if (args.min_valuation) query = query.gte('final_valuation', args.min_valuation as number);

  const { data, error } = await query;
  if (error) return JSON.stringify({ error: error.message });
  return JSON.stringify({ valuations: data, count: data?.length || 0 });
}

async function executeQueryContacts(args: Record<string, unknown>, client: ReturnType<typeof createClient>): Promise<string> {
  let query = client
    .from('contactos')
    .select('id, nombre, email, telefono, empresa_id, cargo, created_at')
    .order('created_at', { ascending: false })
    .limit((args.limit as number) || 10);

  if (args.search) query = query.or(`nombre.ilike.%${args.search}%,email.ilike.%${args.search}%`);

  const { data, error } = await query;
  if (error) return JSON.stringify({ error: error.message });
  return JSON.stringify({ contacts: data, count: data?.length || 0 });
}

async function executeGetDashboardStats(args: Record<string, unknown>, client: ReturnType<typeof createClient>): Promise<string> {
  const period = (args.period as string) || 'month';
  const now = new Date();
  let dateFrom: string;

  switch (period) {
    case 'today': dateFrom = new Date(now.setHours(0, 0, 0, 0)).toISOString(); break;
    case 'week': dateFrom = new Date(now.getTime() - 7 * 86400000).toISOString(); break;
    case 'all': dateFrom = '2020-01-01T00:00:00Z'; break;
    default: dateFrom = new Date(now.getTime() - 30 * 86400000).toISOString();
  }

  const [leads, valuations, blogViews] = await Promise.all([
    client.from('acquisition_leads').select('id', { count: 'exact', head: true }).gte('created_at', dateFrom).eq('is_deleted', false),
    client.from('company_valuations').select('id', { count: 'exact', head: true }).gte('created_at', dateFrom),
    client.from('blog_post_metrics').select('total_views'),
  ]);

  const totalBlogViews = (blogViews.data || []).reduce((sum, m) => sum + (m.total_views || 0), 0);

  return JSON.stringify({
    period,
    total_leads: leads.count || 0,
    total_valuations: valuations.count || 0,
    total_blog_views: totalBlogViews,
  });
}

async function executeUpdateLeadStatus(args: Record<string, unknown>, client: ReturnType<typeof createClient>): Promise<string> {
  const { lead_id, new_status } = args as { lead_id: string; new_status: string };

  const { data, error } = await client
    .from('acquisition_leads')
    .update({ status: new_status, updated_at: new Date().toISOString() })
    .eq('id', lead_id)
    .select('id, full_name, status')
    .single();

  if (error) return JSON.stringify({ error: error.message });
  return JSON.stringify({ success: true, updated_lead: data });
}

// ─── Helper: Get tool definitions for Claude format ─────────────

export function getToolDefinitionsForAgent(enabledTools: string[]) {
  return enabledTools
    .filter(name => AVAILABLE_TOOLS[name])
    .map(name => ({
      type: 'function' as const,
      function: {
        name: AVAILABLE_TOOLS[name].name,
        description: AVAILABLE_TOOLS[name].description,
        parameters: AVAILABLE_TOOLS[name].parameters,
      },
    }));
}
