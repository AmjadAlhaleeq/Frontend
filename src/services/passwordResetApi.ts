
import { apiRequest } from './apiConfig';

export const requestPasswordReset = async (email: string) => {
  try {
    const response = await apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    const result = await response.json();
    
    if (result.status !== 'success') {
      throw new Error(result.message || 'Failed to send reset email');
    }
    
    return result;
  } catch (error) {
    console.error('Password reset request error:', error);
    throw error;
  }
};

export const resetPassword = async (token: string, newPassword: string) => {
  try {
    const response = await apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });

    const result = await response.json();
    
    if (result.status !== 'success') {
      throw new Error(result.message || 'Failed to reset password');
    }
    
    return result;
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};
