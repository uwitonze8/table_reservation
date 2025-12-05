'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, User as ApiUser } from '@/lib/api';

export type UserRole = 'user' | 'admin' | 'waiter' | 'manager' | 'host' | null;

export interface User {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  staffId?: string;
  loyaltyPoints?: number;
  loyaltyTier?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isWaiter: boolean;
  isStaff: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string }>;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Convert API user to frontend user format
const mapApiUserToUser = (apiUser: ApiUser): User => {
  const roleMap: Record<string, UserRole> = {
    'USER': 'user',
    'ADMIN': 'admin',
    'WAITER': 'waiter',
    'MANAGER': 'manager',
    'HOST': 'host',
  };

  return {
    id: String(apiUser.id),
    name: apiUser.fullName,
    firstName: apiUser.firstName,
    lastName: apiUser.lastName,
    email: apiUser.email,
    role: roleMap[apiUser.role] || 'user',
    phone: apiUser.phone,
    avatar: apiUser.avatar,
    loyaltyPoints: apiUser.loyaltyPoints,
    loyaltyTier: apiUser.loyaltyTier,
    createdAt: apiUser.createdAt,
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from localStorage and validate token
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          // Validate token by fetching current user
          const response = await authApi.getCurrentUser();
          if (response.success && response.data) {
            const mappedUser = mapApiUserToUser(response.data);
            setUser(mappedUser);
            localStorage.setItem('user', JSON.stringify(mappedUser));
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Failed to validate token:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);

    try {
      const response = await authApi.login(email, password);

      if (response.success && response.data) {
        const { accessToken, refreshToken, user: apiUser } = response.data;

        // Store tokens
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        // Map and store user
        const mappedUser = mapApiUserToUser(apiUser);
        console.log('Login - API User:', apiUser);
        console.log('Login - Mapped User:', mappedUser);
        console.log('Login - Role from API:', apiUser.role);
        console.log('Login - Mapped Role:', mappedUser.role);

        setUser(mappedUser);
        localStorage.setItem('user', JSON.stringify(mappedUser));

        setLoading(false);

        // Redirect based on role
        console.log('Login - Redirecting based on role:', mappedUser.role);
        if (mappedUser.role === 'admin') {
          console.log('Login - Redirecting to admin dashboard');
          router.push('/admin/dashboard');
        } else if (mappedUser.role === 'waiter' || mappedUser.role === 'manager' || mappedUser.role === 'host') {
          console.log('Login - Redirecting to staff dashboard');
          router.push('/staff/dashboard');
        } else {
          console.log('Login - Redirecting to home (customer)');
          router.push('/');
        }

        return { success: true };
      } else {
        setLoading(false);
        return { success: false, message: response.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login failed:', error);
      setLoading(false);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);

    try {
      const response = await authApi.register(data);

      if (response.success && response.data) {
        const { accessToken, refreshToken, user: apiUser } = response.data;

        // Store tokens
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        // Map and store user
        const mappedUser = mapApiUserToUser(apiUser);
        setUser(mappedUser);
        localStorage.setItem('user', JSON.stringify(mappedUser));

        setLoading(false);
        router.push('/');
        return { success: true };
      } else {
        setLoading(false);
        return { success: false, message: response.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration failed:', error);
      setLoading(false);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/');
  };

  const refreshUser = async () => {
    try {
      const response = await authApi.getCurrentUser();
      if (response.success && response.data) {
        const mappedUser = mapApiUserToUser(response.data);
        setUser(mappedUser);
        localStorage.setItem('user', JSON.stringify(mappedUser));
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoggedIn: !!user,
    isAdmin: user?.role === 'admin',
    isWaiter: user?.role === 'waiter',
    isStaff: user?.role === 'admin' || user?.role === 'waiter' || user?.role === 'manager' || user?.role === 'host',
    login,
    logout,
    register,
    loading,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
