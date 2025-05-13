import { User, InsertUser } from '@shared/schema';

const API_BASE_URL = '/api/auth';

interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

interface RegisterResponse extends User {}

export const AuthService = {
  login: async (credentials: Pick<InsertUser, 'username' | 'password'>): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    return data;
  },

  register: async (userData: Omit<InsertUser, 'role' | 'id'>): Promise<RegisterResponse> => {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    return data;
  },

  // Example of a method that might require an auth token
  fetchProtectedData: async (token: string): Promise<any> => {
    const response = await fetch('/api/protected-resource', { // Assuming you have such an endpoint
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch protected data' }));
      throw new Error(errorData.message || 'Failed to fetch protected data');
    }
    return response.json();
  }
};