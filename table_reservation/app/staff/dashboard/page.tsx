'use client';

import { useAuth } from '@/contexts/AuthContext';
import StaffSidebar from '@/components/staff/StaffSidebar';

// Mock data
const todayReservations = [
  { id: 'RES-101', name: 'John Smith', time: '12:00 PM', guests: 4, table: 5, status: 'seated' },
  { id: 'RES-102', name: 'Sarah Johnson', time: '1:30 PM', guests: 2, table: 12, status: 'confirmed' },
  { id: 'RES-103', name: 'Michael Brown', time: '2:00 PM', guests: 6, table: 10, status: 'arriving' },
  { id: 'RES-104', name: 'Emily Davis', time: '6:00 PM', guests: 2, table: 1, status: 'confirmed' },
];

export default function StaffDashboard() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-[#F8F4F0]">
      <StaffSidebar />

      <main className="flex-1 ml-64 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#333333]">Staff Dashboard</h1>
            <p className="text-sm text-[#333333] opacity-70 mt-1">
              Welcome back, {user?.name} ({user?.staffId})
            </p>
          </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-white rounded-lg shadow-md p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[#333333] opacity-70">Reservations Today</p>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-[#333333]">24</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[#333333] opacity-70">Currently Seated</p>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-[#333333]">8</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[#333333] opacity-70">Upcoming</p>
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-[#333333]">16</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[#333333] opacity-70">Available Tables</p>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-[#333333]">12</p>
          </div>
        </div>

        {/* Today's Reservations */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-bold text-[#333333] mb-4">Today's Reservations</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">ID</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Guest</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Time</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Party Size</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Table</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Status</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {todayReservations.map((reservation) => (
                  <tr key={reservation.id} className="border-b border-gray-100 hover:bg-[#F8F4F0] transition-colors">
                    <td className="py-3 px-3 text-xs text-[#333333]">{reservation.id}</td>
                    <td className="py-3 px-3 text-xs font-medium text-[#333333]">{reservation.name}</td>
                    <td className="py-3 px-3 text-xs text-[#333333]">{reservation.time}</td>
                    <td className="py-3 px-3 text-xs text-[#333333]">{reservation.guests}</td>
                    <td className="py-3 px-3 text-xs text-[#333333]">Table {reservation.table}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        reservation.status === 'seated'
                          ? 'bg-green-100 text-green-800'
                          : reservation.status === 'arriving'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <button className="text-[#FF6B35] hover:text-[#e55a2b] font-semibold text-xs">
                        Update
                      </button>
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
