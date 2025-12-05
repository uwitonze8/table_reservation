'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function StaffSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Get role label
  const getRoleLabel = () => {
    switch (user?.role) {
      case 'manager': return 'Manager';
      case 'host': return 'Host';
      case 'waiter': return 'Waiter';
      default: return 'Staff';
    }
  };

  // Role-based menu items
  const getMenuItems = () => {
    const baseItems = [
      {
        name: 'Dashboard',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        ),
        path: '/staff/dashboard',
        roles: ['manager', 'host', 'waiter'],
      },
      {
        name: 'Reservations',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
        path: '/staff/reservations',
        roles: ['manager', 'host'],
      },
      {
        name: 'Tables',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        ),
        path: '/staff/tables',
        roles: ['manager', 'host', 'waiter'],
      },
      {
        name: 'Reports',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
        path: '/staff/reports',
        roles: ['manager', 'waiter'],
      },
    ];

    // Filter based on user role
    return baseItems.filter(item => item.roles.includes(user?.role || ''));
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-64 bg-[#333333] h-screen p-6 flex flex-col fixed left-0 top-0 overflow-y-auto">
      {/* Logo */}
      <Link href="/staff/dashboard" className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Image src="/Q.png" alt="Quick Table Logo" width={36} height={36} className="object-cover rounded-full" unoptimized />
          <div className="text-2xl font-bold text-white">
            <span className="text-[#FF6B35]">Quick</span> Table
          </div>
        </div>
        <p className="text-sm text-gray-400 mt-1">{getRoleLabel()} Portal</p>
      </Link>

      {/* Navigation */}
      <nav className="flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-[#FF6B35] text-white'
                      : 'text-gray-300 hover:bg-[#444444] hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info */}
      <div className="border-t border-gray-700 pt-6 mt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#FF6B35] rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-medium text-sm">{user?.name || 'Staff User'}</p>
            <p className="text-gray-400 text-xs capitalize">{getRoleLabel()}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
}
