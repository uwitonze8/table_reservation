'use client';

import { useState, useEffect, useRef } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { adminApi, Table } from '@/lib/api';

// Room/Area definitions with positions on the floor plan
const ROOM_AREAS = [
  { id: 'WINDOW', name: 'Window Area', x: 0, y: 0, width: 300, height: 250, color: '#E8F5E9' },
  { id: 'CENTER', name: 'Center Area', x: 320, y: 0, width: 300, height: 250, color: '#FFF3E0' },
  { id: 'BAR', name: 'Bar Area', x: 640, y: 0, width: 200, height: 250, color: '#E3F2FD' },
  { id: 'PATIO', name: 'Patio', x: 0, y: 270, width: 420, height: 200, color: '#F3E5F5' },
  { id: 'PRIVATE', name: 'Private Room', x: 440, y: 270, width: 400, height: 200, color: '#FFEBEE' },
];

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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<Table | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [notificationModal, setNotificationModal] = useState<{
    show: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({ show: false, type: 'success', title: '', message: '' });

  // Floor plan state
  const [viewMode, setViewMode] = useState<'table' | 'floorplan'>('table');
  const [draggingTable, setDraggingTable] = useState<Table | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const floorPlanRef = useRef<HTMLDivElement>(null);

  const showNotification = (type: 'success' | 'error', title: string, message: string) => {
    setNotificationModal({ show: true, type, title, message });
  };

  const closeNotification = () => {
    setNotificationModal({ show: false, type: 'success', title: '', message: '' });
  };

  const openDeleteModal = (table: Table) => {
    setTableToDelete(table);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setTableToDelete(null);
  };

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
    reserved: tables.filter(t => t.status === 'RESERVED').length,
    occupied: tables.filter(t => t.status === 'OCCUPIED').length,
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

  // Calculate position for a new table based on location
  const calculateNewTablePosition = (location: string): { x: number; y: number } => {
    const area = ROOM_AREAS.find(a => a.id === location) || ROOM_AREAS[0];
    const tablesInArea = tables.filter(t => t.location === location);
    const tableIndex = tablesInArea.length; // New table will be at this index
    const cols = Math.floor(area.width / 80);
    const row = Math.floor(tableIndex / cols);
    const col = tableIndex % cols;

    return {
      x: area.x + 20 + col * 80,
      y: area.y + 40 + row * 70
    };
  };

  const handleAddTable = async () => {
    try {
      setActionLoading(true);

      // Calculate position based on selected location
      const position = calculateNewTablePosition(newTable.location);

      const response = await adminApi.createTable({
        tableNumber: parseInt(newTable.tableNumber),
        capacity: parseInt(newTable.capacity),
        location: newTable.location,
        shape: newTable.shape,
        positionX: position.x,
        positionY: position.y,
      });

      if (response.success) {
        await fetchTables();
        setShowAddModal(false);
        setNewTable({ tableNumber: '', capacity: '', location: 'WINDOW', shape: 'SQUARE' });
        showNotification('success', 'Table Added', 'New table has been added successfully.');
      } else {
        showNotification('error', 'Failed to Add', response.message || 'Failed to add table');
      }
    } catch (err) {
      showNotification('error', 'Error', 'Failed to add table. Please try again.');
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
        showNotification('success', 'Status Updated', 'Table status has been updated successfully.');
      } else {
        showNotification('error', 'Update Failed', response.message || 'Failed to update table status');
      }
    } catch (err) {
      showNotification('error', 'Error', 'Failed to update table status. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTable = async () => {
    if (!tableToDelete) return;

    try {
      setDeleteLoading(true);
      const response = await adminApi.deleteTable(tableToDelete.id);

      if (response.success) {
        await fetchTables();
        setSelectedTable(null);
        closeDeleteModal();
        showNotification('success', 'Table Deleted', 'Table has been deleted successfully.');
      } else {
        showNotification('error', 'Delete Failed', response.message || 'Failed to delete table');
      }
    } catch (err) {
      showNotification('error', 'Error', 'Failed to delete table. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Get unique locations for filter
  const locations = [...new Set(tables.map(t => t.location))];

  // Floor plan drag handlers
  const handleDragStart = (e: React.MouseEvent, table: Table) => {
    if (viewMode !== 'floorplan') return;
    e.preventDefault();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setDraggingTable(table);
  };

  const handleDragMove = (e: React.MouseEvent) => {
    if (!draggingTable || !floorPlanRef.current) return;
    e.preventDefault();

    const floorPlanRect = floorPlanRef.current.getBoundingClientRect();
    const newX = e.clientX - floorPlanRect.left - dragOffset.x;
    const newY = e.clientY - floorPlanRect.top - dragOffset.y;

    // Update table position locally
    setTables(prev => prev.map(t =>
      t.id === draggingTable.id
        ? { ...t, positionX: Math.max(0, Math.min(newX, 800)), positionY: Math.max(0, Math.min(newY, 420)) }
        : t
    ));
  };

  const handleDragEnd = async () => {
    if (!draggingTable) return;

    const updatedTable = tables.find(t => t.id === draggingTable.id);
    if (updatedTable && (updatedTable.positionX !== undefined || updatedTable.positionY !== undefined)) {
      // Determine which room the table is in based on position
      const newLocation = determineLocation(updatedTable.positionX || 0, updatedTable.positionY || 0);

      try {
        await adminApi.updateTable(draggingTable.id, {
          positionX: updatedTable.positionX,
          positionY: updatedTable.positionY,
          location: newLocation
        });

        // Update local state with new location
        setTables(prev => prev.map(t =>
          t.id === draggingTable.id ? { ...t, location: newLocation as Table['location'] } : t
        ));
      } catch (err) {
        console.error('Failed to save table position:', err);
      }
    }

    setDraggingTable(null);
  };

  // Determine which room/area a position falls into
  const determineLocation = (x: number, y: number): string => {
    for (const area of ROOM_AREAS) {
      if (x >= area.x && x < area.x + area.width && y >= area.y && y < area.y + area.height) {
        return area.id;
      }
    }
    return 'CENTER'; // Default
  };

  // Get default position for a table based on its location
  const getDefaultPosition = (table: Table, index: number): { x: number; y: number } => {
    if (table.positionX !== undefined && table.positionY !== undefined) {
      return { x: table.positionX, y: table.positionY };
    }

    const area = ROOM_AREAS.find(a => a.id === table.location) || ROOM_AREAS[1];
    const tablesInArea = tables.filter(t => t.location === table.location);
    const tableIndex = tablesInArea.findIndex(t => t.id === table.id);
    const cols = Math.floor(area.width / 80);
    const row = Math.floor(tableIndex / cols);
    const col = tableIndex % cols;

    return {
      x: area.x + 20 + col * 80,
      y: area.y + 40 + row * 70
    };
  };

  // Get table size based on shape
  const getTableSize = (table: Table): { width: number; height: number } => {
    switch (table.shape) {
      case 'ROUND':
        return { width: 50, height: 50 };
      case 'RECTANGLE':
        return { width: 70, height: 45 };
      case 'OVAL':
        return { width: 65, height: 45 };
      default: // SQUARE
        return { width: 50, height: 50 };
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
                <h1 className="text-2xl font-bold text-[#333333] mb-1">Table Management</h1>
                <p className="text-sm text-[#333333] opacity-70">
                  Manage restaurant tables and seating arrangements
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* View Toggle */}
                <div className="flex bg-white rounded-lg border border-gray-300 p-1">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                      viewMode === 'table'
                        ? 'bg-[#FF6B35] text-white'
                        : 'text-[#333333] hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    List
                  </button>
                  <button
                    onClick={() => setViewMode('floorplan')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                      viewMode === 'floorplan'
                        ? 'bg-[#FF6B35] text-white'
                        : 'text-[#333333] hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                    Floor Plan
                  </button>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm bg-[#FF6B35] text-white rounded-lg hover:bg-[#e55a2b] transition-colors font-semibold cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Table
                </button>
              </div>
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
              <p className="text-xs text-[#333333] opacity-70 mb-0.5">Reserved</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.reserved}</p>
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
                    className={`px-4 py-2 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
                      filter === 'all'
                        ? 'bg-[#FF6B35] text-white'
                        : 'bg-gray-100 text-[#333333] hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('available')}
                    className={`px-4 py-2 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
                      filter === 'available'
                        ? 'bg-[#FF6B35] text-white'
                        : 'bg-gray-100 text-[#333333] hover:bg-gray-200'
                    }`}
                  >
                    Available
                  </button>
                  <button
                    onClick={() => setFilter('reserved')}
                    className={`px-4 py-2 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
                      filter === 'reserved'
                        ? 'bg-[#FF6B35] text-white'
                        : 'bg-gray-100 text-[#333333] hover:bg-gray-200'
                    }`}
                  >
                    Reserved
                  </button>
                  <button
                    onClick={() => setFilter('occupied')}
                    className={`px-4 py-2 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
                      filter === 'occupied'
                        ? 'bg-[#FF6B35] text-white'
                        : 'bg-gray-100 text-[#333333] hover:bg-gray-200'
                    }`}
                  >
                    Occupied
                  </button>
                  <button
                    onClick={() => setFilter('maintenance')}
                    className={`px-4 py-2 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
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
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none bg-white cursor-pointer"
                >
                  <option value="all">All Locations</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* View Content - Table or Floor Plan */}
          {viewMode === 'table' ? (
            /* Tables Table View */
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-[#333333]">Tables</h2>
              </div>
              {filteredTables.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-[#333333] opacity-70">No tables found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#F8F4F0]">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#333333] uppercase tracking-wider">Table #</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#333333] uppercase tracking-wider">Capacity</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#333333] uppercase tracking-wider">Location</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#333333] uppercase tracking-wider">Shape</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#333333] uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-[#333333] uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredTables.map((table) => {
                        const status = getTableStatus(table);
                        return (
                          <tr key={table.id} className="hover:bg-[#F8F4F0] transition-colors">
                            <td className="px-4 py-3">
                              <span className="text-sm font-bold text-[#333333]">#{table.tableNumber}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span className="text-sm text-[#333333]">{table.capacity} seats</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-sm text-[#333333]">{table.location}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-[#333333]">{table.shape || 'Square'}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-1">
                                {/* Quick Status Buttons */}
                                {status !== 'available' && (
                                  <button
                                    onClick={() => handleUpdateStatus(table.id, 'AVAILABLE')}
                                    disabled={actionLoading}
                                    className="p-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors cursor-pointer disabled:opacity-50"
                                    title="Set Available"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                  </button>
                                )}
                                {status !== 'reserved' && (
                                  <button
                                    onClick={() => handleUpdateStatus(table.id, 'RESERVED')}
                                    disabled={actionLoading}
                                    className="p-1.5 rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors cursor-pointer disabled:opacity-50"
                                    title="Set Reserved"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </button>
                                )}
                                {status !== 'occupied' && (
                                  <button
                                    onClick={() => handleUpdateStatus(table.id, 'OCCUPIED')}
                                    disabled={actionLoading}
                                    className="p-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors cursor-pointer disabled:opacity-50"
                                    title="Set Occupied"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                  </button>
                                )}
                                {status !== 'maintenance' && (
                                  <button
                                    onClick={() => handleUpdateStatus(table.id, 'MAINTENANCE')}
                                    disabled={actionLoading}
                                    className="p-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-50"
                                    title="Set Maintenance"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                  </button>
                                )}
                                {/* Divider */}
                                <div className="w-px h-5 bg-gray-300 mx-1"></div>
                                {/* View Details */}
                                <button
                                  onClick={() => setSelectedTable(table)}
                                  className="p-1.5 rounded-lg bg-[#FF6B35]/10 text-[#FF6B35] hover:bg-[#FF6B35]/20 transition-colors cursor-pointer"
                                  title="View Details"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </button>
                                {/* Delete */}
                                <button
                                  onClick={() => openDeleteModal(table)}
                                  className="p-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors cursor-pointer"
                                  title="Delete Table"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            /* Floor Plan View */
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#333333]">Floor Plan</h2>
                <p className="text-xs text-[#333333] opacity-70">
                  Drag tables to move them between areas
                </p>
              </div>

              {/* Floor Plan Canvas */}
              <div
                ref={floorPlanRef}
                className="relative bg-gray-100 rounded-lg overflow-hidden select-none"
                style={{ width: '100%', height: '500px' }}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
              >
                {/* Room Areas */}
                {ROOM_AREAS.map((area) => (
                  <div
                    key={area.id}
                    className="absolute border-2 border-dashed border-gray-400 rounded-lg"
                    style={{
                      left: area.x,
                      top: area.y,
                      width: area.width,
                      height: area.height,
                      backgroundColor: area.color,
                    }}
                  >
                    <div className="absolute top-2 left-2 text-xs font-semibold text-gray-600 bg-white/70 px-2 py-0.5 rounded">
                      {area.name}
                    </div>
                  </div>
                ))}

                {/* Tables */}
                {tables.map((table, index) => {
                  const position = getDefaultPosition(table, index);
                  const size = getTableSize(table);
                  const status = getTableStatus(table);
                  const isDragging = draggingTable?.id === table.id;

                  return (
                    <div
                      key={table.id}
                      className={`absolute flex flex-col items-center justify-center cursor-move transition-shadow ${
                        isDragging ? 'z-50 shadow-2xl scale-105' : 'z-10 hover:shadow-lg'
                      } ${
                        status === 'available'
                          ? 'bg-green-500'
                          : status === 'occupied'
                          ? 'bg-red-500'
                          : status === 'reserved'
                          ? 'bg-yellow-500'
                          : 'bg-gray-500'
                      }`}
                      style={{
                        left: position.x,
                        top: position.y,
                        width: size.width,
                        height: size.height,
                        borderRadius: table.shape === 'ROUND' || table.shape === 'OVAL' ? '50%' : '8px',
                      }}
                      onMouseDown={(e) => handleDragStart(e, table)}
                      onClick={(e) => {
                        if (!draggingTable) {
                          e.stopPropagation();
                          setSelectedTable(table);
                        }
                      }}
                    >
                      <span className="text-white font-bold text-xs">#{table.tableNumber}</span>
                      <span className="text-white text-[10px] opacity-90">{table.capacity}p</span>
                    </div>
                  );
                })}

                {/* Legend */}
                <div className="absolute bottom-2 right-2 bg-white/90 rounded-lg p-2 shadow-md">
                  <p className="text-xs font-semibold text-[#333333] mb-1">Legend</p>
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-green-500"></div>
                      <span className="text-[10px] text-[#333333]">Available</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-red-500"></div>
                      <span className="text-[10px] text-[#333333]">Occupied</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-yellow-500"></div>
                      <span className="text-[10px] text-[#333333]">Reserved</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-gray-500"></div>
                      <span className="text-[10px] text-[#333333]">Maintenance</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Table Details Modal */}
      {selectedTable && (
        <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#333333]">Table #{selectedTable.tableNumber}</h2>
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
                      className="px-3 py-2 text-xs bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    >
                      Set Available
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedTable.id, 'OCCUPIED')}
                      disabled={actionLoading}
                      className="px-3 py-2 text-xs bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    >
                      Set Occupied
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedTable.id, 'MAINTENANCE')}
                      disabled={actionLoading}
                      className="px-3 py-2 text-xs bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 col-span-2 cursor-pointer disabled:cursor-not-allowed"
                    >
                      Set Maintenance
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => openDeleteModal(selectedTable)}
                  disabled={actionLoading}
                  className="flex-1 bg-red-600 text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
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
        <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#333333]">Add New Table</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewTable({ tableNumber: '', capacity: '', location: 'WINDOW', shape: 'SQUARE' });
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
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
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none bg-white cursor-pointer"
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
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none bg-white cursor-pointer"
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
                    className="flex-1 bg-gray-200 text-[#333333] px-4 py-2 text-sm rounded-lg font-semibold hover:bg-gray-300 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 bg-[#FF6B35] text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-[#e55a2b] transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {actionLoading ? 'Adding...' : 'Add Table'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && tableToDelete && (
        <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#333333]">Delete Table</h2>
              <button onClick={closeDeleteModal} className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer">
                <svg className="w-5 h-5 text-[#333333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <p className="text-sm text-[#333333] text-center mb-2">
                Are you sure you want to delete
              </p>
              <p className="text-sm font-semibold text-[#333333] text-center mb-4">
                Table #{tableToDelete.tableNumber}?
              </p>
              <p className="text-xs text-gray-500 text-center mb-6">
                This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={deleteLoading}
                  className="flex-1 bg-gray-200 text-[#333333] px-4 py-2 text-sm rounded-lg font-semibold hover:bg-gray-300 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteTable}
                  disabled={deleteLoading}
                  className="flex-1 bg-red-600 text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete'}
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
