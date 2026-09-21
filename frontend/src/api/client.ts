import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiValidationError } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ============================================
// Intercepteur de requête : injecte le token
// ============================================

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('meditrack_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================
// Intercepteur de réponse : gère le 401
// ============================================

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiValidationError>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('meditrack_token');
      localStorage.removeItem('meditrack_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============================================
// Helper pour extraire un message d'erreur lisible
// ============================================

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiValidationError | undefined;

    if (data?.errors) {
      const firstField = Object.keys(data.errors)[0];
      if (firstField) {
        return data.errors[firstField][0];
      }
    }

    if (data?.message) {
      return data.message;
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Une erreur est survenue.';
}