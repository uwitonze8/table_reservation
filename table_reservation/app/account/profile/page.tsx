'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import CustomerSidebar from '@/components/customer/CustomerSidebar';

export default function ProfilePage() {
  const { user, isLoggedIn, logout } = useAuth();
  const router = useRouter();

  // Redirect if not logged in
  if (!isLoggedIn) {
    router.push('/login');
    return null;
  }

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.name?.split(' ')[0] || 'John',
    lastName: user?.name?.split(' ')[1] || 'Doe',
    email: user?.email || 'john.doe@example.com',
    phone: user?.phone || '(555) 123-4567',
    birthday: '1990-05-15',
    dietaryPreferences: ['Vegetarian'],
    favoriteTable: 'Window seat',
    specialRequests: 'Prefer quiet area',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const userStats = {
    totalBookings: 24,
    upcomingBookings: 2,
    completedBookings: 22,
    cancelledBookings: 0,
    loyaltyPoints: 150,
    memberSince: 'January 2024',
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsSaving(false);
    setIsEditing(false);
    setSaveMessage('Profile updated successfully!');

    // Clear success message after 3 seconds
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSaveMessage('Passwords do not match!');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setSaveMessage('Password must be at least 8 characters!');
      return;
    }

    setIsSaving(true);
    setSaveMessage('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsSaving(false);
    setIsChangingPassword(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setSaveMessage('Password updated successfully!');

    setTimeout(() => setSaveMessage(''), 3000);
  };

  return (
    <div className="flex min-h-screen bg-[#F8F4F0]">
      {/* Sidebar */}
      <CustomerSidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#333333]">My Account</h1>
                <p className="text-[#333333] opacity-70 mt-1 text-sm">
                  Welcome back, {profileData.firstName}! Manage your profile and reservations.
                </p>
                {saveMessage && (
                  <div className="mt-3 bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded-lg text-sm">
                    {saveMessage}
                  </div>
                )}
              </div>

              <div className="space-y-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white rounded-lg shadow-md p-3 text-center">
                <p className="text-2xl font-bold text-[#FF6B35]">{userStats.totalBookings}</p>
                <p className="text-xs text-[#333333] opacity-70 mt-1">Total Bookings</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{userStats.upcomingBookings}</p>
                <p className="text-xs text-[#333333] opacity-70 mt-1">Upcoming</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">{userStats.loyaltyPoints}</p>
                <p className="text-xs text-[#333333] opacity-70 mt-1">Points</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-3 text-center">
                <p className="text-2xl font-bold text-purple-600">{userStats.completedBookings}</p>
                <p className="text-xs text-[#333333] opacity-70 mt-1">Completed</p>
              </div>
            </div>

            {/* Profile Information */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#333333]">Profile Information</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-[#FF6B35] hover:text-[#e55a2b] text-sm font-semibold flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 text-sm border-2 border-gray-300 text-[#333333] rounded-lg font-semibold hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-3 py-1.5 text-sm bg-[#FF6B35] text-white rounded-lg font-semibold hover:bg-[#e55a2b] disabled:opacity-50"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-1.5">First Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                    />
                  ) : (
                    <p className="text-sm text-[#333333] py-1.5">{profileData.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-1.5">Last Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                    />
                  ) : (
                    <p className="text-sm text-[#333333] py-1.5">{profileData.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-1.5">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                    />
                  ) : (
                    <p className="text-sm text-[#333333] py-1.5">{profileData.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-1.5">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                    />
                  ) : (
                    <p className="text-sm text-[#333333] py-1.5">{profileData.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-1.5">Birthday</label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="birthday"
                      value={profileData.birthday}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                    />
                  ) : (
                    <p className="text-sm text-[#333333] py-1.5">{new Date(profileData.birthday).toLocaleDateString()}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-1.5">Dietary Preferences</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="dietaryPreferences"
                      value={profileData.dietaryPreferences.join(', ')}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                      placeholder="Vegetarian, Gluten-Free, etc."
                    />
                  ) : (
                    <p className="text-sm text-[#333333] py-1.5">{profileData.dietaryPreferences.join(', ') || 'None specified'}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-[#333333] mb-1.5">Special Requests / Notes</label>
                  {isEditing ? (
                    <textarea
                      name="specialRequests"
                      value={profileData.specialRequests}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none resize-none"
                      placeholder="Any special requirements or preferences..."
                    />
                  ) : (
                    <p className="text-sm text-[#333333] py-1.5">{profileData.specialRequests || 'None'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-xl font-bold text-[#333333] mb-3">Security</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <div>
                    <p className="text-sm font-semibold text-[#333333]">Password</p>
                    <p className="text-xs text-[#333333] opacity-70">Last changed 30 days ago</p>
                  </div>
                  <button
                    onClick={() => setIsChangingPassword(!isChangingPassword)}
                    className="text-[#FF6B35] hover:text-[#e55a2b] text-sm font-semibold"
                  >
                    {isChangingPassword ? 'Cancel' : 'Change'}
                  </button>
                </div>

                {isChangingPassword && (
                  <div className="bg-[#F8F4F0] rounded-lg p-3 space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#333333] mb-1.5">Current Password</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#333333] mb-1.5">New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#333333] mb-1.5">Confirm New Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                      />
                    </div>
                    <button
                      onClick={handlePasswordUpdate}
                      disabled={isSaving}
                      className="w-full bg-[#FF6B35] text-white px-4 py-2 text-sm rounded-lg font-semibold hover:bg-[#e55a2b] disabled:opacity-50"
                    >
                      {isSaving ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-semibold text-[#333333]">Two-Factor Authentication</p>
                    <p className="text-xs text-[#333333] opacity-70">Add extra security to your account</p>
                  </div>
                  <button className="px-3 py-1.5 text-sm bg-[#F8F4F0] text-[#333333] rounded-lg font-semibold hover:bg-gray-200">
                    Enable
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
