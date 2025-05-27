
import { apiRequest, API_BASE_URL } from './apiConfig';

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResetPasswordRequest {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ApiResponse<T = any> {
  status: 'success' | 'fail' | 'error';
  message: string;
  data?: T;
}

// Send OTP to email for password reset
export const requestPasswordReset = async (email: string): Promise<ApiResponse> => {
  try {
    console.log('Sending password reset request for:', email);
    const response = await apiRequest('/auth/forget-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    const result = await response.json();
    console.log('Password reset response:', result);
    
    if (result.status !== 'success') {
      throw new Error(result.message || 'Failed to send reset email');
    }
    
    return result;
  } catch (error) {
    console.error('Password reset request error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred while sending reset email');
  }
};

// Send OTP to email (alternative endpoint for compatibility)
export const forgotPassword = async (data: ForgotPasswordRequest): Promise<ApiResponse> => {
  try {
    console.log('Sending forgot password request to:', `${API_BASE_URL}/auth/forget-password`);
    const response = await apiRequest('/auth/forget-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    const result = await response.json();
    console.log('Forgot password response:', result);
    
    if (result.status !== 'success') {
      throw new Error(result.message || 'Failed to send reset email');
    }

    return result;
  } catch (error) {
    console.error('Forgot password error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred while sending reset email');
  }
};

// Verify OTP
export const verifyOtp = async (data: VerifyOtpRequest): Promise<ApiResponse> => {
  try {
    console.log('Sending verify OTP request for:', data.email);
    const response = await apiRequest('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    const result = await response.json();
    console.log('Verify OTP response:', result);
    
    if (result.status !== 'success') {
      throw new Error(result.message || 'Invalid verification code');
    }

    return result;
  } catch (error) {
    console.error('Verify OTP error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred while verifying code');
  }
};

// Reset password
export const resetPassword = async (data: ResetPasswordRequest): Promise<ApiResponse> => {
  try {
    console.log('Sending reset password request for:', data.email);
    const response = await apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    const result = await response.json();
    console.log('Reset password response:', result);
    
    if (result.status !== 'success') {
      throw new Error(result.message || 'Failed to reset password');
    }

    return result;
  } catch (error) {
    console.error('Reset password error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred while resetting password');
  }
};
