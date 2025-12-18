'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TableLayout, { Table } from '@/components/reservation/TableLayout';
import { useAuth } from '@/contexts/AuthContext';
import { reservationApi, tableApi, menuApi, MenuItem } from '@/lib/api';

export default function ReservationPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const [step, setStep] = useState(1);
  // Type for guest pre-order
  type GuestPreOrder = {
    drinks: string;
    food: string;
  };

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
    // Pre-order fields
    guestPreOrders: [] as GuestPreOrder[],
    dietaryNotes: '',
  });

  const [showPreOrder, setShowPreOrder] = useState(false);

  // Menu items from API
  const [drinkCategories, setDrinkCategories] = useState<Record<string, MenuItem[]>>({});
  const [foodCategories, setFoodCategories] = useState<Record<string, MenuItem[]>>({});
  const [menuLoading, setMenuLoading] = useState(true);

  // Fetch menu items on mount
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const [drinksRes, foodRes] = await Promise.all([
          menuApi.getDrinksGrouped(),
          menuApi.getFoodGrouped(),
        ]);

        if (drinksRes.success && drinksRes.data) {
          setDrinkCategories(drinksRes.data);
        }
        if (foodRes.success && foodRes.data) {
          setFoodCategories(foodRes.data);
        }
      } catch (err) {
        console.error('Failed to fetch menu items:', err);
      } finally {
        setMenuLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  // Initialize guest pre-orders when guest count changes
  useEffect(() => {
    const guestCount = parseInt(formData.guests);
    const currentLength = formData.guestPreOrders.length;

    if (guestCount !== currentLength) {
      const newPreOrders: GuestPreOrder[] = [];
      for (let i = 0; i < guestCount; i++) {
        // Preserve existing selections if available
        newPreOrders.push(formData.guestPreOrders[i] || { drinks: '', food: '' });
      }
      setFormData(prev => ({ ...prev, guestPreOrders: newPreOrders }));
    }
  }, [formData.guests]);

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

  // Convert 12-hour time to minutes from midnight for comparison
  const timeToMinutes = (time12h: string): number => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier === 'PM' && hours !== 12) {
      hours += 12;
    }
    if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }

    return hours * 60 + minutes;
  };

  // Get time slots based on day of the week
  // Opening Hours:
  // Monday - Friday: 5:00 AM - 11:00 PM
  // Saturday: 5:00 AM - 2:00 AM (next day)
  // Sunday: 11:30 AM - 9:00 PM
  const getTimeSlotsForDay = (dateString: string): string[] => {
    if (!dateString) return [];

    const date = new Date(dateString + 'T00:00:00');
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // Generate time slots in 30-minute intervals
    const generateSlots = (startHour: number, startMin: number, endHour: number, endMin: number): string[] => {
      const slots: string[] = [];
      let hour = startHour;
      let min = startMin;

      while (hour < endHour || (hour === endHour && min <= endMin)) {
        // Don't add slots too close to closing time (need at least 1 hour before close)
        const currentMinutes = hour * 60 + min;
        const closingMinutes = endHour * 60 + endMin;
        if (closingMinutes - currentMinutes < 60) break;

        // Convert to 12-hour format
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const ampm = hour < 12 ? 'AM' : 'PM';
        const timeStr = `${displayHour}:${min.toString().padStart(2, '0')} ${ampm}`;
        slots.push(timeStr);

        // Increment by 30 minutes
        min += 30;
        if (min >= 60) {
          min = 0;
          hour++;
        }
      }

      return slots;
    };

    switch (dayOfWeek) {
      case 0: // Sunday: 11:30 AM - 9:00 PM
        return generateSlots(11, 30, 21, 0);
      case 6: // Saturday: 5:00 AM - 2:00 AM (we'll limit to midnight for same-day booking)
        return generateSlots(5, 0, 24, 0);
      default: // Monday - Friday: 5:00 AM - 11:00 PM
        return generateSlots(5, 0, 23, 0);
    }
  };

  // Get available time slots based on selected date
  const getAvailableTimeSlots = (): string[] => {
    const daySlots = getTimeSlotsForDay(formData.date);
    const today = new Date().toISOString().split('T')[0];

    // If not today, return all time slots for that day
    if (formData.date !== today) {
      return daySlots;
    }

    // If today, filter out past times (only show future time slots)
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return daySlots.filter(slot => timeToMinutes(slot) > currentMinutes);
  };

  const availableTimeSlots = getAvailableTimeSlots();

  // Get day name for display
  const getDayName = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  // Get opening hours text for the selected day
  const getOpeningHoursText = (): string => {
    if (!formData.date) return '';
    const date = new Date(formData.date + 'T00:00:00');
    const dayOfWeek = date.getDay();

    switch (dayOfWeek) {
      case 0: return 'Sunday: 11:30 AM - 9:00 PM';
      case 6: return 'Saturday: 5:00 AM - 2:00 AM';
      default: return 'Mon-Fri: 5:00 AM - 11:00 PM';
    }
  };

  // Helper function to display pre-order labels
  const getPreOrderLabel = (type: 'drinks' | 'food', value: string): string => {
    if (!value) return '';

    // Find the item name from menu data
    const categories = type === 'drinks' ? drinkCategories : foodCategories;
    for (const items of Object.values(categories)) {
      const item = items.find(i => i.id.toString() === value);
      if (item) return item.name;
    }

    return value;
  };

  // Check if any pre-order was made
  const hasPreOrder = formData.guestPreOrders.some(g => g.drinks || g.food) || formData.dietaryNotes;

  // Handle guest pre-order change
  const handleGuestPreOrderChange = (guestIndex: number, field: 'drinks' | 'food', value: string) => {
    const newPreOrders = [...formData.guestPreOrders];
    newPreOrders[guestIndex] = { ...newPreOrders[guestIndex], [field]: value };
    setFormData(prev => ({ ...prev, guestPreOrders: newPreOrders }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // If date, time, or guests changed, reset table selection
    // because the available tables may have changed
    const shouldResetTable = name === 'date' || name === 'time' || name === 'guests';

    // If date changed, check if currently selected time is still valid
    if (name === 'date') {
      const today = new Date().toISOString().split('T')[0];
      const newDaySlots = getTimeSlotsForDay(value);

      // Check if current time selection exists in the new day's slots
      let shouldResetTime = false;

      if (formData.time) {
        // Check if the selected time exists in the new day's available slots
        const timeExistsInNewDay = newDaySlots.includes(formData.time);

        if (!timeExistsInNewDay) {
          shouldResetTime = true;
        } else if (value === today) {
          // If today, also check if time hasn't passed
          const now = new Date();
          const currentMinutes = now.getHours() * 60 + now.getMinutes();

          if (timeToMinutes(formData.time) <= currentMinutes) {
            shouldResetTime = true;
          }
        }
      }

      if (shouldResetTime) {
        setFormData({
          ...formData,
          date: value,
          time: '',
          tableId: '',
          tableName: '',
        });
        return;
      }
    }

    setFormData({
      ...formData,
      [name]: value,
      // Reset table selection when date, time, or guests change
      ...(shouldResetTable && { tableId: '', tableName: '' }),
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
      // Prepare pre-order data as JSON string
      const preOrderData = hasPreOrder
        ? JSON.stringify(formData.guestPreOrders.filter(g => g.drinks || g.food))
        : undefined;

      const response = await reservationApi.create({
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        reservationDate: formData.date,
        reservationTime: convertTo24Hour(formData.time),
        numberOfGuests: parseInt(formData.guests),
        tableId: parseInt(formData.tableId),
        specialRequests: formData.specialRequests || undefined,
        preOrderData: preOrderData,
        dietaryNotes: formData.dietaryNotes || undefined,
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
    <main className="min-h-screen bg-[#F8F4F0] pt-20 pb-6 px-4 sm:px-6 lg:px-8">
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
                    disabled={!formData.date}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition text-[#333333] bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">{!formData.date ? 'Select date first' : 'Select Time'}</option>
                    {availableTimeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                  {formData.date && (
                    <p className="text-xs text-gray-500 mt-1">
                      {getOpeningHoursText()}
                    </p>
                  )}
                  {formData.date === new Date().toISOString().split('T')[0] && availableTimeSlots.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">No available times left for today. Please select another date.</p>
                  )}
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

              {/* Pre-Order Section */}
              <div className="mt-4 md:col-span-2">
                <button
                  type="button"
                  onClick={() => setShowPreOrder(!showPreOrder)}
                  className="flex items-center gap-2 text-sm font-semibold text-[#FF6B35] hover:text-[#e55a2b] transition-colors cursor-pointer"
                >
                  <svg
                    className={`w-4 h-4 transition-transform ${showPreOrder ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                  Pre-order your meal (optional)
                </button>

                {showPreOrder && (
                  <div className="mt-3 p-4 bg-[#F8F4F0] rounded-lg space-y-4">
                    <p className="text-xs text-[#333333] opacity-70">
                      Pre-order drinks and food for each guest. This helps us prepare for your visit.
                    </p>

                    {menuLoading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#FF6B35] mx-auto"></div>
                        <p className="text-xs text-gray-500 mt-2">Loading menu...</p>
                      </div>
                    ) : (
                      <>
                        {/* Per-Guest Pre-Orders */}
                        <div className="space-y-3">
                          {formData.guestPreOrders.map((guestOrder, index) => (
                            <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                              <p className="text-xs font-semibold text-[#FF6B35] mb-2">
                                Guest {index + 1}
                              </p>
                              <div className="grid grid-cols-2 gap-3">
                                {/* Drinks */}
                                <div>
                                  <label className="block text-xs text-[#333333] mb-1">Drinks</label>
                                  <select
                                    value={guestOrder.drinks}
                                    onChange={(e) => handleGuestPreOrderChange(index, 'drinks', e.target.value)}
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition text-[#333333] bg-white"
                                  >
                                    <option value="">None</option>
                                    {Object.entries(drinkCategories).map(([category, items]) => (
                                      <optgroup key={category} label={category}>
                                        {items.map((item) => (
                                          <option key={item.id} value={item.id.toString()}>
                                            {item.name}
                                          </option>
                                        ))}
                                      </optgroup>
                                    ))}
                                  </select>
                                </div>

                                {/* Food */}
                                <div>
                                  <label className="block text-xs text-[#333333] mb-1">Food</label>
                                  <select
                                    value={guestOrder.food}
                                    onChange={(e) => handleGuestPreOrderChange(index, 'food', e.target.value)}
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition text-[#333333] bg-white"
                                  >
                                    <option value="">None</option>
                                    {Object.entries(foodCategories).map(([category, items]) => (
                                      <optgroup key={category} label={category}>
                                        {items.map((item) => (
                                          <option key={item.id} value={item.id.toString()}>
                                            {item.name}
                                          </option>
                                        ))}
                                      </optgroup>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Dietary Notes */}
                    <div>
                      <label htmlFor="dietaryNotes" className="block text-xs font-semibold text-[#333333] mb-1">
                        Dietary Notes (allergies, preferences for any guest)
                      </label>
                      <input
                        type="text"
                        id="dietaryNotes"
                        name="dietaryNotes"
                        value={formData.dietaryNotes}
                        onChange={handleChange}
                        placeholder="e.g., Guest 1: vegetarian, Guest 3: nut allergy"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition text-[#333333]"
                      />
                    </div>

                    <p className="text-xs text-gray-500">
                      * Final menu selection will be made at the restaurant. Pre-orders help us prepare for your visit.
                    </p>
                  </div>
                )}
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

            {/* Validation Message - Table Required */}
            {!formData.tableId && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-sm text-amber-800 font-semibold">Please select a table to continue</p>
                </div>
                <p className="text-xs text-amber-700 mt-1">Click on an available (green) table from the floor plan above</p>
              </div>
            )}

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

              {/* Pre-Order Details */}
              {hasPreOrder && (
                <div className="bg-[#FFF5F0] border border-[#FF6B35]/20 rounded-lg p-4">
                  <h3 className="text-base font-bold text-[#333333] mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Pre-Order
                  </h3>

                  {/* Per-Guest Pre-Orders */}
                  <div className="space-y-2">
                    {formData.guestPreOrders.map((guest, index) => (
                      (guest.drinks || guest.food) && (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <span className="font-semibold text-[#FF6B35] min-w-[60px]">Guest {index + 1}:</span>
                          <span className="text-[#333333]">
                            {[
                              guest.drinks && getPreOrderLabel('drinks', guest.drinks),
                              guest.food && getPreOrderLabel('food', guest.food)
                            ].filter(Boolean).join(' + ') || 'No pre-order'}
                          </span>
                        </div>
                      )
                    ))}
                  </div>

                  {formData.dietaryNotes && (
                    <div className="mt-3 pt-3 border-t border-[#FF6B35]/20">
                      <p className="text-xs text-[#333333] opacity-70">Dietary Notes</p>
                      <p className="font-semibold text-sm text-[#333333]">{formData.dietaryNotes}</p>
                    </div>
                  )}
                </div>
              )}

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
