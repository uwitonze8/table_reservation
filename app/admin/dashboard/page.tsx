'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { adminApi, Reservation, DashboardStats, Table, Staff, ContactMessage, User } from '@/lib/api';

// Helper to format time
const formatTime = (time24: string): string => {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

// Search result types
interface SearchResults {
  reservations: Reservation[];
  customers: User[];
  tables: Table[];
  staff: Staff[];
  messages: ContactMessage[];
}

// Date filter types
type DateFilterType = 'today' | 'week' | 'month' | 'custom';

// Helper to get date range based on filter type
const getDateRange = (filterType: DateFilterType, customStart?: string, customEnd?: string) => {
  const today = new Date();
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  switch (filterType) {
    case 'today':
      return { startDate: formatDate(today), endDate: formatDate(today) };
    case 'week': {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // End of week (Saturday)
      return { startDate: formatDate(weekStart), endDate: formatDate(weekEnd) };
    }
    case 'month': {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { startDate: formatDate(monthStart), endDate: formatDate(monthEnd) };
    }
    case 'custom':
      return { startDate: customStart || formatDate(today), endDate: customEnd || formatDate(today) };
    default:
      return { startDate: formatDate(today), endDate: formatDate(today) };
  }
};

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Date filter state
  const [dateFilter, setDateFilter] = useState<DateFilterType>('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

  // Global search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResults>({
    reservations: [],
    customers: [],
    tables: [],
    staff: [],
    messages: [],
  });
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [allData, setAllData] = useState<{
    reservations: Reservation[];
    customers: User[];
    tables: Table[];
    staff: Staff[];
    messages: ContactMessage[];
  }>({
    reservations: [],
    customers: [],
    tables: [],
    staff: [],
    messages: [],
  });
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Fetch all searchable data on mount
  const fetchSearchData = useCallback(async () => {
    try {
      const [reservationsRes, customersRes, tablesRes, staffRes, messagesRes] = await Promise.all([
        adminApi.getAllReservations(0, 100),
        adminApi.getAllCustomers(0, 100),
        adminApi.getAllTables(),
        adminApi.getAllStaff(),
        adminApi.getAllMessages(0, 100),
      ]);

      setAllData({
        reservations: reservationsRes.success && reservationsRes.data ? reservationsRes.data.content : [],
        customers: customersRes.success && customersRes.data ? customersRes.data.content : [],
        tables: tablesRes.success && tablesRes.data ? tablesRes.data : [],
        staff: staffRes.success && staffRes.data ? staffRes.data : [],
        messages: messagesRes.success && messagesRes.data ? messagesRes.data.content : [],
      });
    } catch (err) {
      console.error('Failed to fetch search data:', err);
    }
  }, []);

  // Perform local search
  const performSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults({
        reservations: [],
        customers: [],
        tables: [],
        staff: [],
        messages: [],
      });
      return;
    }

    const lowerQuery = query.toLowerCase();

    const filteredReservations = allData.reservations.filter(r =>
      r.customerName.toLowerCase().includes(lowerQuery) ||
      r.customerEmail.toLowerCase().includes(lowerQuery) ||
      r.customerPhone.toLowerCase().includes(lowerQuery) ||
      r.reservationCode.toLowerCase().includes(lowerQuery) ||
      r.status.toLowerCase().includes(lowerQuery)
    ).slice(0, 5);

    const filteredCustomers = allData.customers.filter(c =>
      c.fullName.toLowerCase().includes(lowerQuery) ||
      c.email.toLowerCase().includes(lowerQuery) ||
      c.phone.toLowerCase().includes(lowerQuery)
    ).slice(0, 5);

    const filteredTables = allData.tables.filter(t =>
      t.tableName.toLowerCase().includes(lowerQuery) ||
      t.tableNumber.toString().includes(lowerQuery) ||
      t.location.toLowerCase().includes(lowerQuery) ||
      t.status.toLowerCase().includes(lowerQuery)
    ).slice(0, 5);

    const filteredStaff = allData.staff.filter(s =>
      s.fullName.toLowerCase().includes(lowerQuery) ||
      s.email.toLowerCase().includes(lowerQuery) ||
      s.role.toLowerCase().includes(lowerQuery) ||
      s.staffId.toLowerCase().includes(lowerQuery)
    ).slice(0, 5);

    const filteredMessages = allData.messages.filter(m =>
      m.fullName.toLowerCase().includes(lowerQuery) ||
      m.email.toLowerCase().includes(lowerQuery) ||
      m.message.toLowerCase().includes(lowerQuery)
    ).slice(0, 5);

    setSearchResults({
      reservations: filteredReservations,
      customers: filteredCustomers,
      tables: filteredTables,
      staff: filteredStaff,
      messages: filteredMessages,
    });
  }, [allData]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowSearchResults(true);
    setSearchLoading(true);

    // Debounce search
    const timeoutId = setTimeout(() => {
      performSearch(query);
      setSearchLoading(false);
    }, 200);

    return () => clearTimeout(timeoutId);
  };

  // Handle click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setShowSearchResults(true);
      }
      if (e.key === 'Escape') {
        setShowSearchResults(false);
        searchInputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Navigate to result
  const handleResultClick = (type: string, id: number) => {
    setShowSearchResults(false);
    setSearchQuery('');
    switch (type) {
      case 'reservation':
        router.push('/admin/reservations');
        break;
      case 'customer':
        router.push('/admin/customers');
        break;
      case 'table':
        router.push('/admin/tables');
        break;
      case 'staff':
        router.push('/admin/staff');
        break;
      case 'message':
        router.push('/admin/messages');
        break;
    }
  };

  // Check if there are any search results
  const hasResults =
    searchResults.reservations.length > 0 ||
    searchResults.customers.length > 0 ||
    searchResults.tables.length > 0 ||
    searchResults.staff.length > 0 ||
    searchResults.messages.length > 0;

  // Fetch reservations based on date filter
  const fetchFilteredReservations = useCallback(async () => {
    try {
      const { startDate, endDate } = getDateRange(dateFilter, customStartDate, customEndDate);

      let reservationsResponse;
      if (dateFilter === 'today') {
        reservationsResponse = await adminApi.getTodayReservations();
      } else {
        reservationsResponse = await adminApi.getReservationsByDateRange(startDate, endDate);
      }

      if (reservationsResponse.success && reservationsResponse.data) {
        setFilteredReservations(reservationsResponse.data);
      }
    } catch (err) {
      console.error('Failed to fetch filtered reservations:', err);
    }
  }, [dateFilter, customStartDate, customEndDate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch dashboard stats
        const statsResponse = await adminApi.getDashboardStats();

        if (statsResponse.success && statsResponse.data) {
          setStats(statsResponse.data);
        } else {
          setError(statsResponse.message || 'Failed to load dashboard stats');
        }

        // Fetch reservations based on date filter
        await fetchFilteredReservations();

        // Fetch search data separately (don't block dashboard loading)
        fetchSearchData();
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchSearchData, fetchFilteredReservations]);

  // Refetch reservations when date filter changes
  useEffect(() => {
    if (!loading) {
      fetchFilteredReservations();
    }
  }, [dateFilter, customStartDate, customEndDate, fetchFilteredReservations, loading]);

  // Handle date filter change
  const handleDateFilterChange = (filter: DateFilterType) => {
    if (filter === 'custom') {
      setShowCustomDatePicker(true);
    } else {
      setShowCustomDatePicker(false);
    }
    setDateFilter(filter);
  };

  // Apply custom date range
  const applyCustomDateRange = () => {
    if (customStartDate && customEndDate) {
      setDateFilter('custom');
      fetchFilteredReservations();
    }
  };

  // Calculate stats from filtered reservations
  const filteredStats = {
    total: filteredReservations.length,
    confirmed: filteredReservations.filter(r => r.status === 'CONFIRMED').length,
    pending: filteredReservations.filter(r => r.status === 'PENDING').length,
    completed: filteredReservations.filter(r => r.status === 'COMPLETED').length,
    cancelled: filteredReservations.filter(r => r.status === 'CANCELLED').length,
    totalGuests: filteredReservations.filter(r => r.status !== 'CANCELLED' && r.status !== 'NO_SHOW')
      .reduce((sum, r) => sum + r.numberOfGuests, 0),
  };

  // Get current date range label
  const getDateRangeLabel = () => {
    const { startDate, endDate } = getDateRange(dateFilter, customStartDate, customEndDate);
    if (dateFilter === 'today') return 'Today';
    if (dateFilter === 'week') return 'This Week';
    if (dateFilter === 'month') return 'This Month';
    if (dateFilter === 'custom' && customStartDate && customEndDate) {
      return `${new Date(customStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(customEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
    return 'Custom';
  };

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
        {/* Header with Global Search */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#333333] mb-1">Dashboard</h1>
            <p className="text-sm text-[#333333] opacity-70">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Date Filter Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
              {(['today', 'week', 'month', 'custom'] as DateFilterType[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => handleDateFilterChange(filter)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    dateFilter === filter
                      ? 'bg-[#FF6B35] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {filter === 'today' ? 'Today' : filter === 'week' ? 'This Week' : filter === 'month' ? 'This Month' : 'Custom'}
                </button>
              ))}
            </div>

            {/* Custom Date Picker */}
            {showCustomDatePicker && (
              <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm border border-gray-200 p-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                />
                <span className="text-xs text-gray-400">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                />
                <button
                  onClick={applyCustomDateRange}
                  disabled={!customStartDate || !customEndDate}
                  className="px-3 py-1 bg-[#FF6B35] text-white text-xs font-medium rounded hover:bg-[#e55a2b] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* Global Search */}
          <div className="relative w-full md:w-96" ref={searchContainerRef}>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search reservations, customers, tables, staff..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setShowSearchResults(true)}
                className="w-full pl-10 pr-20 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-[#333333] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent shadow-sm"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded hidden sm:block">
                Ctrl+K
              </span>
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[70vh] overflow-y-auto z-50">
                {searchLoading ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin w-6 h-6 border-2 border-[#FF6B35] border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-xs text-gray-500 mt-2">Searching...</p>
                  </div>
                ) : !hasResults ? (
                  <div className="p-4 text-center">
                    <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-gray-500">No results found for &quot;{searchQuery}&quot;</p>
                    <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
                  </div>
                ) : (
                  <div className="py-1">
                    {/* Reservations */}
                    {searchResults.reservations.length > 0 && (
                      <div>
                        <div className="px-3 py-1 bg-gray-50">
                          <div className="flex items-center gap-1.5">
                            <svg className="w-3 h-3 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-[10px] font-semibold text-[#333333] uppercase tracking-wider">Reservations</span>
                            <span className="text-[10px] text-gray-400">({searchResults.reservations.length})</span>
                          </div>
                        </div>
                        {searchResults.reservations.map((reservation) => (
                          <button
                            key={`res-${reservation.id}`}
                            onClick={() => handleResultClick('reservation', reservation.id)}
                            className="w-full px-3 py-1.5 hover:bg-[#F8F4F0] flex items-center gap-2 text-left transition-colors cursor-pointer"
                          >
                            <div className="w-6 h-6 rounded-full bg-[#FF6B35] bg-opacity-10 flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] font-bold text-[#FF6B35]">{reservation.customerName.charAt(0)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-[#333333] truncate">{reservation.customerName}</p>
                              <p className="text-[10px] text-gray-500">{reservation.reservationCode} • {reservation.reservationDate} • {reservation.numberOfGuests} guests</p>
                            </div>
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${
                              reservation.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                              reservation.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              reservation.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {reservation.status.charAt(0) + reservation.status.slice(1).toLowerCase()}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Customers */}
                    {searchResults.customers.length > 0 && (
                      <div>
                        <div className="px-3 py-1 bg-gray-50">
                          <div className="flex items-center gap-1.5">
                            <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="text-[10px] font-semibold text-[#333333] uppercase tracking-wider">Customers</span>
                            <span className="text-[10px] text-gray-400">({searchResults.customers.length})</span>
                          </div>
                        </div>
                        {searchResults.customers.map((customer) => (
                          <button
                            key={`cust-${customer.id}`}
                            onClick={() => handleResultClick('customer', customer.id)}
                            className="w-full px-3 py-1.5 hover:bg-[#F8F4F0] flex items-center gap-2 text-left transition-colors cursor-pointer"
                          >
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] font-bold text-blue-600">{customer.fullName.charAt(0)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-[#333333] truncate">{customer.fullName}</p>
                              <p className="text-[10px] text-gray-500">{customer.email} • {customer.phone}</p>
                            </div>
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${
                              customer.loyaltyTier === 'PLATINUM' ? 'bg-purple-100 text-purple-800' :
                              customer.loyaltyTier === 'GOLD' ? 'bg-yellow-100 text-yellow-800' :
                              customer.loyaltyTier === 'SILVER' ? 'bg-gray-200 text-gray-700' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {customer.loyaltyTier}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Tables */}
                    {searchResults.tables.length > 0 && (
                      <div>
                        <div className="px-3 py-1 bg-gray-50">
                          <div className="flex items-center gap-1.5">
                            <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            <span className="text-[10px] font-semibold text-[#333333] uppercase tracking-wider">Tables</span>
                            <span className="text-[10px] text-gray-400">({searchResults.tables.length})</span>
                          </div>
                        </div>
                        {searchResults.tables.map((table) => (
                          <button
                            key={`table-${table.id}`}
                            onClick={() => handleResultClick('table', table.id)}
                            className="w-full px-3 py-1.5 hover:bg-[#F8F4F0] flex items-center gap-2 text-left transition-colors cursor-pointer"
                          >
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] font-bold text-green-600">T{table.tableNumber}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-[#333333] truncate">{table.tableName}</p>
                              <p className="text-[10px] text-gray-500">{table.location} • Capacity: {table.capacity}</p>
                            </div>
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${
                              table.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                              table.status === 'RESERVED' ? 'bg-blue-100 text-blue-800' :
                              table.status === 'OCCUPIED' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {table.status.charAt(0) + table.status.slice(1).toLowerCase()}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Staff */}
                    {searchResults.staff.length > 0 && (
                      <div>
                        <div className="px-3 py-1 bg-gray-50">
                          <div className="flex items-center gap-1.5">
                            <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-[10px] font-semibold text-[#333333] uppercase tracking-wider">Staff</span>
                            <span className="text-[10px] text-gray-400">({searchResults.staff.length})</span>
                          </div>
                        </div>
                        {searchResults.staff.map((staffMember) => (
                          <button
                            key={`staff-${staffMember.id}`}
                            onClick={() => handleResultClick('staff', staffMember.id)}
                            className="w-full px-3 py-1.5 hover:bg-[#F8F4F0] flex items-center gap-2 text-left transition-colors cursor-pointer"
                          >
                            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] font-bold text-purple-600">{staffMember.fullName.charAt(0)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-[#333333] truncate">{staffMember.fullName}</p>
                              <p className="text-[10px] text-gray-500">{staffMember.email} • {staffMember.staffId}</p>
                            </div>
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${
                              staffMember.role === 'MANAGER' ? 'bg-purple-100 text-purple-800' :
                              staffMember.role === 'HOST' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {staffMember.role}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Messages */}
                    {searchResults.messages.length > 0 && (
                      <div>
                        <div className="px-3 py-1 bg-gray-50">
                          <div className="flex items-center gap-1.5">
                            <svg className="w-3 h-3 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="text-[10px] font-semibold text-[#333333] uppercase tracking-wider">Messages</span>
                            <span className="text-[10px] text-gray-400">({searchResults.messages.length})</span>
                          </div>
                        </div>
                        {searchResults.messages.map((message) => (
                          <button
                            key={`msg-${message.id}`}
                            onClick={() => handleResultClick('message', message.id)}
                            className="w-full px-3 py-1.5 hover:bg-[#F8F4F0] flex items-center gap-2 text-left transition-colors cursor-pointer"
                          >
                            <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] font-bold text-teal-600">{message.fullName.charAt(0)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-[#333333] truncate">{message.fullName}</p>
                              <p className="text-[10px] text-gray-500 truncate">{message.message.substring(0, 50)}...</p>
                            </div>
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${
                              message.replied ? 'bg-green-100 text-green-800' :
                              message.read ? 'bg-gray-100 text-gray-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {message.replied ? 'Replied' : message.read ? 'Read' : 'New'}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* View All Results Link */}
                    <div className="px-3 py-2 border-t border-gray-100">
                      <p className="text-[10px] text-center text-gray-500">
                        Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-[9px]">Esc</kbd> to close or click on a result to navigate
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid - Shows filtered stats based on date range */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div className="bg-white rounded-lg shadow-md p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-[#FF6B35] bg-opacity-10 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 bg-[#FF6B35] bg-opacity-10 text-[#FF6B35] rounded font-medium">
                {getDateRangeLabel()}
              </span>
            </div>
            <p className="text-2xl font-bold text-[#333333] mb-0.5">{filteredStats.total}</p>
            <p className="text-xs text-[#333333] opacity-70">Total Reservations</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-[#333333] mb-0.5">{filteredStats.confirmed}</p>
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
            <p className="text-2xl font-bold text-[#333333] mb-0.5">{filteredStats.totalGuests}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-white rounded-lg shadow-md p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-[#333333] mb-0.5">{filteredStats.pending}</p>
            <p className="text-xs text-[#333333] opacity-70">Pending</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-[#333333] mb-0.5">{filteredStats.completed}</p>
            <p className="text-xs text-[#333333] opacity-70">Completed</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-[#333333] mb-0.5">{filteredStats.cancelled}</p>
            <p className="text-xs text-[#333333] opacity-70">Cancelled</p>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-semibold text-xs">Reservations</span>
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

        {/* Reservations Table */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#333333]">Reservations</h2>
              <span className="text-xs px-2 py-0.5 bg-[#FF6B35] bg-opacity-10 text-[#FF6B35] rounded font-medium">
                {getDateRangeLabel()}
              </span>
            </div>
            <Link href="/admin/reservations" className="text-[#FF6B35] hover:text-[#e55a2b] font-semibold text-xs">
              View All →
            </Link>
          </div>

          {filteredReservations.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-[#F8F4F0] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#333333] mb-2">No Reservations</h3>
              <p className="text-sm text-[#333333] opacity-70">There are no reservations for {getDateRangeLabel().toLowerCase()}.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">ID</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Customer</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Date</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Time</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Guests</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Table</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Status</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.slice(0, 10).map((reservation) => (
                    <tr key={reservation.id} className="border-b border-gray-100 hover:bg-[#F8F4F0] transition-colors">
                      <td className="py-3 px-3 text-xs text-[#333333]">{reservation.reservationCode}</td>
                      <td className="py-3 px-3 text-xs font-medium text-[#333333]">{reservation.customerName}</td>
                      <td className="py-3 px-3 text-xs text-[#333333]">
                        {new Date(reservation.reservationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
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
