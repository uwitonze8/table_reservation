'use client';

import { useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';

// Mock data
const mockTables = [
  { id: 1, number: 1, capacity: 2, location: 'Window', status: 'available', shape: 'round' },
  { id: 2, number: 2, capacity: 2, location: 'Window', status: 'occupied', shape: 'square' },
  { id: 3, number: 3, capacity: 4, location: 'Center', status: 'available', shape: 'square' },
  { id: 4, number: 4, capacity: 4, location: 'Center', status: 'reserved', shape: 'rectangle' },
  { id: 5, number: 5, capacity: 4, location: 'Center', status: 'available', shape: 'square' },
  { id: 6, number: 6, capacity: 6, location: 'Center', status: 'occupied', shape: 'rectangle' },
  { id: 7, number: 7, capacity: 2, location: 'Patio', status: 'available', shape: 'round' },
  { id: 8, number: 8, capacity: 4, location: 'Patio', status: 'available', shape: 'square' },
  { id: 9, number: 9, capacity: 4, location: 'Patio', status: 'maintenance', shape: 'square' },
  { id: 10, number: 10, capacity: 6, location: 'Center', status: 'reserved', shape: 'rectangle' },
  { id: 11, number: 11, capacity: 8, location: 'Private', status: 'available', shape: 'rectangle' },
  { id: 12, number: 12, capacity: 2, location: 'Window', status: 'occupied', shape: 'round' },
  { id: 13, number: 13, capacity: 4, location: 'Bar', status: 'available', shape: 'square' },
  { id: 14, number: 14, capacity: 4, location: 'Bar', status: 'available', shape: 'square' },
  { id: 15, number: 15, capacity: 2, location: 'Window', status: 'available', shape: 'round' },
];

export default function AdminTablesPage() {
  const [filter, setFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [selectedTable, setSelectedTable] = useState<typeof mockTables[0] | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTable, setNewTable] = useState({
    number: '',
    capacity: '',
    location: 'Window',
    shape: 'square'
  });

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
    maintenance: mockTables.filter(t => t.status === 'maintenance').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-red-100 text-red-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      case 'maintenance':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
                <h1 className="text-2xl font-bold text-[#333333] mb-1">Table Management</h1>
                <p className="text-sm text-[#333333] opacity-70">
                  Manage restaurant tables and seating arrangements
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm bg-[#FF6B35] text-white rounded-lg hover:bg-[#e55a2b] transition-colors font-semibold"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Table
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <div className="bg-white rounded-lg shadow-md p-3">
              <p className="text-xs text-[#333333] opacity-70 mb-0.5">Total Tables</p>
              <p className="text-2xl font-bold text-[#333333]">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3">
              <p className="text-xs text-[#333333] opacity-70 mb-0.5">Available</p>
              <p className="text-2xl font-bold text-green-600">{stats.available}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3">
              <p className="text-xs text-[#333333] opacity-70 mb-0.5">Occupied</p>
              <p className="text-2xl font-bold text-red-600">{stats.occupied}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3">
              <p className="text-xs text-[#333333] opacity-70 mb-0.5">Reserved</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.reserved}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3">
              <p className="text-xs text-[#333333] opacity-70 mb-0.5">Maintenance</p>
              <p className="text-2xl font-bold text-gray-600">{stats.maintenance}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-[#333333] mb-2">Status</label>
                <div className="flex gap-2 flex-wrap">
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
                    onClick={() => setFilter('available')}
                    className={`px-4 py-2 text-xs rounded-lg font-semibold transition-all ${
                      filter === 'available'
                        ? 'bg-[#FF6B35] text-white'
                        : 'bg-gray-100 text-[#333333] hover:bg-gray-200'
                    }`}
                  >
                    Available
                  </button>
                  <button
                    onClick={() => setFilter('occupied')}
                    className={`px-4 py-2 text-xs rounded-lg font-semibold transition-all ${
                      filter === 'occupied'
                        ? 'bg-[#FF6B35] text-white'
                        : 'bg-gray-100 text-[#333333] hover:bg-gray-200'
                    }`}
                  >
                    Occupied
                  </button>
                  <button
                    onClick={() => setFilter('reserved')}
                    className={`px-4 py-2 text-xs rounded-lg font-semibold transition-all ${
                      filter === 'reserved'
                        ? 'bg-[#FF6B35] text-white'
                        : 'bg-gray-100 text-[#333333] hover:bg-gray-200'
                    }`}
                  >
                    Reserved
                  </button>
                  <button
                    onClick={() => setFilter('maintenance')}
                    className={`px-4 py-2 text-xs rounded-lg font-semibold transition-all ${
                      filter === 'maintenance'
                        ? 'bg-[#FF6B35] text-white'
                        : 'bg-gray-100 text-[#333333] hover:bg-gray-200'
                    }`}
                  >
                    Maintenance
                  </button>
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-[#333333] mb-2">Location</label>
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

          {/* Tables Grid */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-bold text-[#333333] mb-4">Tables</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredTables.map((table) => (
                <div
                  key={table.id}
                  onClick={() => setSelectedTable(table)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
                    table.status === 'available'
                      ? 'border-green-300 bg-green-50'
                      : table.status === 'occupied'
                      ? 'border-red-300 bg-red-50'
                      : table.status === 'reserved'
                      ? 'border-yellow-300 bg-yellow-50'
                      : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-lg font-bold text-[#333333]">#{table.number}</div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(table.status)}`}>
                      {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-[#333333]">
                      <svg className="w-3.5 h-3.5 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="font-semibold">{table.capacity} seats</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#333333]">
                      <svg className="w-3.5 h-3.5 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{table.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#333333]">
                      <svg className="w-3.5 h-3.5 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                      </svg>
                      <span className="capitalize">{table.shape}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredTables.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-[#333333] opacity-70">No tables found</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Table Details Modal */}
      {selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#333333]">Table #{selectedTable.number}</h2>
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
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Status</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(selectedTable.status)}`}>
                    {selectedTable.status.charAt(0).toUpperCase() + selectedTable.status.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Capacity</p>
                  <p className="text-sm font-semibold text-[#333333]">{selectedTable.capacity} seats</p>
                </div>
                <div>
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Location</p>
                  <p className="text-sm font-semibold text-[#333333]">{selectedTable.location}</p>
                </div>
                <div>
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Shape</p>
                  <p className="text-sm font-semibold text-[#333333] capitalize">{selectedTable.shape}</p>
                </div>
                <div>
                  <p className="text-xs text-[#333333] opacity-70 mb-2">Change Status</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="px-3 py-2 text-xs bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
                      Set Available
                    </button>
                    <button className="px-3 py-2 text-xs bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors">
                      Set Occupied
                    </button>
                    <button className="px-3 py-2 text-xs bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-colors">
                      Set Reserved
                    </button>
                    <button className="px-3 py-2 text-xs bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors">
                      Maintenance
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button className="flex-1 bg-blue-600 text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Edit Details
                </button>
                <button className="flex-1 bg-red-600 text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-red-700 transition-colors">
                  Delete Table
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Table Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#333333]">Add New Table</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewTable({ number: '', capacity: '', location: 'Window', shape: 'square' });
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
                // In a real app, this would call an API to create the table
                console.log('Adding table:', newTable);
                setShowAddModal(false);
                setNewTable({ number: '', capacity: '', location: 'Window', shape: 'square' });
              }} className="space-y-4">
                <div>
                  <label htmlFor="tableNumber" className="block text-xs font-semibold text-[#333333] mb-2">
                    Table Number *
                  </label>
                  <input
                    type="number"
                    id="tableNumber"
                    required
                    value={newTable.number}
                    onChange={(e) => setNewTable({ ...newTable, number: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                    placeholder="Enter table number"
                  />
                </div>

                <div>
                  <label htmlFor="capacity" className="block text-xs font-semibold text-[#333333] mb-2">
                    Capacity (seats) *
                  </label>
                  <input
                    type="number"
                    id="capacity"
                    required
                    min="1"
                    max="20"
                    value={newTable.capacity}
                    onChange={(e) => setNewTable({ ...newTable, capacity: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                    placeholder="Number of seats"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-xs font-semibold text-[#333333] mb-2">
                    Location *
                  </label>
                  <select
                    id="location"
                    required
                    value={newTable.location}
                    onChange={(e) => setNewTable({ ...newTable, location: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none bg-white"
                  >
                    <option value="Window">Window</option>
                    <option value="Center">Center</option>
                    <option value="Patio">Patio</option>
                    <option value="Bar">Bar</option>
                    <option value="Private">Private</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="shape" className="block text-xs font-semibold text-[#333333] mb-2">
                    Shape *
                  </label>
                  <select
                    id="shape"
                    required
                    value={newTable.shape}
                    onChange={(e) => setNewTable({ ...newTable, shape: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none bg-white"
                  >
                    <option value="square">Square</option>
                    <option value="round">Round</option>
                    <option value="rectangle">Rectangle</option>
                    <option value="oval">Oval</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setNewTable({ number: '', capacity: '', location: 'Window', shape: 'square' });
                    }}
                    className="flex-1 bg-gray-200 text-[#333333] px-4 py-2 text-sm rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#FF6B35] text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-[#e55a2b] transition-colors"
                  >
                    Add Table
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
