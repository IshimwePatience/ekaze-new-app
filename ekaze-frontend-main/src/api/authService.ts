import api from '@/lib/api';


export interface LoginCredentials {
  login: string; // email or phone number
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      phone?: string;
      firstName: string;
      lastName: string;
      role: string;
    };
    token: string;
  };
}

export interface ForgotPasswordRequest {
  login: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export const authApi = {
  // Login function
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  // Logout function
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  // Forgot password function
  forgotPassword: async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    const response = await api.post<ForgotPasswordResponse>('/auth/forgot-password', data);
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },



};