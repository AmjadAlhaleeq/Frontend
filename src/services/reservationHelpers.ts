
import { API_BASE_URL } from '@/lib/api';

export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const API_BASE = API_BASE_URL;

export const requireAuth = () => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Authentication required');
  return token;
};
