'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ReservationTicket from '@/components/customer/ReservationTicket';
import CustomerSidebar from '@/components/customer/CustomerSidebar';

// Mock data for demonstration - Extended with more details
const mockReservations = [
  {
    id: 'RES-001',
    date: '2025-12-01',
    time: '7:00 PM',
    guests: 4,
    tableName: 'Table 5 (Window Seat)',
    tableNumber: 5,
    status: 'confirmed',
    specialRequests: 'Window seat preferred, Birthday celebration',
    createdAt: '2025-11-20',
    loyaltyPointsEarned: 40,
  },
  {
    id: 'RES-002',
    date: '2025-11-28',
    time: '6:30 PM',
    guests: 2,
    tableName: 'Table 12 (Patio)',
    tableNumber: 12,
    status: 'completed',
    specialRequests: 'Anniversary dinner',
    createdAt: '2025-11-15',
    loyaltyPointsEarned: 20,
  },
  {
    id: 'RES-003',
    date: '2025-11-25',
    time: '8:00 PM',
    guests: 6,
    tableName: 'Table 10 (Private Room)',
    tableNumber: 10,
    status: 'completed',
    specialRequests: 'High chairs needed',
    createdAt: '2025-11-10',
    loyaltyPointsEarned: 60,
  },
  {
    id: 'RES-004',
    date: '2025-11-20',
    time: '12:00 PM',
    guests: 3,
    tableName: 'Table 3 (Garden View)',
    tableNumber: 3,
    status: 'completed',
    specialRequests: 'None',
    createdAt: '2025-11-10',
    loyaltyPointsEarned: 30,
  },
  {
    id: 'RES-005',
    date: '2025-11-15',
    time: '1:00 PM',
    guests: 2,
    tableName: 'Table 8 (Booth)',
    tableNumber: 8,
    status: 'cancelled',
    specialRequests: 'Quiet area',
    createdAt: '2025-11-05',
    loyaltyPointsEarned: 0,
  },
];

export default function MyReservationsPage() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const [reservations] = useState(mockReservations);
  const [filter, setFilter] = useState('all');
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);

  // Redirect if not logged in
  if (!isLoggedIn) {
    router.push('/login');
    return null;
  }

  const filteredReservations = filter === 'all'
    ? reservations
    : reservations.filter(res => res.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'completed':
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'cancelled':
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  const handlePrintTicket = (reservation: any) => {
    setSelectedReservation(reservation);
    setShowTicketModal(true);
  };

  const handleRebook = (reservation: any) => {
    // Navigate to reservation page with pre-filled data
    router.push(`/reservation?rebook=${reservation.id}`);
  };

  const totalLoyaltyPoints = reservations
    .filter(r => r.status === 'completed')
    .reduce((sum, r) => sum + r.loyaltyPointsEarned, 0);

  return (
    <div className="flex min-h-screen bg-[#F8F4F0]">
      {/* Sidebar */}
      <CustomerSidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#F8F4F0] to-[#e8e0d8] py-8 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-[#333333] mb-2">
                  My <span className="text-[#FF6B35]">Reservations</span>
                </h1>
                <p className="text-sm text-[#333333] opacity-70">
                  View and manage all your restaurant reservations
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-3 text-center">
                <div className="text-2xl font-bold text-[#FF6B35]">{totalLoyaltyPoints}</div>
                <div className="text-xs text-[#333333] opacity-70 mt-1">Loyalty Points</div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters and Content */}
        <section className="py-6 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
          {/* Filter Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-1.5 text-sm rounded-full font-semibold transition-all ${
                  filter === 'all'
                    ? 'bg-[#FF6B35] text-white shadow-md'
                    : 'bg-white text-[#333333] hover:bg-[#FF6B35] hover:text-white'
                }`}
              >
                All ({reservations.length})
              </button>
              <button
                onClick={() => setFilter('confirmed')}
                className={`px-4 py-1.5 text-sm rounded-full font-semibold transition-all ${
                  filter === 'confirmed'
                    ? 'bg-[#FF6B35] text-white shadow-md'
                    : 'bg-white text-[#333333] hover:bg-[#FF6B35] hover:text-white'
                }`}
              >
                Upcoming ({reservations.filter(r => r.status === 'confirmed').length})
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-1.5 text-sm rounded-full font-semibold transition-all ${
                  filter === 'completed'
                    ? 'bg-[#FF6B35] text-white shadow-md'
                    : 'bg-white text-[#333333] hover:bg-[#FF6B35] hover:text-white'
                }`}
              >
                Past ({reservations.filter(r => r.status === 'completed').length})
              </button>
            </div>
          </div>

          {/* Reservations List */}
          {filteredReservations.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-[#F8F4F0] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#333333] mb-2">No Reservations Found</h3>
              <p className="text-sm text-[#333333] opacity-70 mb-4">
                {filter === 'all'
                  ? "You don't have any reservations yet."
                  : `You don't have any ${filter} reservations.`}
              </p>
              <Link
                href="/reservation"
                className="inline-block bg-[#FF6B35] text-white px-6 py-2 text-sm rounded-full font-semibold hover:bg-[#e55a2b] transition-all"
              >
                Make Your First Reservation
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="bg-white rounded-lg shadow-md p-2.5 hover:shadow-xl transition-shadow flex flex-col"
                >
                  {/* Header */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-xs font-bold text-[#333333]">
                        {reservation.id}
                      </h3>
                      <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-0.5 ${getStatusColor(reservation.status)}`}>
                        {getStatusIcon(reservation.status)}
                        <span className="text-xs">{reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}</span>
                      </span>
                    </div>
                    <p className="text-xs text-[#333333] opacity-60">
                      Booked {new Date(reservation.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 mb-2 flex-1">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-[#FF6B35] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs font-semibold text-[#333333]">
                        {new Date(reservation.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-[#FF6B35] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs font-semibold text-[#333333]">{reservation.time}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-[#FF6B35] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-xs font-semibold text-[#333333]">{reservation.guests} guests</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-[#FF6B35] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                      </svg>
                      <span className="text-xs font-semibold text-[#333333] truncate">{reservation.tableName}</span>
                    </div>

                    {reservation.status === 'completed' && (
                      <div className="flex items-center gap-1 text-green-600 pt-1.5 border-t border-gray-200">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                        </svg>
                        <span className="text-xs font-semibold">+{reservation.loyaltyPointsEarned} pts</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => handlePrintTicket(reservation)}
                      className="w-full bg-[#FF6B35] text-white px-3 py-1.5 text-xs rounded-lg font-semibold hover:bg-[#e55a2b] transition-all flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                      Print
                    </button>

                    {reservation.status === 'completed' && (
                      <button
                        onClick={() => handleRebook(reservation)}
                        className="w-full bg-blue-600 text-white px-3 py-1.5 text-xs rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-1.5"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Re-book
                      </button>
                    )}

                    {reservation.status === 'confirmed' && (
                      <>
                        <button className="w-full bg-white text-[#FF6B35] border border-[#FF6B35] px-3 py-1.5 text-xs rounded-lg font-semibold hover:bg-[#FF6B35] hover:text-white transition-all flex items-center justify-center gap-1.5">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Modify
                        </button>
                        <button className="w-full bg-white text-red-600 border border-red-600 px-3 py-1.5 text-xs rounded-lg font-semibold hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-1.5">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

        {/* Quick Info */}
        <section className="py-6 px-4 sm:px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="bg-[#F8F4F0] rounded-lg p-4">
              <h3 className="text-lg font-bold text-[#333333] mb-4 text-center">Reservation Policy</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="w-10 h-10 bg-[#FF6B35] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-semibold text-[#333333] mb-1">Modification</h4>
                  <p className="text-xs text-[#333333] opacity-70">
                    Modify your reservation up to 4 hours before
                  </p>
                </div>
                <div>
                  <div className="w-10 h-10 bg-[#FF6B35] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-semibold text-[#333333] mb-1">Cancellation</h4>
                  <p className="text-xs text-[#333333] opacity-70">
                    Free cancellation up to 2 hours before
                  </p>
                </div>
                <div>
                  <div className="w-10 h-10 bg-[#FF6B35] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-semibold text-[#333333] mb-1">Reminders</h4>
                  <p className="text-xs text-[#333333] opacity-70">
                    Get reminders 24 hours and 2 hours before
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Ticket Modal */}
      {showTicketModal && selectedReservation && (
        <ReservationTicket
          reservation={selectedReservation}
          user={user!}
          onClose={() => {
            setShowTicketModal(false);
            setSelectedReservation(null);
          }}
        />
      )}
    </div>
  );
}
