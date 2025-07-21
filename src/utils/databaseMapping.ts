
/**
 * Utilidades para mapear entre convenciones de nomenclatura de base de datos (snake_case) 
 * y frontend (camelCase)
 */

// Tipos para usuarios de la base de datos
export interface DatabaseUser {
  id: string;
  created_at: string;
  updated_at: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  super_admin: boolean;
  phone?: string;
  company?: string;
  title?: string;
  industry?: string;
  location?: string;
  last_login?: string;
  is_active: boolean;
}

// Tipos para usuarios del frontend
export interface FrontendUser {
  id: string;
  createdAt: string;
  updatedAt: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  superAdmin: boolean;
  phone?: string;
  company?: string;
  title?: string;
  industry?: string;
  location?: string;
  lastLogin?: string;
  isActive: boolean;
}

// Tipos para landing pages de la base de datos
export interface DatabaseLandingPage {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  slug: string;
  template_id?: string;
  content_config: any;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  is_published: boolean;
  published_at?: string;
  custom_css?: string;
  custom_js?: string;
  analytics_config?: any;
  conversion_goals?: any[];
}

// Tipos para landing pages del frontend
export interface FrontendLandingPage {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  slug: string;
  templateId?: string;
  contentConfig: any;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  isPublished: boolean;
  publishedAt?: string;
  customCss?: string;
  customJs?: string;
  analyticsConfig?: any;
  conversionGoals?: any[];
}

// Función genérica para convertir snake_case a camelCase
export const snakeToCamel = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel);
  }
  
  const result: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
      result[camelKey] = snakeToCamel(obj[key]);
    }
  }
  return result;
};

// Función genérica para convertir camelCase a snake_case
export const camelToSnake = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(camelToSnake);
  }
  
  const result: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      result[snakeKey] = camelToSnake(obj[key]);
    }
  }
  return result;
};

// Mappers específicos para usuarios
export const mapUserFromDatabase = (dbUser: DatabaseUser): FrontendUser => {
  return {
    id: dbUser.id,
    createdAt: dbUser.created_at,
    updatedAt: dbUser.updated_at,
    fullName: dbUser.full_name,
    email: dbUser.email,
    avatarUrl: dbUser.avatar_url,
    superAdmin: dbUser.super_admin,
    phone: dbUser.phone,
    company: dbUser.company,
    title: dbUser.title,
    industry: dbUser.industry,
    location: dbUser.location,
    lastLogin: dbUser.last_login,
    isActive: dbUser.is_active,
  };
};

export const mapUserToDatabase = (frontendUser: Partial<FrontendUser>): Partial<DatabaseUser> => {
  const dbUser: Partial<DatabaseUser> = {};
  
  if (frontendUser.id) dbUser.id = frontendUser.id;
  if (frontendUser.createdAt) dbUser.created_at = frontendUser.createdAt;
  if (frontendUser.updatedAt) dbUser.updated_at = frontendUser.updatedAt;
  if (frontendUser.fullName) dbUser.full_name = frontendUser.fullName;
  if (frontendUser.email) dbUser.email = frontendUser.email;
  if (frontendUser.avatarUrl) dbUser.avatar_url = frontendUser.avatarUrl;
  if (frontendUser.superAdmin !== undefined) dbUser.super_admin = frontendUser.superAdmin;
  if (frontendUser.phone) dbUser.phone = frontendUser.phone;
  if (frontendUser.company) dbUser.company = frontendUser.company;
  if (frontendUser.title) dbUser.title = frontendUser.title;
  if (frontendUser.industry) dbUser.industry = frontendUser.industry;
  if (frontendUser.location) dbUser.location = frontendUser.location;
  if (frontendUser.lastLogin) dbUser.last_login = frontendUser.lastLogin;
  if (frontendUser.isActive !== undefined) dbUser.is_active = frontendUser.isActive;
  
  return dbUser;
};

// Mappers específicos para landing pages
export const mapLandingPageFromDatabase = (dbPage: DatabaseLandingPage): FrontendLandingPage => {
  return {
    id: dbPage.id,
    createdAt: dbPage.created_at,
    updatedAt: dbPage.updated_at,
    title: dbPage.title,
    slug: dbPage.slug,
    templateId: dbPage.template_id,
    contentConfig: dbPage.content_config,
    metaTitle: dbPage.meta_title,
    metaDescription: dbPage.meta_description,
    metaKeywords: dbPage.meta_keywords,
    isPublished: dbPage.is_published,
    publishedAt: dbPage.published_at,
    customCss: dbPage.custom_css,
    customJs: dbPage.custom_js,
    analyticsConfig: dbPage.analytics_config,
    conversionGoals: dbPage.conversion_goals,
  };
};

export const mapLandingPageToDatabase = (frontendPage: Partial<FrontendLandingPage>): Partial<DatabaseLandingPage> => {
  const dbPage: Partial<DatabaseLandingPage> = {};
  
  if (frontendPage.id) dbPage.id = frontendPage.id;
  if (frontendPage.createdAt) dbPage.created_at = frontendPage.createdAt;
  if (frontendPage.updatedAt) dbPage.updated_at = frontendPage.updatedAt;
  if (frontendPage.title) dbPage.title = frontendPage.title;
  if (frontendPage.slug) dbPage.slug = frontendPage.slug;
  if (frontendPage.templateId) dbPage.template_id = frontendPage.templateId;
  if (frontendPage.contentConfig) dbPage.content_config = frontendPage.contentConfig;
  if (frontendPage.metaTitle) dbPage.meta_title = frontendPage.metaTitle;
  if (frontendPage.metaDescription) dbPage.meta_description = frontendPage.metaDescription;
  if (frontendPage.metaKeywords) dbPage.meta_keywords = frontendPage.metaKeywords;
  if (frontendPage.isPublished !== undefined) dbPage.is_published = frontendPage.isPublished;
  if (frontendPage.publishedAt) dbPage.published_at = frontendPage.publishedAt;
  if (frontendPage.customCss) dbPage.custom_css = frontendPage.customCss;
  if (frontendPage.customJs) dbPage.custom_js = frontendPage.customJs;
  if (frontendPage.analyticsConfig) dbPage.analytics_config = frontendPage.analyticsConfig;
  if (frontendPage.conversionGoals) dbPage.conversion_goals = frontendPage.conversionGoals;
  
  return dbPage;
};

// Constantes para campos comunes
export const COMMON_DB_FIELDS = {
  ID: 'id',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',
  IS_ACTIVE: 'is_active',
  IS_PUBLISHED: 'is_published',
} as const;

export const COMMON_FRONTEND_FIELDS = {
  ID: 'id',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
  IS_ACTIVE: 'isActive',
  IS_PUBLISHED: 'isPublished',
} as const;

// Utilidades para validación de campos
export const validateDatabaseField = (field: string): boolean => {
  return /^[a-z][a-z0-9_]*$/.test(field);
};

export const validateFrontendField = (field: string): boolean => {
  return /^[a-z][a-zA-Z0-9]*$/.test(field);
};
