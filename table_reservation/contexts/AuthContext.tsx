'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export type UserRole = 'user' | 'admin' | 'waiter' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  staffId?: string; // For admin and waiter roles
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isWaiter: boolean;
  isStaff: boolean; // true for both admin and waiter
  login: (email: string, password: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, role?: UserRole): Promise<boolean> => {
    setLoading(true);

    try {
      // Simulate API call - In production, replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock authentication logic
      // Admin credentials: admin@quicktable.com / admin123
      // Waiter credentials: waiter@quicktable.com / waiter123
      // User credentials: any other email / any password

      let authenticatedUser: User;

      if (email === 'admin@quicktable.com' && password === 'admin123') {
        authenticatedUser = {
          id: 'admin-1',
          name: 'Admin User',
          email: 'admin@quicktable.com',
          role: 'admin',
          staffId: 'STAFF-001',
        };
      } else if (email === 'waiter@quicktable.com' && password === 'waiter123') {
        authenticatedUser = {
          id: 'waiter-1',
          name: 'John Waiter',
          email: 'waiter@quicktable.com',
          role: 'waiter',
          staffId: 'STAFF-002',
        };
      } else if (role === 'admin' || role === 'waiter') {
        // Invalid staff credentials
        setLoading(false);
        return false;
      } else {
        // Regular user login
        authenticatedUser = {
          id: `user-${Date.now()}`,
          name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
          email: email,
          role: 'user',
        };
      }

      setUser(authenticatedUser);
      localStorage.setItem('user', JSON.stringify(authenticatedUser));
      setLoading(false);

      // Redirect based on role
      if (authenticatedUser.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (authenticatedUser.role === 'waiter') {
        router.push('/staff/dashboard');
      } else {
        router.push('/');
      }

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      setLoading(false);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newUser: User = {
        id: `user-${Date.now()}`,
        name: name,
        email: email,
        role: 'user',
      };

      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      setLoading(false);

      router.push('/');
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    router.push('/');
  };

  const value: AuthContextType = {
    user,
    isLoggedIn: !!user,
    isAdmin: user?.role === 'admin',
    isWaiter: user?.role === 'waiter',
    isStaff: user?.role === 'admin' || user?.role === 'waiter',
    login,
    logout,
    register,
    loading,
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
