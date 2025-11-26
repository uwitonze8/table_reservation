'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import StaffSidebar from '@/components/staff/StaffSidebar';
import { staffApi, Reservation, Table } from '@/lib/api';

export default function StaffDashboard() {
  const { user, isStaff, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect if not staff
  useEffect(() => {
    if (!authLoading && !isStaff) {
      router.push('/login');
    }
  }, [authLoading, isStaff, router]);

  useEffect(() => {
    if (isStaff) {
      fetchDashboardData();
    }
  }, [isStaff]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [reservationsRes, tablesRes] = await Promise.all([
        staffApi.getTodayReservations(),
        staffApi.getAllTables()
      ]);

      if (reservationsRes.success && reservationsRes.data) {
        setReservations(reservationsRes.data);
      }
      if (tablesRes.success && tablesRes.data) {
        setTables(tablesRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const stats = {
    totalReservations: reservations.length,
    completed: reservations.filter(r => r.status === 'COMPLETED').length,
    confirmed: reservations.filter(r => r.status === 'CONFIRMED').length,
    pending: reservations.filter(r => r.status === 'PENDING').length,
    upcoming: reservations.filter(r => r.status === 'CONFIRMED' || r.status === 'PENDING').length,
    availableTables: tables.filter(t => t.status === 'AVAILABLE').length,
    occupiedTables: tables.filter(t => t.status === 'OCCUPIED').length,
    totalTables: tables.length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-500';
      case 'OCCUPIED': return 'bg-red-500';
      case 'RESERVED': return 'bg-blue-500';
      case 'MAINTENANCE': return 'bg-gray-500';
      default: return 'bg-gray-300';
    }
  };

  const formatStatus = (status: string) => status.charAt(0) + status.slice(1).toLowerCase();

  const getRoleTitle = () => {
    switch (user?.role) {
      case 'manager': return 'Manager Dashboard';
      case 'host': return 'Host Dashboard';
      case 'waiter': return 'Waiter Dashboard';
      default: return 'Staff Dashboard';
    }
  };

  const getRoleDescription = () => {
    switch (user?.role) {
      case 'manager': return 'Overview of restaurant operations';
      case 'host': return 'Manage guest arrivals and reservations';
      case 'waiter': return 'View your assigned tables';
      default: return 'Welcome to the staff portal';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen bg-[#F8F4F0]">
        <StaffSidebar />
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

  // MANAGER DASHBOARD - Full overview
  if (user?.role === 'manager') {
    return (
      <div className="flex min-h-screen bg-[#F8F4F0]">
        <StaffSidebar />
        <main className="flex-1 ml-64 py-8 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#333333]">{getRoleTitle()}</h1>
              <p className="text-sm text-[#333333] opacity-70 mt-1">
                Welcome back, {user?.name}. {getRoleDescription()}
              </p>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
                <button onClick={fetchDashboardData} className="ml-4 underline hover:no-underline">Retry</button>
              </div>
            )}

            {/* Manager Stats - Full Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-xs text-[#333333] opacity-70 mb-1">Today's Reservations</p>
                <p className="text-3xl font-bold text-[#333333]">{stats.totalReservations}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-xs text-[#333333] opacity-70 mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-xs text-[#333333] opacity-70 mb-1">Upcoming</p>
                <p className="text-3xl font-bold text-blue-600">{stats.upcoming}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-xs text-[#333333] opacity-70 mb-1">Available Tables</p>
                <p className="text-3xl font-bold text-purple-600">{stats.availableTables}/{stats.totalTables}</p>
              </div>
            </div>

            {/* Today's Reservations Table */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-[#333333]">Today's Reservations</h2>
                <button onClick={fetchDashboardData} className="text-sm text-[#FF6B35] hover:text-[#e55a2b] font-semibold">
                  Refresh
                </button>
              </div>
              {reservations.length === 0 ? (
                <p className="text-center py-8 text-sm text-[#333333] opacity-70">No reservations for today</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Code</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Guest</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Time</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Party</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Table</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservations.map((r) => (
                        <tr key={r.id} className="border-b border-gray-100 hover:bg-[#F8F4F0]">
                          <td className="py-3 px-3 text-xs font-medium text-[#333333]">{r.reservationCode}</td>
                          <td className="py-3 px-3 text-xs text-[#333333]">{r.customerName}</td>
                          <td className="py-3 px-3 text-xs text-[#333333]">{r.reservationTime}</td>
                          <td className="py-3 px-3 text-xs text-[#333333]">{r.numberOfGuests}</td>
                          <td className="py-3 px-3 text-xs text-[#333333]">{r.tableName || `Table ${r.tableNumber}`}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(r.status)}`}>
                              {formatStatus(r.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Table Status Grid */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-bold text-[#333333] mb-4">Table Status Overview</h2>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                {tables.map((table) => (
                  <div key={table.id} className="text-center">
                    <div className={`w-12 h-12 mx-auto rounded-lg flex items-center justify-center text-white font-bold ${getTableStatusColor(table.status)}`}>
                      {table.tableNumber}
                    </div>
                    <p className="text-xs text-[#333333] mt-1">{table.capacity} seats</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-4 text-xs">
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded"></span> Available</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded"></span> Occupied</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded"></span> Reserved</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-500 rounded"></span> Maintenance</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // HOST DASHBOARD - Focus on arrivals and check-ins
  if (user?.role === 'host') {
    const upcomingReservations = reservations.filter(r => r.status === 'CONFIRMED' || r.status === 'PENDING');

    return (
      <div className="flex min-h-screen bg-[#F8F4F0]">
        <StaffSidebar />
        <main className="flex-1 ml-64 py-8 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#333333]">{getRoleTitle()}</h1>
              <p className="text-sm text-[#333333] opacity-70 mt-1">
                Welcome back, {user?.name}. {getRoleDescription()}
              </p>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
                <button onClick={fetchDashboardData} className="ml-4 underline hover:no-underline">Retry</button>
              </div>
            )}

            {/* Host Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-xs text-[#333333] opacity-70 mb-1">Expected Arrivals</p>
                <p className="text-3xl font-bold text-blue-600">{stats.confirmed}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-xs text-[#333333] opacity-70 mb-1">Pending Confirmation</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-xs text-[#333333] opacity-70 mb-1">Checked In</p>
                <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-xs text-[#333333] opacity-70 mb-1">Available Tables</p>
                <p className="text-3xl font-bold text-purple-600">{stats.availableTables}</p>
              </div>
            </div>

            {/* Upcoming Arrivals - Priority View */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-[#333333]">Upcoming Arrivals</h2>
                <button onClick={fetchDashboardData} className="text-sm text-[#FF6B35] hover:text-[#e55a2b] font-semibold">
                  Refresh
                </button>
              </div>
              {upcomingReservations.length === 0 ? (
                <p className="text-center py-8 text-sm text-[#333333] opacity-70">No upcoming arrivals</p>
              ) : (
                <div className="space-y-3">
                  {upcomingReservations.map((r) => (
                    <div key={r.id} className="flex items-center justify-between p-4 bg-[#F8F4F0] rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-lg font-bold text-[#FF6B35]">{r.reservationTime}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-[#333333]">{r.customerName}</p>
                          <p className="text-sm text-[#333333] opacity-70">{r.numberOfGuests} guests • {r.tableName || `Table ${r.tableNumber}`}</p>
                          <p className="text-xs text-[#333333] opacity-50">{r.customerPhone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(r.status)}`}>
                          {formatStatus(r.status)}
                        </span>
                        <span className="text-xs text-[#333333] opacity-50">{r.reservationCode}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Table View */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-bold text-[#333333] mb-4">Available Tables</h2>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {tables.filter(t => t.status === 'AVAILABLE').map((table) => (
                  <div key={table.id} className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                    <p className="font-bold text-green-700">Table {table.tableNumber}</p>
                    <p className="text-xs text-green-600">{table.capacity} seats</p>
                    <p className="text-xs text-green-500 capitalize">{table.location.toLowerCase()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // WAITER DASHBOARD - Focus on tables
  return (
    <div className="flex min-h-screen bg-[#F8F4F0]">
      <StaffSidebar />
      <main className="flex-1 ml-64 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#333333]">{getRoleTitle()}</h1>
            <p className="text-sm text-[#333333] opacity-70 mt-1">
              Welcome back, {user?.name}. {getRoleDescription()}
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
              <button onClick={fetchDashboardData} className="ml-4 underline hover:no-underline">Retry</button>
            </div>
          )}

          {/* Waiter Stats - Table focused */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-xs text-[#333333] opacity-70 mb-1">Total Tables</p>
              <p className="text-3xl font-bold text-[#333333]">{stats.totalTables}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-xs text-[#333333] opacity-70 mb-1">Occupied</p>
              <p className="text-3xl font-bold text-red-600">{stats.occupiedTables}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-xs text-[#333333] opacity-70 mb-1">Available</p>
              <p className="text-3xl font-bold text-green-600">{stats.availableTables}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-xs text-[#333333] opacity-70 mb-1">Today's Guests</p>
              <p className="text-3xl font-bold text-purple-600">{reservations.reduce((sum, r) => sum + r.numberOfGuests, 0)}</p>
            </div>
          </div>

          {/* Table Status Grid - Main View for Waiter */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[#333333]">Table Status</h2>
              <button onClick={fetchDashboardData} className="text-sm text-[#FF6B35] hover:text-[#e55a2b] font-semibold">
                Refresh
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {tables.map((table) => (
                <div key={table.id} className={`p-4 rounded-lg border-2 ${
                  table.status === 'AVAILABLE' ? 'bg-green-50 border-green-300' :
                  table.status === 'OCCUPIED' ? 'bg-red-50 border-red-300' :
                  table.status === 'RESERVED' ? 'bg-blue-50 border-blue-300' :
                  'bg-gray-50 border-gray-300'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-[#333333]">Table {table.tableNumber}</p>
                    <span className={`w-3 h-3 rounded-full ${getTableStatusColor(table.status)}`}></span>
                  </div>
                  <p className="text-sm text-[#333333] opacity-70">{table.capacity} seats</p>
                  <p className="text-xs text-[#333333] opacity-50 capitalize">{table.location.toLowerCase()}</p>
                  <p className="text-xs font-medium mt-2 capitalize">{table.status.toLowerCase()}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-4 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded"></span> Available</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded"></span> Occupied</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded"></span> Reserved</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-500 rounded"></span> Maintenance</span>
            </div>
          </div>

          {/* Occupied Tables with Reservations */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-bold text-[#333333] mb-4">Active Tables</h2>
            {reservations.filter(r => r.status === 'COMPLETED' || r.status === 'CONFIRMED').length === 0 ? (
              <p className="text-center py-8 text-sm text-[#333333] opacity-70">No active tables</p>
            ) : (
              <div className="space-y-2">
                {reservations.filter(r => r.status === 'COMPLETED' || r.status === 'CONFIRMED').map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-3 bg-[#F8F4F0] rounded-lg">
                    <div>
                      <p className="font-semibold text-[#333333]">{r.tableName || `Table ${r.tableNumber}`}</p>
                      <p className="text-sm text-[#333333] opacity-70">{r.customerName} • {r.numberOfGuests} guests</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(r.status)}`}>
                      {formatStatus(r.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
