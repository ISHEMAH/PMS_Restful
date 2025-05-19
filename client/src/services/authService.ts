
import api from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
  };
}

// Mock credentials and responses for testing
const TEST_USER = {
  email: 'user@example.com',
  password: 'password123',
  name: 'Test User',
  role: 'user',
  id: 'user-123'
};

const TEST_ADMIN = {
  email: 'admin@example.com',
  password: 'admin123',
  name: 'Test Admin',
  role: 'admin',
  id: 'admin-456'
};

const authService = {
  login: async (credentials: LoginRequest) => {
    // For testing purposes, check if using test credentials
    if (credentials.email === TEST_USER.email && credentials.password === TEST_USER.password) {
      const mockResponse = {
        token: 'mock-user-jwt-token',
        user: {
          id: TEST_USER.id,
          email: TEST_USER.email,
          name: TEST_USER.name,
          role: TEST_USER.role as 'user' | 'admin'
        }
      };
      
      localStorage.setItem('parking-token', mockResponse.token);
      localStorage.setItem('parking-user', JSON.stringify(mockResponse.user));
      return mockResponse;
    } 
    
    if (credentials.email === TEST_ADMIN.email && credentials.password === TEST_ADMIN.password) {
      const mockResponse = {
        token: 'mock-admin-jwt-token',
        user: {
          id: TEST_ADMIN.id,
          email: TEST_ADMIN.email,
          name: TEST_ADMIN.name,
          role: TEST_ADMIN.role as 'user' | 'admin'
        }
      };
      
      localStorage.setItem('parking-token', mockResponse.token);
      localStorage.setItem('parking-user', JSON.stringify(mockResponse.user));
      return mockResponse;
    }
    
    // If not using test credentials, forward to the actual API
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    localStorage.setItem('parking-token', response.data.token);
    localStorage.setItem('parking-user', JSON.stringify(response.data.user));
    return response.data;
  },

  signup: async (userData: SignupRequest) => {
    // For testing purposes - mock success response
    if (userData.email === 'new@example.com') {
      return { message: 'User registered successfully' };
    }
    
    // Forward to actual API otherwise
    const response = await api.post<{ message: string }>('/auth/signup', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('parking-token');
    localStorage.removeItem('parking-user');
    window.location.href = '/login';
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('parking-user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('parking-token');
  },

  hasRole: (role: string) => {
    const user = authService.getCurrentUser();
    return user?.role === role;
  },
};

export default authService;
