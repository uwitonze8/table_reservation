'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Check if current route is admin or staff dashboard
  const isAdminRoute = pathname?.startsWith('/admin/');
  const isStaffRoute = pathname?.startsWith('/staff');
  const isCustomerDashboard = pathname?.startsWith('/account') || pathname?.startsWith('/my-reservations');
  const isMenuRoute = pathname === '/menu';
  const isContactRoute = pathname === '/contact';
  const isLoginRoute = pathname === '/login';
  const isRegisterRoute = pathname === '/register';

  // Hide navbar and footer for admin, staff, and customer dashboards
  const hideNavAndFooter = isAdminRoute || isStaffRoute || isCustomerDashboard;

  // Hide footer for menu, contact, login, and register pages
  const hideFooter = hideNavAndFooter || isMenuRoute || isContactRoute || isLoginRoute || isRegisterRoute;

  return (
    <AuthProvider>
      {!hideNavAndFooter && <Navbar />}
      {children}
      {!hideFooter && <Footer />}
    </AuthProvider>
  );
}
