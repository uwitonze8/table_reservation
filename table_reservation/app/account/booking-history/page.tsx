'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import CustomerSidebar from '@/components/customer/CustomerSidebar';
import { reservationApi, Reservation } from '@/lib/api';

interface BookingStats {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  favoriteTable: string;
}

interface MonthlyStats {
  month: string;
  bookings: number;
}

// Convert 24h time to 12h format
const formatTime = (time24: string): string => {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

export default function BookingHistoryPage() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const [filterYear, setFilterYear] = useState('2025');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  // Fetch reservations from API
  useEffect(() => {
    const fetchReservations = async () => {
      if (!isLoggedIn) return;

      try {
        setLoading(true);
        const response = await reservationApi.getMyReservations();
        if (response.success && response.data) {
          setReservations(response.data);
        } else {
          setError(response.message || 'Failed to load booking history');
        }
      } catch (err) {
        setError('Failed to load booking history. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return null;
  }

  // Filter reservations by year
  const filteredReservations = filterYear === 'all'
    ? reservations
    : reservations.filter(r => r.reservationDate.startsWith(filterYear));

  // Calculate stats from real data
  const bookingStats: BookingStats = {
    totalBookings: filteredReservations.length,
    completedBookings: filteredReservations.filter(r => r.status === 'COMPLETED').length,
    cancelledBookings: filteredReservations.filter(r => r.status === 'CANCELLED').length,
    favoriteTable: filteredReservations.length > 0
      ? `Table ${filteredReservations[0].tableNumber}`
      : 'N/A',
  };

  // Calculate monthly stats
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];

  const monthlyStats: MonthlyStats[] = monthNames.map((month, index) => {
    const monthReservations = filteredReservations.filter(r => {
      const date = new Date(r.reservationDate);
      return date.getMonth() === index;
    });
    return {
      month,
      bookings: monthReservations.length,
    };
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const csvData = `
Booking History Report
Customer Name,${user?.name}
Customer Email,${user?.email}
Year,${filterYear}
Total Bookings,${bookingStats.totalBookings}
Completed Bookings,${bookingStats.completedBookings}
Cancelled Bookings,${bookingStats.cancelledBookings}
Favorite Table,${bookingStats.favoriteTable}

Booking Details
ID,Date,Time,Guests,Table,Status,Points Earned
${filteredReservations.map(b => `${b.reservationCode},${b.reservationDate},${formatTime(b.reservationTime)},${b.numberOfGuests},${b.tableNumber},${b.status},${b.loyaltyPointsEarned}`).join('\n')}

Monthly Summary
Month,Bookings
${monthlyStats.filter(m => m.bookings > 0).map(m => `${m.month},${m.bookings}`).join('\n')}
    `.trim();

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking-history-${filterYear}.csv`;
    a.click();
  };

  return (
    <div className="flex min-h-screen bg-[#F8F4F0]">
      {/* Sidebar */}
      <CustomerSidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-[#333333]">Booking History</h1>
                <p className="text-sm text-[#333333] opacity-70 mt-1">
                  View and export your complete reservation history
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print
                </button>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="bg-white rounded-lg shadow-md p-3 mb-4">
            <label className="block text-xs font-semibold text-[#333333] mb-2">Filter by Year</label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
            >
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-[#FF6B35] border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-sm text-[#333333] opacity-70">Loading your booking history...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#333333] mb-2">Error Loading History</h3>
              <p className="text-sm text-[#333333] opacity-70 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="inline-block bg-[#FF6B35] text-white px-6 py-2 text-sm rounded-full font-semibold hover:bg-[#e55a2b] transition-all"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-3 text-white">
                  <p className="text-white opacity-90 mb-1 text-xs">Total Bookings</p>
                  <p className="text-2xl font-bold">{bookingStats.totalBookings}</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-3 text-white">
                  <p className="text-white opacity-90 mb-1 text-xs">Completed</p>
                  <p className="text-2xl font-bold">{bookingStats.completedBookings}</p>
                </div>
                <div className="bg-gradient-to-br from-[#FF6B35] to-[#e55a2b] rounded-lg shadow-md p-3 text-white">
                  <p className="text-white opacity-90 mb-1 text-xs">Points Earned</p>
                  <p className="text-2xl font-bold">{filteredReservations.filter(r => r.status === 'COMPLETED').reduce((sum, r) => sum + r.loyaltyPointsEarned, 0)}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-3 text-white">
                  <p className="text-white opacity-90 mb-1 text-xs">Favorite Table</p>
                  <p className="text-xl font-bold">{bookingStats.favoriteTable}</p>
                </div>
              </div>

              {/* Monthly Chart */}
              {monthlyStats.some(m => m.bookings > 0) && (
                <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                  <h2 className="text-xl font-bold text-[#333333] mb-4">Monthly Activity</h2>
                  <div className="space-y-2.5">
                    {monthlyStats.filter(m => m.bookings > 0).map((month, index) => (
                      <div key={index}>
                        <div className="flex justify-between mb-1.5">
                          <span className="text-sm font-semibold text-[#333333]">{month.month}</span>
                          <span className="text-xs text-[#FF6B35] font-bold">{month.bookings} bookings</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-[#FF6B35] h-1.5 rounded-full"
                            style={{ width: `${Math.min((month.bookings / 5) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Booking History Table */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-xl font-bold text-[#333333] mb-4">All Bookings</h2>
                {filteredReservations.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-[#F8F4F0] rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-[#333333] mb-2">No Bookings Found</h3>
                    <p className="text-sm text-[#333333] opacity-70">You don't have any reservations for this period.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Reservation ID</th>
                          <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Date</th>
                          <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Time</th>
                          <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Guests</th>
                          <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Table</th>
                          <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Status</th>
                          <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredReservations.map((booking) => (
                          <tr key={booking.id} className="border-b border-gray-100 hover:bg-[#F8F4F0] transition-colors">
                            <td className="py-3 px-3 text-xs text-[#333333] font-medium">{booking.reservationCode}</td>
                            <td className="py-3 px-3 text-xs text-[#333333]">
                              {new Date(booking.reservationDate).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-3 text-xs text-[#333333]">{formatTime(booking.reservationTime)}</td>
                            <td className="py-3 px-3 text-xs text-[#333333]">{booking.numberOfGuests}</td>
                            <td className="py-3 px-3 text-xs text-[#333333]">Table {booking.tableNumber}</td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                booking.status === 'COMPLETED'
                                  ? 'bg-green-100 text-green-800'
                                  : booking.status === 'CONFIRMED'
                                  ? 'bg-blue-100 text-blue-800'
                                  : booking.status === 'CANCELLED'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-xs font-bold text-[#333333]">
                              {booking.status === 'COMPLETED' ? `+${booking.loyaltyPointsEarned}` : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
