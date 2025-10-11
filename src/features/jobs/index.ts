// ============= JOBS FEATURE EXPORTS =============
// Components
export { JobBasicInfo } from './components/JobBasicInfo';
export { JobTemplateSelector } from './components/JobTemplateSelector';
export { JobRequirements } from './components/JobRequirements';
export { JobLocationSalary } from './components/JobLocationSalary';
export { JobApplicationMethod } from './components/JobApplicationMethod';
export { JobPreview } from './components/JobPreview';
export { JobsErrorBoundary } from './components/JobsErrorBoundary';

// Hooks
export { useJobForm } from './hooks/useJobForm';
export { useJobListManagement } from './hooks/useJobListManagement';

// Types
export type {
  JobPost,
  JobPostFormData,
  JobCategory,
  JobApplication,
  JobTemplate,
  ContractType,
  EmploymentType,
  ExperienceLevel,
  ApplicationMethod,
  JobStatus,
  ApplicationStatus
} from './types';

// Validation Schemas
export { jobPostSchema, jobApplicationSchema, jobCategorySchema } from './validation/schemas';
export type { JobApplicationFormData, JobCategoryFormData } from './validation/schemas';

// Services (re-export from base services)
export * from '@/services/jobs';
