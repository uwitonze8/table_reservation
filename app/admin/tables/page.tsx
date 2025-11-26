'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { adminApi, Table } from '@/lib/api';

export default function AdminTablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTable, setNewTable] = useState({
    tableNumber: '',
    capacity: '',
    location: 'WINDOW',
    shape: 'SQUARE',
  });
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch tables from API
  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllTables();
      if (response.success && response.data) {
        setTables(response.data);
      } else {
        setError(response.message || 'Failed to load tables');
      }
    } catch (err) {
      console.error('Failed to fetch tables:', err);
      setError('Failed to load tables. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Map API status to display status
  const getTableStatus = (table: Table): string => {
    return table.status.toLowerCase();
  };

  const filteredTables = tables.filter(table => {
    const status = getTableStatus(table);
    const matchesStatus = filter === 'all' || status === filter;
    const matchesLocation = locationFilter === 'all' || table.location === locationFilter;
    return matchesStatus && matchesLocation;
  });

  const stats = {
    total: tables.length,
    available: tables.filter(t => t.status === 'AVAILABLE').length,
    occupied: tables.filter(t => t.status === 'OCCUPIED' || t.status === 'RESERVED').length,
    maintenance: tables.filter(t => t.status === 'MAINTENANCE').length,
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

  const handleAddTable = async () => {
    try {
      setActionLoading(true);
      const response = await adminApi.createTable({
        tableNumber: parseInt(newTable.tableNumber),
        capacity: parseInt(newTable.capacity),
        location: newTable.location,
        shape: newTable.shape,
      });

      if (response.success) {
        await fetchTables();
        setShowAddModal(false);
        setNewTable({ tableNumber: '', capacity: '', location: 'WINDOW', shape: 'SQUARE' });
      } else {
        alert(response.message || 'Failed to add table');
      }
    } catch (err) {
      alert('Failed to add table. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (tableId: number, status: string) => {
    try {
      setActionLoading(true);
      const response = await adminApi.updateTableStatus(tableId, status);

      if (response.success) {
        await fetchTables();
        setSelectedTable(null);
      } else {
        alert(response.message || 'Failed to update table status');
      }
    } catch (err) {
      alert('Failed to update table status. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTable = async (tableId: number) => {
    if (!confirm('Are you sure you want to delete this table?')) return;

    try {
      setActionLoading(true);
      const response = await adminApi.deleteTable(tableId);

      if (response.success) {
        await fetchTables();
        setSelectedTable(null);
      } else {
        alert(response.message || 'Failed to delete table');
      }
    } catch (err) {
      alert('Failed to delete table. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Get unique locations for filter
  const locations = [...new Set(tables.map(t => t.location))];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F8F4F0]">
        <AdminSidebar />
        <main className="flex-1 ml-64 py-8 px-4 sm:px-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin w-12 h-12 border-4 border-[#FF6B35] border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-sm text-[#333333] opacity-70">Loading tables...</p>
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
              onClick={fetchTables}
              className="ml-4 text-red-700 underline hover:no-underline"
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
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
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tables Grid */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-bold text-[#333333] mb-4">Tables</h2>
            {filteredTables.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-[#333333] opacity-70">No tables found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {filteredTables.map((table) => {
                  const status = getTableStatus(table);
                  return (
                    <div
                      key={table.id}
                      onClick={() => setSelectedTable(table)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
                        status === 'available'
                          ? 'border-green-300 bg-green-50'
                          : status === 'occupied'
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-300 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-lg font-bold text-[#333333]">#{table.tableNumber}</div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
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
                      </div>
                    </div>
                  );
                })}
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
              <h2 className="text-xl font-bold text-[#333333]">Table #{selectedTable.tableNumber}</h2>
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
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(getTableStatus(selectedTable))}`}>
                    {getTableStatus(selectedTable).charAt(0).toUpperCase() + getTableStatus(selectedTable).slice(1)}
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
                  <p className="text-xs text-[#333333] opacity-70 mb-2">Change Status</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleUpdateStatus(selectedTable.id, 'AVAILABLE')}
                      disabled={actionLoading}
                      className="px-3 py-2 text-xs bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      Set Available
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedTable.id, 'OCCUPIED')}
                      disabled={actionLoading}
                      className="px-3 py-2 text-xs bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      Set Occupied
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedTable.id, 'MAINTENANCE')}
                      disabled={actionLoading}
                      className="px-3 py-2 text-xs bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 col-span-2"
                    >
                      Set Maintenance
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => handleDeleteTable(selectedTable.id)}
                  disabled={actionLoading}
                  className="flex-1 bg-red-600 text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                >
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
                  setNewTable({ tableNumber: '', capacity: '', location: 'WINDOW', shape: 'SQUARE' });
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
                handleAddTable();
              }} className="space-y-4">
                <div>
                  <label htmlFor="tableNumber" className="block text-xs font-semibold text-[#333333] mb-2">
                    Table Number *
                  </label>
                  <input
                    type="number"
                    id="tableNumber"
                    required
                    value={newTable.tableNumber}
                    onChange={(e) => setNewTable({ ...newTable, tableNumber: e.target.value })}
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
                    <option value="WINDOW">Window</option>
                    <option value="CENTER">Center</option>
                    <option value="PATIO">Patio</option>
                    <option value="BAR">Bar</option>
                    <option value="PRIVATE">Private</option>
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
                    <option value="SQUARE">Square</option>
                    <option value="ROUND">Round</option>
                    <option value="RECTANGLE">Rectangle</option>
                    <option value="OVAL">Oval</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setNewTable({ tableNumber: '', capacity: '', location: 'WINDOW', shape: 'SQUARE' });
                    }}
                    className="flex-1 bg-gray-200 text-[#333333] px-4 py-2 text-sm rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 bg-[#FF6B35] text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-[#e55a2b] transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? 'Adding...' : 'Add Table'}
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
