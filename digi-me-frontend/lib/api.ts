// API configuration utility
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = {
  // Auth endpoints
  register: `${API_BASE_URL}/api/auth/register`,
  login: `${API_BASE_URL}/api/auth/login`,
  forgotPassword: `${API_BASE_URL}/api/auth/password/forgot`,
  resetPassword: `${API_BASE_URL}/api/auth/password/reset`,
  googleAuth: `${API_BASE_URL}/api/auth/google`,
  
  // Profile endpoints
  profile: `${API_BASE_URL}/api/profile`,
  
  // QR endpoints
  qr: `${API_BASE_URL}/api/qr`,
  
  // Saved endpoints
  saved: `${API_BASE_URL}/api/saved`,
};

// Helper function for making API requests
export const makeRequest = async (url: string, options: RequestInit = {}) => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Auth helper functions
export const authApi = {
  register: (data: { username: string; email: string; password: string }) =>
    makeRequest(api.register, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  login: (data: { email: string; password: string }) =>
    makeRequest(api.login, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  forgotPassword: (data: { email: string }) =>
    makeRequest(api.forgotPassword, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  resetPassword: (data: { token: string; password: string }) =>
    makeRequest(api.resetPassword, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  googleAuth: (data: { idToken: string }) =>
    makeRequest(api.googleAuth, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
