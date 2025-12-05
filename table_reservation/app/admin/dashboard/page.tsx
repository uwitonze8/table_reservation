'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import Link from 'next/link';
import { adminApi, Reservation, DashboardStats } from '@/lib/api';

// Helper to format time
const formatTime = (time24: string): string => {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todayReservations, setTodayReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch dashboard stats and today's reservations in parallel
        const [statsResponse, reservationsResponse] = await Promise.all([
          adminApi.getDashboardStats(),
          adminApi.getTodayReservations(),
        ]);

        if (statsResponse.success && statsResponse.data) {
          setStats(statsResponse.data);
        } else {
          setError(statsResponse.message || 'Failed to load dashboard stats');
        }

        if (reservationsResponse.success && reservationsResponse.data) {
          setTodayReservations(reservationsResponse.data);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F8F4F0]">
        <AdminSidebar />
        <main className="flex-1 ml-64 py-8 px-4 sm:px-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin w-12 h-12 border-4 border-[#FF6B35] border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-sm text-[#333333] opacity-70">Loading dashboard...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-[#F8F4F0]">
        <AdminSidebar />
        <main className="flex-1 ml-64 py-8 px-4 sm:px-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        </main>
      </div>
    );
  }

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
              {stats?.reservationTrend !== undefined && stats.reservationTrend !== 0 && (
                <span className={`text-xs font-semibold ${stats.reservationTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.reservationTrend > 0 ? '+' : ''}{stats.reservationTrend}%
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-[#333333] mb-0.5">{stats?.totalReservations || 0}</p>
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
            <p className="text-2xl font-bold text-[#333333] mb-0.5">{stats?.confirmedReservations || 0}</p>
            <p className="text-xs text-[#333333] opacity-70">Confirmed</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              {stats?.guestTrend !== undefined && stats.guestTrend !== 0 && (
                <span className={`text-xs font-semibold ${stats.guestTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.guestTrend > 0 ? '+' : ''}{stats.guestTrend}%
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-[#333333] mb-0.5">{stats?.totalGuestsExpected || 0}</p>
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
            <p className="text-2xl font-bold text-[#333333] mb-0.5">{stats?.occupancyRate || 0}%</p>
            <p className="text-xs text-[#333333] opacity-70">Table Occupancy Rate</p>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-lg shadow-md p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-[#333333] mb-0.5">{stats?.pendingReservations || 0}</p>
            <p className="text-xs text-[#333333] opacity-70">Pending Reservations</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-[#333333] mb-0.5">{stats?.totalCustomers || 0}</p>
            <p className="text-xs text-[#333333] opacity-70">Total Customers</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-[#333333] mb-0.5">{stats?.newCustomersToday || 0}</p>
            <p className="text-xs text-[#333333] opacity-70">New Customers Today</p>
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

        {/* Today's Reservations */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#333333]">Today's Reservations</h2>
            <Link href="/admin/reservations" className="text-[#FF6B35] hover:text-[#e55a2b] font-semibold text-xs">
              View All →
            </Link>
          </div>

          {todayReservations.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-[#F8F4F0] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#333333] mb-2">No Reservations Today</h3>
              <p className="text-sm text-[#333333] opacity-70">There are no reservations scheduled for today.</p>
            </div>
          ) : (
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
                  {todayReservations.slice(0, 5).map((reservation) => (
                    <tr key={reservation.id} className="border-b border-gray-100 hover:bg-[#F8F4F0] transition-colors">
                      <td className="py-3 px-3 text-xs text-[#333333]">{reservation.reservationCode}</td>
                      <td className="py-3 px-3 text-xs font-medium text-[#333333]">{reservation.customerName}</td>
                      <td className="py-3 px-3 text-xs text-[#333333]">{formatTime(reservation.reservationTime)}</td>
                      <td className="py-3 px-3 text-xs text-[#333333]">{reservation.numberOfGuests}</td>
                      <td className="py-3 px-3 text-xs text-[#333333]">Table {reservation.tableNumber}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          reservation.status === 'CONFIRMED'
                            ? 'bg-green-100 text-green-800'
                            : reservation.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : reservation.status === 'COMPLETED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {reservation.status.charAt(0) + reservation.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <Link
                          href="/admin/reservations"
                          className="text-[#FF6B35] hover:text-[#e55a2b] font-semibold text-xs"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
