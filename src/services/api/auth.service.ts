/**
 * Authentication service (placeholder for future implementation)
 * Backend does not implement auth yet. When added, implement the functions below
 * and wire token handling into axios interceptors in src/services/api/config.ts
 */

// interface AuthResponse { token: string; user: User }
// interface User { id: number; email: string; name: string }
// interface LoginCredentials { email: string; password: string }
// interface RegisterPayload { email: string; password: string; name: string }

// import apiClient from './config';

// export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
//   const res = await apiClient.post<AuthResponse>('/auth/login', credentials);
//   return res.data;
// }

// export async function register(userData: RegisterPayload): Promise<AuthResponse> {
//   const res = await apiClient.post<AuthResponse>('/auth/register', userData);
//   return res.data;
// }

// export async function logout(): Promise<void> {
//   await apiClient.post('/auth/logout');
// }

// export async function getCurrentUser(): Promise<User> {
//   const res = await apiClient.get<User>('/auth/me');
//   return res.data;
// }

export default {};
