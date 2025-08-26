import axios from 'axios';
import { LoginRequest, RegisterRequest, AuthResponse } from '../types/Auth';

const API_BASE_URL = 'http://localhost:8000/api';

const authApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authApi = {
  // Login user
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await authApiClient.post<AuthResponse>('/auth/login/', credentials);
    return response.data;
  },

  // Register new user
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await authApiClient.post<AuthResponse>('/auth/register/', userData);
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<{ access: string }> => {
    const response = await authApiClient.post<{ access: string }>('/auth/token/refresh/', {
      refresh: refreshToken
    });
    return response.data;
  },

  // Get user profile
  getProfile: async (token: string) => {
    const response = await authApiClient.get('/auth/profile/', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }
};