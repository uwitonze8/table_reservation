'use client';

import { useState, useEffect } from 'react';
import StaffSidebar from '@/components/staff/StaffSidebar';
import { staffApi, Table } from '@/lib/api';

export default function StaffTablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
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

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching tables...');
      const response = await staffApi.getAllTables();
      console.log('Tables response:', response);
      if (response.success && response.data) {
        setTables(response.data);
      } else {
        setError(response.message || 'Failed to load tables');
      }
    } catch (err) {
      console.error('Failed to fetch tables:', err);
      setError('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  const filteredTables = tables.filter(table => {
    const matchesStatus = filter === 'all' || table.status === filter.toUpperCase();
    const matchesLocation = locationFilter === 'all' || table.location === locationFilter.toUpperCase();
    return matchesStatus && matchesLocation;
  });

  const stats = {
    total: tables.length,
    available: tables.filter(t => t.status === 'AVAILABLE').length,
    occupied: tables.filter(t => t.status === 'OCCUPIED').length,
    reserved: tables.filter(t => t.status === 'RESERVED').length,
    maintenance: tables.filter(t => t.status === 'MAINTENANCE').length,
  };

  const handleUpdateTableStatus = async (tableId: number, newStatus: string) => {
    try {
      setActionLoading(true);
      console.log(`Updating table ${tableId} to status: ${newStatus}`);
      const response = await staffApi.updateTableStatus(tableId, newStatus);
      if (response.success) {
        await fetchTables();
        setSelectedTable(null);
        showNotification('success', 'Status Updated', 'Table status has been updated successfully.');
      } else {
        showNotification('error', 'Update Failed', response.message || 'Failed to update table status');
      }
    } catch (err) {
      console.error('Failed to update table status:', err);
      showNotification('error', 'Error', 'Failed to update table status');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'OCCUPIED':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'RESERVED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'MAINTENANCE':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  const formatLocation = (location: string) => {
    return location.charAt(0) + location.slice(1).toLowerCase();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F8F4F0]">
        <StaffSidebar />
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

  return (
    <div className="flex min-h-screen bg-[#F8F4F0]">
      <StaffSidebar />

      <main className="flex-1 ml-64 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-[#333333]">Table Management</h1>
              <p className="text-sm text-[#333333] opacity-70 mt-1">
                Real-time table status and seating management
              </p>
            </div>
            <button
              onClick={fetchTables}
              className="text-sm text-[#FF6B35] hover:text-[#e55a2b] font-semibold cursor-pointer"
            >
              Refresh
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
              <button onClick={fetchTables} className="ml-4 underline hover:no-underline cursor-pointer">
                Retry
              </button>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
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
            <div className="bg-white rounded-lg shadow-md p-3">
              <p className="text-xs text-[#333333] opacity-70 mb-1">Maintenance</p>
              <p className="text-2xl font-bold text-gray-600">{stats.maintenance}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-3 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-2">Filter by Status</label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { key: 'all', label: 'All', color: 'bg-[#FF6B35]' },
                    { key: 'AVAILABLE', label: 'Available', color: 'bg-green-600' },
                    { key: 'OCCUPIED', label: 'Occupied', color: 'bg-red-600' },
                    { key: 'RESERVED', label: 'Reserved', color: 'bg-blue-600' },
                    { key: 'MAINTENANCE', label: 'Maintenance', color: 'bg-gray-600' },
                  ].map(({ key, label, color }) => (
                    <button
                      key={key}
                      onClick={() => setFilter(key)}
                      className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-colors cursor-pointer ${
                        filter === key
                          ? `${color} text-white`
                          : 'bg-gray-100 text-[#333333] hover:bg-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-2">Filter by Location</label>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none bg-white cursor-pointer"
                >
                  <option value="all">All Locations</option>
                  <option value="WINDOW">Window</option>
                  <option value="CENTER">Center</option>
                  <option value="PATIO">Patio</option>
                  <option value="BAR">Bar</option>
                  <option value="PRIVATE">Private</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tables Grid View */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h2 className="text-xl font-bold text-[#333333] mb-4">Table Layout</h2>
            {filteredTables.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-[#333333] opacity-70">No tables found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filteredTables.map((table) => (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTable(table)}
                    className={`p-4 rounded-lg border-2 transition-all hover:shadow-lg cursor-pointer ${getStatusColor(table.status)}`}
                  >
                    <div className="text-center">
                      <p className="text-xl font-bold mb-1">#{table.tableNumber}</p>
                      <p className="text-xs opacity-70 mb-2">{formatLocation(table.location)}</p>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                        </svg>
                        <span className="text-xs font-semibold">{table.capacity}</span>
                      </div>
                      <p className="text-xs font-bold uppercase">
                        {formatStatus(table.status)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tables List View */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-bold text-[#333333] mb-4">Table List</h2>
            {filteredTables.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-[#333333] opacity-70">No tables found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Table #</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Capacity</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Location</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Shape</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Status</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTables.map((table) => (
                      <tr key={table.id} className="border-b border-gray-100 hover:bg-[#F8F4F0] transition-colors">
                        <td className="py-3 px-3 text-xs font-bold text-[#333333]">#{table.tableNumber}</td>
                        <td className="py-3 px-3 text-xs text-[#333333]">{table.capacity} seats</td>
                        <td className="py-3 px-3 text-xs text-[#333333]">{formatLocation(table.location)}</td>
                        <td className="py-3 px-3 text-xs text-[#333333]">{formatLocation(table.shape)}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(table.status).replace('border-', '')}`}>
                            {formatStatus(table.status)}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <button
                            onClick={() => setSelectedTable(table)}
                            className="text-[#FF6B35] hover:text-[#e55a2b] text-xs font-semibold cursor-pointer"
                          >
                            Manage
                          </button>
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

      {/* Table Details Modal */}
      {selectedTable && (
        <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-[#333333]">Table #{selectedTable.tableNumber}</h2>
                <p className="text-xs text-[#333333] opacity-70">{formatLocation(selectedTable.location)}</p>
              </div>
              <button
                onClick={() => setSelectedTable(null)}
                className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
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
                    <p className="text-xs text-[#333333] opacity-70 mb-1">Shape</p>
                    <p className="text-sm font-semibold text-[#333333]">{formatLocation(selectedTable.shape)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#333333] opacity-70 mb-1">Current Status</p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(selectedTable.status).replace('border-', '')}`}>
                      {formatStatus(selectedTable.status)}
                    </span>
                  </div>
                </div>
                {selectedTable.description && (
                  <div>
                    <p className="text-xs text-[#333333] opacity-70 mb-1">Description</p>
                    <p className="text-sm text-[#333333]">{selectedTable.description}</p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {selectedTable.status === 'OCCUPIED' && (
                  <button
                    onClick={() => handleUpdateTableStatus(selectedTable.id, 'AVAILABLE')}
                    disabled={actionLoading}
                    className="w-full bg-green-600 text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Clear Table (Mark as Available)
                  </button>
                )}
                {selectedTable.status === 'AVAILABLE' && (
                  <>
                    <button
                      onClick={() => handleUpdateTableStatus(selectedTable.id, 'OCCUPIED')}
                      disabled={actionLoading}
                      className="w-full bg-red-600 text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      Mark as Occupied
                    </button>
                    <button
                      onClick={() => handleUpdateTableStatus(selectedTable.id, 'RESERVED')}
                      disabled={actionLoading}
                      className="w-full bg-blue-600 text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      Mark as Reserved
                    </button>
                  </>
                )}
                {selectedTable.status === 'RESERVED' && (
                  <>
                    <button
                      onClick={() => handleUpdateTableStatus(selectedTable.id, 'OCCUPIED')}
                      disabled={actionLoading}
                      className="w-full bg-red-600 text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      Seat Reserved Guests
                    </button>
                    <button
                      onClick={() => handleUpdateTableStatus(selectedTable.id, 'AVAILABLE')}
                      disabled={actionLoading}
                      className="w-full bg-green-600 text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      Release Reservation
                    </button>
                  </>
                )}
                {selectedTable.status === 'MAINTENANCE' && (
                  <button
                    onClick={() => handleUpdateTableStatus(selectedTable.id, 'AVAILABLE')}
                    disabled={actionLoading}
                    className="w-full bg-green-600 text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Mark as Available
                  </button>
                )}
                {selectedTable.status !== 'MAINTENANCE' && (
                  <button
                    onClick={() => handleUpdateTableStatus(selectedTable.id, 'MAINTENANCE')}
                    disabled={actionLoading}
                    className="w-full bg-gray-600 text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Mark for Maintenance
                  </button>
                )}
                <button
                  onClick={() => setSelectedTable(null)}
                  className="w-full bg-gray-200 text-[#333333] px-4 py-2 text-sm rounded-lg font-semibold hover:bg-gray-300 transition-colors cursor-pointer"
                >
                  Close
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
