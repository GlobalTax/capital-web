// ============= DASHBOARD VALIDATION SCHEMAS =============
// Schemas Zod para validación de widgets y layouts

import { z } from 'zod';

export const widgetConfigSchema = z.object({
  id: z.string(),
  type: z.enum(['kpi', 'chart', 'table', 'text', 'alert']),
  title: z.string().min(1, "El título es requerido"),
  size: z.enum(['small', 'medium', 'large']),
  config: z.record(z.any()),
  permissions: z.array(z.string()).optional()
});

export const dashboardLayoutSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "El nombre es requerido").max(50, "Máximo 50 caracteres"),
  widgets: z.array(widgetConfigSchema),
  columns: z.number().min(1).max(12),
  isDefault: z.boolean().optional(),
  isShared: z.boolean().optional(),
  createdBy: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export const kpiWidgetConfigSchema = z.object({
  metric: z.string().min(1, "La métrica es requerida"),
  format: z.enum(['number', 'currency', 'percentage']),
  trend: z.object({
    value: z.number(),
    direction: z.enum(['up', 'down', 'stable'])
  }).optional()
});

export const chartWidgetConfigSchema = z.object({
  chartType: z.enum(['line', 'bar', 'area', 'pie']),
  metric: z.string().min(1, "La métrica es requerida"),
  dataSource: z.string().optional(),
  timeRange: z.enum(['7d', '30d', '90d', '1y']).optional()
});

export const tableWidgetConfigSchema = z.object({
  tableType: z.string().min(1, "El tipo de tabla es requerido"),
  limit: z.number().min(1).max(100),
  columns: z.array(z.string()).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

export const textWidgetConfigSchema = z.object({
  content: z.string().min(1, "El contenido es requerido"),
  format: z.enum(['markdown', 'html', 'plain']).default('markdown')
});

export const alertWidgetConfigSchema = z.object({
  alertType: z.string().min(1, "El tipo de alerta es requerido"),
  limit: z.number().min(1).max(50),
  severity: z.enum(['info', 'warning', 'error']).optional()
});
