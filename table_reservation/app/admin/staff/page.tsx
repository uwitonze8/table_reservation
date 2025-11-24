'use client';

import { useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';

interface StaffMember {
  id: string;
  staffId: string;
  name: string;
  email: string;
  role: 'waiter' | 'manager' | 'host';
  phone: string;
  status: 'active' | 'inactive';
  joinedDate: string;
}

// Mock data
const initialStaff: StaffMember[] = [
  { id: '1', staffId: 'STAFF-002', name: 'John Waiter', email: 'waiter@quicktable.com', role: 'waiter', phone: '+1 555-0101', status: 'active', joinedDate: '2024-01-15' },
  { id: '2', staffId: 'STAFF-003', name: 'Sarah Manager', email: 'sarah@quicktable.com', role: 'manager', phone: '+1 555-0102', status: 'active', joinedDate: '2024-02-20' },
  { id: '3', staffId: 'STAFF-004', name: 'Mike Host', email: 'mike@quicktable.com', role: 'host', phone: '+1 555-0103', status: 'active', joinedDate: '2024-03-10' },
];

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'waiter' as 'waiter' | 'manager' | 'host',
    password: '',
  });

  const handleAddStaff = () => {
    const staffMember: StaffMember = {
      id: `${staff.length + 1}`,
      staffId: `STAFF-${String(staff.length + 2).padStart(3, '0')}`,
      name: newStaff.name,
      email: newStaff.email,
      role: newStaff.role,
      phone: newStaff.phone,
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
    };

    setStaff([...staff, staffMember]);
    setShowAddModal(false);
    setNewStaff({ name: '', email: '', phone: '', role: 'waiter', password: '' });
  };

  const toggleStatus = (id: string) => {
    setStaff(staff.map(member =>
      member.id === id
        ? { ...member, status: member.status === 'active' ? 'inactive' : 'active' }
        : member
    ));
  };

  return (
    <div className="flex min-h-screen bg-[#F8F4F0]">
      <AdminSidebar />

      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#333333] mb-2">Staff Management</h1>
            <p className="text-[#333333] opacity-70">
              Manage your restaurant staff and their access
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-[#FF6B35] text-white px-6 py-3 rounded-lg hover:bg-[#e55a2b] transition-colors font-semibold shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add New Staff
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-[#333333] opacity-70 mb-1">Total Staff</p>
            <p className="text-3xl font-bold text-[#333333]">{staff.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-[#333333] opacity-70 mb-1">Active</p>
            <p className="text-3xl font-bold text-green-600">
              {staff.filter(s => s.status === 'active').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-[#333333] opacity-70 mb-1">Waiters</p>
            <p className="text-3xl font-bold text-blue-600">
              {staff.filter(s => s.role === 'waiter').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-[#333333] opacity-70 mb-1">Other Roles</p>
            <p className="text-3xl font-bold text-purple-600">
              {staff.filter(s => s.role !== 'waiter').length}
            </p>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-[#333333] mb-6">Staff Members</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#333333]">Staff ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#333333]">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#333333]">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#333333]">Phone</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#333333]">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#333333]">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#333333]">Joined</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#333333]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((member) => (
                  <tr key={member.id} className="border-b border-gray-100 hover:bg-[#F8F4F0] transition-colors">
                    <td className="py-4 px-4 text-sm text-[#333333] font-medium">{member.staffId}</td>
                    <td className="py-4 px-4 text-sm text-[#333333]">{member.name}</td>
                    <td className="py-4 px-4 text-sm text-[#333333]">{member.email}</td>
                    <td className="py-4 px-4 text-sm text-[#333333]">{member.phone}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        member.role === 'waiter' ? 'bg-blue-100 text-blue-800' :
                        member.role === 'manager' ? 'bg-purple-100 text-purple-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => toggleStatus(member.id)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          member.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-sm text-[#333333]">
                      {new Date(member.joinedDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button className="text-blue-600 hover:text-blue-800 font-semibold text-sm">
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-800 font-semibold text-sm">
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-[#333333] mb-6">Add New Staff Member</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#333333] mb-2">Full Name</label>
                <input
                  type="text"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#333333] mb-2">Email</label>
                <input
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                  placeholder="john@quicktable.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#333333] mb-2">Phone</label>
                <input
                  type="tel"
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                  placeholder="+1 555-0100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#333333] mb-2">Role</label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as 'waiter' | 'manager' | 'host' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                >
                  <option value="waiter">Waiter</option>
                  <option value="manager">Manager</option>
                  <option value="host">Host</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#333333] mb-2">Initial Password</label>
                <input
                  type="password"
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-[#333333] rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStaff}
                disabled={!newStaff.name || !newStaff.email || !newStaff.phone || !newStaff.password}
                className="flex-1 px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#e55a2b] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Staff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
