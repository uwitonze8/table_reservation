'use client';

import { useState } from 'react';
import StaffSidebar from '@/components/staff/StaffSidebar';

// Mock data
const mockReservations = [
  { id: 'RES-101', customer: 'John Smith', phone: '555-0101', time: '12:00 PM', guests: 4, table: 5, status: 'seated', notes: 'Window seat preferred' },
  { id: 'RES-102', customer: 'Sarah Johnson', phone: '555-0102', time: '1:30 PM', guests: 2, table: 12, status: 'confirmed', notes: '' },
  { id: 'RES-103', customer: 'Michael Brown', phone: '555-0103', time: '2:00 PM', guests: 6, table: 10, status: 'arriving', notes: 'Birthday celebration' },
  { id: 'RES-104', customer: 'Emily Davis', phone: '555-0104', time: '6:00 PM', guests: 2, table: 1, status: 'confirmed', notes: '' },
  { id: 'RES-105', customer: 'David Wilson', phone: '555-0105', time: '7:30 PM', guests: 4, table: 8, status: 'confirmed', notes: 'Anniversary dinner' },
  { id: 'RES-106', customer: 'Lisa Anderson', phone: '555-0106', time: '8:00 PM', guests: 3, table: 14, status: 'pending', notes: '' },
];

export default function StaffReservationsPage() {
  const [filter, setFilter] = useState('all');
  const [selectedReservation, setSelectedReservation] = useState<typeof mockReservations[0] | null>(null);

  const filteredReservations = mockReservations.filter(reservation => {
    if (filter === 'all') return true;
    return reservation.status === filter;
  });

  const stats = {
    total: mockReservations.length,
    seated: mockReservations.filter(r => r.status === 'seated').length,
    arriving: mockReservations.filter(r => r.status === 'arriving').length,
    confirmed: mockReservations.filter(r => r.status === 'confirmed').length,
    pending: mockReservations.filter(r => r.status === 'pending').length,
  };

  const handleUpdateStatus = (reservationId: string, newStatus: string) => {
    console.log(`Updating reservation ${reservationId} to status: ${newStatus}`);
    // In a real app, this would update the database
  };

  const handleSeatGuests = (reservation: typeof mockReservations[0]) => {
    console.log(`Seating guests for reservation: ${reservation.id}`);
    handleUpdateStatus(reservation.id, 'seated');
  };

  return (
    <div className="flex min-h-screen bg-[#F8F4F0]">
      <StaffSidebar />

      <main className="flex-1 ml-64 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#333333]">Today's Reservations</h1>
            <p className="text-sm text-[#333333] opacity-70 mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <div className="bg-white rounded-lg shadow-md p-3">
              <p className="text-xs text-[#333333] opacity-70 mb-1">Total</p>
              <p className="text-2xl font-bold text-[#333333]">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3">
              <p className="text-xs text-[#333333] opacity-70 mb-1">Seated</p>
              <p className="text-2xl font-bold text-green-600">{stats.seated}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3">
              <p className="text-xs text-[#333333] opacity-70 mb-1">Arriving</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.arriving}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3">
              <p className="text-xs text-[#333333] opacity-70 mb-1">Confirmed</p>
              <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3">
              <p className="text-xs text-[#333333] opacity-70 mb-1">Pending</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-lg shadow-md p-3 mb-4">
            <div className="flex gap-2 overflow-x-auto">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 text-xs rounded-lg font-semibold transition-colors whitespace-nowrap ${
                  filter === 'all'
                    ? 'bg-[#FF6B35] text-white'
                    : 'bg-gray-100 text-[#333333] hover:bg-gray-200'
                }`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setFilter('seated')}
                className={`px-4 py-2 text-xs rounded-lg font-semibold transition-colors whitespace-nowrap ${
                  filter === 'seated'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-[#333333] hover:bg-gray-200'
                }`}
              >
                Seated ({stats.seated})
              </button>
              <button
                onClick={() => setFilter('arriving')}
                className={`px-4 py-2 text-xs rounded-lg font-semibold transition-colors whitespace-nowrap ${
                  filter === 'arriving'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 text-[#333333] hover:bg-gray-200'
                }`}
              >
                Arriving ({stats.arriving})
              </button>
              <button
                onClick={() => setFilter('confirmed')}
                className={`px-4 py-2 text-xs rounded-lg font-semibold transition-colors whitespace-nowrap ${
                  filter === 'confirmed'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-[#333333] hover:bg-gray-200'
                }`}
              >
                Confirmed ({stats.confirmed})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 text-xs rounded-lg font-semibold transition-colors whitespace-nowrap ${
                  filter === 'pending'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-[#333333] hover:bg-gray-200'
                }`}
              >
                Pending ({stats.pending})
              </button>
            </div>
          </div>

          {/* Reservations Table */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-bold text-[#333333] mb-4">Reservations</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">ID</th>
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
                      <td className="py-3 px-3 text-xs text-[#333333] font-medium">{reservation.id}</td>
                      <td className="py-3 px-3 text-xs font-semibold text-[#333333]">{reservation.customer}</td>
                      <td className="py-3 px-3 text-xs text-[#333333]">{reservation.phone}</td>
                      <td className="py-3 px-3 text-xs text-[#333333]">{reservation.time}</td>
                      <td className="py-3 px-3 text-xs text-[#333333]">{reservation.guests}</td>
                      <td className="py-3 px-3 text-xs text-[#333333]">Table {reservation.table}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          reservation.status === 'seated'
                            ? 'bg-green-100 text-green-800'
                            : reservation.status === 'arriving'
                            ? 'bg-yellow-100 text-yellow-800'
                            : reservation.status === 'confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedReservation(reservation)}
                            className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                            title="View Details"
                          >
                            View
                          </button>
                          {reservation.status === 'confirmed' && (
                            <button
                              onClick={() => handleUpdateStatus(reservation.id, 'arriving')}
                              className="text-yellow-600 hover:text-yellow-800 text-xs font-semibold"
                              title="Mark as Arriving"
                            >
                              Arriving
                            </button>
                          )}
                          {(reservation.status === 'confirmed' || reservation.status === 'arriving') && (
                            <button
                              onClick={() => handleSeatGuests(reservation)}
                              className="text-green-600 hover:text-green-800 text-xs font-semibold"
                              title="Seat Guests"
                            >
                              Seat
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Reservation Details Modal */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-[#333333]">Reservation Details</h2>
                <p className="text-xs text-[#333333] opacity-70">{selectedReservation.id}</p>
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
                  <p className="text-sm font-semibold text-[#333333]">{selectedReservation.customer}</p>
                </div>
                <div>
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Phone Number</p>
                  <p className="text-sm font-semibold text-[#333333]">{selectedReservation.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Time</p>
                  <p className="text-sm font-semibold text-[#333333]">{selectedReservation.time}</p>
                </div>
                <div>
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Party Size</p>
                  <p className="text-sm font-semibold text-[#333333]">{selectedReservation.guests} guests</p>
                </div>
                <div>
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Table Number</p>
                  <p className="text-sm font-semibold text-[#333333]">Table {selectedReservation.table}</p>
                </div>
                <div>
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Status</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                    selectedReservation.status === 'seated'
                      ? 'bg-green-100 text-green-800'
                      : selectedReservation.status === 'arriving'
                      ? 'bg-yellow-100 text-yellow-800'
                      : selectedReservation.status === 'confirmed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {selectedReservation.status.charAt(0).toUpperCase() + selectedReservation.status.slice(1)}
                  </span>
                </div>
                {selectedReservation.notes && (
                  <div className="col-span-2">
                    <p className="text-xs text-[#333333] opacity-70 mb-1">Special Notes</p>
                    <p className="text-sm text-[#333333] bg-[#F8F4F0] p-2 rounded">{selectedReservation.notes}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {selectedReservation.status === 'confirmed' && (
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedReservation.id, 'arriving');
                      setSelectedReservation(null);
                    }}
                    className="flex-1 bg-yellow-600 text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-yellow-700 transition-colors"
                  >
                    Mark as Arriving
                  </button>
                )}
                {(selectedReservation.status === 'confirmed' || selectedReservation.status === 'arriving') && (
                  <button
                    onClick={() => {
                      handleSeatGuests(selectedReservation);
                      setSelectedReservation(null);
                    }}
                    className="flex-1 bg-green-600 text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Seat Guests
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
    </div>
  );
}
