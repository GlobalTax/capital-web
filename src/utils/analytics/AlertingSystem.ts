
import { LeadIntelligence } from './CompanyEnrichment';

export interface Alert {
  id: string;
  type: 'hot_lead' | 'returning_visitor' | 'high_intent' | 'competitor_visit' | 'enterprise_lead';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  companyName: string;
  companyDomain: string;
  leadScore: number;
  triggers: string[];
  actions: string[];
  createdAt: Date;
  isRead: boolean;
  notificationSent: boolean;
}

export interface AlertRule {
  id: string;
  name: string;
  conditions: AlertCondition[];
  actions: AlertAction[];
  isActive: boolean;
}

export interface AlertCondition {
  field: 'leadScore' | 'visitCount' | 'engagementScore' | 'industry' | 'companySize' | 'pageVisits';
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'contains' | 'in';
  value: any;
}

export interface AlertAction {
  type: 'email' | 'slack' | 'webhook' | 'dashboard';
  config: {
    recipients?: string[];
    webhookUrl?: string;
    slackChannel?: string;
    template?: string;
  };
}

export class AlertingSystem {
  private alerts: Alert[] = [];
  private rules: AlertRule[] = [];

  constructor() {
    this.initializeDefaultRules();
  }

  private initializeDefaultRules() {
    this.rules = [
      {
        id: 'hot-lead-rule',
        name: 'Lead Caliente (Score ≥ 80)',
        conditions: [
          { field: 'leadScore', operator: 'gte', value: 80 }
        ],
        actions: [
          { 
            type: 'email', 
            config: { 
              recipients: ['comercial@capittal.com'],
              template: 'hot_lead'
            }
          }
        ],
        isActive: true
      },
      {
        id: 'enterprise-lead-rule',  
        name: 'Lead Empresarial Grande',
        conditions: [
          { field: 'companySize', operator: 'contains', value: '200+' },
          { field: 'leadScore', operator: 'gte', value: 60 }
        ],
        actions: [
          { 
            type: 'email', 
            config: { 
              recipients: ['director@capittal.com'],
              template: 'enterprise_lead'
            }
          }
        ],
        isActive: true
      },
      {
        id: 'calculator-usage-rule',
        name: 'Uso de Calculadora de Valoración',
        conditions: [
          { field: 'pageVisits', operator: 'contains', value: '/calculadora' }
        ],
        actions: [
          { 
            type: 'email', 
            config: { 
              recipients: ['valoraciones@capittal.com'],
              template: 'calculator_usage'
            }
          }
        ],
        isActive: true
      },
      {
        id: 'returning-visitor-rule',
        name: 'Visitante Recurrente de Alta Calidad',
        conditions: [
          { field: 'visitCount', operator: 'gte', value: 3 },
          { field: 'leadScore', operator: 'gte', value: 50 }
        ],
        actions: [
          { 
            type: 'dashboard', 
            config: {}
          }
        ],
        isActive: true
      }
    ];
  }

  processLeadIntelligence(leadIntel: LeadIntelligence): Alert[] {
    const newAlerts: Alert[] = [];

    for (const rule of this.rules.filter(r => r.isActive)) {
      if (this.evaluateConditions(rule.conditions, leadIntel)) {
        const alert = this.createAlert(rule, leadIntel);
        newAlerts.push(alert);
        this.executeActions(rule.actions, alert);
      }
    }

    this.alerts.push(...newAlerts);
    return newAlerts;
  }

  private evaluateConditions(conditions: AlertCondition[], leadIntel: LeadIntelligence): boolean {
    return conditions.every(condition => {
      const value = this.getFieldValue(condition.field, leadIntel);
      return this.evaluateCondition(condition, value);
    });
  }

  private getFieldValue(field: string, leadIntel: LeadIntelligence): any {
    switch (field) {
      case 'leadScore':
        return leadIntel.overallScore;
      case 'visitCount':
        return leadIntel.visitData.totalVisits;
      case 'engagementScore':
        return leadIntel.engagementScore;
      case 'industry':
        return leadIntel.companyData.industry;
      case 'companySize':
        return leadIntel.companyData.size;
      case 'pageVisits':
        return leadIntel.visitData.pagesViewed;
      default:
        return null;
    }
  }

  private evaluateCondition(condition: AlertCondition, value: any): boolean {
    switch (condition.operator) {
      case 'gt':
        return value > condition.value;
      case 'gte':
        return value >= condition.value;
      case 'lt':
        return value < condition.value;
      case 'lte':
        return value <= condition.value;
      case 'eq':
        return value === condition.value;
      case 'contains':
        return Array.isArray(value) 
          ? value.some(v => v.toString().includes(condition.value))
          : value?.toString().includes(condition.value);
      case 'in':
        return Array.isArray(condition.value) 
          ? condition.value.includes(value)
          : false;
      default:
        return false;
    }
  }

  private createAlert(rule: AlertRule, leadIntel: LeadIntelligence): Alert {
    const alertType = this.determineAlertType(rule.id, leadIntel);
    const priority = this.determinePriority(leadIntel.overallScore);
    
    return {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: alertType,
      priority,
      title: this.generateAlertTitle(alertType, leadIntel),
      description: this.generateAlertDescription(alertType, leadIntel),
      companyName: leadIntel.companyData.name,
      companyDomain: leadIntel.companyData.domain,
      leadScore: leadIntel.overallScore,
      triggers: leadIntel.triggers,
      actions: leadIntel.nextActions,
      createdAt: new Date(),
      isRead: false,
      notificationSent: false
    };
  }

  private determineAlertType(ruleId: string, leadIntel: LeadIntelligence): Alert['type'] {
    if (ruleId.includes('hot-lead')) return 'hot_lead';
    if (ruleId.includes('enterprise')) return 'enterprise_lead';
    if (ruleId.includes('calculator')) return 'high_intent';
    if (ruleId.includes('returning')) return 'returning_visitor';
    if (leadIntel.companyData.name?.toLowerCase().includes('compet')) return 'competitor_visit';
    return 'hot_lead';
  }

  private determinePriority(score: number): Alert['priority'] {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  private generateAlertTitle(type: Alert['type'], leadIntel: LeadIntelligence): string {
    const companyName = leadIntel.companyData.name;
    const score = leadIntel.overallScore;

    switch (type) {
      case 'hot_lead':
        return `🔥 Lead Caliente: ${companyName} (${score}/100)`;
      case 'enterprise_lead':
        return `🏢 Lead Empresarial: ${companyName} (${score}/100)`;
      case 'high_intent':
        return `💰 Alta Intención: ${companyName} usó calculadora`;
      case 'returning_visitor':
        return `🔄 Visitante Recurrente: ${companyName} (${leadIntel.visitData.totalVisits} visitas)`;
      case 'competitor_visit':
        return `👀 Posible Competidor: ${companyName}`;
      default:
        return `📊 Nueva Actividad: ${companyName}`;
    }
  }

  private generateAlertDescription(type: Alert['type'], leadIntel: LeadIntelligence): string {
    const { companyData, visitData, triggers } = leadIntel;
    
    return `${companyData.industry || 'Industria desconocida'} • ${companyData.size || 'Tamaño desconocido'} • ${companyData.location || 'Ubicación desconocida'}
    
Última visita: ${visitData.lastVisit.toLocaleString()}
Páginas vistas: ${visitData.pagesViewed.join(', ')}
Triggers: ${triggers.join(' | ')}`;
  }

  private async executeActions(actions: AlertAction[], alert: Alert): Promise<void> {
    for (const action of actions) {
      try {
        switch (action.type) {
          case 'email':
            await this.sendEmailAlert(action.config, alert);
            break;
          case 'slack':
            await this.sendSlackAlert(action.config, alert);
            break;
          case 'webhook':
            await this.sendWebhookAlert(action.config, alert);
            break;
          case 'dashboard':
            // Dashboard notifications are handled by the UI
            break;
        }
      } catch (error) {
        console.error(`Error executing alert action ${action.type}:`, error);
      }
    }
  }

  private async sendEmailAlert(config: any, alert: Alert): Promise<void> {
    // Mock email sending - in production, integrate with email service
    console.log(`📧 Sending email alert to ${config.recipients?.join(', ')}:`, alert.title);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async sendSlackAlert(config: any, alert: Alert): Promise<void> {
    // Mock Slack sending - in production, integrate with Slack API
    console.log(`💬 Sending Slack alert to ${config.slackChannel}:`, alert.title);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async sendWebhookAlert(config: any, alert: Alert): Promise<void> {
    // Mock webhook - in production, send to configured webhook URL
    console.log(`🔗 Sending webhook alert to ${config.webhookUrl}:`, alert);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  getAlerts(filters?: { isRead?: boolean; priority?: Alert['priority']; type?: Alert['type'] }): Alert[] {
    let filteredAlerts = [...this.alerts];

    if (filters) {
      if (filters.isRead !== undefined) {
        filteredAlerts = filteredAlerts.filter(alert => alert.isRead === filters.isRead);
      }
      if (filters.priority) {
        filteredAlerts = filteredAlerts.filter(alert => alert.priority === filters.priority);
      }
      if (filters.type) {
        filteredAlerts = filteredAlerts.filter(alert => alert.type === filters.type);
      }
    }

    return filteredAlerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  markAsRead(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.isRead = true;
    }
  }

  getUnreadCount(): number {
    return this.alerts.filter(alert => !alert.isRead).length;
  }
}
