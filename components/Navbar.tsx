'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isLoggedIn, logout } = useAuth();
  const pathname = usePathname();

  const userName = user?.name || "Guest";

  // Use white text only on home page hero (not scrolled)
  const isHomePage = pathname === '/';
  const isOnHero = isHomePage && !isScrolled;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/30 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/Q.png" alt="Quick Table Logo" width={40} height={40} className="object-cover rounded-full" unoptimized />
            <div className="text-2xl font-bold text-[#333333]">
              <span className="text-[#FF6B35]">Quick</span> Table
            </div>
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
            <Link
              href="/"
              className="text-[#333333] hover:text-[#FF6B35] transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-[#333333] hover:text-[#FF6B35] transition-colors font-medium"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-[#333333] hover:text-[#FF6B35] transition-colors font-medium"
            >
              Contact
            </Link>
            <Link
              href="/reservation"
              className="text-[#333333] hover:text-[#FF6B35] transition-colors font-medium"
            >
              Reserve
            </Link>
          </div>

          {/* Desktop Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Auth Buttons / User Menu */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 text-[#333333] hover:text-[#FF6B35] transition-colors font-medium cursor-pointer"
                >
                  <div className="w-8 h-8 bg-[#FF6B35] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {userName.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <span>{userName.split(' ')[0]}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50">
                    {/* Admin Menu */}
                    {user?.role === 'admin' ? (
                      <>
                        <Link
                          href="/account/profile"
                          className="block px-4 py-2 text-[#333333] hover:bg-[#F8F4F0] transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            My Profile
                          </div>
                        </Link>
                        <Link
                          href="/admin/dashboard"
                          className="block px-4 py-2 text-[#333333] hover:bg-[#F8F4F0] transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Dashboard
                          </div>
                        </Link>
                        <div className="border-t border-gray-200 my-2"></div>
                        <button
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                          </div>
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Customer Menu */}
                        <Link
                          href="/account/profile"
                          className="block px-4 py-2 text-[#333333] hover:bg-[#F8F4F0] transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            My Profile
                          </div>
                        </Link>
                        <Link
                          href="/my-reservations"
                          className="block px-4 py-2 text-[#333333] hover:bg-[#F8F4F0] transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            My Reservations
                          </div>
                        </Link>
                        <Link
                          href="/account/rewards"
                          className="block px-4 py-2 text-[#333333] hover:bg-[#F8F4F0] transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                            </svg>
                            Loyalty Rewards
                          </div>
                        </Link>
                        <Link
                          href="/account/preferences"
                          className="block px-4 py-2 text-[#333333] hover:bg-[#F8F4F0] transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Preferences
                          </div>
                        </Link>
                        <div className="border-t border-gray-200 my-2"></div>
                        <button
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                          </div>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-[#333333] hover:text-[#FF6B35] transition-colors font-semibold"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-[#FF6B35] text-white px-6 py-2 rounded-full hover:bg-[#e55a2b] transition-colors font-semibold shadow-md"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[#333333] focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 bg-white/95 backdrop-blur-md rounded-b-lg">
            <div className="flex flex-col space-y-3">
              <Link
                href="/"
                className="text-[#333333] hover:text-[#FF6B35] transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/about"
                className="text-[#333333] hover:text-[#FF6B35] transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-[#333333] hover:text-[#FF6B35] transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>

              {/* Mobile Auth Section */}
              <div className="border-t border-gray-200 my-2"></div>

              {isLoggedIn ? (
                <>
                  <div className="flex items-center gap-3 py-2">
                    <div className="w-10 h-10 bg-[#FF6B35] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {userName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <span className="font-semibold text-[#333333]">{userName}</span>
                  </div>
                  {user?.role === 'admin' ? (
                    <>
                      {/* Admin Mobile Menu */}
                      <Link
                        href="/account/profile"
                        className="text-[#333333] hover:text-[#FF6B35] transition-colors font-medium py-2 pl-4"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        My Profile
                      </Link>
                      <Link
                        href="/admin/dashboard"
                        className="text-[#333333] hover:text-[#FF6B35] transition-colors font-medium py-2 pl-4"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsMenuOpen(false);
                        }}
                        className="text-left text-red-600 hover:text-red-700 transition-colors font-medium py-2 pl-4 cursor-pointer"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Customer Mobile Menu */}
                      <Link
                        href="/account/profile"
                        className="text-[#333333] hover:text-[#FF6B35] transition-colors font-medium py-2 pl-4"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        My Profile
                      </Link>
                      <Link
                        href="/my-reservations"
                        className="text-[#333333] hover:text-[#FF6B35] transition-colors font-medium py-2 pl-4"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        My Reservations
                      </Link>
                      <Link
                        href="/account/rewards"
                        className="text-[#333333] hover:text-[#FF6B35] transition-colors font-medium py-2 pl-4"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Loyalty Rewards
                      </Link>
                      <Link
                        href="/account/preferences"
                        className="text-[#333333] hover:text-[#FF6B35] transition-colors font-medium py-2 pl-4"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Preferences
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsMenuOpen(false);
                        }}
                        className="text-left text-red-600 hover:text-red-700 transition-colors font-medium py-2 pl-4 cursor-pointer"
                      >
                        Logout
                      </button>
                      <div className="border-t border-gray-200 my-2"></div>
                      <Link
                        href="/reservation"
                        className="bg-[#FF6B35] text-white px-6 py-2 rounded-full hover:bg-[#e55a2b] transition-colors font-semibold text-center shadow-md"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Reserve Table
                      </Link>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-[#333333] hover:text-[#FF6B35] transition-colors font-semibold py-2 text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="bg-[#FF6B35] text-white px-6 py-2 rounded-full hover:bg-[#e55a2b] transition-colors font-semibold text-center shadow-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
