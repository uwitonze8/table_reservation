'use client';

import { useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminReportsPage() {
  const [dateRange, setDateRange] = useState('thisMonth');
  const [reportType, setReportType] = useState('summary');

  // Mock data - Comprehensive reporting data
  const reportData = {
    summary: {
      totalReservations: 342,
      totalRevenue: 28450,
      averagePartySize: 3.2,
      cancellationRate: 8.5,
      noShowRate: 3.2,
      averageRevenuePerReservation: 83.19,
      totalGuests: 1094,
      tableUtilization: 72,
    },
    topTables: [
      { table: 'Table 5', bookings: 45, revenue: 3200, avgPartySize: 4 },
      { table: 'Table 12', bookings: 42, revenue: 2980, avgPartySize: 2 },
      { table: 'Table 8', bookings: 38, revenue: 2750, avgPartySize: 4 },
      { table: 'Table 10', bookings: 35, revenue: 2450, avgPartySize: 6 },
      { table: 'Table 3', bookings: 32, revenue: 2100, avgPartySize: 2 },
    ],
    peakHours: [
      { time: '6:00 PM', bookings: 65, revenue: 5200 },
      { time: '7:00 PM', bookings: 78, revenue: 6800 },
      { time: '8:00 PM', bookings: 95, revenue: 8200 },
      { time: '9:00 PM', bookings: 54, revenue: 4500 },
    ],
    customerSegments: [
      { type: 'New Customers', count: 145, percentage: 42, avgSpending: 78 },
      { type: 'Returning Customers', count: 197, percentage: 58, avgSpending: 87 },
    ],
    weeklyTrend: [
      { day: 'Monday', reservations: 38, revenue: 3200 },
      { day: 'Tuesday', reservations: 42, revenue: 3500 },
      { day: 'Wednesday', reservations: 45, revenue: 3750 },
      { day: 'Thursday', reservations: 52, revenue: 4200 },
      { day: 'Friday', reservations: 78, revenue: 6800 },
      { day: 'Saturday', reservations: 87, revenue: 7000 },
    ],
    topCustomers: [
      { name: 'Michael Brown', visits: 8, spent: 720, tierLevel: 'Platinum' },
      { name: 'John Smith', visits: 6, spent: 540, tierLevel: 'Gold' },
      { name: 'Sarah Johnson', visits: 5, spent: 450, tierLevel: 'Gold' },
      { name: 'Emily Davis', visits: 4, spent: 360, tierLevel: 'Silver' },
      { name: 'David Wilson', visits: 3, spent: 270, tierLevel: 'Silver' },
    ],
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const csvData = `
Restaurant Management Report
Report Type,${reportType}
Date Range,${dateRange}
Generated,${new Date().toLocaleString()}

SUMMARY METRICS
Total Reservations,${reportData.summary.totalReservations}
Total Revenue,$${reportData.summary.totalRevenue}
Average Party Size,${reportData.summary.averagePartySize} guests
Cancellation Rate,${reportData.summary.cancellationRate}%
No-Show Rate,${reportData.summary.noShowRate}%
Avg Revenue per Reservation,$${reportData.summary.averageRevenuePerReservation}
Total Guests,${reportData.summary.totalGuests}
Table Utilization,${reportData.summary.tableUtilization}%

TOP PERFORMING TABLES
Table,Bookings,Revenue,Avg Party Size
${reportData.topTables.map(t => `${t.table},${t.bookings},$${t.revenue},${t.avgPartySize}`).join('\n')}

PEAK HOURS
Time,Bookings,Revenue
${reportData.peakHours.map(h => `${h.time},${h.bookings},$${h.revenue}`).join('\n')}

CUSTOMER SEGMENTS
Segment,Count,Percentage,Avg Spending
${reportData.customerSegments.map(s => `${s.type},${s.count},${s.percentage}%,$${s.avgSpending}`).join('\n')}

TOP CUSTOMERS
Customer,Visits,Total Spent,Tier Level
${reportData.topCustomers.map(c => `${c.name},${c.visits},$${c.spent},${c.tierLevel}`).join('\n')}
    `.trim();

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `restaurant-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleExportPDF = () => {
    alert('PDF export: This would generate a professionally formatted PDF report using a library like jsPDF or Puppeteer');
  };

  return (
    <div className="flex min-h-screen bg-[#F8F4F0]">
      <AdminSidebar />

      <main className="flex-1 ml-64 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#333333] mb-1">Business Reports & Analytics</h1>
            <p className="text-sm text-[#333333] opacity-70">
              Comprehensive insights for restaurant performance and decision making
            </p>
          </div>

          {/* Filters & Export */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-2">Date Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none bg-white"
                >
                  <option value="today">Today</option>
                  <option value="thisWeek">This Week</option>
                  <option value="thisMonth">This Month</option>
                  <option value="lastMonth">Last Month</option>
                  <option value="thisQuarter">This Quarter</option>
                  <option value="thisYear">This Year</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-2">Report Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none bg-white"
                >
                  <option value="summary">Executive Summary</option>
                  <option value="detailed">Detailed Analytics</option>
                  <option value="financial">Financial Report</option>
                  <option value="customer">Customer Insights</option>
                  <option value="operational">Operational Metrics</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#333333] mb-2">Export Options</label>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrintReport}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    CSV
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    PDF
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-white rounded-lg shadow-md p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-[#333333] opacity-70">Total Reservations</p>
                <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-[#333333] mb-0.5">{reportData.summary.totalReservations}</p>
              <p className="text-xs text-green-600">↑ 12% vs last period</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-[#333333] opacity-70">Total Revenue</p>
                <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-[#333333] mb-0.5">${reportData.summary.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-green-600">↑ 8% vs last period</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-[#333333] opacity-70">Total Guests</p>
                <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-[#333333] mb-0.5">{reportData.summary.totalGuests}</p>
              <p className="text-xs text-[#333333] opacity-70">{reportData.summary.averagePartySize} avg party size</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-[#333333] opacity-70">Table Utilization</p>
                <div className="w-6 h-6 bg-[#FF6B35] bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-[#333333] mb-0.5">{reportData.summary.tableUtilization}%</p>
              <p className="text-xs text-green-600">↑ 5% vs last period</p>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-md p-3 text-white">
              <p className="text-white opacity-90 mb-1 text-xs">Cancellation Rate</p>
              <p className="text-2xl font-bold">{reportData.summary.cancellationRate}%</p>
              <p className="text-xs opacity-80">↓ 2% improvement</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md p-3 text-white">
              <p className="text-white opacity-90 mb-1 text-xs">No-Show Rate</p>
              <p className="text-2xl font-bold">{reportData.summary.noShowRate}%</p>
              <p className="text-xs opacity-80">↓ 1% improvement</p>
            </div>

            <div className="bg-gradient-to-br from-[#FF6B35] to-[#e55a2b] rounded-lg shadow-md p-3 text-white">
              <p className="text-white opacity-90 mb-1 text-xs">Avg Revenue/Booking</p>
              <p className="text-2xl font-bold">${reportData.summary.averageRevenuePerReservation}</p>
              <p className="text-xs opacity-80">↑ 4% increase</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-3 text-white">
              <p className="text-white opacity-90 mb-1 text-xs">Returning Customers</p>
              <p className="text-2xl font-bold">{reportData.customerSegments[1].percentage}%</p>
              <p className="text-xs opacity-80">Strong loyalty</p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Top Tables */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-xl font-bold text-[#333333] mb-4">Top Performing Tables</h3>
              <div className="space-y-2.5">
                {reportData.topTables.map((table, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 bg-[#FF6B35] text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#333333]">{table.table}</p>
                        <p className="text-xs text-[#333333] opacity-70">{table.bookings} bookings • Avg {table.avgPartySize} guests</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-green-600">${table.revenue.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Peak Hours */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-xl font-bold text-[#333333] mb-4">Peak Booking Hours</h3>
              <div className="space-y-3">
                {reportData.peakHours.map((hour, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-semibold text-[#333333]">{hour.time}</span>
                      <span className="text-xs text-[#FF6B35] font-bold">{hour.bookings} bookings • ${hour.revenue.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-[#FF6B35] h-1.5 rounded-full transition-all"
                        style={{ width: `${(hour.bookings / 100) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Weekly Trend */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h3 className="text-xl font-bold text-[#333333] mb-4">Weekly Performance Trend</h3>
            <div className="overflow-x-auto">
              <div className="flex gap-3 min-w-max">
                {reportData.weeklyTrend.map((day, index) => (
                  <div key={index} className="flex-1 min-w-[120px]">
                    <div className="bg-[#F8F4F0] rounded-lg p-3 text-center">
                      <p className="text-xs font-semibold text-[#333333] mb-2">{day.day}</p>
                      <div className="mb-2">
                        <p className="text-xl font-bold text-[#FF6B35]">{day.reservations}</p>
                        <p className="text-xs text-[#333333] opacity-70">reservations</p>
                      </div>
                      <div className="pt-2 border-t border-gray-300">
                        <p className="text-sm font-bold text-green-600">${day.revenue.toLocaleString()}</p>
                        <p className="text-xs text-[#333333] opacity-70">revenue</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Customer Segments */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-xl font-bold text-[#333333] mb-4">Customer Segments</h3>
              <div className="space-y-3">
                {reportData.customerSegments.map((segment, index) => (
                  <div key={index} className="border-2 border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-semibold text-[#333333]">{segment.type}</h4>
                      <span className="text-2xl font-bold text-[#FF6B35]">{segment.percentage}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xl font-bold text-[#333333]">{segment.count}</p>
                        <p className="text-xs text-[#333333] opacity-70">customers</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">${segment.avgSpending}</p>
                        <p className="text-xs text-[#333333] opacity-70">avg spending</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Customers */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-xl font-bold text-[#333333] mb-4">Top Customers (VIP)</h3>
              <div className="space-y-2">
                {reportData.topCustomers.map((customer, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#333333]">{customer.name}</p>
                        <p className="text-xs text-[#333333] opacity-70">{customer.visits} visits • {customer.tierLevel}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-green-600">${customer.spent}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
