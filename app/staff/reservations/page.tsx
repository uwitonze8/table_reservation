'use client';

import { useState, useEffect } from 'react';
import StaffSidebar from '@/components/staff/StaffSidebar';
import { staffApi, Reservation } from '@/lib/api';

export default function StaffReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState<Reservation | null>(null);
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

  const openCancelModal = (reservation: Reservation) => {
    setReservationToCancel(reservation);
    setCancelModalOpen(true);
  };

  const closeCancelModal = () => {
    setCancelModalOpen(false);
    setReservationToCancel(null);
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching today\'s reservations...');
      const response = await staffApi.getTodayReservations();
      console.log('Reservations response:', response);
      if (response.success && response.data) {
        setReservations(response.data);
      } else {
        setError(response.message || 'Failed to load reservations');
      }
    } catch (err) {
      console.error('Failed to fetch reservations:', err);
      setError('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    if (filter === 'all') return true;
    return reservation.status === filter.toUpperCase();
  });

  const stats = {
    total: reservations.length,
    completed: reservations.filter(r => r.status === 'COMPLETED').length,
    confirmed: reservations.filter(r => r.status === 'CONFIRMED').length,
    pending: reservations.filter(r => r.status === 'PENDING').length,
    cancelled: reservations.filter(r => r.status === 'CANCELLED').length,
  };

  const handleConfirmReservation = async (id: number) => {
    try {
      setActionLoading(true);
      const response = await staffApi.confirmReservation(id);
      if (response.success) {
        await fetchReservations();
        setSelectedReservation(null);
        showNotification('success', 'Reservation Confirmed', 'The reservation has been confirmed successfully.');
      } else {
        showNotification('error', 'Confirmation Failed', response.message || 'Failed to confirm reservation');
      }
    } catch (err) {
      showNotification('error', 'Error', 'Failed to confirm reservation. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteReservation = async (id: number) => {
    try {
      setActionLoading(true);
      const response = await staffApi.completeReservation(id);
      if (response.success) {
        await fetchReservations();
        setSelectedReservation(null);
        showNotification('success', 'Reservation Completed', 'The reservation has been marked as completed.');
      } else {
        showNotification('error', 'Completion Failed', response.message || 'Failed to complete reservation');
      }
    } catch (err) {
      showNotification('error', 'Error', 'Failed to complete reservation. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelReservation = async () => {
    if (!reservationToCancel) return;
    try {
      setActionLoading(true);
      const response = await staffApi.cancelReservation(reservationToCancel.id, 'Cancelled by staff');
      if (response.success) {
        await fetchReservations();
        setSelectedReservation(null);
        closeCancelModal();
        showNotification('success', 'Reservation Cancelled', 'The reservation has been cancelled successfully.');
      } else {
        showNotification('error', 'Cancellation Failed', response.message || 'Failed to cancel reservation');
      }
    } catch (err) {
      showNotification('error', 'Error', 'Failed to cancel reservation. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F8F4F0]">
        <StaffSidebar />
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

  return (
    <div className="flex min-h-screen bg-[#F8F4F0]">
      <StaffSidebar />

      <main className="flex-1 ml-64 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-[#333333]">Today&apos;s Reservations</h1>
              <p className="text-sm text-[#333333] opacity-70 mt-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <button
              onClick={fetchReservations}
              className="text-sm text-[#FF6B35] hover:text-[#e55a2b] font-semibold"
            >
              Refresh
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
              <button onClick={fetchReservations} className="ml-4 underline hover:no-underline">
                Retry
              </button>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <div className="bg-white rounded-lg shadow-md p-3">
              <p className="text-xs text-[#333333] opacity-70 mb-1">Total</p>
              <p className="text-2xl font-bold text-[#333333]">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3">
              <p className="text-xs text-[#333333] opacity-70 mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3">
              <p className="text-xs text-[#333333] opacity-70 mb-1">Confirmed</p>
              <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3">
              <p className="text-xs text-[#333333] opacity-70 mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3">
              <p className="text-xs text-[#333333] opacity-70 mb-1">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-lg shadow-md p-3 mb-4">
            <div className="flex gap-2 overflow-x-auto">
              {[
                { key: 'all', label: 'All', count: stats.total, color: 'bg-[#FF6B35]' },
                { key: 'COMPLETED', label: 'Completed', count: stats.completed, color: 'bg-green-600' },
                { key: 'CONFIRMED', label: 'Confirmed', count: stats.confirmed, color: 'bg-blue-600' },
                { key: 'PENDING', label: 'Pending', count: stats.pending, color: 'bg-yellow-600' },
                { key: 'CANCELLED', label: 'Cancelled', count: stats.cancelled, color: 'bg-red-600' },
              ].map(({ key, label, count, color }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-4 py-2 text-xs rounded-lg font-semibold transition-colors whitespace-nowrap ${
                    filter === key
                      ? `${color} text-white`
                      : 'bg-gray-100 text-[#333333] hover:bg-gray-200'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>
          </div>

          {/* Reservations Table */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-bold text-[#333333] mb-4">Reservations</h2>
            {filteredReservations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-[#333333] opacity-70">No reservations found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Code</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Customer</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Phone</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Time</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Guests</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Table</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Status</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReservations.map((reservation) => (
                      <tr key={reservation.id} className="border-b border-gray-100 hover:bg-[#F8F4F0] transition-colors">
                        <td className="py-3 px-3 text-xs text-[#333333] font-medium">{reservation.reservationCode}</td>
                        <td className="py-3 px-3 text-xs font-semibold text-[#333333]">{reservation.customerName}</td>
                        <td className="py-3 px-3 text-xs text-[#333333]">{reservation.customerPhone}</td>
                        <td className="py-3 px-3 text-xs text-[#333333]">{reservation.reservationTime}</td>
                        <td className="py-3 px-3 text-xs text-[#333333]">{reservation.numberOfGuests}</td>
                        <td className="py-3 px-3 text-xs text-[#333333]">{reservation.tableName || `Table ${reservation.tableNumber}`}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(reservation.status)}`}>
                            {formatStatus(reservation.status)}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedReservation(reservation)}
                              className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                            >
                              View
                            </button>
                            {reservation.status === 'PENDING' && (
                              <button
                                onClick={() => handleConfirmReservation(reservation.id)}
                                className="text-green-600 hover:text-green-800 text-xs font-semibold"
                              >
                                Confirm
                              </button>
                            )}
                            {reservation.status === 'CONFIRMED' && (
                              <button
                                onClick={() => handleCompleteReservation(reservation.id)}
                                className="text-green-600 hover:text-green-800 text-xs font-semibold"
                              >
                                Complete
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
          </div>
        </div>
      </main>

      {/* Reservation Details Modal */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-[#333333]">Reservation Details</h2>
                <p className="text-xs text-[#333333] opacity-70">{selectedReservation.reservationCode}</p>
              </div>
              <button
                onClick={() => setSelectedReservation(null)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <svg className="w-5 h-5 text-[#333333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Customer Name</p>
                  <p className="text-sm font-semibold text-[#333333]">{selectedReservation.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Phone Number</p>
                  <p className="text-sm font-semibold text-[#333333]">{selectedReservation.customerPhone}</p>
                </div>
                <div>
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Email</p>
                  <p className="text-sm font-semibold text-[#333333]">{selectedReservation.customerEmail}</p>
                </div>
                <div>
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Date & Time</p>
                  <p className="text-sm font-semibold text-[#333333]">{selectedReservation.reservationDate} at {selectedReservation.reservationTime}</p>
                </div>
                <div>
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Party Size</p>
                  <p className="text-sm font-semibold text-[#333333]">{selectedReservation.numberOfGuests} guests</p>
                </div>
                <div>
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Table</p>
                  <p className="text-sm font-semibold text-[#333333]">{selectedReservation.tableName || `Table ${selectedReservation.tableNumber}`}</p>
                </div>
                <div>
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Status</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(selectedReservation.status)}`}>
                    {formatStatus(selectedReservation.status)}
                  </span>
                </div>
                {selectedReservation.specialRequests && (
                  <div className="col-span-2">
                    <p className="text-xs text-[#333333] opacity-70 mb-1">Special Requests</p>
                    <p className="text-sm text-[#333333] bg-[#F8F4F0] p-2 rounded">{selectedReservation.specialRequests}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {selectedReservation.status === 'PENDING' && (
                  <button
                    onClick={() => handleConfirmReservation(selectedReservation.id)}
                    disabled={actionLoading}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    Confirm Reservation
                  </button>
                )}
                {selectedReservation.status === 'CONFIRMED' && (
                  <button
                    onClick={() => handleCompleteReservation(selectedReservation.id)}
                    disabled={actionLoading}
                    className="flex-1 bg-green-600 text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    Mark as Completed
                  </button>
                )}
                {(selectedReservation.status === 'PENDING' || selectedReservation.status === 'CONFIRMED') && (
                  <button
                    onClick={() => openCancelModal(selectedReservation)}
                    disabled={actionLoading}
                    className="flex-1 bg-red-600 text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={() => setSelectedReservation(null)}
                  className="flex-1 bg-gray-200 text-[#333333] px-4 py-2 text-sm rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalOpen && reservationToCancel && (
        <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#333333]">Cancel Reservation</h3>
                <p className="text-sm text-[#333333] opacity-70">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-[#333333] mb-6">
              Are you sure you want to cancel the reservation for <strong>{reservationToCancel.customerName}</strong> ({reservationToCancel.reservationCode})?
            </p>
            <div className="flex gap-3">
              <button
                onClick={closeCancelModal}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 text-sm font-semibold text-[#333333] bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Keep Reservation
              </button>
              <button
                onClick={handleCancelReservation}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {notificationModal.show && (
        <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
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
              <div>
                <h3 className="text-lg font-bold text-[#333333]">{notificationModal.title}</h3>
              </div>
            </div>
            <p className="text-sm text-[#333333] mb-6">{notificationModal.message}</p>
            <button
              onClick={closeNotification}
              className={`w-full px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors ${
                notificationModal.type === 'success'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
