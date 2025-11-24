'use client';

import { useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';

// Mock data
const mockCustomers = [
  {
    id: 'CUST-001',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567',
    totalReservations: 24,
    completedReservations: 22,
    cancelledReservations: 2,
    totalSpent: 1840,
    loyaltyPoints: 480,
    tierLevel: 'Gold',
    joinedDate: '2024-01-15',
    lastVisit: '2025-11-20',
    favoriteTable: 'Table 5',
    averagePartySize: 4,
    status: 'active',
    tags: ['VIP', 'Regular']
  },
  {
    id: 'CUST-002',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+1 (555) 234-5678',
    totalReservations: 18,
    completedReservations: 17,
    cancelledReservations: 1,
    totalSpent: 1350,
    loyaltyPoints: 350,
    tierLevel: 'Silver',
    joinedDate: '2024-03-20',
    lastVisit: '2025-11-18',
    favoriteTable: 'Table 12',
    averagePartySize: 2,
    status: 'active',
    tags: ['Regular']
  },
  {
    id: 'CUST-003',
    name: 'Michael Brown',
    email: 'mbrown@email.com',
    phone: '+1 (555) 345-6789',
    totalReservations: 32,
    completedReservations: 30,
    cancelledReservations: 2,
    totalSpent: 2850,
    loyaltyPoints: 720,
    tierLevel: 'Platinum',
    joinedDate: '2023-11-10',
    lastVisit: '2025-11-22',
    favoriteTable: 'Table 10',
    averagePartySize: 6,
    status: 'active',
    tags: ['VIP', 'High-Value']
  },
  {
    id: 'CUST-004',
    name: 'Emily Davis',
    email: 'emily.davis@email.com',
    phone: '+1 (555) 456-7890',
    totalReservations: 12,
    completedReservations: 11,
    cancelledReservations: 1,
    totalSpent: 890,
    loyaltyPoints: 180,
    tierLevel: 'Silver',
    joinedDate: '2024-06-05',
    lastVisit: '2025-11-15',
    favoriteTable: 'Table 1',
    averagePartySize: 2,
    status: 'active',
    tags: []
  },
  {
    id: 'CUST-005',
    name: 'David Wilson',
    email: 'dwilson@email.com',
    phone: '+1 (555) 567-8901',
    totalReservations: 8,
    completedReservations: 7,
    cancelledReservations: 1,
    totalSpent: 620,
    loyaltyPoints: 120,
    tierLevel: 'Silver',
    joinedDate: '2024-08-12',
    lastVisit: '2025-11-10',
    favoriteTable: 'Table 8',
    averagePartySize: 4,
    status: 'active',
    tags: []
  },
  {
    id: 'CUST-006',
    name: 'Lisa Anderson',
    email: 'lisa.a@email.com',
    phone: '+1 (555) 678-9012',
    totalReservations: 5,
    completedReservations: 5,
    cancelledReservations: 0,
    totalSpent: 450,
    loyaltyPoints: 90,
    tierLevel: 'Bronze',
    joinedDate: '2024-09-25',
    lastVisit: '2025-10-28',
    favoriteTable: 'Table 3',
    averagePartySize: 2,
    status: 'inactive',
    tags: []
  }
];

export default function AdminCustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<typeof mockCustomers[0] | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<typeof mockCustomers[0] | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<typeof mockCustomers[0] | null>(null);

  const filteredCustomers = mockCustomers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.phone.includes(searchQuery);
    const matchesStatus = filter === 'all' || customer.status === filter;
    const matchesTier = tierFilter === 'all' || customer.tierLevel === tierFilter;
    return matchesSearch && matchesStatus && matchesTier;
  });

  const stats = {
    total: mockCustomers.length,
    active: mockCustomers.filter(c => c.status === 'active').length,
    vip: mockCustomers.filter(c => c.tags.includes('VIP')).length,
    totalRevenue: mockCustomers.reduce((sum, c) => sum + c.totalSpent, 0),
    averageSpending: Math.round(mockCustomers.reduce((sum, c) => sum + c.totalSpent, 0) / mockCustomers.length),
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum':
        return 'bg-purple-100 text-purple-800';
      case 'Gold':
        return 'bg-yellow-100 text-yellow-800';
      case 'Silver':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-orange-100 text-orange-800';
    }
  };

  const handleEditCustomer = (customer: typeof mockCustomers[0]) => {
    setEditingCustomer({ ...customer });
    setShowEditModal(true);
    setSelectedCustomer(null);
  };

  const handleSaveEdit = () => {
    if (editingCustomer) {
      console.log('Saving customer:', editingCustomer);
      // In a real app, this would update the database
      setShowEditModal(false);
      setEditingCustomer(null);
    }
  };

  const handleDeleteClick = (customer: typeof mockCustomers[0]) => {
    setCustomerToDelete(customer);
    setShowDeleteDialog(true);
    setSelectedCustomer(null);
  };

  const handleConfirmDelete = () => {
    if (customerToDelete) {
      console.log('Deleting customer:', customerToDelete.id);
      // In a real app, this would delete from the database
      setShowDeleteDialog(false);
      setCustomerToDelete(null);
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
                <h1 className="text-2xl font-bold text-[#333333] mb-1">Customer Management</h1>
                <p className="text-sm text-[#333333] opacity-70">
                  View and manage customer profiles and loyalty data
                </p>
              </div>
              <button className="flex items-center gap-1.5 px-4 py-2 text-sm bg-[#FF6B35] text-white rounded-lg hover:bg-[#e55a2b] transition-colors font-semibold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <div className="bg-white rounded-lg shadow-md p-3">
              <p className="text-xs text-[#333333] opacity-70 mb-0.5">Total Customers</p>
              <p className="text-2xl font-bold text-[#333333]">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3">
              <p className="text-xs text-[#333333] opacity-70 mb-0.5">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3">
              <p className="text-xs text-[#333333] opacity-70 mb-0.5">VIP Members</p>
              <p className="text-2xl font-bold text-purple-600">{stats.vip}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3">
              <p className="text-xs text-[#333333] opacity-70 mb-0.5">Total Revenue</p>
              <p className="text-2xl font-bold text-[#FF6B35]">${stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3">
              <p className="text-xs text-[#333333] opacity-70 mb-0.5">Avg. Spending</p>
              <p className="text-2xl font-bold text-blue-600">${stats.averageSpending}</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#333333] mb-2">Search Customers</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, or phone..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-2">Status</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`flex-1 px-3 py-2 text-xs rounded-lg font-semibold transition-all ${
                      filter === 'all'
                        ? 'bg-[#FF6B35] text-white'
                        : 'bg-gray-100 text-[#333333] hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('active')}
                    className={`flex-1 px-3 py-2 text-xs rounded-lg font-semibold transition-all ${
                      filter === 'active'
                        ? 'bg-[#FF6B35] text-white'
                        : 'bg-gray-100 text-[#333333] hover:bg-gray-200'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setFilter('inactive')}
                    className={`flex-1 px-3 py-2 text-xs rounded-lg font-semibold transition-all ${
                      filter === 'inactive'
                        ? 'bg-[#FF6B35] text-white'
                        : 'bg-gray-100 text-[#333333] hover:bg-gray-200'
                    }`}
                  >
                    Inactive
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-xs font-semibold text-[#333333] mb-2">Loyalty Tier</label>
              <div className="flex gap-2 flex-wrap">
                {['all', 'Platinum', 'Gold', 'Silver', 'Bronze'].map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setTierFilter(tier)}
                    className={`px-4 py-2 text-xs rounded-lg font-semibold transition-all ${
                      tierFilter === tier
                        ? 'bg-[#FF6B35] text-white'
                        : 'bg-gray-100 text-[#333333] hover:bg-gray-200'
                    }`}
                  >
                    {tier === 'all' ? 'All Tiers' : tier}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Customers Table */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-bold text-[#333333] mb-4">Customers ({filteredCustomers.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Customer</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Contact</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Tier</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Reservations</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Total Spent</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Points</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Last Visit</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b border-gray-100 hover:bg-[#F8F4F0] transition-colors">
                      <td className="py-3 px-3">
                        <div>
                          <p className="text-xs font-semibold text-[#333333]">{customer.name}</p>
                          <p className="text-xs text-[#333333] opacity-70">{customer.id}</p>
                          {customer.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {customer.tags.map((tag, i) => (
                                <span key={i} className="px-1.5 py-0.5 bg-[#FF6B35] bg-opacity-10 text-[#FF6B35] rounded text-xs font-semibold">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <p className="text-xs text-[#333333]">{customer.email}</p>
                        <p className="text-xs text-[#333333] opacity-70">{customer.phone}</p>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getTierColor(customer.tierLevel)}`}>
                          {customer.tierLevel}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <p className="text-xs font-semibold text-[#333333]">{customer.totalReservations} total</p>
                        <p className="text-xs text-green-600">{customer.completedReservations} completed</p>
                      </td>
                      <td className="py-3 px-3">
                        <p className="text-xs font-bold text-[#333333]">${customer.totalSpent.toLocaleString()}</p>
                      </td>
                      <td className="py-3 px-3">
                        <p className="text-xs font-semibold text-[#FF6B35]">{customer.loyaltyPoints} pts</p>
                      </td>
                      <td className="py-3 px-3">
                        <p className="text-xs text-[#333333]">{new Date(customer.lastVisit).toLocaleDateString()}</p>
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => setSelectedCustomer(customer)}
                          className="text-[#FF6B35] hover:text-[#e55a2b] font-semibold text-xs"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredCustomers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-[#333333] opacity-70">No customers found</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <div>
                <h2 className="text-xl font-bold text-[#333333]">{selectedCustomer.name}</h2>
                <p className="text-xs text-[#333333] opacity-70">{selectedCustomer.id}</p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <svg className="w-5 h-5 text-[#333333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              {/* Customer Info Grid */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-[#F8F4F0] p-3 rounded-lg">
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Email</p>
                  <p className="text-sm font-semibold text-[#333333]">{selectedCustomer.email}</p>
                </div>
                <div className="bg-[#F8F4F0] p-3 rounded-lg">
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Phone</p>
                  <p className="text-sm font-semibold text-[#333333]">{selectedCustomer.phone}</p>
                </div>
                <div className="bg-[#F8F4F0] p-3 rounded-lg">
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Loyalty Tier</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getTierColor(selectedCustomer.tierLevel)}`}>
                    {selectedCustomer.tierLevel}
                  </span>
                </div>
                <div className="bg-[#F8F4F0] p-3 rounded-lg">
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Loyalty Points</p>
                  <p className="text-sm font-semibold text-[#FF6B35]">{selectedCustomer.loyaltyPoints} points</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{selectedCustomer.totalReservations}</p>
                  <p className="text-xs text-[#333333] opacity-70">Total Reservations</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{selectedCustomer.completedReservations}</p>
                  <p className="text-xs text-[#333333] opacity-70">Completed</p>
                </div>
                <div className="text-center p-3 bg-[#FF6B35] bg-opacity-10 rounded-lg">
                  <p className="text-2xl font-bold text-[#FF6B35]">${selectedCustomer.totalSpent.toLocaleString()}</p>
                  <p className="text-xs text-[#333333] opacity-70">Total Spent</p>
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-[#333333] opacity-70">Member Since</span>
                  <span className="text-sm font-semibold text-[#333333]">{new Date(selectedCustomer.joinedDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-[#333333] opacity-70">Last Visit</span>
                  <span className="text-sm font-semibold text-[#333333]">{new Date(selectedCustomer.lastVisit).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-[#333333] opacity-70">Favorite Table</span>
                  <span className="text-sm font-semibold text-[#333333]">{selectedCustomer.favoriteTable}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-[#333333] opacity-70">Avg. Party Size</span>
                  <span className="text-sm font-semibold text-[#333333]">{selectedCustomer.averagePartySize} guests</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-[#333333] opacity-70">Cancellation Rate</span>
                  <span className="text-sm font-semibold text-[#333333]">
                    {Math.round((selectedCustomer.cancelledReservations / selectedCustomer.totalReservations) * 100)}%
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-6">
                <button className="flex-1 bg-[#FF6B35] text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-[#e55a2b] transition-colors">
                  Send Message
                </button>
                <button className="flex-1 bg-blue-600 text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  View History
                </button>
                <button
                  onClick={() => handleEditCustomer(selectedCustomer)}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => handleDeleteClick(selectedCustomer)}
                  className="bg-red-600 text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && editingCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <div>
                <h2 className="text-xl font-bold text-[#333333]">Edit Customer Profile</h2>
                <p className="text-xs text-[#333333] opacity-70">{editingCustomer.id}</p>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingCustomer(null);
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <svg className="w-5 h-5 text-[#333333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              {/* Edit Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-2">Full Name</label>
                  <input
                    type="text"
                    value={editingCustomer.name}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#333333] mb-2">Email Address</label>
                    <input
                      type="email"
                      value={editingCustomer.email}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#333333] mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={editingCustomer.phone}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#333333] mb-2">Loyalty Tier</label>
                    <select
                      value={editingCustomer.tierLevel}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, tierLevel: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                    >
                      <option value="Bronze">Bronze</option>
                      <option value="Silver">Silver</option>
                      <option value="Gold">Gold</option>
                      <option value="Platinum">Platinum</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#333333] mb-2">Status</label>
                    <select
                      value={editingCustomer.status}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, status: e.target.value as 'active' | 'inactive' })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-2">Loyalty Points</label>
                  <input
                    type="number"
                    value={editingCustomer.loyaltyPoints}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, loyaltyPoints: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-2">Tags</label>
                  <div className="flex gap-2 flex-wrap mb-2">
                    {['VIP', 'Regular', 'High-Value'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          const tags = editingCustomer.tags.includes(tag)
                            ? editingCustomer.tags.filter(t => t !== tag)
                            : [...editingCustomer.tags, tag];
                          setEditingCustomer({ ...editingCustomer, tags });
                        }}
                        className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-all ${
                          editingCustomer.tags.includes(tag)
                            ? 'bg-[#FF6B35] text-white'
                            : 'bg-gray-100 text-[#333333] hover:bg-gray-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-800 font-semibold mb-1">Customer Statistics (Read-Only)</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-blue-600 opacity-70">Total Reservations</p>
                      <p className="font-semibold text-blue-900">{editingCustomer.totalReservations}</p>
                    </div>
                    <div>
                      <p className="text-blue-600 opacity-70">Total Spent</p>
                      <p className="font-semibold text-blue-900">${editingCustomer.totalSpent.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-blue-600 opacity-70">Member Since</p>
                      <p className="font-semibold text-blue-900">{new Date(editingCustomer.joinedDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingCustomer(null);
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

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && customerToDelete && (
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
                  <h2 className="text-xl font-bold text-[#333333]">Delete Customer</h2>
                  <p className="text-xs text-[#333333] opacity-70">This action cannot be undone</p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm text-[#333333] mb-4">
                Are you sure you want to delete <span className="font-semibold">{customerToDelete.name}</span>?
                This will permanently remove all customer data, including:
              </p>
              <ul className="text-sm text-[#333333] opacity-70 space-y-1 ml-5 mb-4">
                <li className="list-disc">{customerToDelete.totalReservations} reservation records</li>
                <li className="list-disc">{customerToDelete.loyaltyPoints} loyalty points</li>
                <li className="list-disc">Customer history and preferences</li>
              </ul>
              <div className="bg-red-50 p-3 rounded-lg mb-4">
                <p className="text-xs text-red-800 font-semibold">
                  Warning: This customer has spent ${customerToDelete.totalSpent.toLocaleString()} total. Consider marking them as inactive instead.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteDialog(false);
                    setCustomerToDelete(null);
                  }}
                  className="flex-1 bg-gray-200 text-[#333333] px-4 py-2 text-sm rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 bg-red-600 text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Delete Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
