'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import CustomerSidebar from '@/components/customer/CustomerSidebar';

export default function BookingHistoryPage() {
  const { user } = useAuth();
  const [filterYear, setFilterYear] = useState('2025');

  // Mock data
  const bookingHistory = {
    totalBookings: 24,
    completedBookings: 21,
    cancelledBookings: 3,
    totalSpent: 1840,
    favoriteTable: 'Table 12',
    bookings: [
      { id: 'RES-245', date: '2025-11-20', time: '7:00 PM', guests: 2, table: 12, status: 'completed', amount: 85 },
      { id: 'RES-238', date: '2025-11-15', time: '8:00 PM', guests: 4, table: 5, status: 'completed', amount: 145 },
      { id: 'RES-230', date: '2025-11-10', time: '6:30 PM', guests: 2, table: 8, status: 'completed', amount: 72 },
      { id: 'RES-221', date: '2025-11-05', time: '7:30 PM', guests: 3, table: 10, status: 'cancelled', amount: 0 },
      { id: 'RES-210', date: '2025-10-28', time: '8:00 PM', guests: 2, table: 12, status: 'completed', amount: 95 },
      { id: 'RES-198', date: '2025-10-20', time: '7:00 PM', guests: 4, table: 15, status: 'completed', amount: 180 },
      { id: 'RES-185', date: '2025-10-12', time: '6:00 PM', guests: 2, table: 3, status: 'completed', amount: 68 },
      { id: 'RES-172', date: '2025-09-30', time: '7:30 PM', guests: 5, table: 18, status: 'completed', amount: 225 },
    ],
    monthlyStats: [
      { month: 'January', bookings: 2, spent: 140 },
      { month: 'February', bookings: 3, spent: 215 },
      { month: 'March', bookings: 2, spent: 160 },
      { month: 'April', bookings: 1, spent: 75 },
      { month: 'May', bookings: 3, spent: 245 },
      { month: 'June', bookings: 2, spent: 180 },
      { month: 'July', bookings: 1, spent: 90 },
      { month: 'August', bookings: 2, spent: 155 },
      { month: 'September', bookings: 2, spent: 200 },
      { month: 'October', bookings: 3, spent: 343 },
      { month: 'November', bookings: 3, spent: 302 },
      { month: 'December', bookings: 0, spent: 0 },
    ],
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const csvData = `
Booking History Report
Customer Name,${user?.name}
Customer Email,${user?.email}
Year,${filterYear}
Total Bookings,${bookingHistory.totalBookings}
Completed Bookings,${bookingHistory.completedBookings}
Cancelled Bookings,${bookingHistory.cancelledBookings}
Total Spent,$${bookingHistory.totalSpent}
Favorite Table,${bookingHistory.favoriteTable}

Booking Details
ID,Date,Time,Guests,Table,Status,Amount
${bookingHistory.bookings.map(b => `${b.id},${b.date},${b.time},${b.guests},${b.table},${b.status},$${b.amount}`).join('\n')}

Monthly Summary
Month,Bookings,Amount Spent
${bookingHistory.monthlyStats.map(m => `${m.month},${m.bookings},$${m.spent}`).join('\n')}
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

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-3 text-white">
              <p className="text-white opacity-90 mb-1 text-xs">Total Bookings</p>
              <p className="text-2xl font-bold">{bookingHistory.totalBookings}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-3 text-white">
              <p className="text-white opacity-90 mb-1 text-xs">Completed</p>
              <p className="text-2xl font-bold">{bookingHistory.completedBookings}</p>
            </div>
            <div className="bg-gradient-to-br from-[#FF6B35] to-[#e55a2b] rounded-lg shadow-md p-3 text-white">
              <p className="text-white opacity-90 mb-1 text-xs">Total Spent</p>
              <p className="text-2xl font-bold">${bookingHistory.totalSpent}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-3 text-white">
              <p className="text-white opacity-90 mb-1 text-xs">Favorite Table</p>
              <p className="text-xl font-bold">{bookingHistory.favoriteTable}</p>
            </div>
          </div>

          {/* Monthly Chart */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h2 className="text-xl font-bold text-[#333333] mb-4">Monthly Activity</h2>
            <div className="space-y-2.5">
              {bookingHistory.monthlyStats.filter(m => m.bookings > 0).map((month, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm font-semibold text-[#333333]">{month.month}</span>
                    <span className="text-xs text-[#FF6B35] font-bold">{month.bookings} bookings - ${month.spent}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-[#FF6B35] h-1.5 rounded-full"
                      style={{ width: `${(month.bookings / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Booking History Table */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-bold text-[#333333] mb-4">All Bookings</h2>
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
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingHistory.bookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-gray-100 hover:bg-[#F8F4F0] transition-colors">
                      <td className="py-3 px-3 text-xs text-[#333333] font-medium">{booking.id}</td>
                      <td className="py-3 px-3 text-xs text-[#333333]">
                        {new Date(booking.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 text-xs text-[#333333]">{booking.time}</td>
                      <td className="py-3 px-3 text-xs text-[#333333]">{booking.guests}</td>
                      <td className="py-3 px-3 text-xs text-[#333333]">Table {booking.table}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          booking.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs font-bold text-[#333333]">
                        {booking.amount > 0 ? `$${booking.amount}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
