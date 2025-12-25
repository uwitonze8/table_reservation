'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { adminApi, User } from '@/lib/api';

// Customer type alias for User with customer-specific fields
type Customer = User & { isActive?: boolean };

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Fetch customers from API
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllCustomers(0, 100);
      if (response.success && response.data) {
        // Extract content array from paginated response
        const customersData = response.data.content || [];
        // Map enabled field to isActive for compatibility
        setCustomers(customersData.map(c => ({ ...c, isActive: c.enabled })));
      } else {
        setError(response.message || 'Failed to load customers');
      }
    } catch (err) {
      console.error('Failed to fetch customers:', err);
      setError('Failed to load customers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (customer.phone && customer.phone.includes(searchQuery));
    const matchesTier = tierFilter === 'all' || customer.loyaltyTier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const stats = {
    total: customers.length,
    active: customers.filter(c => c.isActive).length,
    vip: customers.filter(c => c.loyaltyTier === 'PLATINUM' || c.loyaltyTier === 'GOLD').length,
    totalPoints: customers.reduce((sum, c) => sum + c.loyaltyPoints, 0),
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'PLATINUM':
        return 'bg-purple-100 text-purple-800';
      case 'GOLD':
        return 'bg-yellow-100 text-yellow-800';
      case 'SILVER':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-orange-100 text-orange-800';
    }
  };

  const formatTierName = (tier: string) => {
    return tier.charAt(0) + tier.slice(1).toLowerCase();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F8F4F0]">
        <AdminSidebar />
        <main className="flex-1 ml-64 py-8 px-4 sm:px-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin w-12 h-12 border-4 border-[#FF6B35] border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-sm text-[#333333] opacity-70">Loading customers...</p>
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
              onClick={fetchCustomers}
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
                <h1 className="text-2xl font-bold text-[#333333] mb-1">Customer Management</h1>
                <p className="text-sm text-[#333333] opacity-70">
                  View and manage customer profiles and loyalty data
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
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
              <p className="text-xs text-[#333333] opacity-70 mb-0.5">Total Points</p>
              <p className="text-2xl font-bold text-[#FF6B35]">{stats.totalPoints.toLocaleString()}</p>
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
                <label className="block text-xs font-semibold text-[#333333] mb-2">Loyalty Tier</label>
                <div className="flex gap-2 flex-wrap">
                  {['all', 'PLATINUM', 'GOLD', 'SILVER', 'BRONZE'].map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setTierFilter(tier)}
                      className={`px-3 py-2 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
                        tierFilter === tier
                          ? 'bg-[#FF6B35] text-white'
                          : 'bg-gray-100 text-[#333333] hover:bg-gray-200'
                      }`}
                    >
                      {tier === 'all' ? 'All' : formatTierName(tier)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Customers Table */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-bold text-[#333333] mb-4">Customers ({filteredCustomers.length})</h2>
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-[#333333] opacity-70">No customers found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Customer</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Contact</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Tier</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Reservations</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Points</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Member Since</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="border-b border-gray-100 hover:bg-[#F8F4F0] transition-colors">
                        <td className="py-3 px-3">
                          <div>
                            <p className="text-xs font-semibold text-[#333333]">{customer.fullName}</p>
                            <p className="text-xs text-[#333333] opacity-70">ID: {customer.id}</p>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <p className="text-xs text-[#333333]">{customer.email}</p>
                          <p className="text-xs text-[#333333] opacity-70">{customer.phone || 'No phone'}</p>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getTierColor(customer.loyaltyTier)}`}>
                            {formatTierName(customer.loyaltyTier)}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <p className="text-xs font-semibold text-[#333333]">{customer.totalReservations} total</p>
                        </td>
                        <td className="py-3 px-3">
                          <p className="text-xs font-semibold text-[#FF6B35]">{customer.loyaltyPoints} pts</p>
                        </td>
                        <td className="py-3 px-3">
                          <p className="text-xs text-[#333333]">{new Date(customer.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="py-3 px-3">
                          <button
                            onClick={() => setSelectedCustomer(customer)}
                            className="text-[#FF6B35] hover:text-[#e55a2b] font-semibold text-xs cursor-pointer"
                          >
                            View
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

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <div>
                <h2 className="text-xl font-bold text-[#333333]">{selectedCustomer.fullName}</h2>
                <p className="text-xs text-[#333333] opacity-70">Customer ID: {selectedCustomer.id}</p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
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
                  <p className="text-sm font-semibold text-[#333333]">{selectedCustomer.phone || 'Not provided'}</p>
                </div>
                <div className="bg-[#F8F4F0] p-3 rounded-lg">
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Loyalty Tier</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getTierColor(selectedCustomer.loyaltyTier)}`}>
                    {formatTierName(selectedCustomer.loyaltyTier)}
                  </span>
                </div>
                <div className="bg-[#F8F4F0] p-3 rounded-lg">
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Loyalty Points</p>
                  <p className="text-sm font-semibold text-[#FF6B35]">{selectedCustomer.loyaltyPoints} points</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{selectedCustomer.totalReservations}</p>
                  <p className="text-xs text-[#333333] opacity-70">Total Reservations</p>
                </div>
                <div className="text-center p-3 bg-[#FF6B35] bg-opacity-10 rounded-lg">
                  <p className="text-2xl font-bold text-[#FF6B35]">{selectedCustomer.loyaltyPoints}</p>
                  <p className="text-xs text-[#333333] opacity-70">Loyalty Points</p>
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-[#333333] opacity-70">Member Since</span>
                  <span className="text-sm font-semibold text-[#333333]">{new Date(selectedCustomer.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-[#333333] opacity-70">Status</span>
                  <span className={`text-sm font-semibold ${selectedCustomer.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedCustomer.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="flex-1 bg-gray-200 text-[#333333] px-4 py-2 text-sm rounded-lg font-semibold hover:bg-gray-300 transition-colors cursor-pointer"
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
