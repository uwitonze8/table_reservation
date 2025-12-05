'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { adminApi, ReportData } from '@/lib/api';

export default function AdminReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('thisMonth');

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch dashboard stats and reservations to generate report data
      const [statsResponse, reservationsResponse] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getAllReservations(0, 100)
      ]);

      if (statsResponse.success && statsResponse.data) {
        const stats = statsResponse.data;
        const reservations = reservationsResponse.success && reservationsResponse.data
          ? reservationsResponse.data.content || []
          : [];

        // Calculate report data from dashboard stats
        const totalGuests = stats.totalGuestsExpected + stats.totalGuestsServed;
        const totalReservations = stats.totalReservations || 1;
        const avgPartySize = totalGuests / totalReservations || 0;
        const cancellationRate = totalReservations > 0
          ? (stats.cancelledReservations / totalReservations) * 100
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

        const generatedReport: ReportData = {
          summary: {
            totalReservations: stats.totalReservations,
            confirmedReservations: stats.confirmedReservations,
            completedReservations: stats.completedReservations,
            cancelledReservations: stats.cancelledReservations,
            totalGuests,
            averagePartySize: avgPartySize,
            tableUtilization: stats.occupancyRate,
            cancellationRate
          },
          topTables,
          peakHours,
          customerStats: {
            newCustomers: stats.newCustomersToday,
            returningCustomers: Math.max(0, stats.totalCustomers - stats.newCustomersToday),
            totalUniqueCustomers: stats.totalCustomers
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

  const handleExportCSV = () => {
    if (!reportData) return;

    const csvData = `
QuickTable Restaurant Report
Date Range: ${dateRange === 'thisMonth' ? 'This Month' : dateRange === 'lastMonth' ? 'Last Month' : dateRange === 'thisWeek' ? 'This Week' : 'Last 7 Days'}
Generated: ${new Date().toLocaleString()}

Summary Statistics
Total Reservations,${reportData.summary.totalReservations}
Confirmed Reservations,${reportData.summary.confirmedReservations}
Completed Reservations,${reportData.summary.completedReservations}
Cancelled Reservations,${reportData.summary.cancelledReservations}
Total Guests,${reportData.summary.totalGuests}
Average Party Size,${reportData.summary.averagePartySize.toFixed(1)}
Table Utilization,${reportData.summary.tableUtilization}%
Cancellation Rate,${reportData.summary.cancellationRate.toFixed(1)}%

Top Tables
Table,Bookings
${reportData.topTables.map(t => `Table ${t.tableNumber},${t.bookings}`).join('\n')}

Peak Hours
Hour,Bookings
${reportData.peakHours.map(h => `${h.hour},${h.bookings}`).join('\n')}
    `.trim();

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quicktable-report-${dateRange}.csv`;
    a.click();
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
              className="ml-4 text-red-700 underline hover:no-underline"
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
              </div>
              <div className="flex gap-2">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none bg-white"
                >
                  <option value="thisWeek">This Week</option>
                  <option value="last7Days">Last 7 Days</option>
                  <option value="thisMonth">This Month</option>
                  <option value="lastMonth">Last Month</option>
                </select>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export CSV
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
    </div>
  );
}
