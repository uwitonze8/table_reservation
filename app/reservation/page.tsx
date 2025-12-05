'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TableLayout, { Table } from '@/components/reservation/TableLayout';
import { useAuth } from '@/contexts/AuthContext';
import { reservationApi, tableApi } from '@/lib/api';

export default function ReservationPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: '2',
    specialRequests: '',
    tableId: '',
    tableName: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');
  const [reservationCode, setReservationCode] = useState('');

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
    }
  }, [user]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login?redirect=/reservation');
    }
  }, [isLoggedIn, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTableSelect = (table: Table) => {
    setFormData({
      ...formData,
      tableId: table.id,
      tableName: `Table ${table.number} (${table.seats} seats, ${table.location})`,
    });
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (formData.name && formData.email && formData.phone && formData.date && formData.time && formData.guests) {
        setStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (step === 2) {
      if (formData.tableId) {
        setStep(3);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrevStep = () => {
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Convert time string to 24-hour format for API
  const convertTo24Hour = (time12h: string): string => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');

    if (modifier === 'PM' && hours !== '12') {
      hours = String(parseInt(hours, 10) + 12);
    }
    if (modifier === 'AM' && hours === '12') {
      hours = '00';
    }

    return `${hours.padStart(2, '0')}:${minutes}:00`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await reservationApi.create({
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        reservationDate: formData.date,
        reservationTime: convertTo24Hour(formData.time),
        numberOfGuests: parseInt(formData.guests),
        tableId: parseInt(formData.tableId),
        specialRequests: formData.specialRequests || undefined,
      });

      if (response.success && response.data) {
        setReservationCode(response.data.reservationCode);
        setSubmitSuccess(true);

        // Redirect to my-reservations after 5 seconds
        setTimeout(() => {
          router.push('/my-reservations');
        }, 5000);
      } else {
        setError(response.message || 'Failed to create reservation. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading if not logged in
  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-[#F8F4F0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35] mx-auto mb-4"></div>
          <p className="text-[#333333]">Redirecting to login...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F4F0] py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-[#333333] mb-1">
            Reserve Your <span className="text-[#FF6B35]">Table</span>
          </h1>
          <p className="text-xs text-[#333333] opacity-80">
            Book your dining experience in just a few steps
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Progress Steps */}
        {!submitSuccess && (
          <div className="mb-4">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Step 1 */}
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step >= 1 ? 'bg-[#FF6B35] text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {step > 1 ? '✓' : '1'}
                  </div>
                  <span className={`ml-1 text-xs sm:text-sm font-semibold ${step >= 1 ? 'text-[#333333]' : 'text-gray-400'}`}>
                    Your Info
                  </span>
                </div>

                {/* Connector */}
                <div className={`w-8 sm:w-12 h-0.5 ${step >= 2 ? 'bg-[#FF6B35]' : 'bg-gray-300'}`}></div>

                {/* Step 2 */}
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step >= 2 ? 'bg-[#FF6B35] text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {step > 2 ? '✓' : '2'}
                  </div>
                  <span className={`ml-1 text-xs sm:text-sm font-semibold ${step >= 2 ? 'text-[#333333]' : 'text-gray-400'}`}>
                    Select Table
                  </span>
                </div>

                {/* Connector */}
                <div className={`w-8 sm:w-12 h-0.5 ${step >= 3 ? 'bg-[#FF6B35]' : 'bg-gray-300'}`}></div>

                {/* Step 3 */}
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step >= 3 ? 'bg-[#FF6B35] text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    3
                  </div>
                  <span className={`ml-1 text-xs sm:text-sm font-semibold ${step >= 3 ? 'text-[#333333]' : 'text-gray-400'}`}>
                    Confirm
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {submitSuccess && (
          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[#333333] mb-2">Reservation Confirmed!</h2>
              <p className="text-sm text-[#333333] opacity-80 mb-2">
                Confirmation email sent to {formData.email}
              </p>
              <p className="text-base font-bold text-[#FF6B35] mb-4">
                Confirmation Code: {reservationCode}
              </p>
              <div className="bg-[#F8F4F0] rounded-lg p-4 mt-4 max-w-md mx-auto">
                <div className="space-y-1 text-left text-sm">
                  <p className="text-[#333333]"><span className="font-semibold">Date:</span> {formData.date}</p>
                  <p className="text-[#333333]"><span className="font-semibold">Time:</span> {formData.time}</p>
                  <p className="text-[#333333]"><span className="font-semibold">Guests:</span> {formData.guests}</p>
                  <p className="text-[#333333]"><span className="font-semibold">Table:</span> {formData.tableName}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">Redirecting to My Reservations...</p>
            </div>
          </div>
        )}

        {/* Step 1: Basic Information */}
        {!submitSuccess && step === 1 && (
          <div className="bg-white rounded-lg shadow-xl p-5 md:p-6">
            <h2 className="text-lg font-bold text-[#333333] mb-4">Your Information</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label htmlFor="name" className="block text-xs font-semibold text-[#333333] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition text-[#333333]"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-[#333333] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition text-[#333333]"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold text-[#333333] mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition text-[#333333]"
                  />
                </div>

                {/* Number of Guests */}
                <div>
                  <label htmlFor="guests" className="block text-xs font-semibold text-[#333333] mb-1">
                    Number of Guests *
                  </label>
                  <select
                    id="guests"
                    name="guests"
                    value={formData.guests}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition text-[#333333] bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label htmlFor="date" className="block text-xs font-semibold text-[#333333] mb-1">
                    Reservation Date *
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition text-[#333333]"
                  />
                </div>

                {/* Time */}
                <div>
                  <label htmlFor="time" className="block text-xs font-semibold text-[#333333] mb-1">
                    Reservation Time *
                  </label>
                  <select
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition text-[#333333] bg-white"
                  >
                    <option value="">Select Time</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="12:30 PM">12:30 PM</option>
                    <option value="1:00 PM">1:00 PM</option>
                    <option value="1:30 PM">1:30 PM</option>
                    <option value="2:00 PM">2:00 PM</option>
                    <option value="5:00 PM">5:00 PM</option>
                    <option value="5:30 PM">5:30 PM</option>
                    <option value="6:00 PM">6:00 PM</option>
                    <option value="6:30 PM">6:30 PM</option>
                    <option value="7:00 PM">7:00 PM</option>
                    <option value="7:30 PM">7:30 PM</option>
                    <option value="8:00 PM">8:00 PM</option>
                    <option value="8:30 PM">8:30 PM</option>
                    <option value="9:00 PM">9:00 PM</option>
                    <option value="9:30 PM">9:30 PM</option>
                  </select>
                </div>
              </div>

              {/* Special Requests */}
              <div className="mt-4 md:col-span-2">
                <label htmlFor="specialRequests" className="block text-xs font-semibold text-[#333333] mb-1">
                  Special Requests (Optional)
                </label>
                <textarea
                  id="specialRequests"
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition text-[#333333] resize-none"
                  placeholder="Dietary restrictions, occasion, etc."
                />
              </div>

              {/* Next Button */}
              <div className="mt-5 flex justify-center">
                <button
                  type="submit"
                  className="w-full max-w-xs bg-[#FF6B35] text-white py-2 rounded-full text-sm font-semibold hover:bg-[#e55a2b] transition-all transform hover:scale-105 shadow-lg cursor-pointer"
                >
                  Continue to Table Selection
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 2: Table Selection */}
        {!submitSuccess && step === 2 && (
          <div className="space-y-4">
            <TableLayout
              selectedDate={formData.date}
              selectedTime={formData.time}
              selectedGuests={parseInt(formData.guests)}
              onTableSelect={handleTableSelect}
              selectedTableId={formData.tableId}
            />

            {/* Navigation Buttons */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={handlePrevStep}
                className="bg-white border-2 border-[#333333] text-[#333333] py-2 px-8 rounded-full text-sm font-semibold hover:bg-gray-50 transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                disabled={!formData.tableId}
                className="bg-[#FF6B35] text-white py-2 px-8 rounded-full text-sm font-semibold hover:bg-[#e55a2b] transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
              >
                Continue to Confirmation
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {!submitSuccess && step === 3 && (
          <div className="bg-white rounded-lg shadow-xl p-5 md:p-6">
            <h2 className="text-lg font-bold text-[#333333] mb-4">Confirm Your Reservation</h2>

            <div className="space-y-4">
              {/* Reservation Details */}
              <div className="bg-[#F8F4F0] rounded-lg p-4">
                <h3 className="text-base font-bold text-[#333333] mb-3">Reservation Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-[#333333] opacity-70">Name</p>
                    <p className="font-semibold text-sm text-[#333333]">{formData.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#333333] opacity-70">Email</p>
                    <p className="font-semibold text-sm text-[#333333]">{formData.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#333333] opacity-70">Phone</p>
                    <p className="font-semibold text-sm text-[#333333]">{formData.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#333333] opacity-70">Number of Guests</p>
                    <p className="font-semibold text-sm text-[#333333]">{formData.guests} {parseInt(formData.guests) === 1 ? 'Guest' : 'Guests'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#333333] opacity-70">Date</p>
                    <p className="font-semibold text-sm text-[#333333]">{new Date(formData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#333333] opacity-70">Time</p>
                    <p className="font-semibold text-sm text-[#333333]">{formData.time}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-[#333333] opacity-70">Selected Table</p>
                    <p className="font-semibold text-[#FF6B35] text-base">{formData.tableName}</p>
                  </div>
                  {formData.specialRequests && (
                    <div className="md:col-span-2">
                      <p className="text-xs text-[#333333] opacity-70">Special Requests</p>
                      <p className="font-semibold text-sm text-[#333333]">{formData.specialRequests}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Policy */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-[#333333]">
                  <span className="font-semibold">Cancellation Policy:</span> Cancellations must be made at least 2 hours in advance.
                  You will receive a confirmation email and SMS reminder.
                </p>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handlePrevStep}
                  className="bg-white border-2 border-[#333333] text-[#333333] py-2 px-8 rounded-full text-sm font-semibold hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-[#FF6B35] text-white py-2 px-8 rounded-full text-sm font-semibold hover:bg-[#e55a2b] transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Confirming...
                    </span>
                  ) : (
                    'Confirm Reservation'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
