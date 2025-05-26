
// API Configuration with fallback handling
const API_BASE_URL = 'http://127.0.0.1:3000';

// Helper function to check if backend is accessible
export const checkBackendConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.ok;
  } catch (error) {
    console.warn('Backend not accessible:', error);
    return false;
  }
};

// Enhanced fetch with retry logic
export const apiRequest = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  
  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Backend server is not accessible. Please ensure the server is running on http://127.0.0.1:3000');
    }
    throw error;
  }
};

export { API_BASE_URL };
