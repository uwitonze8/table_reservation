'use client';

import Link from 'next/link';

export default function MenuPage() {
  return (
    <main className="min-h-screen bg-[#F8F4F0] pt-16">
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <div className="text-center max-w-md">
          {/* Icon */}
          <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B35] to-[#ff8c5a] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-[#333333] mb-3">
            Our Menu is <span className="text-[#FF6B35]">Coming Soon</span>
          </h1>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-6">
            We&apos;re crafting a delicious menu for you. Stay tuned!
          </p>

          {/* Contact Info */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
            <h2 className="text-base font-bold text-[#333333] mb-2">
              Want to know more? Call us!
            </h2>
            <div className="flex items-center justify-center gap-2 text-[#FF6B35]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-lg font-bold">+250 788 587 420</span>
            </div>
          </div>

          {/* Back to Home Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#FF6B35] text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-[#e55a2b] transition-all transform hover:scale-105 shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
