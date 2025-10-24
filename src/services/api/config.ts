import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '../types/api.types';

// Warn if API URL is not configured
if (!import.meta.env.VITE_API_URL) {
  // eslint-disable-next-line no-console
  console.warn('VITE_API_URL is not set. Create .env.local with VITE_API_URL=http://localhost:8000');
}

// Axios instance configured for Fulani Hair Finder API
const prodBase = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'https://admin.fulanihairsecrets.com') as string;
const apiClient = axios.create({
  // In dev, use same-origin so Vite proxy handles /api
  baseURL: import.meta.env.DEV ? '' : prodBase,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Future: attach auth token here
    // const token = localStorage.getItem('authToken');
    // if (token) config.headers.Authorization = `Bearer ${token}`;

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }
    if (response.status === 202 && response.data && typeof response.data === 'object') {
      // mark accepted fallback
      // @ts-expect-error add flag for caller awareness
      response.data._isAcceptedFallback = true;
    }
    return response;
  },
  (error: AxiosError) => {
    const apiError: ApiError = {
      status: error.response?.status || 0,
      message: error.message || 'An unexpected error occurred',
      details: error.response?.data,
    };

    if (!error.response) {
      apiError.message = 'Unable to connect to server. Please check your connection.';
    } else if (error.response.status === 404) {
      apiError.message = 'Resource not found.';
    } else if ((error.response.status || 0) >= 500) {
      apiError.message = 'Server error. Please try again later.';
    } else if (error.response.status === 400) {
      apiError.message = 'Invalid request. Please check your input.';
    }

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error(`API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, apiError);
    }

    return Promise.reject(apiError);
  }
);

export default apiClient;
