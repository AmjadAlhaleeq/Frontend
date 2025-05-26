
const API_BASE_URL = 'http://localhost:3000/api';

export interface ApiResponse<T = any> {
  status: 'success' | 'fail' | 'error';
  message: string;
  data?: T;
}

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

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  age: number;
}

// Send OTP to email for password reset
export const forgotPassword = async (data: ForgotPasswordRequest): Promise<ApiResponse> => {
  try {
    console.log('Sending forgot password request to:', `${API_BASE_URL}/auth/forgot-password`);
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    console.log('Forgot password response:', result);
    
    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }

    return result;
  } catch (error) {
    console.error('Forgot password error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
};

// Verify OTP
export const verifyOtp = async (data: VerifyOtpRequest): Promise<ApiResponse> => {
  try {
    console.log('Sending verify OTP request to:', `${API_BASE_URL}/auth/verify-otp`);
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    console.log('Verify OTP response:', result);
    
    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }

    return result;
  } catch (error) {
    console.error('Verify OTP error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
};

// Reset password
export const resetPassword = async (data: ResetPasswordRequest): Promise<ApiResponse> => {
  try {
    console.log('Sending reset password request to:', `${API_BASE_URL}/auth/reset-password`);
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    console.log('Reset password response:', result);
    
    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }

    return result;
  } catch (error) {
    console.error('Reset password error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
};

// Login user
export const login = async (data: LoginRequest): Promise<ApiResponse> => {
  try {
    console.log('Sending login request to:', `${API_BASE_URL}/auth/login`);
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    console.log('Login response:', result);
    
    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }

    return result;
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
};

// Signup user
export const signup = async (data: SignupRequest): Promise<ApiResponse> => {
  try {
    console.log('Sending signup request to:', `${API_BASE_URL}/auth/signup`);
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    console.log('Signup response:', result);
    
    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }

    return result;
  } catch (error) {
    console.error('Signup error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
};
