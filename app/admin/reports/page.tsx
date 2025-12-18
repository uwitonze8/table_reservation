'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { adminApi, ReportData, Reservation } from '@/lib/api';

export default function AdminReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);

  useEffect(() => {
    if (dateRange !== 'custom') {
      fetchReportData();
    }
  }, [dateRange]);

  // Helper function to get date range boundaries
  const getDateRange = (): { startDate: Date; endDate: Date; label: string } => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (dateRange) {
      case 'today':
        return {
          startDate: today,
          endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
          label: `Today (${today.toLocaleDateString()})`
        };
      case 'thisWeek': {
        const dayOfWeek = today.getDay();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - dayOfWeek);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        return {
          startDate: startOfWeek,
          endDate: endOfWeek,
          label: `This Week (${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()})`
        };
      }
      case 'thisMonth': {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);
        return {
          startDate: startOfMonth,
          endDate: endOfMonth,
          label: `This Month (${startOfMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})`
        };
      }
      case 'custom': {
        const start = customStartDate ? new Date(customStartDate) : today;
        const end = customEndDate ? new Date(customEndDate) : today;
        end.setHours(23, 59, 59, 999);
        return {
          startDate: start,
          endDate: end,
          label: `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
        };
      }
      default:
        return {
          startDate: today,
          endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
          label: 'Today'
        };
    }
  };

  // Filter reservations by date range
  const filterReservationsByDateRange = (reservations: Reservation[]): Reservation[] => {
    const { startDate, endDate } = getDateRange();

    return reservations.filter(r => {
      if (!r.reservationDate) return false;
      const reservationDate = new Date(r.reservationDate);
      return reservationDate >= startDate && reservationDate <= endDate;
    });
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch dashboard stats and all reservations to generate report data
      const [statsResponse, reservationsResponse] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getAllReservations(0, 1000)
      ]);

      if (statsResponse.success && statsResponse.data) {
        const stats = statsResponse.data;
        const allReservations = reservationsResponse.success && reservationsResponse.data
          ? reservationsResponse.data.content || []
          : [];

        // Filter reservations by selected date range
        const reservations = filterReservationsByDateRange(allReservations);

        // Calculate report data from filtered reservations
        const totalReservations = reservations.length;
        const confirmedReservations = reservations.filter(r => r.status === 'CONFIRMED').length;
        const completedReservations = reservations.filter(r => r.status === 'COMPLETED').length;
        const cancelledReservations = reservations.filter(r => r.status === 'CANCELLED').length;
        const totalGuests = reservations.reduce((sum, r) => sum + r.numberOfGuests, 0);
        const avgPartySize = totalReservations > 0 ? totalGuests / totalReservations : 0;
        const cancellationRate = totalReservations > 0
          ? (cancelledReservations / totalReservations) * 100
          : 0;

        // Generate top tables data from reservations
        const tableBookings: Record<number, { count: number; guests: number }> = {};
        reservations.forEach(r => {
          if (!tableBookings[r.tableNumber]) {
            tableBookings[r.tableNumber] = { count: 0, guests: 0 };
          }
          tableBookings[r.tableNumber].count++;
          tableBookings[r.tableNumber].guests += r.numberOfGuests;
        });

        const topTables = Object.entries(tableBookings)
          .map(([tableNum, data]) => ({
            tableNumber: parseInt(tableNum),
            bookings: data.count,
            avgGuests: data.count > 0 ? data.guests / data.count : 0
          }))
          .sort((a, b) => b.bookings - a.bookings)
          .slice(0, 5);

        // Generate peak hours from reservations
        const hourBookings: Record<string, number> = {};
        reservations.forEach(r => {
          const hour = r.reservationTime?.split(':')[0] || '12';
          const hourInt = parseInt(hour);
          const hourLabel = hourInt >= 12
            ? `${hourInt === 12 ? 12 : hourInt - 12}:00 PM`
            : `${hourInt === 0 ? 12 : hourInt}:00 AM`;
          hourBookings[hourLabel] = (hourBookings[hourLabel] || 0) + 1;
        });

        const peakHours = Object.entries(hourBookings)
          .map(([hour, bookings]) => ({ hour, bookings }))
          .sort((a, b) => b.bookings - a.bookings)
          .slice(0, 6);

        // Generate weekday breakdown
        const weekdayBookings: Record<string, number> = {};
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        reservations.forEach(r => {
          if (r.reservationDate) {
            const date = new Date(r.reservationDate);
            const dayName = dayNames[date.getDay()];
            weekdayBookings[dayName] = (weekdayBookings[dayName] || 0) + 1;
          }
        });

        const weekdayBreakdown = dayNames
          .map(dayName => ({ dayName, bookings: weekdayBookings[dayName] || 0 }))
          .sort((a, b) => b.bookings - a.bookings);

        // Calculate unique customers from filtered reservations
        const uniqueCustomerEmails = new Set(reservations.map(r => r.customerEmail));
        const totalUniqueCustomers = uniqueCustomerEmails.size;

        // Calculate table utilization from filtered data
        const tableUtilization = stats.occupancyRate || 0;

        const generatedReport: ReportData = {
          summary: {
            totalReservations,
            confirmedReservations,
            completedReservations,
            cancelledReservations,
            totalGuests,
            averagePartySize: avgPartySize,
            tableUtilization,
            cancellationRate
          },
          topTables,
          peakHours,
          customerStats: {
            newCustomers: totalUniqueCustomers,
            returningCustomers: 0,
            totalUniqueCustomers
          },
          weekdayBreakdown
        };

        setReportData(generatedReport);
      } else {
        setError(statsResponse.message || 'Failed to load reports');
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      setError('Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!reportData) return;

    const { label: dateRangeLabel } = getDateRange();

    // Create an iframe for printing in the same tab
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QuickTable Report - ${dateRangeLabel}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #FF6B35; padding-bottom: 20px; }
          .header h1 { color: #FF6B35; font-size: 28px; margin-bottom: 5px; }
          .header p { color: #666; font-size: 14px; }
          .section { margin-bottom: 25px; }
          .section h2 { color: #333; font-size: 18px; margin-bottom: 15px; border-left: 4px solid #FF6B35; padding-left: 10px; }
          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px; }
          .stat-card { background: #f8f4f0; padding: 15px; border-radius: 8px; text-align: center; }
          .stat-card .value { font-size: 24px; font-weight: bold; color: #FF6B35; }
          .stat-card .label { font-size: 12px; color: #666; margin-top: 5px; }
          .status-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
          .status-card { padding: 15px; border-radius: 8px; text-align: center; color: white; }
          .status-card.confirmed { background: linear-gradient(135deg, #22c55e, #16a34a); }
          .status-card.completed { background: linear-gradient(135deg, #3b82f6, #2563eb); }
          .status-card.cancelled { background: linear-gradient(135deg, #ef4444, #dc2626); }
          .status-card.rate { background: linear-gradient(135deg, #eab308, #ca8a04); }
          .status-card .value { font-size: 24px; font-weight: bold; }
          .status-card .label { font-size: 12px; opacity: 0.9; }
          .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #eee; }
          th { background: #f8f4f0; font-weight: 600; }
          .footer { margin-top: 30px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Quick Table</h1>
          <p>Restaurant Performance Report</p>
          <p style="margin-top: 10px;"><strong>Period:</strong> ${dateRangeLabel} | <strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <div class="section">
          <h2>Summary Statistics</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="value">${reportData.summary.totalReservations}</div>
              <div class="label">Total Reservations</div>
            </div>
            <div class="stat-card">
              <div class="value" style="color: #3b82f6;">${reportData.summary.totalGuests}</div>
              <div class="label">Total Guests</div>
            </div>
            <div class="stat-card">
              <div class="value" style="color: #8b5cf6;">${reportData.summary.averagePartySize.toFixed(1)}</div>
              <div class="label">Avg Party Size</div>
            </div>
            <div class="stat-card">
              <div class="value" style="color: #22c55e;">${reportData.summary.tableUtilization}%</div>
              <div class="label">Table Utilization</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Reservation Status</h2>
          <div class="status-grid">
            <div class="status-card confirmed">
              <div class="value">${reportData.summary.confirmedReservations}</div>
              <div class="label">Confirmed</div>
            </div>
            <div class="status-card completed">
              <div class="value">${reportData.summary.completedReservations}</div>
              <div class="label">Completed</div>
            </div>
            <div class="status-card cancelled">
              <div class="value">${reportData.summary.cancelledReservations}</div>
              <div class="label">Cancelled</div>
            </div>
            <div class="status-card rate">
              <div class="value">${reportData.summary.cancellationRate.toFixed(1)}%</div>
              <div class="label">Cancellation Rate</div>
            </div>
          </div>
        </div>

        <div class="section two-col">
          <div>
            <h2>Top Tables</h2>
            <table>
              <thead>
                <tr><th>Rank</th><th>Table</th><th>Bookings</th><th>Avg Guests</th></tr>
              </thead>
              <tbody>
                ${reportData.topTables.map((t, i) => `
                  <tr>
                    <td>#${i + 1}</td>
                    <td>Table ${t.tableNumber}</td>
                    <td>${t.bookings}</td>
                    <td>${t.avgGuests.toFixed(1)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div>
            <h2>Peak Hours</h2>
            <table>
              <thead>
                <tr><th>Time</th><th>Bookings</th></tr>
              </thead>
              <tbody>
                ${reportData.peakHours.map(h => `
                  <tr>
                    <td>${h.hour}</td>
                    <td>${h.bookings}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="section two-col">
          <div>
            <h2>Customer Statistics</h2>
            <table>
              <tbody>
                <tr><td>New Customers</td><td><strong>${reportData.customerStats.newCustomers}</strong></td></tr>
                <tr><td>Returning Customers</td><td><strong>${reportData.customerStats.returningCustomers}</strong></td></tr>
                <tr><td>Total Unique Customers</td><td><strong>${reportData.customerStats.totalUniqueCustomers}</strong></td></tr>
              </tbody>
            </table>
          </div>
          <div>
            <h2>Busiest Days</h2>
            <table>
              <thead>
                <tr><th>Day</th><th>Bookings</th></tr>
              </thead>
              <tbody>
                ${reportData.weekdayBreakdown.slice(0, 5).map(d => `
                  <tr>
                    <td>${d.dayName}</td>
                    <td>${d.bookings}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="footer">
          <p>Generated by Quick Table Restaurant Management System</p>
        </div>
      </body>
      </html>
    `;

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) {
      document.body.removeChild(iframe);
      return;
    }

    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    // Use setTimeout to ensure the content is fully rendered before printing
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      // Remove iframe after printing
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 250);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F8F4F0]">
        <AdminSidebar />
        <main className="flex-1 ml-64 py-8 px-4 sm:px-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin w-12 h-12 border-4 border-[#FF6B35] border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-sm text-[#333333] opacity-70">Loading reports...</p>
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
              onClick={fetchReportData}
              className="ml-4 text-red-700 underline hover:no-underline cursor-pointer"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!reportData) {
    return null;
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
                <h1 className="text-2xl font-bold text-[#333333] mb-1">Reports & Analytics</h1>
                <p className="text-sm text-[#333333] opacity-70">
                  View restaurant performance metrics and insights
                </p>
                <p className="text-xs text-[#FF6B35] font-semibold mt-1">
                  Showing data for: {getDateRange().label}
                </p>
              </div>
              <div className="flex gap-2 items-center">
                {/* Date Range Buttons */}
                <div className="flex bg-white rounded-lg border border-gray-300 p-1">
                  <button
                    onClick={() => setDateRange('today')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                      dateRange === 'today'
                        ? 'bg-[#FF6B35] text-white'
                        : 'text-[#333333] hover:bg-gray-100'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setDateRange('thisWeek')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                      dateRange === 'thisWeek'
                        ? 'bg-[#FF6B35] text-white'
                        : 'text-[#333333] hover:bg-gray-100'
                    }`}
                  >
                    This Week
                  </button>
                  <button
                    onClick={() => setDateRange('thisMonth')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                      dateRange === 'thisMonth'
                        ? 'bg-[#FF6B35] text-white'
                        : 'text-[#333333] hover:bg-gray-100'
                    }`}
                  >
                    This Month
                  </button>
                  <button
                    onClick={() => setShowCustomModal(true)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                      dateRange === 'custom'
                        ? 'bg-[#FF6B35] text-white'
                        : 'text-[#333333] hover:bg-gray-100'
                    }`}
                  >
                    Custom
                  </button>
                </div>

                {/* Show current date range label for custom */}
                {dateRange === 'custom' && customStartDate && customEndDate && (
                  <span className="text-xs text-[#333333] opacity-70 bg-[#F8F4F0] px-2 py-1 rounded">
                    {new Date(customStartDate).toLocaleDateString()} - {new Date(customEndDate).toLocaleDateString()}
                  </span>
                )}

                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm bg-[#FF6B35] text-white rounded-lg hover:bg-[#e55a2b] transition-colors font-semibold cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Report
                </button>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-white rounded-lg shadow-md p-3">
              <p className="text-xs text-[#333333] opacity-70 mb-0.5">Total Reservations</p>
              <p className="text-2xl font-bold text-[#333333]">{reportData.summary.totalReservations}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3">
              <p className="text-xs text-[#333333] opacity-70 mb-0.5">Total Guests</p>
              <p className="text-2xl font-bold text-blue-600">{reportData.summary.totalGuests}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3">
              <p className="text-xs text-[#333333] opacity-70 mb-0.5">Avg Party Size</p>
              <p className="text-2xl font-bold text-purple-600">{reportData.summary.averagePartySize.toFixed(1)}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3">
              <p className="text-xs text-[#333333] opacity-70 mb-0.5">Table Utilization</p>
              <p className="text-2xl font-bold text-green-600">{reportData.summary.tableUtilization}%</p>
            </div>
          </div>

          {/* Reservation Status */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-3 text-white">
              <p className="text-white opacity-90 mb-0.5 text-xs">Confirmed</p>
              <p className="text-2xl font-bold">{reportData.summary.confirmedReservations}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-3 text-white">
              <p className="text-white opacity-90 mb-0.5 text-xs">Completed</p>
              <p className="text-2xl font-bold">{reportData.summary.completedReservations}</p>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-md p-3 text-white">
              <p className="text-white opacity-90 mb-0.5 text-xs">Cancelled</p>
              <p className="text-2xl font-bold">{reportData.summary.cancelledReservations}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-md p-3 text-white">
              <p className="text-white opacity-90 mb-0.5 text-xs">Cancellation Rate</p>
              <p className="text-2xl font-bold">{reportData.summary.cancellationRate.toFixed(1)}%</p>
            </div>
          </div>

          {/* Top Tables and Peak Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Top Tables */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-xl font-bold text-[#333333] mb-4">Top Tables</h2>
              {reportData.topTables.length === 0 ? (
                <p className="text-sm text-[#333333] opacity-70 text-center py-4">No data available</p>
              ) : (
                <div className="space-y-3">
                  {reportData.topTables.map((table, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="font-semibold text-[#333333] text-sm">Table {table.tableNumber}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#FF6B35] text-sm">{table.bookings} bookings</p>
                        <p className="text-xs text-[#333333] opacity-70">{table.avgGuests.toFixed(1)} avg guests</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Peak Hours */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-xl font-bold text-[#333333] mb-4">Peak Hours</h2>
              {reportData.peakHours.length === 0 ? (
                <p className="text-sm text-[#333333] opacity-70 text-center py-4">No data available</p>
              ) : (
                <div className="space-y-3">
                  {reportData.peakHours.map((hour, index) => {
                    const maxBookings = Math.max(...reportData.peakHours.map(h => h.bookings));
                    const percentage = maxBookings > 0 ? (hour.bookings / maxBookings) * 100 : 0;
                    return (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-semibold text-[#333333]">{hour.hour}</span>
                          <span className="text-xs text-[#FF6B35] font-bold">{hour.bookings} bookings</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#FF6B35] h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Customer Stats and Weekday Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Stats */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-xl font-bold text-[#333333] mb-4">Customer Statistics</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-[#F8F4F0] rounded-lg">
                  <p className="text-2xl font-bold text-[#FF6B35]">{reportData.customerStats.newCustomers}</p>
                  <p className="text-xs text-[#333333] opacity-70">New Customers</p>
                </div>
                <div className="text-center p-3 bg-[#F8F4F0] rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{reportData.customerStats.returningCustomers}</p>
                  <p className="text-xs text-[#333333] opacity-70">Returning Customers</p>
                </div>
                <div className="text-center p-3 bg-[#F8F4F0] rounded-lg col-span-2">
                  <p className="text-2xl font-bold text-green-600">{reportData.customerStats.totalUniqueCustomers}</p>
                  <p className="text-xs text-[#333333] opacity-70">Total Unique Customers</p>
                </div>
              </div>
            </div>

            {/* Weekday Breakdown */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-xl font-bold text-[#333333] mb-4">Busiest Days</h2>
              {reportData.weekdayBreakdown.length === 0 ? (
                <p className="text-sm text-[#333333] opacity-70 text-center py-4">No data available</p>
              ) : (
                <div className="space-y-2">
                  {reportData.weekdayBreakdown.slice(0, 5).map((day, index) => {
                    const maxBookings = Math.max(...reportData.weekdayBreakdown.map(d => d.bookings));
                    const percentage = maxBookings > 0 ? (day.bookings / maxBookings) * 100 : 0;
                    return (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-semibold text-[#333333]">{day.dayName}</span>
                          <span className="text-xs text-[#FF6B35] font-bold">{day.bookings} bookings</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-[#FF6B35] h-1.5 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Custom Date Range Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-[#333333]">Custom Date Range</h3>
                <button
                  onClick={() => setShowCustomModal(false)}
                  className="text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#333333] mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    max={customEndDate || undefined}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none text-[#333333]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#333333] mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    min={customStartDate || undefined}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none text-[#333333]"
                  />
                </div>

                {/* Quick Select Presets */}
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-[#333333] opacity-70 mb-2">Quick Select:</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        const today = new Date();
                        const lastWeek = new Date(today);
                        lastWeek.setDate(today.getDate() - 7);
                        setCustomStartDate(lastWeek.toISOString().split('T')[0]);
                        setCustomEndDate(today.toISOString().split('T')[0]);
                      }}
                      className="px-2 py-1 text-xs bg-[#F8F4F0] text-[#333333] rounded hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      Last 7 Days
                    </button>
                    <button
                      onClick={() => {
                        const today = new Date();
                        const last30 = new Date(today);
                        last30.setDate(today.getDate() - 30);
                        setCustomStartDate(last30.toISOString().split('T')[0]);
                        setCustomEndDate(today.toISOString().split('T')[0]);
                      }}
                      className="px-2 py-1 text-xs bg-[#F8F4F0] text-[#333333] rounded hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      Last 30 Days
                    </button>
                    <button
                      onClick={() => {
                        const today = new Date();
                        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
                        setCustomStartDate(lastMonth.toISOString().split('T')[0]);
                        setCustomEndDate(lastMonthEnd.toISOString().split('T')[0]);
                      }}
                      className="px-2 py-1 text-xs bg-[#F8F4F0] text-[#333333] rounded hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      Last Month
                    </button>
                    <button
                      onClick={() => {
                        const today = new Date();
                        const last90 = new Date(today);
                        last90.setDate(today.getDate() - 90);
                        setCustomStartDate(last90.toISOString().split('T')[0]);
                        setCustomEndDate(today.toISOString().split('T')[0]);
                      }}
                      className="px-2 py-1 text-xs bg-[#F8F4F0] text-[#333333] rounded hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      Last 90 Days
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCustomModal(false)}
                  className="flex-1 px-4 py-2 text-sm border border-gray-300 text-[#333333] rounded-lg hover:bg-gray-100 transition-colors font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (customStartDate && customEndDate) {
                      setDateRange('custom');
                      setShowCustomModal(false);
                      fetchReportData();
                    }
                  }}
                  disabled={!customStartDate || !customEndDate}
                  className="flex-1 px-4 py-2 text-sm bg-[#FF6B35] text-white rounded-lg hover:bg-[#e55a2b] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
