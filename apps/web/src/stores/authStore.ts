import { create } from 'zustand';
import api from '../lib/api';
import { User, UserRole } from '@campusedge/shared';

interface AuthState {
  user: User & {
    student?: any;
    faculty?: any;
    parent?: any;
    superAdmin?: any;
  } | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  
  login: (credentials: { email: string; passwordHash: string }) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateAvatar: (avatarConfig: any) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      // API expects email and password
      const res = await api.post('/auth/login', {
        email: credentials.email,
        password: credentials.passwordHash, // actual password input from form
      });
      
      const { token, user } = res.data.data;
      
      localStorage.setItem('campusedge_token', token);
      localStorage.setItem('campusedge_user', JSON.stringify(user));
      
      set({ token, user, isLoading: false });
    } catch (err: any) {
      const message = err.response?.data?.error?.message || 'Failed to sign in. Please check your credentials.';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/register', data);
      const { token, user } = res.data.data;

      localStorage.setItem('campusedge_token', token);
      localStorage.setItem('campusedge_user', JSON.stringify(user));

      set({ token, user, isLoading: false });
    } catch (err: any) {
      const message = err.response?.data?.error?.message || 'Failed to sign up. Please try again.';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('campusedge_token');
    localStorage.removeItem('campusedge_user');
    set({ token: null, user: null, error: null });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('campusedge_token');
    const cachedUser = localStorage.getItem('campusedge_user');

    if (!token || !cachedUser) {
      set({ token: null, user: null });
      return;
    }

    set({ token, user: JSON.parse(cachedUser) });

    // Validate token with backend refreshingly
    try {
      const res = await api.get('/auth/me');
      const user = res.data.data;
      localStorage.setItem('campusedge_user', JSON.stringify(user));
      set({ user });
    } catch (err) {
      console.warn('Token validation failed, logging out.');
      get().logout();
    }
  },

  updateAvatar: async (avatarConfig) => {
    const { user } = get();
    if (!user || !user.student) return;

    try {
      const res = await api.put('/students/me/avatar', { avatarConfig });
      const updatedStudent = res.data.data;
      
      const updatedUser = {
        ...user,
        student: updatedStudent
      };

      localStorage.setItem('campusedge_user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    } catch (err) {
      console.error('Failed to update student avatar:', err);
    }
  }
}));
