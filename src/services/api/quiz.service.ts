import apiClient from './config';
import type {
  QuizResult,
  CreateQuizResultPayload,
  PaginatedQuizResults,
  PaginationParams,
  AcceptedFallback,
} from '../types/api.types';

export async function listQuizResults(
  params: PaginationParams = {}
): Promise<PaginatedQuizResults> {
  const res = await apiClient.get<PaginatedQuizResults>('/quiz-results', {
    params: {
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
    },
  });
  return res.data;
}

export async function createQuizResult(
  payload: CreateQuizResultPayload
): Promise<QuizResult | AcceptedFallback> {
  const res = await apiClient.post<QuizResult | AcceptedFallback>(
    '/quiz-results',
    payload
  );
  return res.data as QuizResult | AcceptedFallback;
}

export async function getQuizResultById(id: number): Promise<QuizResult> {
  const res = await apiClient.get<QuizResult>(`/quiz-results/${id}`);
  return res.data;
}

export default {
  listQuizResults,
  createQuizResult,
  getQuizResultById,
};
