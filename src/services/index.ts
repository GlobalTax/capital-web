/**
 * Services barrel export - Centralized exports for all services
 */

// Base services
export { BaseDataService } from './base/BaseDataService';
export type { ServiceResult, PaginatedResult, QueryFilters, ServiceError } from './base/types';

// Jobs services
export { JobPostsService, jobPostsService } from './jobs/JobPostsService';
export { JobTemplatesService, jobTemplatesService } from './jobs/JobTemplatesService';
export type { JobPost } from './jobs/JobPostsService';
export type { JobTemplate, JobTemplateInsert } from './jobs/JobTemplatesService';

// Future service exports
// export * from './blog';
// export * from './leads';
// export * from './analytics';
