// API Type Definitions for Fulani Hair Finder Backend
// Backend base URL: http://localhost:8000

export interface QuizResult {
  id: number | null;
  answers: Record<string, any>;
  recommendation: Record<string, any> | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  state?: string | null;
  createdAt?: string;
  updatedAt?: string;
  note?: string;
  _isAcceptedFallback?: boolean;
}

export interface CreateQuizResultPayload {
  answers: Record<string, any>;
  recommendation?: Record<string, any> | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  state?: string | null;
}

export interface UpdateQuizResultPayload {
  recommendation?: Record<string, any> | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  state?: string | null;
}

export interface AcceptedFallback {
  id: null;
  answers: Record<string, any> | null;
  recommendation: Record<string, any> | null;
  note: 'Accepted without persistence (DB unavailable)';
  _isAcceptedFallback: true;
}

export interface PaginatedQuizResults {
  items: QuizResult[];
  limit: number;
  offset: number;
}

export interface ApiError {
  status: number;
  message: string;
  details?: any;
}

export interface HealthResponse {
  status: string;
  service: string;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}
