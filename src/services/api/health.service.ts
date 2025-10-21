import apiClient from './config';
import type { HealthResponse } from '../types/api.types';

export async function getHealth(): Promise<HealthResponse> {
  const res = await apiClient.get<HealthResponse>('/health');
  return res.data;
}

export default { getHealth };
