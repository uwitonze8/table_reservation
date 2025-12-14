'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ReservationTicket from '@/components/customer/ReservationTicket';
import CustomerSidebar from '@/components/customer/CustomerSidebar';
import { reservationApi, tableApi, Reservation, Table } from '@/lib/api';

interface DisplayReservation {
  id: string;
  numericId: number;
  date: string;
  time: string;
  time24: string;
  guests: number;
  tableName: string;
  tableNumber: number;
  tableId: number;
  status: string;
  specialRequests: string;
  createdAt: string;
  loyaltyPointsEarned: number;
}

// Convert 24h time to 12h format
const formatTime = (time24: string): string => {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

// Map API reservation to display format
const mapReservation = (res: Reservation): DisplayReservation => ({
  id: res.reservationCode,
  numericId: res.id,
  date: res.reservationDate,
  time: formatTime(res.reservationTime),
  time24: res.reservationTime,
  guests: res.numberOfGuests,
  tableName: `Table ${res.tableNumber} (${res.tableLocation})`,
  tableNumber: res.tableNumber,
  tableId: res.tableId,
  status: res.status.toLowerCase(),
  specialRequests: res.specialRequests || 'None',
  createdAt: res.createdAt.split('T')[0],
  loyaltyPointsEarned: res.loyaltyPointsEarned,
});

export default function MyReservationsPage() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<DisplayReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Modify modal state
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [reservationToModify, setReservationToModify] = useState<DisplayReservation | null>(null);
  const [modifyForm, setModifyForm] = useState({
    date: '',
    time: '',
    guests: 1,
    specialRequests: '',
    tableId: 0,
  });
  const [availableTables, setAvailableTables] = useState<Table[]>([]);
  const [modifyLoading, setModifyLoading] = useState(false);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState<DisplayReservation | null>(null);
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

  const openCancelModal = (reservation: DisplayReservation) => {
    setReservationToCancel(reservation);
    setCancelModalOpen(true);
  };

  const closeCancelModal = () => {
    setCancelModalOpen(false);
    setReservationToCancel(null);
  };

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
          const mapped = response.data.map(mapReservation);
          setReservations(mapped);
        } else {
          setError(response.message || 'Failed to load reservations');
        }
      } catch (err) {
        setError('Failed to load reservations. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return null;
  }

  const filteredReservations = filter === 'all'
    ? reservations
    : reservations.filter(res => res.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'completed':
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'cancelled':
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  const handlePrintTicket = (reservation: any) => {
    setSelectedReservation(reservation);
    setShowTicketModal(true);
  };

  const handleRebook = (reservation: any) => {
    // Navigate to reservation page with pre-filled data
    router.push(`/reservation?rebook=${reservation.id}`);
  };

  const handleCancel = async () => {
    if (!reservationToCancel) return;

    setCancellingId(reservationToCancel.id);
    try {
      const response = await reservationApi.cancel(reservationToCancel.id);
      if (response.success) {
        // Update the reservation status locally
        setReservations(prev =>
          prev.map(r =>
            r.id === reservationToCancel.id ? { ...r, status: 'cancelled' } : r
          )
        );
        closeCancelModal();
        showNotification('success', 'Reservation Cancelled', 'Your reservation has been cancelled successfully.');
      } else {
        showNotification('error', 'Cancellation Failed', response.message || 'Failed to cancel reservation');
      }
    } catch (err) {
      showNotification('error', 'Error', 'Failed to cancel reservation. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  // Open modify modal with reservation data
  const handleOpenModify = async (reservation: DisplayReservation) => {
    setReservationToModify(reservation);
    setModifyForm({
      date: reservation.date,
      time: reservation.time24,
      guests: reservation.guests,
      specialRequests: reservation.specialRequests === 'None' ? '' : reservation.specialRequests,
      tableId: reservation.tableId,
    });
    setShowModifyModal(true);

    // Fetch available tables for the current date/time
    await fetchAvailableTables(reservation.date, reservation.time24, reservation.guests);
  };

  // Fetch available tables when date/time/guests change
  const fetchAvailableTables = async (date: string, time: string, guests: number) => {
    if (!date || !time) return;

    setTablesLoading(true);
    try {
      const response = await tableApi.getAvailable(date, time, guests);
      if (response.success && response.data) {
        setAvailableTables(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch available tables:', err);
    } finally {
      setTablesLoading(false);
    }
  };

  // Handle form field changes
  const handleModifyFormChange = async (field: string, value: string | number) => {
    const newForm = { ...modifyForm, [field]: value };
    setModifyForm(newForm);

    // Refetch available tables when date, time, or guests change
    if (field === 'date' || field === 'time' || field === 'guests') {
      await fetchAvailableTables(
        field === 'date' ? value as string : newForm.date,
        field === 'time' ? value as string : newForm.time,
        field === 'guests' ? value as number : newForm.guests
      );
    }
  };

  // Submit modification
  const handleSubmitModify = async () => {
    if (!reservationToModify) return;

    setModifyLoading(true);
    try {
      const response = await reservationApi.update(reservationToModify.numericId, {
        reservationDate: modifyForm.date,
        reservationTime: modifyForm.time,
        numberOfGuests: modifyForm.guests,
        tableId: modifyForm.tableId,
        specialRequests: modifyForm.specialRequests || undefined,
        customerName: user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
        customerEmail: user?.email || '',
        customerPhone: user?.phone || '',
      });

      if (response.success) {
        // Refresh reservations list
        const refreshResponse = await reservationApi.getMyReservations();
        if (refreshResponse.success && refreshResponse.data) {
          setReservations(refreshResponse.data.map(mapReservation));
        }
        setShowModifyModal(false);
        setReservationToModify(null);
        showNotification('success', 'Reservation Modified', 'Your reservation has been modified successfully.');
      } else {
        showNotification('error', 'Modification Failed', response.message || 'Failed to modify reservation');
      }
    } catch (err) {
      showNotification('error', 'Error', 'Failed to modify reservation. Please try again.');
    } finally {
      setModifyLoading(false);
    }
  };

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 11; hour <= 21; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const totalLoyaltyPoints = reservations
    .filter(r => r.status === 'completed')
    .reduce((sum, r) => sum + r.loyaltyPointsEarned, 0);

  return (
    <div className="flex min-h-screen bg-[#F8F4F0]">
      {/* Sidebar */}
      <CustomerSidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#F8F4F0] to-[#e8e0d8] py-8 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-[#333333] mb-2">
                  My <span className="text-[#FF6B35]">Reservations</span>
                </h1>
                <p className="text-sm text-[#333333] opacity-70">
                  View and manage all your restaurant reservations
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-3 text-center">
                <div className="text-2xl font-bold text-[#FF6B35]">{totalLoyaltyPoints}</div>
                <div className="text-xs text-[#333333] opacity-70 mt-1">Loyalty Points</div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters and Content */}
        <section className="py-6 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
          {/* Filter Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-1.5 text-sm rounded-full font-semibold transition-all cursor-pointer ${
                  filter === 'all'
                    ? 'bg-[#FF6B35] text-white shadow-md'
                    : 'bg-white text-[#333333] hover:bg-[#FF6B35] hover:text-white'
                }`}
              >
                All ({reservations.length})
              </button>
              <button
                onClick={() => setFilter('confirmed')}
                className={`px-4 py-1.5 text-sm rounded-full font-semibold transition-all cursor-pointer ${
                  filter === 'confirmed'
                    ? 'bg-[#FF6B35] text-white shadow-md'
                    : 'bg-white text-[#333333] hover:bg-[#FF6B35] hover:text-white'
                }`}
              >
                Upcoming ({reservations.filter(r => r.status === 'confirmed').length})
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-1.5 text-sm rounded-full font-semibold transition-all cursor-pointer ${
                  filter === 'completed'
                    ? 'bg-[#FF6B35] text-white shadow-md'
                    : 'bg-white text-[#333333] hover:bg-[#FF6B35] hover:text-white'
                }`}
              >
                Past ({reservations.filter(r => r.status === 'completed').length})
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-[#FF6B35] border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-sm text-[#333333] opacity-70">Loading your reservations...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#333333] mb-2">Error Loading Reservations</h3>
              <p className="text-sm text-[#333333] opacity-70 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="inline-block bg-[#FF6B35] text-white px-6 py-2 text-sm rounded-full font-semibold hover:bg-[#e55a2b] transition-all cursor-pointer"
              >
                Try Again
              </button>
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-[#F8F4F0] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#333333] mb-2">No Reservations Found</h3>
              <p className="text-sm text-[#333333] opacity-70 mb-4">
                {filter === 'all'
                  ? "You don't have any reservations yet."
                  : `You don't have any ${filter} reservations.`}
              </p>
              <Link
                href="/reservation"
                className="inline-block bg-[#FF6B35] text-white px-6 py-2 text-sm rounded-full font-semibold hover:bg-[#e55a2b] transition-all"
              >
                Make Your First Reservation
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="bg-white rounded-lg shadow-md p-2.5 hover:shadow-xl transition-shadow flex flex-col"
                >
                  {/* Header */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-xs font-bold text-[#333333]">
                        {reservation.id}
                      </h3>
                      <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-0.5 ${getStatusColor(reservation.status)}`}>
                        {getStatusIcon(reservation.status)}
                        <span className="text-xs">{reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}</span>
                      </span>
                    </div>
                    <p className="text-xs text-[#333333] opacity-60">
                      Booked {new Date(reservation.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 mb-2 flex-1">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-[#FF6B35] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs font-semibold text-[#333333]">
                        {new Date(reservation.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-[#FF6B35] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs font-semibold text-[#333333]">{reservation.time}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-[#FF6B35] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-xs font-semibold text-[#333333]">{reservation.guests} guests</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-[#FF6B35] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                      </svg>
                      <span className="text-xs font-semibold text-[#333333] truncate">{reservation.tableName}</span>
                    </div>

                    {reservation.status === 'completed' && (
                      <div className="flex items-center gap-1 text-green-600 pt-1.5 border-t border-gray-200">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                        </svg>
                        <span className="text-xs font-semibold">+{reservation.loyaltyPointsEarned} pts</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1.5">
                    {/* Print button - only show for confirmed and completed reservations */}
                    {(reservation.status === 'confirmed' || reservation.status === 'completed') && (
                      <button
                        onClick={() => handlePrintTicket(reservation)}
                        className="w-full bg-[#FF6B35] text-white px-3 py-1.5 text-xs rounded-lg font-semibold hover:bg-[#e55a2b] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                        Print
                      </button>
                    )}

                    {reservation.status === 'completed' && (
                      <button
                        onClick={() => handleRebook(reservation)}
                        className="w-full bg-blue-600 text-white px-3 py-1.5 text-xs rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Re-book
                      </button>
                    )}

                    {reservation.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => handleOpenModify(reservation)}
                          className="w-full bg-white text-[#FF6B35] border border-[#FF6B35] px-3 py-1.5 text-xs rounded-lg font-semibold hover:bg-[#FF6B35] hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Modify
                        </button>
                        <button
                          onClick={() => openCancelModal(reservation)}
                          disabled={cancellingId === reservation.id}
                          className="w-full bg-white text-red-600 border border-red-600 px-3 py-1.5 text-xs rounded-lg font-semibold hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

        {/* Quick Info */}
        <section className="py-6 px-4 sm:px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="bg-[#F8F4F0] rounded-lg p-4">
              <h3 className="text-lg font-bold text-[#333333] mb-4 text-center">Reservation Policy</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="w-10 h-10 bg-[#FF6B35] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-semibold text-[#333333] mb-1">Modification</h4>
                  <p className="text-xs text-[#333333] opacity-70">
                    Modify your reservation up to 4 hours before
                  </p>
                </div>
                <div>
                  <div className="w-10 h-10 bg-[#FF6B35] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-semibold text-[#333333] mb-1">Cancellation</h4>
                  <p className="text-xs text-[#333333] opacity-70">
                    Free cancellation up to 2 hours before
                  </p>
                </div>
                <div>
                  <div className="w-10 h-10 bg-[#FF6B35] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-semibold text-[#333333] mb-1">Reminders</h4>
                  <p className="text-xs text-[#333333] opacity-70">
                    Get reminders 24 hours and 2 hours before
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Ticket Modal */}
      {showTicketModal && selectedReservation && (
        <ReservationTicket
          reservation={selectedReservation}
          user={user!}
          onClose={() => {
            setShowTicketModal(false);
            setSelectedReservation(null);
          }}
        />
      )}

      {/* Modify Reservation Modal */}
      {showModifyModal && reservationToModify && (
        <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <div>
                <h2 className="text-xl font-bold text-[#333333]">Modify Reservation</h2>
                <p className="text-xs text-[#333333] opacity-70">
                  Reservation: {reservationToModify.id}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowModifyModal(false);
                  setReservationToModify(null);
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5 text-[#333333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4">
              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={modifyForm.date}
                  onChange={(e) => handleModifyFormChange('date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">
                  Time
                </label>
                <select
                  value={modifyForm.time}
                  onChange={(e) => handleModifyFormChange('time', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                >
                  <option value="">Select time</option>
                  {generateTimeSlots().map((time) => (
                    <option key={time} value={time}>
                      {formatTime(time)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Number of Guests */}
              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">
                  Number of Guests
                </label>
                <select
                  value={modifyForm.guests}
                  onChange={(e) => handleModifyFormChange('guests', parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'guest' : 'guests'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Table Selection */}
              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">
                  Table
                </label>
                {tablesLoading ? (
                  <div className="flex items-center gap-2 py-2">
                    <div className="animate-spin w-4 h-4 border-2 border-[#FF6B35] border-t-transparent rounded-full"></div>
                    <span className="text-xs text-[#333333] opacity-70">Loading available tables...</span>
                  </div>
                ) : availableTables.length === 0 ? (
                  <p className="text-xs text-red-600 py-2">
                    No tables available for selected date/time. Please try a different time.
                  </p>
                ) : (
                  <select
                    value={modifyForm.tableId}
                    onChange={(e) => handleModifyFormChange('tableId', parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                  >
                    <option value={0}>Select a table</option>
                    {availableTables.map((table) => (
                      <option key={table.id} value={table.id}>
                        Table {table.tableNumber} - {table.location} (Seats {table.capacity})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">
                  Special Requests (optional)
                </label>
                <textarea
                  value={modifyForm.specialRequests}
                  onChange={(e) => handleModifyFormChange('specialRequests', e.target.value)}
                  placeholder="Any special requests or dietary requirements..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none resize-none"
                />
              </div>

              {/* Policy Note */}
              <div className="bg-[#F8F4F0] p-3 rounded-lg">
                <p className="text-xs text-[#333333] opacity-70">
                  <strong>Note:</strong> Modifications can be made up to 4 hours before your reservation time.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 flex gap-2">
              <button
                onClick={handleSubmitModify}
                disabled={modifyLoading || !modifyForm.tableId || tablesLoading}
                className="flex-1 bg-[#FF6B35] text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-[#e55a2b] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {modifyLoading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
              <button
                onClick={() => {
                  setShowModifyModal(false);
                  setReservationToModify(null);
                }}
                className="flex-1 bg-gray-200 text-[#333333] px-4 py-2 text-sm rounded-lg font-semibold hover:bg-gray-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalOpen && reservationToCancel && (
        <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#333333]">Cancel Reservation</h2>
              <button onClick={closeCancelModal} className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer">
                <svg className="w-5 h-5 text-[#333333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-sm text-[#333333] text-center mb-2">
                Are you sure you want to cancel your reservation?
              </p>
              <p className="text-sm font-semibold text-[#333333] text-center mb-4">
                {reservationToCancel.id}
              </p>
              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-[#333333] opacity-70">Date</p>
                    <p className="font-semibold text-[#333333]">{new Date(reservationToCancel.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-[#333333] opacity-70">Time</p>
                    <p className="font-semibold text-[#333333]">{reservationToCancel.time}</p>
                  </div>
                  <div>
                    <p className="text-[#333333] opacity-70">Guests</p>
                    <p className="font-semibold text-[#333333]">{reservationToCancel.guests}</p>
                  </div>
                  <div>
                    <p className="text-[#333333] opacity-70">Table</p>
                    <p className="font-semibold text-[#333333]">Table {reservationToCancel.tableNumber}</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center mb-6">
                This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeCancelModal}
                  disabled={cancellingId !== null}
                  className="flex-1 bg-gray-200 text-[#333333] px-4 py-2 text-sm rounded-lg font-semibold hover:bg-gray-300 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Keep Reservation
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={cancellingId !== null}
                  className="flex-1 bg-red-600 text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancellingId !== null ? 'Cancelling...' : 'Cancel Reservation'}
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
