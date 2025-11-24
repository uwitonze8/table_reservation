'use client';

import AdminSidebar from '@/components/admin/AdminSidebar';
import Link from 'next/link';

// Mock data
const todayStats = {
  totalReservations: 24,
  confirmedReservations: 18,
  pendingReservations: 4,
  cancelledReservations: 2,
  totalGuests: 68,
  occupancyRate: 75,
};

const upcomingReservations = [
  { id: 'RES-101', name: 'John Smith', time: '12:00 PM', guests: 4, table: 5, status: 'confirmed' },
  { id: 'RES-102', name: 'Sarah Johnson', time: '1:30 PM', guests: 2, table: 12, status: 'confirmed' },
  { id: 'RES-103', name: 'Michael Brown', time: '2:00 PM', guests: 6, table: 10, status: 'pending' },
  { id: 'RES-104', name: 'Emily Davis', time: '6:00 PM', guests: 2, table: 1, status: 'confirmed' },
  { id: 'RES-105', name: 'David Wilson', time: '7:30 PM', guests: 4, table: 8, status: 'confirmed' },
];

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-[#F8F4F0]">
      <AdminSidebar />

      <main className="flex-1 ml-64 py-8 px-4 sm:px-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#333333] mb-1">Dashboard</h1>
          <p className="text-sm text-[#333333] opacity-70">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div className="bg-white rounded-lg shadow-md p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-[#FF6B35] bg-opacity-10 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-green-600 text-xs font-semibold">+12%</span>
            </div>
            <p className="text-2xl font-bold text-[#333333] mb-0.5">{todayStats.totalReservations}</p>
            <p className="text-xs text-[#333333] opacity-70">Total Reservations Today</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-[#333333] mb-0.5">{todayStats.confirmedReservations}</p>
            <p className="text-xs text-[#333333] opacity-70">Confirmed</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-[#333333] mb-0.5">{todayStats.totalGuests}</p>
            <p className="text-xs text-[#333333] opacity-70">Total Guests Expected</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-[#333333] mb-0.5">{todayStats.occupancyRate}%</p>
            <p className="text-xs text-[#333333] opacity-70">Table Occupancy Rate</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="text-xl font-bold text-[#333333] mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link
              href="/admin/reservations"
              className="flex flex-col items-center justify-center p-4 bg-[#F8F4F0] rounded-lg hover:bg-[#FF6B35] hover:text-white transition-all group"
            >
              <svg className="w-6 h-6 text-[#FF6B35] group-hover:text-white mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-semibold text-xs">New Reservation</span>
            </Link>

            <Link
              href="/admin/tables"
              className="flex flex-col items-center justify-center p-4 bg-[#F8F4F0] rounded-lg hover:bg-[#FF6B35] hover:text-white transition-all group"
            >
              <svg className="w-6 h-6 text-[#FF6B35] group-hover:text-white mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span className="font-semibold text-xs">View Tables</span>
            </Link>

            <Link
              href="/admin/customers"
              className="flex flex-col items-center justify-center p-4 bg-[#F8F4F0] rounded-lg hover:bg-[#FF6B35] hover:text-white transition-all group"
            >
              <svg className="w-6 h-6 text-[#FF6B35] group-hover:text-white mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="font-semibold text-xs">Customers</span>
            </Link>

            <Link
              href="/admin/reports"
              className="flex flex-col items-center justify-center p-4 bg-[#F8F4F0] rounded-lg hover:bg-[#FF6B35] hover:text-white transition-all group"
            >
              <svg className="w-6 h-6 text-[#FF6B35] group-hover:text-white mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-semibold text-xs">Reports</span>
            </Link>
          </div>
        </div>

        {/* Upcoming Reservations */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#333333]">Today's Reservations</h2>
            <Link href="/admin/reservations" className="text-[#FF6B35] hover:text-[#e55a2b] font-semibold text-xs">
              View All →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">ID</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Customer</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Time</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Guests</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Table</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Status</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {upcomingReservations.map((reservation) => (
                  <tr key={reservation.id} className="border-b border-gray-100 hover:bg-[#F8F4F0] transition-colors">
                    <td className="py-3 px-3 text-xs text-[#333333]">{reservation.id}</td>
                    <td className="py-3 px-3 text-xs font-medium text-[#333333]">{reservation.name}</td>
                    <td className="py-3 px-3 text-xs text-[#333333]">{reservation.time}</td>
                    <td className="py-3 px-3 text-xs text-[#333333]">{reservation.guests}</td>
                    <td className="py-3 px-3 text-xs text-[#333333]">Table {reservation.table}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        reservation.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <button className="text-[#FF6B35] hover:text-[#e55a2b] font-semibold text-xs">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
