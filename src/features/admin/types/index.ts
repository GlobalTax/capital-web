// ============= ADMIN FEATURE TYPES =============
// Type definitions for the admin feature module

export interface AdminUser {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'super_admin';
  avatar_url?: string;
  permissions: AdminPermission[];
  created_at: string;
  last_login_at?: string;
}

export type AdminPermission = 
  | 'manage_users'
  | 'manage_content'
  | 'manage_valuations'
  | 'manage_contacts'
  | 'manage_settings'
  | 'view_analytics'
  | 'manage_blog'
  | 'manage_jobs';

export interface AdminStats {
  totalUsers: number;
  totalLeads: number;
  totalValuations: number;
  totalBlogPosts: number;
  totalRevenue: number;
  conversionRate: number;
}

export interface AdminActivity {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, unknown>;
  created_at: string;
}

export interface AdminNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  action_url?: string;
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