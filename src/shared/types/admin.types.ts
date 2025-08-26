// ============= ADMIN TYPES =============
// Admin dashboard and management related types

import { LucideIcon } from 'lucide-react';

export interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login: string | null;
}

export type AdminRole = 'super_admin' | 'admin' | 'editor' | 'viewer';

export interface AdminPermissions {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canManageUsers: boolean;
}

export interface SidebarItem {
  title: string;
  icon: LucideIcon;
  url: string;
  badge?: 'URGENTE' | 'AI' | 'NEW';
  description?: string;
  visible?: boolean;
}

export interface SidebarSection {
  title: string;
  description: string;
  items: SidebarItem[];
}

export interface AdminLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

export interface AdminComponent {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  lastCheck: string;
  error?: string;
}

export interface AdminMetrics {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  errorRate: number;
  responseTime: number;
}