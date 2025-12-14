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
  const [statusFilter, setStatusFilter] = useState('all');
  const [showPassword, setShowPassword] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ name: string; email: string; password: string } | null>(null);
  const [newStaff, setNewStaff] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'WAITER' as 'WAITER' | 'HOST' | 'MANAGER',
    password: '',
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
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

  const openDeleteModal = (member: Staff) => {
    setStaffToDelete(member);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setStaffToDelete(null);
  };

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
        // Save credentials before clearing the form
        setCreatedCredentials({
          name: fullName,
          email: newStaff.email,
          password: newStaff.password,
        });
        await fetchStaff();
        setShowAddModal(false);
        setShowPassword(false);
        setNewStaff({ firstName: '', lastName: '', email: '', phone: '', role: 'WAITER', password: '' });
        // Show credentials modal
        setShowCredentialsModal(true);
      } else {
        console.error('Failed to create staff:', response.message);
        showNotification('error', 'Failed to Add', response.message || 'Failed to add staff member');
      }
    } catch (err) {
      console.error('Error creating staff:', err);
      showNotification('error', 'Error', 'Failed to add staff member. Please try again.');
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
        showNotification('success', 'Status Updated', 'Staff member status has been updated successfully.');
      } else {
        showNotification('error', 'Update Failed', response.message || 'Failed to update staff status');
      }
    } catch (err) {
      showNotification('error', 'Error', 'Failed to update staff status. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!staffToDelete) return;

    try {
      setDeleteLoading(true);
      const response = await adminApi.deleteStaff(staffToDelete.id);

      if (response.success) {
        await fetchStaff();
        setSelectedStaff(null);
        closeDeleteModal();
        showNotification('success', 'Staff Deleted', 'Staff member has been deleted successfully.');
      } else {
        showNotification('error', 'Delete Failed', response.message || 'Failed to delete staff');
      }
    } catch (err) {
      showNotification('error', 'Error', 'Failed to delete staff. Please try again.');
    } finally {
      setDeleteLoading(false);
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

  const filteredStaff = staff.filter(s => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return s.active;
    if (statusFilter === 'inactive') return !s.active;
    return true;
  });

  const stats = {
    total: staff.length,
    active: staff.filter(s => s.active).length,
    inactive: staff.filter(s => !s.active).length,
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
                <h1 className="text-2xl font-bold text-[#333333] mb-1">Staff Management</h1>
                <p className="text-sm text-[#333333] opacity-70">
                  Manage restaurant staff and their roles
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm bg-[#FF6B35] text-white rounded-lg hover:bg-[#e55a2b] transition-colors font-semibold cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Waiter
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white rounded-lg shadow-md p-3">
              <p className="text-xs text-[#333333] opacity-70 mb-0.5">Total Staff</p>
              <p className="text-2xl font-bold text-[#333333]">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3">
              <p className="text-xs text-[#333333] opacity-70 mb-0.5">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3">
              <p className="text-xs text-[#333333] opacity-70 mb-0.5">Inactive</p>
              <p className="text-2xl font-bold text-gray-500">{stats.inactive}</p>
            </div>
          </div>

          {/* Filter */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <label className="block text-xs font-semibold text-[#333333] mb-2">Filter by Status</label>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'all', label: 'All' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ].map((status) => (
                <button
                  key={status.value}
                  onClick={() => setStatusFilter(status.value)}
                  className={`px-4 py-2 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
                    statusFilter === status.value
                      ? 'bg-[#FF6B35] text-white'
                      : 'bg-gray-100 text-[#333333] hover:bg-gray-200'
                  }`}
                >
                  {status.label}
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
                              className="text-[#FF6B35] hover:text-[#e55a2b] font-semibold text-xs cursor-pointer"
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
        <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-[#333333]">{selectedStaff.fullName}</h2>
                <p className="text-xs text-[#333333] opacity-70">Staff ID: {selectedStaff.staffId}</p>
              </div>
              <button
                onClick={() => setSelectedStaff(null)}
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
                  className={`flex-1 px-4 py-2 text-sm rounded-lg font-semibold transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed ${
                    selectedStaff.active
                      ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {selectedStaff.active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => openDeleteModal(selectedStaff)}
                  disabled={actionLoading}
                  className="flex-1 bg-red-600 text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
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
        <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#333333]">Add New Waiter</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowPassword(false);
                  setNewStaff({ firstName: '', lastName: '', email: '', phone: '', role: 'WAITER', password: '' });
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
                  <label className="block text-xs font-semibold text-[#333333] mb-2">Role</label>
                  <div className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 text-[#333333]">
                    Waiter
                  </div>
                  <input type="hidden" value="WAITER" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-2">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newStaff.password}
                      onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                      className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                      placeholder="Min 6 characters"
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-[#333333] cursor-pointer"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowPassword(false);
                      setNewStaff({ firstName: '', lastName: '', email: '', phone: '', role: 'WAITER', password: '' });
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
                    {actionLoading ? 'Adding...' : 'Add Staff'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Credentials Success Modal */}
      {showCredentialsModal && createdCredentials && (
        <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#333333]">Waiter Created Successfully!</h2>
                  <p className="text-xs text-[#333333] opacity-70">Save these credentials for the new waiter</p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="bg-[#F8F4F0] rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Name</p>
                  <p className="text-sm font-semibold text-[#333333]">{createdCredentials.name}</p>
                </div>
                <div>
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Email (Login)</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[#333333] flex-1 font-mono bg-white px-2 py-1 rounded border">{createdCredentials.email}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(createdCredentials.email);
                      }}
                      className="p-1.5 text-[#FF6B35] hover:bg-[#FF6B35]/10 rounded transition-colors cursor-pointer"
                      title="Copy email"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-[#333333] opacity-70 mb-1">Password</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[#333333] flex-1 font-mono bg-white px-2 py-1 rounded border">{createdCredentials.password}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(createdCredentials.password);
                      }}
                      className="p-1.5 text-[#FF6B35] hover:bg-[#FF6B35]/10 rounded transition-colors cursor-pointer"
                      title="Copy password"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex gap-2">
                  <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-xs text-yellow-800">
                    <strong>Important:</strong> Please save or share these credentials with the waiter now. The password cannot be retrieved later for security reasons.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCredentialsModal(false);
                  setCreatedCredentials(null);
                }}
                className="w-full mt-4 bg-[#FF6B35] text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-[#e55a2b] transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && staffToDelete && (
        <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#333333]">Delete Staff Member</h2>
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
                {staffToDelete.fullName}?
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
                  onClick={handleDeleteStaff}
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
