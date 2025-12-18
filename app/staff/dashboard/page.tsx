'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import StaffSidebar from '@/components/staff/StaffSidebar';
import { staffApi, Reservation, Table } from '@/lib/api';

type DateFilterType = 'today' | 'week' | 'month' | 'custom';

const getDateRange = (filter: DateFilterType, customStart?: string, customEnd?: string): { start: string; end: string } => {
  const today = new Date();
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  switch (filter) {
    case 'today':
      return { start: formatDate(today), end: formatDate(today) };
    case 'week':
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return { start: formatDate(weekStart), end: formatDate(weekEnd) };
    case 'month':
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { start: formatDate(monthStart), end: formatDate(monthEnd) };
    case 'custom':
      return { start: customStart || formatDate(today), end: customEnd || formatDate(today) };
    default:
      return { start: formatDate(today), end: formatDate(today) };
  }
};

export default function StaffDashboard() {
  const { user, isStaff, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Date filter state
  const [dateFilter, setDateFilter] = useState<DateFilterType>('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

  // Global search state
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut for search (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setSearchQuery('');
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!authLoading && !isStaff) router.push('/login');
  }, [authLoading, isStaff, router]);

  const fetchFilteredReservations = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const { start, end } = getDateRange(dateFilter, customStartDate, customEndDate);

      const [reservationsRes, tablesRes] = await Promise.all([
        staffApi.getReservationsByDateRange(start, end),
        staffApi.getAllTables()
      ]);

      if (reservationsRes.success && reservationsRes.data) {
        setReservations(reservationsRes.data);
        setFilteredReservations(reservationsRes.data);
      }
      if (tablesRes.success && tablesRes.data) setTables(tablesRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [dateFilter, customStartDate, customEndDate]);

  useEffect(() => {
    if (isStaff) fetchFilteredReservations();
  }, [isStaff, fetchFilteredReservations]);

  // Filter reservations based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredReservations(reservations);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = reservations.filter(r =>
      r.customerName?.toLowerCase().includes(query) ||
      r.customerEmail?.toLowerCase().includes(query) ||
      r.customerPhone?.toLowerCase().includes(query) ||
      r.tableName?.toLowerCase().includes(query) ||
      r.tableNumber?.toString().includes(query) ||
      r.status?.toLowerCase().includes(query) ||
      r.specialRequests?.toLowerCase().includes(query)
    );
    setFilteredReservations(filtered);
  }, [searchQuery, reservations]);

  const handleDateFilterChange = (filter: DateFilterType) => {
    if (filter === 'custom') {
      setShowCustomDatePicker(true);
      return;
    }
    setDateFilter(filter);
    setShowCustomDatePicker(false);
  };

  const applyCustomDateRange = () => {
    if (customStartDate && customEndDate) {
      setDateFilter('custom');
      setShowCustomDatePicker(false);
    }
  };

  const getDateRangeLabel = () => {
    const { start, end } = getDateRange(dateFilter, customStartDate, customEndDate);
    if (dateFilter === 'today') return 'Today';
    if (dateFilter === 'custom' && customStartDate && customEndDate) {
      return `${new Date(customStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(customEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
    return `${new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  const stats = {
    totalReservations: filteredReservations.length,
    completed: filteredReservations.filter(r => r.status === 'COMPLETED').length,
    confirmed: filteredReservations.filter(r => r.status === 'CONFIRMED').length,
    pending: filteredReservations.filter(r => r.status === 'PENDING').length,
    cancelled: filteredReservations.filter(r => r.status === 'CANCELLED').length,
    noShow: filteredReservations.filter(r => r.status === 'NO_SHOW').length,
    availableTables: tables.filter(t => t.status === 'AVAILABLE').length,
    occupiedTables: tables.filter(t => t.status === 'OCCUPIED').length,
    reservedTables: tables.filter(t => t.status === 'RESERVED').length,
    maintenanceTables: tables.filter(t => t.status === 'MAINTENANCE').length,
    totalTables: tables.length,
    totalGuests: filteredReservations.filter(r => r.status !== 'CANCELLED' && r.status !== 'NO_SHOW').reduce((sum, r) => sum + r.numberOfGuests, 0),
    totalCapacity: tables.reduce((sum, t) => sum + t.capacity, 0),
  };

  const occupancyRate = stats.totalTables > 0
    ? Math.round(((stats.occupiedTables + stats.reservedTables) / stats.totalTables) * 100) : 0;

  const hourlyData = () => {
    const hours: { [key: string]: number } = {};
    for (let i = 6; i <= 23; i++) hours[`${i.toString().padStart(2, '0')}:00`] = 0;
    filteredReservations.forEach(r => {
      if (r.status !== 'CANCELLED') {
        const hour = r.reservationTime.substring(0, 2) + ':00';
        if (hours[hour] !== undefined) hours[hour]++;
      }
    });
    return hours;
  };

  const getPeakHour = () => {
    const data = hourlyData();
    let maxHour = '', maxCount = 0;
    Object.entries(data).forEach(([hour, count]) => {
      if (count > maxCount) { maxCount = count; maxHour = hour; }
    });
    return { hour: maxHour, count: maxCount };
  };

  const getUpcomingReservations = () => {
    const now = currentTime;
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    return filteredReservations.filter(r => {
      if (r.status !== 'CONFIRMED' && r.status !== 'PENDING') return false;
      const [hours, minutes] = r.reservationTime.split(':').map(Number);
      const resTime = new Date();
      resTime.setHours(hours, minutes, 0, 0);
      return resTime >= now && resTime <= twoHoursLater;
    }).sort((a, b) => a.reservationTime.localeCompare(b.reservationTime));
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'COMPLETED': 'bg-green-100 text-green-800', 'CONFIRMED': 'bg-blue-100 text-blue-800',
      'PENDING': 'bg-yellow-100 text-yellow-800', 'CANCELLED': 'bg-red-100 text-red-800',
      'NO_SHOW': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTableStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'AVAILABLE': 'bg-green-500', 'OCCUPIED': 'bg-red-500',
      'RESERVED': 'bg-blue-500', 'MAINTENANCE': 'bg-gray-500'
    };
    return colors[status] || 'bg-gray-300';
  };

  const formatTime = (time: string) => {
    const h = parseInt(time.split(':')[0]);
    return `${h % 12 || 12}${h >= 12 ? 'PM' : 'AM'}`;
  };

  const peak = getPeakHour();
  const upcomingReservations = getUpcomingReservations();
  const hourData = hourlyData();
  const maxHourlyCount = Math.max(...Object.values(hourData), 1);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen bg-[#F8F4F0]">
        <StaffSidebar />
        <main className="flex-1 ml-64 p-4">
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin w-10 h-10 border-4 border-[#FF6B35] border-t-transparent rounded-full"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8F4F0]">
      <StaffSidebar />
      <main className="flex-1 ml-64 p-4">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-[#333333]">
                Staff Dashboard
              </h1>
              <p className="text-xs text-[#333333] opacity-70">
                {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} • {getDateRangeLabel()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-[#FF6B35]">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <button onClick={fetchFilteredReservations} className="p-1.5 hover:bg-gray-200 rounded cursor-pointer">
                <svg className="w-4 h-4 text-[#333333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          {/* Global Search */}
          <div className="relative">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search reservations... (Ctrl+K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="text-xs text-gray-500 mt-1">
                Found {filteredReservations.length} result{filteredReservations.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
              </p>
            )}
          </div>

          {/* Date Filter Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 font-medium">Filter:</span>
            {(['today', 'week', 'month', 'custom'] as DateFilterType[]).map((filter) => (
              <button
                key={filter}
                onClick={() => handleDateFilterChange(filter)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  dateFilter === filter
                    ? 'bg-[#FF6B35] text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {filter === 'today' ? 'Today' : filter === 'week' ? 'This Week' : filter === 'month' ? 'This Month' : 'Custom'}
              </button>
            ))}

            {/* Custom Date Picker */}
            {showCustomDatePicker && (
              <div className="flex items-center gap-2 ml-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                />
                <span className="text-xs text-gray-500">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                />
                <button
                  onClick={applyCustomDateRange}
                  disabled={!customStartDate || !customEndDate}
                  className="px-3 py-1 text-xs bg-[#FF6B35] text-white rounded hover:bg-[#e55a2b] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Apply
                </button>
                <button
                  onClick={() => setShowCustomDatePicker(false)}
                  className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm">
              {error} <button onClick={fetchFilteredReservations} className="underline ml-2 cursor-pointer">Retry</button>
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white rounded-lg shadow p-3 border-l-4 border-[#FF6B35]">
              <p className="text-[10px] text-gray-500 uppercase">Occupancy</p>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-[#333333]">{occupancyRate}%</span>
                <div className="w-12 h-1.5 bg-gray-200 rounded-full">
                  <div className="h-1.5 bg-[#FF6B35] rounded-full" style={{ width: `${occupancyRate}%` }}></div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-3 border-l-4 border-blue-500">
              <p className="text-[10px] text-gray-500 uppercase">Reservations</p>
              <span className="text-2xl font-bold text-[#333333]">{stats.totalReservations}</span>
              <p className="text-[10px] text-gray-500">{stats.confirmed} conf / {stats.pending} pend</p>
            </div>
            <div className="bg-white rounded-lg shadow p-3 border-l-4 border-green-500">
              <p className="text-[10px] text-gray-500 uppercase">Guests</p>
              <span className="text-2xl font-bold text-[#333333]">{stats.totalGuests}</span>
              <p className="text-[10px] text-gray-500">of {stats.totalCapacity} capacity</p>
            </div>
            <div className="bg-white rounded-lg shadow p-3 border-l-4 border-purple-500">
              <p className="text-[10px] text-gray-500 uppercase">Peak</p>
              <span className="text-2xl font-bold text-[#333333]">{peak.hour ? formatTime(peak.hour) : '--'}</span>
              <p className="text-[10px] text-gray-500">{peak.count} reservation{peak.count !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-3 gap-4">
            {/* Hourly Chart */}
            <div className="col-span-2 bg-white rounded-lg shadow p-3">
              <h2 className="text-sm font-bold text-[#333333] mb-2">Hourly Reservations</h2>
              <div className="flex items-end gap-1 h-28">
                {Object.entries(hourData).map(([hour, count]) => (
                  <div key={hour} className="flex-1 flex flex-col items-center group min-w-0">
                    <div
                      className="w-full rounded-t transition-all relative cursor-pointer"
                      style={{
                        height: `${(count / maxHourlyCount) * 100}%`,
                        minHeight: count > 0 ? '6px' : '2px',
                        backgroundColor: count > 0 ? '#FF6B35' : '#e5e7eb'
                      }}
                    >
                      {count > 0 && (
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#333] text-white text-[10px] px-1 rounded opacity-0 group-hover:opacity-100 z-10">
                          {count}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-gray-500 mt-1 font-medium">{hour.substring(0, 2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[8px] text-gray-400 mt-1 px-1">
                <span>6AM</span>
                <span>12PM</span>
                <span>6PM</span>
                <span>11PM</span>
              </div>
            </div>

            {/* Table Status */}
            <div className="bg-white rounded-lg shadow p-3">
              <h2 className="text-sm font-bold text-[#333333] mb-2">Tables</h2>
              <div className="flex items-center gap-3">
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 -rotate-90">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                    <circle cx="40" cy="40" r="32" fill="none" stroke="#22c55e" strokeWidth="8"
                      strokeDasharray={`${(stats.availableTables / (stats.totalTables || 1)) * 201} 201`} />
                    <circle cx="40" cy="40" r="32" fill="none" stroke="#ef4444" strokeWidth="8"
                      strokeDasharray={`${(stats.occupiedTables / (stats.totalTables || 1)) * 201} 201`}
                      strokeDashoffset={`-${(stats.availableTables / (stats.totalTables || 1)) * 201}`} />
                    <circle cx="40" cy="40" r="32" fill="none" stroke="#3b82f6" strokeWidth="8"
                      strokeDasharray={`${(stats.reservedTables / (stats.totalTables || 1)) * 201} 201`}
                      strokeDashoffset={`-${((stats.availableTables + stats.occupiedTables) / (stats.totalTables || 1)) * 201}`} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold">{stats.totalTables}</span>
                  </div>
                </div>
                <div className="flex-1 space-y-1 text-xs">
                  <div className="flex justify-between"><span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span>Available</span><b className="text-green-600">{stats.availableTables}</b></div>
                  <div className="flex justify-between"><span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full"></span>Occupied</span><b className="text-red-600">{stats.occupiedTables}</b></div>
                  <div className="flex justify-between"><span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500 rounded-full"></span>Reserved</span><b className="text-blue-600">{stats.reservedTables}</b></div>
                  <div className="flex justify-between"><span className="flex items-center gap-1"><span className="w-2 h-2 bg-gray-400 rounded-full"></span>Maint.</span><b className="text-gray-600">{stats.maintenanceTables}</b></div>
                </div>
              </div>
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Upcoming */}
            <div className="bg-white rounded-lg shadow p-3">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-bold text-[#333333]">Arriving Soon</h2>
                <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded">2h</span>
              </div>
              {upcomingReservations.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No upcoming arrivals</p>
              ) : (
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {upcomingReservations.slice(0, 4).map((r) => (
                    <div key={r.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-xs">
                      <span className="w-10 h-8 bg-[#FF6B35] rounded flex items-center justify-center text-white font-bold text-[10px]">
                        {formatTime(r.reservationTime)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{r.customerName}</p>
                        <p className="text-[10px] text-gray-500">{r.numberOfGuests}p • {r.tableName || `T${r.tableNumber}`}</p>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getStatusColor(r.status)}`}>
                        {r.status.slice(0, 4)}
                      </span>
                    </div>
                  ))}
                  {upcomingReservations.length > 4 && (
                    <p className="text-[10px] text-center text-[#FF6B35]">+{upcomingReservations.length - 4} more</p>
                  )}
                </div>
              )}
            </div>

            {/* Status Breakdown */}
            <div className="bg-white rounded-lg shadow p-3">
              <h2 className="text-sm font-bold text-[#333333] mb-2">Status Overview</h2>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 bg-blue-50 rounded">
                  <p className="text-xl font-bold text-blue-600">{stats.confirmed}</p>
                  <p className="text-[10px] text-blue-700">Conf</p>
                </div>
                <div className="p-2 bg-yellow-50 rounded">
                  <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
                  <p className="text-[10px] text-yellow-700">Pend</p>
                </div>
                <div className="p-2 bg-green-50 rounded">
                  <p className="text-xl font-bold text-green-600">{stats.completed}</p>
                  <p className="text-[10px] text-green-700">Done</p>
                </div>
                <div className="p-2 bg-red-50 rounded">
                  <p className="text-xl font-bold text-red-600">{stats.cancelled + stats.noShow}</p>
                  <p className="text-[10px] text-red-700">Canc</p>
                </div>
              </div>
              <div className="flex justify-between text-xs mt-2 pt-2 border-t">
                <span className="text-gray-500">Completion</span>
                <b>{stats.totalReservations > 0 ? Math.round((stats.completed / stats.totalReservations) * 100) : 0}%</b>
              </div>
            </div>
          </div>

          {/* Floor Grid */}
          <div className="bg-white rounded-lg shadow p-3">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm font-bold text-[#333333]">Floor Status</h2>
              <div className="flex gap-3 text-[10px]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded"></span>Avail</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded"></span>Occup</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500 rounded"></span>Resv</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-gray-400 rounded"></span>Maint</span>
              </div>
            </div>
            <div className="grid grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
              {tables.map((table) => (
                <div
                  key={table.id}
                  className={`relative p-2 rounded text-center text-xs cursor-pointer hover:scale-105 transition-transform ${
                    table.status === 'AVAILABLE' ? 'bg-green-100 border border-green-300' :
                    table.status === 'OCCUPIED' ? 'bg-red-100 border border-red-300' :
                    table.status === 'RESERVED' ? 'bg-blue-100 border border-blue-300' :
                    'bg-gray-100 border border-gray-300'
                  }`}
                >
                  <span className={`absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full ${getTableStatusColor(table.status)}`}></span>
                  <p className="font-bold">#{table.tableNumber}</p>
                  <p className="text-[9px] text-gray-500">{table.capacity}p</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
