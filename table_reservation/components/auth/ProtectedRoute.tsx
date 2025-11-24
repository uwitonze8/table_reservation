'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireWaiter?: boolean;
  requireStaff?: boolean; // Either admin or waiter
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  requireAdmin = false,
  requireWaiter = false,
  requireStaff = false
}: ProtectedRouteProps) {
  const { user, isLoggedIn, isAdmin, isWaiter, isStaff, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Check if authentication is required
    if (requireAuth && !isLoggedIn) {
      router.push('/login');
      return;
    }

    // Check if admin access is required
    if (requireAdmin && !isAdmin) {
      router.push('/');
      return;
    }

    // Check if waiter access is required
    if (requireWaiter && !isWaiter) {
      router.push('/');
      return;
    }

    // Check if staff access is required (admin or waiter)
    if (requireStaff && !isStaff) {
      router.push('/');
      return;
    }

    // Redirect staff away from user routes
    if (!requireAdmin && !requireWaiter && !requireStaff && isStaff && isLoggedIn) {
      if (isAdmin) {
        router.push('/admin/dashboard');
      } else if (isWaiter) {
        router.push('/staff/dashboard');
      }
      return;
    }
  }, [isLoggedIn, isAdmin, isWaiter, isStaff, loading, requireAuth, requireAdmin, requireWaiter, requireStaff, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F4F0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#333333] font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if requirements aren't met
  if (requireAuth && !isLoggedIn) return null;
  if (requireAdmin && !isAdmin) return null;
  if (requireWaiter && !isWaiter) return null;
  if (requireStaff && !isStaff) return null;
  if (!requireAdmin && !requireWaiter && !requireStaff && isStaff && isLoggedIn) return null;

  return <>{children}</>;
}
