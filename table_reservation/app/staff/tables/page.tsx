'use client';

import { useState } from 'react';
import StaffSidebar from '@/components/staff/StaffSidebar';

// Mock data
const mockTables = [
  { id: 1, number: 1, capacity: 2, location: 'Window', status: 'occupied', currentGuests: 2, reservationId: 'RES-104' },
  { id: 2, number: 2, capacity: 4, location: 'Window', status: 'available', currentGuests: 0, reservationId: null },
  { id: 3, number: 3, capacity: 4, location: 'Center', status: 'reserved', currentGuests: 0, reservationId: 'RES-102' },
  { id: 4, number: 4, capacity: 2, location: 'Window', status: 'available', currentGuests: 0, reservationId: null },
  { id: 5, number: 5, capacity: 4, location: 'Window', status: 'occupied', currentGuests: 4, reservationId: 'RES-101' },
  { id: 6, number: 6, capacity: 6, location: 'Center', status: 'available', currentGuests: 0, reservationId: null },
  { id: 7, number: 7, capacity: 4, location: 'Patio', status: 'available', currentGuests: 0, reservationId: null },
  { id: 8, number: 8, capacity: 4, location: 'Center', status: 'reserved', currentGuests: 0, reservationId: 'RES-105' },
  { id: 9, number: 9, capacity: 2, location: 'Bar', status: 'occupied', currentGuests: 2, reservationId: null },
  { id: 10, number: 10, capacity: 6, location: 'Private', status: 'reserved', currentGuests: 0, reservationId: 'RES-103' },
  { id: 11, number: 11, capacity: 4, location: 'Patio', status: 'available', currentGuests: 0, reservationId: null },
  { id: 12, number: 12, capacity: 2, location: 'Center', status: 'reserved', currentGuests: 0, reservationId: 'RES-102' },
  { id: 13, number: 13, capacity: 8, location: 'Private', status: 'available', currentGuests: 0, reservationId: null },
  { id: 14, number: 14, capacity: 4, location: 'Bar', status: 'occupied', currentGuests: 3, reservationId: null },
  { id: 15, number: 15, capacity: 2, location: 'Window', status: 'available', currentGuests: 0, reservationId: null },
];

export default function StaffTablesPage() {
  const [filter, setFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [selectedTable, setSelectedTable] = useState<typeof mockTables[0] | null>(null);

  const filteredTables = mockTables.filter(table => {
    const matchesStatus = filter === 'all' || table.status === filter;
    const matchesLocation = locationFilter === 'all' || table.location === locationFilter;
    return matchesStatus && matchesLocation;
  });

  const stats = {
    total: mockTables.length,
    available: mockTables.filter(t => t.status === 'available').length,
    occupied: mockTables.filter(t => t.status === 'occupied').length,
    reserved: mockTables.filter(t => t.status === 'reserved').length,
  };

  const handleUpdateTableStatus = (tableId: number, newStatus: string) => {
    console.log(`Updating table ${tableId} to status: ${newStatus}`);
    // In a real app, this would update the database
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'occupied':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'reserved':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8F4F0]">
      <StaffSidebar />

      <main className="flex-1 ml-64 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#333333]">Table Management</h1>
            <p className="text-sm text-[#333333] opacity-70 mt-1">
              Real-time table status and seating management
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-white rounded-lg shadow-md p-3">
              <p className="text-xs text-[#333333] opacity-70 mb-1">Total Tables</p>
              <p className="text-2xl font-bold text-[#333333]">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3">
              <p className="text-xs text-[#333333] opacity-70 mb-1">Available</p>
              <p className="text-2xl font-bold text-green-600">{stats.available}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3">
              <p className="text-xs text-[#333333] opacity-70 mb-1">Occupied</p>
              <p className="text-2xl font-bold text-red-600">{stats.occupied}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3">
              <p className="text-xs text-[#333333] opacity-70 mb-1">Reserved</p>
              <p className="text-2xl font-bold text-blue-600">{stats.reserved}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-3 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-2">Filter by Status</label>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-colors ${
                      filter === 'all'
                        ? 'bg-[#FF6B35] text-white'
                        : 'bg-gray-100 text-[#333333] hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('available')}
                    className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-colors ${
                      filter === 'available'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-[#333333] hover:bg-gray-200'
                    }`}
                  >
                    Available
                  </button>
                  <button
                    onClick={() => setFilter('occupied')}
                    className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-colors ${
                      filter === 'occupied'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-[#333333] hover:bg-gray-200'
                    }`}
                  >
                    Occupied
                  </button>
                  <button
                    onClick={() => setFilter('reserved')}
                    className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-colors ${
                      filter === 'reserved'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-[#333333] hover:bg-gray-200'
                    }`}
                  >
                    Reserved
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-2">Filter by Location</label>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none bg-white"
                >
                  <option value="all">All Locations</option>
                  <option value="Window">Window</option>
                  <option value="Center">Center</option>
                  <option value="Patio">Patio</option>
                  <option value="Bar">Bar</option>
                  <option value="Private">Private</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tables Grid View */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h2 className="text-xl font-bold text-[#333333] mb-4">Table Layout</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredTables.map((table) => (
                <button
                  key={table.id}
                  onClick={() => setSelectedTable(table)}
                  className={`p-4 rounded-lg border-2 transition-all hover:shadow-lg ${getStatusColor(table.status)}`}
                >
                  <div className="text-center">
                    <p className="text-xl font-bold mb-1">#{table.number}</p>
                    <p className="text-xs opacity-70 mb-2">{table.location}</p>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                      </svg>
                      <span className="text-xs font-semibold">
                        {table.status === 'occupied' ? `${table.currentGuests}/` : ''}{table.capacity}
                      </span>
                    </div>
                    <p className="text-xs font-bold uppercase">
                      {table.status}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tables List View */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-bold text-[#333333] mb-4">Table List</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Table #</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Capacity</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Location</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Status</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Current Guests</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Reservation</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTables.map((table) => (
                    <tr key={table.id} className="border-b border-gray-100 hover:bg-[#F8F4F0] transition-colors">
                      <td className="py-3 px-3 text-xs font-bold text-[#333333]">#{table.number}</td>
                      <td className="py-3 px-3 text-xs text-[#333333]">{table.capacity} seats</td>
                      <td className="py-3 px-3 text-xs text-[#333333]">{table.location}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          table.status === 'available'
                            ? 'bg-green-100 text-green-800'
                            : table.status === 'occupied'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs text-[#333333]">
                        {table.status === 'occupied' ? `${table.currentGuests} guests` : '-'}
                      </td>
                      <td className="py-3 px-3 text-xs text-[#333333]">
                        {table.reservationId || '-'}
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => setSelectedTable(table)}
                          className="text-[#FF6B35] hover:text-[#e55a2b] text-xs font-semibold"
                        >
                          Manage
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

      {/* Table Details Modal */}
      {selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-[#333333]">Table #{selectedTable.number}</h2>
                <p className="text-xs text-[#333333] opacity-70">{selectedTable.location}</p>
              </div>
              <button
                onClick={() => setSelectedTable(null)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <svg className="w-5 h-5 text-[#333333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#333333] opacity-70 mb-1">Capacity</p>
                    <p className="text-sm font-semibold text-[#333333]">{selectedTable.capacity} seats</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#333333] opacity-70 mb-1">Current Status</p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                      selectedTable.status === 'available'
                        ? 'bg-green-100 text-green-800'
                        : selectedTable.status === 'occupied'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedTable.status.charAt(0).toUpperCase() + selectedTable.status.slice(1)}
                    </span>
                  </div>
                </div>
                {selectedTable.status === 'occupied' && (
                  <div>
                    <p className="text-xs text-[#333333] opacity-70 mb-1">Current Guests</p>
                    <p className="text-sm font-semibold text-[#333333]">{selectedTable.currentGuests} guests</p>
                  </div>
                )}
                {selectedTable.reservationId && (
                  <div>
                    <p className="text-xs text-[#333333] opacity-70 mb-1">Reservation ID</p>
                    <p className="text-sm font-semibold text-[#333333]">{selectedTable.reservationId}</p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {selectedTable.status === 'occupied' && (
                  <button
                    onClick={() => {
                      handleUpdateTableStatus(selectedTable.id, 'available');
                      setSelectedTable(null);
                    }}
                    className="w-full bg-green-600 text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Clear Table
                  </button>
                )}
                {selectedTable.status === 'available' && (
                  <button
                    onClick={() => {
                      handleUpdateTableStatus(selectedTable.id, 'occupied');
                      setSelectedTable(null);
                    }}
                    className="w-full bg-red-600 text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    Mark as Occupied
                  </button>
                )}
                {selectedTable.status === 'reserved' && (
                  <button
                    onClick={() => {
                      handleUpdateTableStatus(selectedTable.id, 'occupied');
                      setSelectedTable(null);
                    }}
                    className="w-full bg-blue-600 text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Seat Reserved Guests
                  </button>
                )}
                <button
                  onClick={() => setSelectedTable(null)}
                  className="w-full bg-gray-200 text-[#333333] px-4 py-2 text-sm rounded-lg font-semibold hover:bg-gray-300 transition-colors"
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
