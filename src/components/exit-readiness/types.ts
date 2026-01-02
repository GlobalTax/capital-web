export interface ExitReadinessQuestion {
  id: number;
  question: string;
  options: {
    label: string;
    value: string;
    points: number;
  }[];
  recommendation: string;
}

export interface ExitReadinessResponse {
  questionId: number;
  answer: string;
  points: number;
}

export type ReadinessLevel = 'ready' | 'in_progress' | 'needs_work';

export interface ExitReadinessResult {
  totalScore: number;
  maxScore: number;
  readinessLevel: ReadinessLevel;
  recommendations: string[];
  responses: ExitReadinessResponse[];
}

export interface ExitReadinessLeadData {
  email: string;
  name?: string;
  phone?: string;
  company_name?: string;
}
