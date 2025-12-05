'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function MyReservationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requireAuth={true} requireAdmin={false}>
      {children}
    </ProtectedRoute>
  );
}
