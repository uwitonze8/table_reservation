'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { adminApi, Staff } from '@/lib/api';

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all');
  const [newStaff, setNewStaff] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'WAITER' as 'WAITER' | 'HOST' | 'MANAGER',
    password: '',
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching staff from backend...');
      const response = await adminApi.getAllStaff();
      console.log('Staff API response:', response);
      if (response.success && response.data) {
        setStaff(response.data);
        console.log('Staff loaded:', response.data.length, 'members');
      } else {
        console.error('Failed to load staff:', response.message);
        setError(response.message || 'Failed to load staff');
      }
    } catch (err) {
      console.error('Failed to fetch staff:', err);
      setError('Failed to load staff. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async () => {
    try {
      setActionLoading(true);
      const fullName = `${newStaff.firstName} ${newStaff.lastName}`.trim();
      const staffData = {
        fullName,
        email: newStaff.email,
        phone: newStaff.phone,
        role: newStaff.role,
        password: newStaff.password,
      };
      console.log('Creating staff member:', staffData);
      const response = await adminApi.createStaff(staffData);
      console.log('Create staff response:', response);

      if (response.success) {
        console.log('Staff created successfully:', response.data);
        await fetchStaff();
        setShowAddModal(false);
        setNewStaff({ firstName: '', lastName: '', email: '', phone: '', role: 'WAITER', password: '' });
      } else {
        console.error('Failed to create staff:', response.message);
        alert(response.message || 'Failed to add staff member');
      }
    } catch (err) {
      console.error('Error creating staff:', err);
      alert('Failed to add staff member. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (staffMember: Staff) => {
    try {
      setActionLoading(true);
      const response = await adminApi.toggleStaffStatus(staffMember.id);

      if (response.success) {
        await fetchStaff();
        setSelectedStaff(null);
      } else {
        alert(response.message || 'Failed to update staff status');
      }
    } catch (err) {
      alert('Failed to update staff status. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteStaff = async (staffId: number) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;

    try {
      setActionLoading(true);
      const response = await adminApi.deleteStaff(staffId);

      if (response.success) {
        await fetchStaff();
        setSelectedStaff(null);
      } else {
        alert(response.message || 'Failed to delete staff');
      }
    } catch (err) {
      alert('Failed to delete staff. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'MANAGER':
        return 'bg-purple-100 text-purple-800';
      case 'HOST':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const formatRole = (role: string) => {
    return role.charAt(0) + role.slice(1).toLowerCase();
  };

  const filteredStaff = staff.filter(s =>
    roleFilter === 'all' || s.role === roleFilter
  );

  const stats = {
    total: staff.length,
    active: staff.filter(s => s.active).length,
    waiters: staff.filter(s => s.role === 'WAITER').length,
    managers: staff.filter(s => s.role === 'MANAGER').length,
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F8F4F0]">
        <AdminSidebar />
        <main className="flex-1 ml-64 py-8 px-4 sm:px-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin w-12 h-12 border-4 border-[#FF6B35] border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-sm text-[#333333] opacity-70">Loading staff...</p>
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
              onClick={fetchStaff}
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
                <h1 className="text-2xl font-bold text-[#333333] mb-1">Staff Management</h1>
                <p className="text-sm text-[#333333] opacity-70">
                  Manage restaurant staff and their roles
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm bg-[#FF6B35] text-white rounded-lg hover:bg-[#e55a2b] transition-colors font-semibold"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Staff
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-white rounded-lg shadow-md p-3">
              <p className="text-xs text-[#333333] opacity-70 mb-0.5">Total Staff</p>
              <p className="text-2xl font-bold text-[#333333]">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3">
              <p className="text-xs text-[#333333] opacity-70 mb-0.5">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3">
              <p className="text-xs text-[#333333] opacity-70 mb-0.5">Waiters</p>
              <p className="text-2xl font-bold text-blue-600">{stats.waiters}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3">
              <p className="text-xs text-[#333333] opacity-70 mb-0.5">Managers</p>
              <p className="text-2xl font-bold text-purple-600">{stats.managers}</p>
            </div>
          </div>

          {/* Filter */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <label className="block text-xs font-semibold text-[#333333] mb-2">Filter by Role</label>
            <div className="flex gap-2 flex-wrap">
              {['all', 'WAITER', 'HOST', 'MANAGER'].map((role) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`px-4 py-2 text-xs rounded-lg font-semibold transition-all ${
                    roleFilter === role
                      ? 'bg-[#FF6B35] text-white'
                      : 'bg-gray-100 text-[#333333] hover:bg-gray-200'
                  }`}
                >
                  {role === 'all' ? 'All' : formatRole(role)}
                </button>
              ))}
            </div>
          </div>

          {/* Staff Table */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-bold text-[#333333] mb-4">Staff Members ({filteredStaff.length})</h2>
            {filteredStaff.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-[#333333] opacity-70">No staff members found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Staff ID</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Name</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Contact</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Role</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Status</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.map((member) => (
                      <tr key={member.id} className="border-b border-gray-100 hover:bg-[#F8F4F0] transition-colors">
                        <td className="py-3 px-3 text-xs text-[#333333] font-medium">{member.staffId}</td>
                        <td className="py-3 px-3 text-xs text-[#333333]">{member.fullName}</td>
                        <td className="py-3 px-3">
                          <p className="text-xs text-[#333333]">{member.email}</p>
                          <p className="text-xs text-[#333333] opacity-70">{member.phone || 'No phone'}</p>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getRoleColor(member.role)}`}>
                            {formatRole(member.role)}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            member.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {member.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => setSelectedStaff(member)}
                              className="text-[#FF6B35] hover:text-[#e55a2b] font-semibold text-xs"
                            >
                              View
                            </button>
                          </div>
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

      {/* Staff Details Modal */}
      {selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-[#333333]">{selectedStaff.fullName}</h2>
                <p className="text-xs text-[#333333] opacity-70">Staff ID: {selectedStaff.staffId}</p>
              </div>
              <button
                onClick={() => setSelectedStaff(null)}
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
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Email</p>
                  <p className="text-sm font-semibold text-[#333333]">{selectedStaff.email}</p>
                </div>
                <div>
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Phone</p>
                  <p className="text-sm font-semibold text-[#333333]">{selectedStaff.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Role</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getRoleColor(selectedStaff.role)}`}>
                    {formatRole(selectedStaff.role)}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Status</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                    selectedStaff.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedStaff.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => handleToggleStatus(selectedStaff)}
                  disabled={actionLoading}
                  className={`flex-1 px-4 py-2 text-sm rounded-lg font-semibold transition-colors disabled:opacity-50 ${
                    selectedStaff.active
                      ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {selectedStaff.active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDeleteStaff(selectedStaff.id)}
                  disabled={actionLoading}
                  className="flex-1 bg-red-600 text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#333333]">Add New Staff</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewStaff({ firstName: '', lastName: '', email: '', phone: '', role: 'WAITER', password: '' });
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
                handleAddStaff();
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#333333] mb-2">First Name *</label>
                    <input
                      type="text"
                      required
                      value={newStaff.firstName}
                      onChange={(e) => setNewStaff({ ...newStaff, firstName: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#333333] mb-2">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={newStaff.lastName}
                      onChange={(e) => setNewStaff({ ...newStaff, lastName: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-2">Phone</label>
                  <input
                    type="tel"
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-2">Role *</label>
                  <select
                    required
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as 'WAITER' | 'HOST' | 'MANAGER' })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none bg-white"
                  >
                    <option value="WAITER">Waiter</option>
                    <option value="HOST">Host</option>
                    <option value="MANAGER">Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-2">Password *</label>
                  <input
                    type="password"
                    required
                    value={newStaff.password}
                    onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                    placeholder="Min 6 characters"
                    minLength={6}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setNewStaff({ firstName: '', lastName: '', email: '', phone: '', role: 'WAITER', password: '' });
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
                    {actionLoading ? 'Adding...' : 'Add Staff'}
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
