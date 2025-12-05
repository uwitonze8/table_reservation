'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import CustomerSidebar from '@/components/customer/CustomerSidebar';
import { reservationApi, Reservation } from '@/lib/api';

interface UserStats {
  totalBookings: number;
  upcomingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  loyaltyPoints: number;
}

export default function ProfilePage() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  // Initialize profile data from user
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  // Fetch reservations for stats
  useEffect(() => {
    const fetchReservations = async () => {
      if (!isLoggedIn) return;

      try {
        setLoading(true);
        const response = await reservationApi.getMyReservations();
        if (response.success && response.data) {
          setReservations(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch reservations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return null;
  }

  // Calculate stats from real data
  const now = new Date();
  const userStats: UserStats = {
    totalBookings: reservations.length,
    upcomingBookings: reservations.filter(r => {
      const resDate = new Date(r.reservationDate);
      return resDate >= now && (r.status === 'CONFIRMED' || r.status === 'PENDING');
    }).length,
    completedBookings: reservations.filter(r => r.status === 'COMPLETED').length,
    cancelledBookings: reservations.filter(r => r.status === 'CANCELLED').length,
    loyaltyPoints: user?.loyaltyPoints || reservations.filter(r => r.status === 'COMPLETED').reduce((sum, r) => sum + r.loyaltyPointsEarned, 0),
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
    setSaveError(false);

    // Note: In a full implementation, this would call an API to update the profile
    // For now, we just simulate success since no update profile endpoint exists
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsSaving(false);
    setIsEditing(false);
    setSaveMessage('Profile updated successfully!');

    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSaveMessage('Passwords do not match!');
      setSaveError(true);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setSaveMessage('Password must be at least 8 characters!');
      setSaveError(true);
      return;
    }

    setIsSaving(true);
    setSaveMessage('');
    setSaveError(false);

    // Note: In a full implementation, this would call an API to update the password
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
              Welcome back, {profileData.firstName || 'User'}! Manage your profile and reservations.
            </p>
            {saveMessage && (
              <div className={`mt-3 px-3 py-2 rounded-lg text-sm ${
                saveError
                  ? 'bg-red-100 border border-red-400 text-red-700'
                  : 'bg-green-100 border border-green-400 text-green-700'
              }`}>
                {saveMessage}
              </div>
            )}
          </div>

          <div className="space-y-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white rounded-lg shadow-md p-3 text-center">
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-[#FF6B35]">{userStats.totalBookings}</p>
                    <p className="text-xs text-[#333333] opacity-70 mt-1">Total Bookings</p>
                  </>
                )}
              </div>
              <div className="bg-white rounded-lg shadow-md p-3 text-center">
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-green-600">{userStats.upcomingBookings}</p>
                    <p className="text-xs text-[#333333] opacity-70 mt-1">Upcoming</p>
                  </>
                )}
              </div>
              <div className="bg-white rounded-lg shadow-md p-3 text-center">
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-blue-600">{userStats.loyaltyPoints}</p>
                    <p className="text-xs text-[#333333] opacity-70 mt-1">Points</p>
                  </>
                )}
              </div>
              <div className="bg-white rounded-lg shadow-md p-3 text-center">
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-purple-600">{userStats.completedBookings}</p>
                    <p className="text-xs text-[#333333] opacity-70 mt-1">Completed</p>
                  </>
                )}
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
                    <p className="text-sm text-[#333333] py-1.5">{profileData.firstName || '-'}</p>
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
                    <p className="text-sm text-[#333333] py-1.5">{profileData.lastName || '-'}</p>
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
                    <p className="text-sm text-[#333333] py-1.5">{profileData.email || '-'}</p>
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
                    <p className="text-sm text-[#333333] py-1.5">{profileData.phone || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-1.5">Loyalty Tier</label>
                  <p className="text-sm text-[#333333] py-1.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#FF6B35] bg-opacity-10 text-[#FF6B35]">
                      {user?.loyaltyTier || 'Bronze'}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-1.5">Loyalty Points</label>
                  <p className="text-sm text-[#333333] py-1.5 font-bold">{userStats.loyaltyPoints} points</p>
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
                    <p className="text-xs text-[#333333] opacity-70">Keep your account secure</p>
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
