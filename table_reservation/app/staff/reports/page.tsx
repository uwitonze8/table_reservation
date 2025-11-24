'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function StaffReportsPage() {
  const { user } = useAuth();
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);

  // Mock data
  const dailyReport = {
    date: reportDate,
    staffName: user?.name,
    staffId: user?.staffId,
    shift: 'Evening (5:00 PM - 11:00 PM)',
    tablesServed: 12,
    guestsServed: 34,
    reservationsHandled: 15,
    walkIns: 3,
    averageServiceTime: '45 mins',
    customerRating: 4.8,
    reservations: [
      { id: 'RES-101', time: '5:30 PM', name: 'John Smith', guests: 4, table: 5, status: 'completed', notes: 'Birthday celebration' },
      { id: 'RES-102', time: '6:00 PM', name: 'Sarah Johnson', guests: 2, table: 12, status: 'completed', notes: '' },
      { id: 'RES-103', time: '6:30 PM', name: 'Michael Brown', guests: 6, table: 10, status: 'completed', notes: 'Business dinner' },
      { id: 'RES-104', time: '7:00 PM', name: 'Emily Davis', guests: 2, table: 1, status: 'completed', notes: '' },
      { id: 'RES-105', time: '7:30 PM', name: 'David Wilson', guests: 4, table: 8, status: 'completed', notes: '' },
    ],
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const csvData = `
Staff Daily Report
Date,${dailyReport.date}
Staff Name,${dailyReport.staffName}
Staff ID,${dailyReport.staffId}
Shift,${dailyReport.shift}
Tables Served,${dailyReport.tablesServed}
Guests Served,${dailyReport.guestsServed}
Reservations Handled,${dailyReport.reservationsHandled}
Walk-ins,${dailyReport.walkIns}

Reservation Details
ID,Time,Guest Name,Party Size,Table,Status,Notes
${dailyReport.reservations.map(r => `${r.id},${r.time},${r.name},${r.guests},Table ${r.table},${r.status},"${r.notes}"`).join('\n')}
    `.trim();

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `staff-report-${reportDate}.csv`;
    a.click();
  };

  return (
    <main className="min-h-screen bg-[#F8F4F0] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/staff/dashboard" className="text-[#FF6B35] hover:text-[#e55a2b] font-semibold mb-2 inline-flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-[#333333] mt-2">Daily Report</h1>
            <p className="text-[#333333] opacity-70 mt-1">
              {user?.name} ({user?.staffId})
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Report
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        {/* Date Selector */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <label className="block text-sm font-semibold text-[#333333] mb-2">Select Date</label>
          <input
            type="date"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-[#333333] opacity-70 mb-1">Tables Served</p>
            <p className="text-4xl font-bold text-[#FF6B35]">{dailyReport.tablesServed}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-[#333333] opacity-70 mb-1">Guests Served</p>
            <p className="text-4xl font-bold text-blue-600">{dailyReport.guestsServed}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-[#333333] opacity-70 mb-1">Reservations</p>
            <p className="text-4xl font-bold text-green-600">{dailyReport.reservationsHandled}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-[#333333] opacity-70 mb-1">Customer Rating</p>
            <p className="text-4xl font-bold text-yellow-600">{dailyReport.customerRating}</p>
          </div>
        </div>

        {/* Shift Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-[#333333] mb-4">Shift Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-[#333333] opacity-70 mb-1">Shift</p>
              <p className="text-lg font-semibold text-[#333333]">{dailyReport.shift}</p>
            </div>
            <div>
              <p className="text-sm text-[#333333] opacity-70 mb-1">Average Service Time</p>
              <p className="text-lg font-semibold text-[#333333]">{dailyReport.averageServiceTime}</p>
            </div>
            <div>
              <p className="text-sm text-[#333333] opacity-70 mb-1">Walk-ins Handled</p>
              <p className="text-lg font-semibold text-[#333333]">{dailyReport.walkIns}</p>
            </div>
            <div>
              <p className="text-sm text-[#333333] opacity-70 mb-1">Date</p>
              <p className="text-lg font-semibold text-[#333333]">
                {new Date(dailyReport.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Reservations Handled */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-[#333333] mb-6">Reservations Handled</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#333333]">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#333333]">Time</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#333333]">Guest Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#333333]">Party Size</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#333333]">Table</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#333333]">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#333333]">Notes</th>
                </tr>
              </thead>
              <tbody>
                {dailyReport.reservations.map((reservation) => (
                  <tr key={reservation.id} className="border-b border-gray-100 hover:bg-[#F8F4F0] transition-colors">
                    <td className="py-4 px-4 text-sm text-[#333333] font-medium">{reservation.id}</td>
                    <td className="py-4 px-4 text-sm text-[#333333]">{reservation.time}</td>
                    <td className="py-4 px-4 text-sm text-[#333333]">{reservation.name}</td>
                    <td className="py-4 px-4 text-sm text-[#333333]">{reservation.guests}</td>
                    <td className="py-4 px-4 text-sm text-[#333333]">Table {reservation.table}</td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-[#333333] italic">
                      {reservation.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
