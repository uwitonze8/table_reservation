'use client';

import { useState } from 'react';
import Link from 'next/link';
import CustomerSidebar from '@/components/customer/CustomerSidebar';

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState({
    // Dining Preferences
    favoriteSeatingArea: 'window',
    tableSize: '2-4',
    ambience: 'quiet',

    // Dietary
    dietaryRestrictions: ['vegetarian'],
    allergies: '',

    // Notifications
    emailNotifications: true,
    smsNotifications: true,
    reminderTime: '2hours',
    specialOffers: true,

    // Booking Preferences
    defaultGuests: '2',
    preferredDays: ['friday', 'saturday'],
    preferredTimes: ['7:00 PM', '8:00 PM'],
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleCheckboxChange = (category: string, value: string) => {
    const current = preferences[category as keyof typeof preferences] as string[];
    if (current.includes(value)) {
      setPreferences({
        ...preferences,
        [category]: current.filter(item => item !== value),
      });
    } else {
      setPreferences({
        ...preferences,
        [category]: [...current, value],
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div className="flex min-h-screen bg-[#F8F4F0]">
      {/* Sidebar */}
      <CustomerSidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 py-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#333333]">Dining Preferences</h1>
            <p className="text-sm text-[#333333] opacity-70 mt-1">
              Personalize your dining experience and get better recommendations
            </p>
          </div>

          {/* Dining Preferences */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h2 className="text-xl font-bold text-[#333333] mb-4">Seating & Ambience</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-2">Favorite Seating Area</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['window', 'center', 'patio', 'bar'].map((area) => (
                    <label
                      key={area}
                      className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        preferences.favoriteSeatingArea === area
                          ? 'border-[#FF6B35] bg-[#FF6B35] bg-opacity-10'
                          : 'border-gray-300 hover:border-[#FF6B35]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="favoriteSeatingArea"
                        value={area}
                        checked={preferences.favoriteSeatingArea === area}
                        onChange={(e) => setPreferences({ ...preferences, favoriteSeatingArea: e.target.value })}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium text-[#333333] capitalize">{area}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-2">Preferred Table Size</label>
                <div className="grid grid-cols-3 gap-3">
                  {['2-4', '4-6', '6+'].map((size) => (
                    <label
                      key={size}
                      className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        preferences.tableSize === size
                          ? 'border-[#FF6B35] bg-[#FF6B35] bg-opacity-10'
                          : 'border-gray-300 hover:border-[#FF6B35]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="tableSize"
                        value={size}
                        checked={preferences.tableSize === size}
                        onChange={(e) => setPreferences({ ...preferences, tableSize: e.target.value })}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium text-[#333333]">{size} seats</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-2">Preferred Ambience</label>
                <div className="grid grid-cols-3 gap-3">
                  {['quiet', 'moderate', 'lively'].map((amb) => (
                    <label
                      key={amb}
                      className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        preferences.ambience === amb
                          ? 'border-[#FF6B35] bg-[#FF6B35] bg-opacity-10'
                          : 'border-gray-300 hover:border-[#FF6B35]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="ambience"
                        value={amb}
                        checked={preferences.ambience === amb}
                        onChange={(e) => setPreferences({ ...preferences, ambience: e.target.value })}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium text-[#333333] capitalize">{amb}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Dietary Preferences */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h2 className="text-xl font-bold text-[#333333] mb-4">Dietary Preferences</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-2">Dietary Restrictions</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'halal'].map((diet) => (
                    <label
                      key={diet}
                      className="flex items-center p-2 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-[#FF6B35] transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={preferences.dietaryRestrictions.includes(diet)}
                        onChange={() => handleCheckboxChange('dietaryRestrictions', diet)}
                        className="w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]"
                      />
                      <span className="ml-2 text-sm text-[#333333] capitalize">{diet}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-2">Allergies</label>
                <input
                  type="text"
                  value={preferences.allergies}
                  onChange={(e) => setPreferences({ ...preferences, allergies: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                  placeholder="e.g., Shellfish, Peanuts..."
                />
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h2 className="text-xl font-bold text-[#333333] mb-4">Notifications</h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <div>
                  <p className="text-sm font-semibold text-[#333333]">Email Notifications</p>
                  <p className="text-xs text-[#333333] opacity-70">Receive booking confirmations and updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FF6B35] peer-focus:ring-opacity-30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6B35]"></div>
              </label>
            </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <div>
                  <p className="text-sm font-semibold text-[#333333]">SMS Notifications</p>
                  <p className="text-xs text-[#333333] opacity-70">Get text reminders before your reservation</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.smsNotifications}
                    onChange={(e) => setPreferences({ ...preferences, smsNotifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FF6B35] peer-focus:ring-opacity-30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6B35]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <div>
                  <p className="text-sm font-semibold text-[#333333]">Special Offers & Promotions</p>
                  <p className="text-xs text-[#333333] opacity-70">Receive exclusive deals and event invitations</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.specialOffers}
                    onChange={(e) => setPreferences({ ...preferences, specialOffers: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FF6B35] peer-focus:ring-opacity-30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6B35]"></div>
                </label>
              </div>

              <div className="py-2">
                <label className="block text-sm font-semibold text-[#333333] mb-2">Reminder Time</label>
                <select
                  value={preferences.reminderTime}
                  onChange={(e) => setPreferences({ ...preferences, reminderTime: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none bg-white"
                >
                  <option value="24hours">24 hours before</option>
                  <option value="12hours">12 hours before</option>
                  <option value="4hours">4 hours before</option>
                  <option value="2hours">2 hours before</option>
                  <option value="1hour">1 hour before</option>
                </select>
              </div>
            </div>
          </div>

          {/* Booking Preferences */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h2 className="text-xl font-bold text-[#333333] mb-4">Booking Preferences</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-2">Default Number of Guests</label>
                <select
                  value={preferences.defaultGuests}
                  onChange={(e) => setPreferences({ ...preferences, defaultGuests: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none bg-white"
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 text-sm bg-[#FF6B35] text-white rounded-lg font-semibold hover:bg-[#e55a2b] transition-all shadow-md disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
