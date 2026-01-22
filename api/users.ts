import { apiClient } from './client';

export interface User {
  id: string;
  username: string;
  full_name: string;
  email: string;
  created_at: string;
  role: string;
}

export interface RegisterUserData {
  username: string;
  password: string;
  full_name: string;
  email?: string;
  role: string;
}

export interface UpdateUserData {
  full_name?: string;
  email?: string;
  role?: string;
  password?: string;
}

const AUTH_PREFIX = '/auth';

export const usersApi = {
  // GET all users
  getAll: async (): Promise<User[]> => {
    return apiClient.get('/users');
  },

  // POST /register
  register: async (data: RegisterUserData): Promise<User> => {
    return apiClient.post(`${AUTH_PREFIX}/register`, data);
  },

  // PATCH /users/{user_id}
  update: async (userId: string, data: UpdateUserData): Promise<User> => {
    return apiClient.patch(`${AUTH_PREFIX}/users/${userId}`, data);
  },

  // DELETE /users/{user_id}
  delete: async (userId: string): Promise<void> => {
    return apiClient.delete(`${AUTH_PREFIX}/users/${userId}`);
  },
};
