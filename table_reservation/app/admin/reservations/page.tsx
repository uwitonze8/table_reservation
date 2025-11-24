'use client';

import { useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import Link from 'next/link';

// Mock data
const mockReservations = [
  { id: 'RES-101', customer: 'John Smith', email: 'john@example.com', phone: '555-0101', date: '2025-11-24', time: '12:00 PM', guests: 4, table: 5, status: 'confirmed', notes: 'Window seat preferred' },
  { id: 'RES-102', customer: 'Sarah Johnson', email: 'sarah@example.com', phone: '555-0102', date: '2025-11-24', time: '1:30 PM', guests: 2, table: 12, status: 'confirmed', notes: '' },
  { id: 'RES-103', customer: 'Michael Brown', email: 'michael@example.com', phone: '555-0103', date: '2025-11-24', time: '2:00 PM', guests: 6, table: 10, status: 'pending', notes: 'Birthday celebration' },
  { id: 'RES-104', customer: 'Emily Davis', email: 'emily@example.com', phone: '555-0104', date: '2025-11-24', time: '6:00 PM', guests: 2, table: 1, status: 'confirmed', notes: '' },
  { id: 'RES-105', customer: 'David Wilson', email: 'david@example.com', phone: '555-0105', date: '2025-11-24', time: '7:30 PM', guests: 4, table: 8, status: 'confirmed', notes: 'Vegetarian options needed' },
  { id: 'RES-106', customer: 'Lisa Anderson', email: 'lisa@example.com', phone: '555-0106', date: '2025-11-25', time: '12:30 PM', guests: 3, table: 7, status: 'pending', notes: '' },
  { id: 'RES-107', customer: 'Robert Martinez', email: 'robert@example.com', phone: '555-0107', date: '2025-11-25', time: '1:00 PM', guests: 2, table: 15, status: 'cancelled', notes: '' },
  { id: 'RES-108', customer: 'Jennifer Taylor', email: 'jennifer@example.com', phone: '555-0108', date: '2025-11-25', time: '7:00 PM', guests: 5, table: 18, status: 'confirmed', notes: 'Anniversary dinner' },
];

export default function AdminReservationsPage() {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReservation, setSelectedReservation] = useState<typeof mockReservations[0] | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [newReservation, setNewReservation] = useState({
    customer: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: '2',
    table: '',
    notes: ''
  });
  const [editingReservation, setEditingReservation] = useState<typeof mockReservations[0] | null>(null);
  const [reservationToCancel, setReservationToCancel] = useState<typeof mockReservations[0] | null>(null);

  const filteredReservations = mockReservations.filter(reservation => {
    const matchesFilter = filter === 'all' || reservation.status === filter;
    const matchesSearch = searchQuery === '' ||
      reservation.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reservation.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reservation.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: mockReservations.length,
    confirmed: mockReservations.filter(r => r.status === 'confirmed').length,
    pending: mockReservations.filter(r => r.status === 'pending').length,
    cancelled: mockReservations.filter(r => r.status === 'cancelled').length,
  };

  const handleAddReservation = () => {
    console.log('Adding reservation:', newReservation);
    // In a real app, this would call an API to create the reservation
    setShowAddModal(false);
    setNewReservation({
      customer: '',
      email: '',
      phone: '',
      date: '',
      time: '',
      guests: '2',
      table: '',
      notes: ''
    });
  };

  const handleEditReservation = (reservation: typeof mockReservations[0]) => {
    setEditingReservation({ ...reservation });
    setShowEditModal(true);
    setSelectedReservation(null);
  };

  const handleSaveEdit = () => {
    if (editingReservation) {
      console.log('Saving reservation:', editingReservation);
      // In a real app, this would update the database
      setShowEditModal(false);
      setEditingReservation(null);
    }
  };

  const handleConfirmReservation = (reservation: typeof mockReservations[0]) => {
    console.log('Confirming reservation:', reservation.id);
    // In a real app, this would update the status to 'confirmed'
  };

  const handleCancelClick = (reservation: typeof mockReservations[0]) => {
    setReservationToCancel(reservation);
    setShowCancelDialog(true);
    setSelectedReservation(null);
  };

  const handleConfirmCancel = () => {
    if (reservationToCancel) {
      console.log('Cancelling reservation:', reservationToCancel.id);
      // In a real app, this would update the status to 'cancelled'
      setShowCancelDialog(false);
      setReservationToCancel(null);
    }
  };

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
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm bg-[#FF6B35] text-white rounded-lg hover:bg-[#e55a2b] transition-colors font-semibold"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                New Reservation
              </button>
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
              <p className="text-xs text-[#333333] opacity-70 mb-0.5">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
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
                  className={`px-4 py-2 text-xs rounded-lg font-semibold transition-all ${
                    filter === 'all'
                      ? 'bg-[#FF6B35] text-white'
                      : 'bg-gray-100 text-[#333333] hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('confirmed')}
                  className={`px-4 py-2 text-xs rounded-lg font-semibold transition-all ${
                    filter === 'confirmed'
                      ? 'bg-[#FF6B35] text-white'
                      : 'bg-gray-100 text-[#333333] hover:bg-gray-200'
                  }`}
                >
                  Confirmed
                </button>
                <button
                  onClick={() => setFilter('pending')}
                  className={`px-4 py-2 text-xs rounded-lg font-semibold transition-all ${
                    filter === 'pending'
                      ? 'bg-[#FF6B35] text-white'
                      : 'bg-gray-100 text-[#333333] hover:bg-gray-200'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setFilter('cancelled')}
                  className={`px-4 py-2 text-xs rounded-lg font-semibold transition-all ${
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
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Status</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.map((reservation) => (
                    <tr key={reservation.id} className="border-b border-gray-100 hover:bg-[#F8F4F0] transition-colors">
                      <td className="py-3 px-3 text-xs text-[#333333] font-medium">{reservation.id}</td>
                      <td className="py-3 px-3 text-xs text-[#333333]">{reservation.customer}</td>
                      <td className="py-3 px-3 text-xs text-[#333333]">
                        <div>{reservation.email}</div>
                        <div className="text-[#333333] opacity-60">{reservation.phone}</div>
                      </td>
                      <td className="py-3 px-3 text-xs text-[#333333]">
                        <div>{new Date(reservation.date).toLocaleDateString()}</div>
                        <div className="text-[#333333] opacity-60">{reservation.time}</div>
                      </td>
                      <td className="py-3 px-3 text-xs text-[#333333]">{reservation.guests}</td>
                      <td className="py-3 px-3 text-xs text-[#333333]">Table {reservation.table}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          reservation.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : reservation.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => setSelectedReservation(reservation)}
                            className="p-1 text-[#FF6B35] hover:bg-[#FF6B35] hover:bg-opacity-10 rounded transition-colors"
                            title="View Details"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEditReservation(reservation)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          {reservation.status === 'pending' && (
                            <button
                              onClick={() => handleConfirmReservation(reservation)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                              title="Confirm"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          )}
                          {reservation.status !== 'cancelled' && (
                            <button
                              onClick={() => handleCancelClick(reservation)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
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

            {filteredReservations.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-[#333333] opacity-70">No reservations found</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Reservation Details Modal */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#333333]">Reservation Details</h2>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Reservation ID</p>
                  <p className="text-sm font-semibold text-[#333333]">{selectedReservation.id}</p>
                </div>
                <div>
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Status</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                    selectedReservation.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : selectedReservation.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedReservation.status.charAt(0).toUpperCase() + selectedReservation.status.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Customer Name</p>
                  <p className="text-sm font-semibold text-[#333333]">{selectedReservation.customer}</p>
                </div>
                <div>
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Email</p>
                  <p className="text-sm text-[#333333]">{selectedReservation.email}</p>
                </div>
                <div>
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Phone</p>
                  <p className="text-sm text-[#333333]">{selectedReservation.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Date & Time</p>
                  <p className="text-sm font-semibold text-[#333333]">
                    {new Date(selectedReservation.date).toLocaleDateString()} at {selectedReservation.time}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Number of Guests</p>
                  <p className="text-sm font-semibold text-[#333333]">{selectedReservation.guests}</p>
                </div>
                <div>
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Table</p>
                  <p className="text-sm font-semibold text-[#333333]">Table {selectedReservation.table}</p>
                </div>
                {selectedReservation.notes && (
                  <div className="col-span-2">
                    <p className="text-xs text-[#333333] opacity-70 mb-1">Special Notes</p>
                    <p className="text-sm text-[#333333] bg-[#F8F4F0] p-2 rounded">{selectedReservation.notes}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-6">
                {selectedReservation.status === 'pending' && (
                  <button
                    onClick={() => handleConfirmReservation(selectedReservation)}
                    className="flex-1 bg-green-600 text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Confirm Reservation
                  </button>
                )}
                <button
                  onClick={() => handleEditReservation(selectedReservation)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Edit Details
                </button>
                {selectedReservation.status !== 'cancelled' && (
                  <button
                    onClick={() => handleCancelClick(selectedReservation)}
                    className="flex-1 bg-red-600 text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    Cancel Reservation
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Reservation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-[#333333]">New Reservation</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewReservation({
                    customer: '',
                    email: '',
                    phone: '',
                    date: '',
                    time: '',
                    guests: '2',
                    table: '',
                    notes: ''
                  });
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <svg className="w-5 h-5 text-[#333333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <form onSubmit={(e) => {
                e.preventDefault();
                handleAddReservation();
              }} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-2">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={newReservation.customer}
                    onChange={(e) => setNewReservation({ ...newReservation, customer: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                    placeholder="Enter customer name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#333333] mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={newReservation.email}
                      onChange={(e) => setNewReservation({ ...newReservation, email: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                      placeholder="customer@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#333333] mb-2">Phone *</label>
                    <input
                      type="tel"
                      required
                      value={newReservation.phone}
                      onChange={(e) => setNewReservation({ ...newReservation, phone: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                      placeholder="555-0000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#333333] mb-2">Date *</label>
                    <input
                      type="date"
                      required
                      value={newReservation.date}
                      onChange={(e) => setNewReservation({ ...newReservation, date: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#333333] mb-2">Time *</label>
                    <input
                      type="time"
                      required
                      value={newReservation.time}
                      onChange={(e) => setNewReservation({ ...newReservation, time: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#333333] mb-2">Number of Guests *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="20"
                      value={newReservation.guests}
                      onChange={(e) => setNewReservation({ ...newReservation, guests: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#333333] mb-2">Table Number *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newReservation.table}
                      onChange={(e) => setNewReservation({ ...newReservation, table: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                      placeholder="Table number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-2">Special Notes</label>
                  <textarea
                    value={newReservation.notes}
                    onChange={(e) => setNewReservation({ ...newReservation, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none resize-none"
                    placeholder="Any special requests or notes..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setNewReservation({
                        customer: '',
                        email: '',
                        phone: '',
                        date: '',
                        time: '',
                        guests: '2',
                        table: '',
                        notes: ''
                      });
                    }}
                    className="flex-1 bg-gray-200 text-[#333333] px-4 py-2 text-sm rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#FF6B35] text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-[#e55a2b] transition-colors"
                  >
                    Create Reservation
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Reservation Modal */}
      {showEditModal && editingReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <div>
                <h2 className="text-xl font-bold text-[#333333]">Edit Reservation</h2>
                <p className="text-xs text-[#333333] opacity-70">{editingReservation.id}</p>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingReservation(null);
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <svg className="w-5 h-5 text-[#333333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-2">Customer Name</label>
                  <input
                    type="text"
                    value={editingReservation.customer}
                    onChange={(e) => setEditingReservation({ ...editingReservation, customer: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#333333] mb-2">Email</label>
                    <input
                      type="email"
                      value={editingReservation.email}
                      onChange={(e) => setEditingReservation({ ...editingReservation, email: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#333333] mb-2">Phone</label>
                    <input
                      type="tel"
                      value={editingReservation.phone}
                      onChange={(e) => setEditingReservation({ ...editingReservation, phone: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#333333] mb-2">Date</label>
                    <input
                      type="date"
                      value={editingReservation.date}
                      onChange={(e) => setEditingReservation({ ...editingReservation, date: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#333333] mb-2">Time</label>
                    <input
                      type="text"
                      value={editingReservation.time}
                      onChange={(e) => setEditingReservation({ ...editingReservation, time: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                      placeholder="e.g., 7:00 PM"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#333333] mb-2">Guests</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={editingReservation.guests}
                      onChange={(e) => setEditingReservation({ ...editingReservation, guests: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#333333] mb-2">Table</label>
                    <input
                      type="number"
                      min="1"
                      value={editingReservation.table}
                      onChange={(e) => setEditingReservation({ ...editingReservation, table: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#333333] mb-2">Status</label>
                    <select
                      value={editingReservation.status}
                      onChange={(e) => setEditingReservation({ ...editingReservation, status: e.target.value as 'confirmed' | 'pending' | 'cancelled' })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-2">Special Notes</label>
                  <textarea
                    value={editingReservation.notes}
                    onChange={(e) => setEditingReservation({ ...editingReservation, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingReservation(null);
                  }}
                  className="flex-1 bg-gray-200 text-[#333333] px-4 py-2 text-sm rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 bg-[#FF6B35] text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-[#e55a2b] transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && reservationToCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                Are you sure you want to cancel the reservation for <span className="font-semibold">{reservationToCancel.customer}</span>?
              </p>
              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-[#333333] opacity-70">Reservation ID</p>
                    <p className="font-semibold text-[#333333]">{reservationToCancel.id}</p>
                  </div>
                  <div>
                    <p className="text-[#333333] opacity-70">Date & Time</p>
                    <p className="font-semibold text-[#333333]">
                      {new Date(reservationToCancel.date).toLocaleDateString()} at {reservationToCancel.time}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#333333] opacity-70">Guests</p>
                    <p className="font-semibold text-[#333333]">{reservationToCancel.guests}</p>
                  </div>
                  <div>
                    <p className="text-[#333333] opacity-70">Table</p>
                    <p className="font-semibold text-[#333333]">Table {reservationToCancel.table}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCancelDialog(false);
                    setReservationToCancel(null);
                  }}
                  className="flex-1 bg-gray-200 text-[#333333] px-4 py-2 text-sm rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Keep Reservation
                </button>
                <button
                  onClick={handleConfirmCancel}
                  className="flex-1 bg-red-600 text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Cancel Reservation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
