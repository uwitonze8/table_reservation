'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function CustomerSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Format the member since date from user's createdAt
  const formatMemberSince = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const memberSince = formatMemberSince(user?.createdAt);

  const firstName = user?.name?.split(' ')[0] || 'User';
  const lastName = user?.name?.split(' ')[1] || '';
  const initials = `${firstName[0]}${lastName[0] || ''}`;

  return (
    <div className="hidden lg:block w-64 fixed left-0 top-0 h-screen bg-white shadow-lg overflow-y-auto">
      <div className="p-4">
        {/* Profile Picture */}
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-[#FF6B35] rounded-full mx-auto mb-2 flex items-center justify-center">
            <span className="text-xl font-bold text-white">
              {initials}
            </span>
          </div>
          <h2 className="text-base font-bold text-[#333333]">
            {user?.name}
          </h2>
          <p className="text-xs text-[#333333] opacity-70">Member since {memberSince}</p>
        </div>

        {/* Reserve New Table Button */}
        <Link
          href="/reservation"
          className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-[#FF6B35] text-white rounded-lg font-semibold hover:bg-[#e55a2b] transition-all shadow-md"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Reserve New Table
        </Link>

        {/* Navigation */}
        <nav className="space-y-1.5">
          <Link
            href="/account/profile"
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
              pathname === '/account/profile'
                ? 'bg-[#FF6B35] text-white'
                : 'text-[#333333] hover:bg-[#F8F4F0]'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </Link>
          <Link
            href="/my-reservations"
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
              pathname === '/my-reservations'
                ? 'bg-[#FF6B35] text-white'
                : 'text-[#333333] hover:bg-[#F8F4F0]'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            My Reservations
          </Link>
          <Link
            href="/account/preferences"
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
              pathname === '/account/preferences'
                ? 'bg-[#FF6B35] text-white'
                : 'text-[#333333] hover:bg-[#F8F4F0]'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Preferences
          </Link>
          <Link
            href="/account/booking-history"
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
              pathname === '/account/booking-history'
                ? 'bg-[#FF6B35] text-white'
                : 'text-[#333333] hover:bg-[#F8F4F0]'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Booking History
          </Link>
          <Link
            href="/account/rewards"
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
              pathname === '/account/rewards'
                ? 'bg-[#FF6B35] text-white'
                : 'text-[#333333] hover:bg-[#F8F4F0]'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
            Loyalty Rewards
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-red-600 hover:bg-red-50 font-medium transition-colors w-full text-left"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </nav>
      </div>
    </div>
  );
}
