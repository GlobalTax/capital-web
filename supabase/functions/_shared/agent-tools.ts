/**
 * Agent Tools — Definitions and execution for AI Agent tool calling
 * Tools allow agents to query data, update records, and perform actions
 * v2: Added requiresConfirmation flag, 5 new tools, native Claude format support
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

export interface AgentToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  requiresConfirmation?: boolean;
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
    description: 'Update the status of a lead. This action requires user confirmation before executing.',
    requiresConfirmation: true,
    parameters: {
      type: 'object',
      properties: {
        lead_id: { type: 'string', description: 'UUID of the lead to update' },
        new_status: { type: 'string', description: 'New status value' },
      },
      required: ['lead_id', 'new_status'],
    },
  },
  get_lead_detail: {
    name: 'get_lead_detail',
    description: 'Get full details of a specific lead by ID, including all fields, tags, and enrichment data.',
    parameters: {
      type: 'object',
      properties: {
        lead_id: { type: 'string', description: 'UUID of the lead' },
      },
      required: ['lead_id'],
    },
  },
  search_pipeline: {
    name: 'search_pipeline',
    description: 'Query leads by pipeline stage/status, grouped by their current status for a Kanban-like view.',
    parameters: {
      type: 'object',
      properties: {
        statuses: { type: 'array', items: { type: 'string' }, description: 'List of statuses to include (e.g. ["new","contacted","qualified"])' },
        limit_per_status: { type: 'number', description: 'Max leads per status group (default 5)' },
      },
      required: [],
    },
  },
  send_email: {
    name: 'send_email',
    description: 'Send an email via Resend to a specified recipient. Requires user confirmation before sending.',
    requiresConfirmation: true,
    parameters: {
      type: 'object',
      properties: {
        to: { type: 'string', description: 'Recipient email address' },
        subject: { type: 'string', description: 'Email subject line' },
        body: { type: 'string', description: 'Email body in HTML or plain text' },
      },
      required: ['to', 'subject', 'body'],
    },
  },
  create_lead_note: {
    name: 'create_lead_note',
    description: 'Add a note or comment to a lead record for internal tracking.',
    parameters: {
      type: 'object',
      properties: {
        lead_id: { type: 'string', description: 'UUID of the lead' },
        note: { type: 'string', description: 'Note content to add' },
      },
      required: ['lead_id', 'note'],
    },
  },
  query_blog_posts: {
    name: 'query_blog_posts',
    description: 'Search and list blog posts. Can filter by category, tags, or search by title/content.',
    parameters: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Search by title or content' },
        category: { type: 'string', description: 'Filter by category' },
        is_published: { type: 'boolean', description: 'Filter by publish status (default true)' },
        limit: { type: 'number', description: 'Max results (default 10)' },
      },
      required: [],
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
      case 'get_lead_detail':
        return await executeGetLeadDetail(args, adminClient);
      case 'search_pipeline':
        return await executeSearchPipeline(args, adminClient);
      case 'send_email':
        return await executeSendEmail(args);
      case 'create_lead_note':
        return await executeCreateLeadNote(args, adminClient);
      case 'query_blog_posts':
        return await executeQueryBlogPosts(args, adminClient);
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

async function executeGetLeadDetail(args: Record<string, unknown>, client: ReturnType<typeof createClient>): Promise<string> {
  const { lead_id } = args as { lead_id: string };

  const { data, error } = await client
    .from('acquisition_leads')
    .select('*')
    .eq('id', lead_id)
    .single();

  if (error) return JSON.stringify({ error: error.message });
  // Remove very large fields to save context
  if (data) {
    delete (data as any).apollo_org_data;
    delete (data as any).apollo_people_data;
    delete (data as any).apollo_candidates;
    delete (data as any).company_enriched_data;
  }
  return JSON.stringify({ lead: data });
}

async function executeSearchPipeline(args: Record<string, unknown>, client: ReturnType<typeof createClient>): Promise<string> {
  const statuses = (args.statuses as string[]) || ['new', 'contacted', 'qualified', 'converted'];
  const limitPerStatus = (args.limit_per_status as number) || 5;

  const results: Record<string, any[]> = {};
  
  await Promise.all(statuses.map(async (status) => {
    const { data } = await client
      .from('acquisition_leads')
      .select('id, full_name, company, email, status, created_at')
      .eq('status', status)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(limitPerStatus);
    results[status] = data || [];
  }));

  return JSON.stringify({ pipeline: results, statuses });
}

async function executeSendEmail(args: Record<string, unknown>): Promise<string> {
  const { to, subject, body } = args as { to: string; subject: string; body: string };
  const resendKey = Deno.env.get('RESEND_API_KEY');
  if (!resendKey) return JSON.stringify({ error: 'RESEND_API_KEY not configured' });

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Capittal <no-reply@capittal.es>',
      to: [to],
      subject,
      html: body,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return JSON.stringify({ error: `Email send failed: ${err}` });
  }

  const data = await response.json();
  return JSON.stringify({ success: true, email_id: data.id });
}

async function executeCreateLeadNote(args: Record<string, unknown>, client: ReturnType<typeof createClient>): Promise<string> {
  const { lead_id, note } = args as { lead_id: string; note: string };

  // Append note to additional_details field
  const { data: lead } = await client
    .from('acquisition_leads')
    .select('additional_details')
    .eq('id', lead_id)
    .single();

  const existingNotes = lead?.additional_details || '';
  const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const updatedNotes = existingNotes
    ? `${existingNotes}\n\n[${timestamp}] ${note}`
    : `[${timestamp}] ${note}`;

  const { error } = await client
    .from('acquisition_leads')
    .update({ additional_details: updatedNotes, updated_at: new Date().toISOString() })
    .eq('id', lead_id);

  if (error) return JSON.stringify({ error: error.message });
  return JSON.stringify({ success: true, lead_id, note_added: note });
}

async function executeQueryBlogPosts(args: Record<string, unknown>, client: ReturnType<typeof createClient>): Promise<string> {
  let query = client
    .from('blog_posts')
    .select('id, title, slug, category, tags, is_published, published_at, reading_time, excerpt')
    .order('published_at', { ascending: false })
    .limit((args.limit as number) || 10);

  if (args.search) query = query.or(`title.ilike.%${args.search}%,excerpt.ilike.%${args.search}%`);
  if (args.category) query = query.eq('category', args.category as string);
  if (args.is_published !== undefined) query = query.eq('is_published', args.is_published as boolean);

  const { data, error } = await query;
  if (error) return JSON.stringify({ error: error.message });
  return JSON.stringify({ posts: data, count: data?.length || 0 });
}

// ─── Helper: Get tool definitions for Claude native format ──────

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

// ─── Helper: Check if tool requires confirmation ─────────────────

export function toolRequiresConfirmation(toolName: string): boolean {
  return AVAILABLE_TOOLS[toolName]?.requiresConfirmation === true;
}
