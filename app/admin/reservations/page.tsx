'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { adminApi, Reservation } from '@/lib/api';

// Helper to format time
const formatTime = (time24: string): string => {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

const ITEMS_PER_PAGE = 10;

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState<Reservation | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [statusCounts, setStatusCounts] = useState({
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    pending: 0,
  });
  const [notificationModal, setNotificationModal] = useState<{
    show: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({ show: false, type: 'success', title: '', message: '' });

  const showNotification = (type: 'success' | 'error', title: string, message: string) => {
    setNotificationModal({ show: true, type, title, message });
  };

  const closeNotification = () => {
    setNotificationModal({ show: false, type: 'success', title: '', message: '' });
  };

  // Fetch status counts (all reservations) once on initial load
  const fetchStatusCounts = async () => {
    try {
      // Fetch a large batch to count all statuses
      const response = await adminApi.getAllReservations(0, 1000);
      if (response.success && response.data) {
        const allReservations = response.data.content || [];
        setStatusCounts({
          confirmed: allReservations.filter((r: Reservation) => r.status === 'CONFIRMED').length,
          completed: allReservations.filter((r: Reservation) => r.status === 'COMPLETED').length,
          cancelled: allReservations.filter((r: Reservation) => r.status === 'CANCELLED').length,
          pending: allReservations.filter((r: Reservation) => r.status === 'PENDING').length,
        });
      }
    } catch (err) {
      console.error('Failed to fetch status counts:', err);
    }
  };

  // Fetch reservations from API
  useEffect(() => {
    fetchReservations(currentPage);
  }, [currentPage]);

  // Fetch status counts on initial load
  useEffect(() => {
    fetchStatusCounts();
  }, []);

  const fetchReservations = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await adminApi.getAllReservations(page - 1, ITEMS_PER_PAGE);
      if (response.success && response.data) {
        setReservations(response.data.content || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalElements(response.data.totalElements || 0);
      } else {
        setError(response.message || 'Failed to load reservations');
      }
    } catch (err) {
      console.error('Failed to fetch reservations:', err);
      setError('Failed to load reservations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesFilter = filter === 'all' || reservation.status.toLowerCase() === filter;
    const matchesSearch = searchQuery === '' ||
      reservation.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reservation.reservationCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reservation.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: totalElements,
    confirmed: statusCounts.confirmed,
    completed: statusCounts.completed,
    cancelled: statusCounts.cancelled,
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const handleConfirmReservation = async (reservation: Reservation) => {
    try {
      setActionLoading(true);
      const response = await adminApi.confirmReservation(reservation.id);
      if (response.success) {
        await fetchReservations(currentPage);
        await fetchStatusCounts();
        setSelectedReservation(null);
        showNotification('success', 'Reservation Confirmed', 'The reservation has been confirmed successfully.');
      } else {
        showNotification('error', 'Failed to Confirm', response.message || 'Failed to confirm reservation');
      }
    } catch (err) {
      showNotification('error', 'Error', 'Failed to confirm reservation. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelClick = (reservation: Reservation) => {
    setReservationToCancel(reservation);
    setShowCancelDialog(true);
    setSelectedReservation(null);
  };

  const handleConfirmCancel = async () => {
    if (!reservationToCancel) return;

    try {
      setActionLoading(true);
      const response = await adminApi.cancelReservation(reservationToCancel.id);
      if (response.success) {
        await fetchReservations(currentPage);
        await fetchStatusCounts();
        setShowCancelDialog(false);
        setReservationToCancel(null);
        showNotification('success', 'Reservation Cancelled', 'The reservation has been cancelled successfully.');
      } else {
        showNotification('error', 'Failed to Cancel', response.message || 'Failed to cancel reservation');
      }
    } catch (err) {
      showNotification('error', 'Error', 'Failed to cancel reservation. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteReservation = async (reservation: Reservation) => {
    try {
      setActionLoading(true);
      const response = await adminApi.completeReservation(reservation.id);
      if (response.success) {
        await fetchReservations(currentPage);
        await fetchStatusCounts();
        setSelectedReservation(null);
        showNotification('success', 'Reservation Completed', 'The reservation has been marked as completed.');
      } else {
        showNotification('error', 'Failed to Complete', response.message || 'Failed to complete reservation');
      }
    } catch (err) {
      showNotification('error', 'Error', 'Failed to complete reservation. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F8F4F0]">
        <AdminSidebar />
        <main className="flex-1 ml-64 py-8 px-4 sm:px-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin w-12 h-12 border-4 border-[#FF6B35] border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-sm text-[#333333] opacity-70">Loading reservations...</p>
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
            <button
              onClick={() => fetchReservations(currentPage)}
              className="ml-4 text-red-700 underline hover:no-underline cursor-pointer"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8F4F0]">
      <AdminSidebar />

      <main className="flex-1 ml-64 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-[#333333] mb-1">Reservations</h1>
                <p className="text-sm text-[#333333] opacity-70">
                  Manage all restaurant reservations
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-white rounded-lg shadow-md p-3">
              <p className="text-xs text-[#333333] opacity-70 mb-0.5">Total</p>
              <p className="text-2xl font-bold text-[#333333]">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3">
              <p className="text-xs text-[#333333] opacity-70 mb-0.5">Confirmed</p>
              <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3">
              <p className="text-xs text-[#333333] opacity-70 mb-0.5">Completed</p>
              <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3">
              <p className="text-xs text-[#333333] opacity-70 mb-0.5">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by customer, ID, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                  />
                  <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
                    filter === 'all'
                      ? 'bg-[#FF6B35] text-white'
                      : 'bg-gray-100 text-[#333333] hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('confirmed')}
                  className={`px-4 py-2 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
                    filter === 'confirmed'
                      ? 'bg-[#FF6B35] text-white'
                      : 'bg-gray-100 text-[#333333] hover:bg-gray-200'
                  }`}
                >
                  Confirmed
                </button>
                <button
                  onClick={() => setFilter('pending')}
                  className={`px-4 py-2 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
                    filter === 'pending'
                      ? 'bg-[#FF6B35] text-white'
                      : 'bg-gray-100 text-[#333333] hover:bg-gray-200'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setFilter('cancelled')}
                  className={`px-4 py-2 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
                    filter === 'cancelled'
                      ? 'bg-[#FF6B35] text-white'
                      : 'bg-gray-100 text-[#333333] hover:bg-gray-200'
                  }`}
                >
                  Cancelled
                </button>
              </div>
            </div>
          </div>

          {/* Reservations Table */}
          <div className="bg-white rounded-lg shadow-md p-4">
            {filteredReservations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-[#333333] opacity-70">No reservations found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">ID</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Customer</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Contact</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Date & Time</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Guests</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Table</th>
                      <th className="text-center py-2 px-3 text-xs font-semibold text-[#333333]" title="Pre-Order / Dietary / Requests">Notes</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Status</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReservations.map((reservation) => (
                      <tr key={reservation.id} className="border-b border-gray-100 hover:bg-[#F8F4F0] transition-colors">
                        <td className="py-3 px-3 text-xs text-[#333333] font-medium">{reservation.reservationCode}</td>
                        <td className="py-3 px-3 text-xs text-[#333333]">{reservation.customerName}</td>
                        <td className="py-3 px-3 text-xs text-[#333333]">
                          <div>{reservation.customerEmail}</div>
                          <div className="text-[#333333] opacity-60">{reservation.customerPhone}</div>
                        </td>
                        <td className="py-3 px-3 text-xs text-[#333333]">
                          <div>{new Date(reservation.reservationDate).toLocaleDateString()}</div>
                          <div className="text-[#333333] opacity-60">{formatTime(reservation.reservationTime)}</div>
                        </td>
                        <td className="py-3 px-3 text-xs text-[#333333]">{reservation.numberOfGuests}</td>
                        <td className="py-3 px-3 text-xs text-[#333333]">Table {reservation.tableNumber}</td>
                        <td className="py-3 px-3">
                          <div className="flex justify-center items-center gap-1">
                            {reservation.preOrderData && (
                              <span className="inline-flex items-center justify-center w-5 h-5 bg-[#FF6B35] bg-opacity-10 rounded-full" title="Has Pre-Order">
                                <svg className="w-3 h-3 text-[#FF6B35]" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                                </svg>
                              </span>
                            )}
                            {reservation.dietaryNotes && (
                              <span className="inline-flex items-center justify-center w-5 h-5 bg-yellow-100 rounded-full" title="Has Dietary Notes">
                                <svg className="w-3 h-3 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </span>
                            )}
                            {reservation.specialRequests && (
                              <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 rounded-full" title="Has Special Requests">
                                <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                              </span>
                            )}
                          </div>
                        </td>
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
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => setSelectedReservation(reservation)}
                              className="p-1 text-[#FF6B35] hover:bg-[#FF6B35] hover:bg-opacity-10 rounded transition-colors cursor-pointer"
                              title="View Details"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            {reservation.status === 'PENDING' && (
                              <button
                                onClick={() => handleConfirmReservation(reservation)}
                                disabled={actionLoading}
                                className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50 cursor-pointer"
                                title="Confirm"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                            )}
                            {reservation.status === 'CONFIRMED' && (
                              <button
                                onClick={() => handleCompleteReservation(reservation)}
                                disabled={actionLoading}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50 cursor-pointer"
                                title="Mark as Completed"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                            )}
                            {(reservation.status === 'PENDING' || reservation.status === 'CONFIRMED') && (
                              <button
                                onClick={() => handleCancelClick(reservation)}
                                disabled={actionLoading}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 cursor-pointer"
                                title="Cancel"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-200">
                <div className="text-xs text-[#333333] opacity-70">
                  Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalElements)} of {totalElements} reservations
                </div>
                <div className="flex items-center gap-1">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg text-[#333333] hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Previous page"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Page Numbers */}
                  {getPageNumbers().map((page, index) => (
                    typeof page === 'number' ? (
                      <button
                        key={index}
                        onClick={() => handlePageChange(page)}
                        className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          currentPage === page
                            ? 'bg-[#FF6B35] text-white'
                            : 'text-[#333333] hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ) : (
                      <span key={index} className="px-1 text-[#333333] opacity-50">...</span>
                    )
                  ))}

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg text-[#333333] hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Next page"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Reservation Details Modal */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#333333]">Reservation Details</h2>
              <button
                onClick={() => setSelectedReservation(null)}
                className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5 text-[#333333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Reservation ID</p>
                  <p className="text-sm font-semibold text-[#333333]">{selectedReservation.reservationCode}</p>
                </div>
                <div>
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Status</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                    selectedReservation.status === 'CONFIRMED'
                      ? 'bg-green-100 text-green-800'
                      : selectedReservation.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : selectedReservation.status === 'COMPLETED'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedReservation.status.charAt(0) + selectedReservation.status.slice(1).toLowerCase()}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Customer Name</p>
                  <p className="text-sm font-semibold text-[#333333]">{selectedReservation.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Email</p>
                  <p className="text-sm text-[#333333]">{selectedReservation.customerEmail}</p>
                </div>
                <div>
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Phone</p>
                  <p className="text-sm text-[#333333]">{selectedReservation.customerPhone}</p>
                </div>
                <div>
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Date & Time</p>
                  <p className="text-sm font-semibold text-[#333333]">
                    {new Date(selectedReservation.reservationDate).toLocaleDateString()} at {formatTime(selectedReservation.reservationTime)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Number of Guests</p>
                  <p className="text-sm font-semibold text-[#333333]">{selectedReservation.numberOfGuests}</p>
                </div>
                <div>
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Table</p>
                  <p className="text-sm font-semibold text-[#333333]">Table {selectedReservation.tableNumber}</p>
                </div>
                {selectedReservation.specialRequests && (
                  <div className="col-span-2">
                    <p className="text-xs text-[#333333] opacity-70 mb-1">Special Requests</p>
                    <p className="text-sm text-[#333333] bg-[#F8F4F0] p-2 rounded">{selectedReservation.specialRequests}</p>
                  </div>
                )}
                {selectedReservation.preOrderData && (
                  <div className="col-span-2">
                    <p className="text-xs text-[#333333] opacity-70 mb-1">Pre-Order</p>
                    <div className="text-sm text-[#333333] bg-[#FFF5F0] border border-[#FF6B35]/20 p-2 rounded">
                      {(() => {
                        try {
                          const preOrders = JSON.parse(selectedReservation.preOrderData);
                          const drinkLabels: Record<string, string> = {
                            water_soft_drinks: 'Water/Soft Drinks',
                            wine: 'Wine',
                            beer: 'Beer',
                            cocktails: 'Cocktails',
                            coffee_tea: 'Coffee/Tea',
                          };
                          const foodLabels: Record<string, string> = {
                            appetizers: 'Appetizers',
                            main_course: 'Main Course',
                            desserts: 'Desserts',
                            full_course: 'Full Course',
                          };
                          return preOrders.map((order: { drinks: string; food: string }, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 py-1">
                              <span className="font-semibold text-[#FF6B35]">Guest {idx + 1}:</span>
                              <span>
                                {[
                                  order.drinks && drinkLabels[order.drinks],
                                  order.food && foodLabels[order.food]
                                ].filter(Boolean).join(' + ')}
                              </span>
                            </div>
                          ));
                        } catch {
                          return <span>{selectedReservation.preOrderData}</span>;
                        }
                      })()}
                    </div>
                  </div>
                )}
                {selectedReservation.dietaryNotes && (
                  <div className="col-span-2">
                    <p className="text-xs text-[#333333] opacity-70 mb-1">Dietary Notes</p>
                    <p className="text-sm text-[#333333] bg-yellow-50 border border-yellow-200 p-2 rounded">{selectedReservation.dietaryNotes}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-6">
                {selectedReservation.status === 'PENDING' && (
                  <button
                    onClick={() => handleConfirmReservation(selectedReservation)}
                    disabled={actionLoading}
                    className="flex-1 bg-green-600 text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Confirm Reservation
                  </button>
                )}
                {selectedReservation.status === 'CONFIRMED' && (
                  <button
                    onClick={() => handleCompleteReservation(selectedReservation)}
                    disabled={actionLoading}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Mark as Completed
                  </button>
                )}
                {(selectedReservation.status === 'PENDING' || selectedReservation.status === 'CONFIRMED') && (
                  <button
                    onClick={() => handleCancelClick(selectedReservation)}
                    disabled={actionLoading}
                    className="flex-1 bg-red-600 text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Cancel Reservation
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && reservationToCancel && (
        <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#333333]">Cancel Reservation</h2>
                  <p className="text-xs text-[#333333] opacity-70">This action can be undone later</p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm text-[#333333] mb-4">
                Are you sure you want to cancel the reservation for <span className="font-semibold">{reservationToCancel.customerName}</span>?
              </p>
              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-[#333333] opacity-70">Reservation ID</p>
                    <p className="font-semibold text-[#333333]">{reservationToCancel.reservationCode}</p>
                  </div>
                  <div>
                    <p className="text-[#333333] opacity-70">Date & Time</p>
                    <p className="font-semibold text-[#333333]">
                      {new Date(reservationToCancel.reservationDate).toLocaleDateString()} at {formatTime(reservationToCancel.reservationTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#333333] opacity-70">Guests</p>
                    <p className="font-semibold text-[#333333]">{reservationToCancel.numberOfGuests}</p>
                  </div>
                  <div>
                    <p className="text-[#333333] opacity-70">Table</p>
                    <p className="font-semibold text-[#333333]">Table {reservationToCancel.tableNumber}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCancelDialog(false);
                    setReservationToCancel(null);
                  }}
                  disabled={actionLoading}
                  className="flex-1 bg-gray-200 text-[#333333] px-4 py-2 text-sm rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Keep Reservation
                </button>
                <button
                  onClick={handleConfirmCancel}
                  disabled={actionLoading}
                  className="flex-1 bg-red-600 text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? 'Cancelling...' : 'Cancel Reservation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {notificationModal.show && (
        <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#333333]">{notificationModal.title}</h2>
              <button onClick={closeNotification} className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer">
                <svg className="w-5 h-5 text-[#333333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className={`flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full ${
                notificationModal.type === 'success' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {notificationModal.type === 'success' ? (
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <p className="text-sm text-[#333333] text-center mb-6">{notificationModal.message}</p>
              <button
                onClick={closeNotification}
                className={`w-full px-4 py-2 text-sm rounded-lg font-semibold transition-colors cursor-pointer ${
                  notificationModal.type === 'success'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
