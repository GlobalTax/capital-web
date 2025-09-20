// ============= ADMIN FEATURE TYPES =============
// Type definitions for the admin feature module

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'super_admin';
  permissions: string[];
}

export interface AdminDashboardMetrics {
  totalLeads: number;
  qualifiedLeads: number;
  totalRevenue: number;
  identifiedCompanies: number;
  leadConversionRate: number;
  totalVisitors: number;
  averageLeadScore: number;
  leadScoring: {
    hotLeads: number;
  };
}

export interface AdminLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}