'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import StaffSidebar from '@/components/staff/StaffSidebar';
import { staffApi, Reservation, Table } from '@/lib/api';

interface TableUsage {
  tableId: number;
  tableNumber: number;
  tableName: string;
  location: string;
  capacity: number;
  totalReservations: number;
  completedReservations: number;
  cancelledReservations: number;
  totalGuests: number;
  timeSlots: { time: string; customerName: string; guests: number; status: string }[];
}

export default function StaffReportsPage() {
  const { user } = useAuth();
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReportData();
  }, [reportDate]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError('');

      const [reservationsRes, tablesRes] = await Promise.all([
        staffApi.getReservationsByDate(reportDate),
        staffApi.getAllTables()
      ]);

      if (reservationsRes.success && reservationsRes.data) {
        setReservations(reservationsRes.data);
      }
      if (tablesRes.success && tablesRes.data) {
        setTables(tablesRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch report data:', err);
      setError('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate table usage statistics
  const getTableUsageStats = (): TableUsage[] => {
    const tableUsageMap = new Map<number, TableUsage>();

    // Initialize all tables
    tables.forEach(table => {
      tableUsageMap.set(table.id, {
        tableId: table.id,
        tableNumber: table.tableNumber,
        tableName: table.tableName || `Table ${table.tableNumber}`,
        location: table.location,
        capacity: table.capacity,
        totalReservations: 0,
        completedReservations: 0,
        cancelledReservations: 0,
        totalGuests: 0,
        timeSlots: []
      });
    });

    // Add reservation data to tables
    reservations.forEach(r => {
      const tableUsage = tableUsageMap.get(r.tableId);
      if (tableUsage) {
        tableUsage.totalReservations++;
        tableUsage.totalGuests += r.numberOfGuests;
        if (r.status === 'COMPLETED') tableUsage.completedReservations++;
        if (r.status === 'CANCELLED') tableUsage.cancelledReservations++;
        tableUsage.timeSlots.push({
          time: r.reservationTime,
          customerName: r.customerName,
          guests: r.numberOfGuests,
          status: r.status
        });
      }
    });

    // Sort time slots and return only tables with reservations first, then empty tables
    return Array.from(tableUsageMap.values())
      .map(t => ({
        ...t,
        timeSlots: t.timeSlots.sort((a, b) => a.time.localeCompare(b.time))
      }))
      .sort((a, b) => b.totalReservations - a.totalReservations);
  };

  const tableUsageStats = getTableUsageStats();
  const tablesWithReservations = tableUsageStats.filter(t => t.totalReservations > 0);
  const tablesWithoutReservations = tableUsageStats.filter(t => t.totalReservations === 0);

  // Overall stats
  const overallStats = {
    totalTables: tables.length,
    tablesUsed: tablesWithReservations.length,
    totalReservations: reservations.length,
    completedReservations: reservations.filter(r => r.status === 'COMPLETED').length,
    cancelledReservations: reservations.filter(r => r.status === 'CANCELLED').length,
    totalGuests: reservations.reduce((sum, r) => sum + r.numberOfGuests, 0),
    utilizationRate: tables.length > 0 ? Math.round((tablesWithReservations.length / tables.length) * 100) : 0
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLocationLabel = (location: string) => {
    switch (location) {
      case 'WINDOW': return 'Window';
      case 'CENTER': return 'Center';
      case 'PATIO': return 'Patio';
      case 'BAR': return 'Bar';
      case 'PRIVATE': return 'Private';
      default: return location;
    }
  };

  const handlePrintPdf = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Table Usage Report - ${reportDate}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #FF6B35; padding-bottom: 20px; }
            .header h1 { color: #FF6B35; font-size: 24px; margin-bottom: 5px; }
            .header p { color: #666; font-size: 14px; }
            .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
            .summary-box { border: 1px solid #ddd; padding: 15px; text-align: center; border-radius: 8px; }
            .summary-box .value { font-size: 28px; font-weight: bold; color: #FF6B35; }
            .summary-box .label { font-size: 12px; color: #666; margin-top: 5px; }
            .section-title { font-size: 18px; font-weight: bold; margin: 25px 0 15px 0; color: #333; border-left: 4px solid #FF6B35; padding-left: 10px; }
            .table-card { border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 15px; page-break-inside: avoid; }
            .table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
            .table-name { font-size: 16px; font-weight: bold; color: #333; }
            .table-meta { font-size: 11px; color: #666; }
            .table-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 10px; }
            .stat { text-align: center; padding: 8px; background: #f8f4f0; border-radius: 4px; }
            .stat .num { font-size: 18px; font-weight: bold; }
            .stat .lbl { font-size: 10px; color: #666; }
            .time-slots { margin-top: 10px; }
            .time-slot { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f0f0f0; font-size: 12px; }
            .status { padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; }
            .status.completed { background: #dcfce7; color: #16a34a; }
            .status.confirmed { background: #dbeafe; color: #2563eb; }
            .status.pending { background: #fef3c7; color: #ca8a04; }
            .status.cancelled { background: #fee2e2; color: #dc2626; }
            .unused-tables { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
            .unused-table { padding: 10px; border: 1px dashed #ccc; border-radius: 6px; text-align: center; font-size: 12px; color: #666; }
            .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 15px; }
            @media print { body { padding: 20px; } .table-card { page-break-inside: avoid; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>QuickTable - Table Usage Report</h1>
            <p>${new Date(reportDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <div class="summary-grid">
            <div class="summary-box">
              <div class="value">${overallStats.tablesUsed}/${overallStats.totalTables}</div>
              <div class="label">Tables Used</div>
            </div>
            <div class="summary-box">
              <div class="value">${overallStats.utilizationRate}%</div>
              <div class="label">Utilization Rate</div>
            </div>
            <div class="summary-box">
              <div class="value">${overallStats.totalReservations}</div>
              <div class="label">Total Reservations</div>
            </div>
            <div class="summary-box">
              <div class="value">${overallStats.totalGuests}</div>
              <div class="label">Total Guests</div>
            </div>
          </div>

          <div class="section-title">Tables with Reservations (${tablesWithReservations.length})</div>
          ${tablesWithReservations.map(table => `
            <div class="table-card">
              <div class="table-header">
                <div>
                  <span class="table-name">${table.tableName}</span>
                  <span class="table-meta"> - ${getLocationLabel(table.location)} - Capacity: ${table.capacity}</span>
                </div>
              </div>
              <div class="table-stats">
                <div class="stat">
                  <div class="num">${table.totalReservations}</div>
                  <div class="lbl">Reservations</div>
                </div>
                <div class="stat">
                  <div class="num" style="color: #16a34a;">${table.completedReservations}</div>
                  <div class="lbl">Completed</div>
                </div>
                <div class="stat">
                  <div class="num" style="color: #dc2626;">${table.cancelledReservations}</div>
                  <div class="lbl">Cancelled</div>
                </div>
                <div class="stat">
                  <div class="num" style="color: #9333ea;">${table.totalGuests}</div>
                  <div class="lbl">Guests</div>
                </div>
              </div>
              <div class="time-slots">
                ${table.timeSlots.map(slot => `
                  <div class="time-slot">
                    <span><strong>${slot.time}</strong> - ${slot.customerName} (${slot.guests} guests)</span>
                    <span class="status ${slot.status.toLowerCase()}">${slot.status}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}

          ${tablesWithoutReservations.length > 0 ? `
            <div class="section-title">Unused Tables (${tablesWithoutReservations.length})</div>
            <div class="unused-tables">
              ${tablesWithoutReservations.map(table => `
                <div class="unused-table">
                  <strong>${table.tableName}</strong><br/>
                  ${getLocationLabel(table.location)} - Cap: ${table.capacity}
                </div>
              `).join('')}
            </div>
          ` : ''}

          <div class="footer">
            Generated on ${new Date().toLocaleString()} | QuickTable Restaurant Management System
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="flex min-h-screen bg-[#F8F4F0]">
      <StaffSidebar />

      <main className="flex-1 ml-64 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#333333]">Table Usage Report</h1>
              <p className="text-sm text-[#333333] opacity-70 mt-1">
                View how each table was used throughout the day
              </p>
            </div>
            <button
              onClick={handlePrintPdf}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 text-sm bg-[#FF6B35] text-white rounded-lg hover:bg-[#e55a2b] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print / Save PDF
            </button>
          </div>

          {/* Date Selector */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">Select Date</label>
                <input
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none cursor-pointer"
                />
              </div>
              <div className="text-sm text-[#333333]">
                {new Date(reportDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
              <button onClick={fetchReportData} className="ml-4 underline hover:no-underline cursor-pointer">Retry</button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin w-12 h-12 border-4 border-[#FF6B35] border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-sm text-[#333333] opacity-70">Loading report...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Overall Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="bg-white rounded-lg shadow-md p-4 text-center">
                  <p className="text-3xl font-bold text-[#FF6B35]">{overallStats.tablesUsed}/{overallStats.totalTables}</p>
                  <p className="text-xs text-[#333333] opacity-70 mt-1">Tables Used</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4 text-center">
                  <p className="text-3xl font-bold text-blue-600">{overallStats.utilizationRate}%</p>
                  <p className="text-xs text-[#333333] opacity-70 mt-1">Utilization Rate</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4 text-center">
                  <p className="text-3xl font-bold text-green-600">{overallStats.totalReservations}</p>
                  <p className="text-xs text-[#333333] opacity-70 mt-1">Total Reservations</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4 text-center">
                  <p className="text-3xl font-bold text-purple-600">{overallStats.totalGuests}</p>
                  <p className="text-xs text-[#333333] opacity-70 mt-1">Total Guests</p>
                </div>
              </div>

              {/* Tables with Reservations */}
              {tablesWithReservations.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-[#333333] mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Tables with Reservations ({tablesWithReservations.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tablesWithReservations.map(table => (
                      <div key={table.tableId} className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex justify-between items-start mb-3 pb-3 border-b border-gray-100">
                          <div>
                            <h3 className="font-bold text-[#333333]">{table.tableName}</h3>
                            <p className="text-xs text-[#333333] opacity-70">
                              {getLocationLabel(table.location)} • Capacity: {table.capacity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-[#FF6B35]">{table.totalReservations}</p>
                            <p className="text-xs text-[#333333] opacity-70">reservations</p>
                          </div>
                        </div>

                        {/* Table Stats */}
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <div className="bg-green-50 rounded-lg p-2 text-center">
                            <p className="text-lg font-bold text-green-600">{table.completedReservations}</p>
                            <p className="text-xs text-green-700">Completed</p>
                          </div>
                          <div className="bg-red-50 rounded-lg p-2 text-center">
                            <p className="text-lg font-bold text-red-600">{table.cancelledReservations}</p>
                            <p className="text-xs text-red-700">Cancelled</p>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-2 text-center">
                            <p className="text-lg font-bold text-purple-600">{table.totalGuests}</p>
                            <p className="text-xs text-purple-700">Guests</p>
                          </div>
                        </div>

                        {/* Time Slots */}
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-[#333333] opacity-70">Reservations:</p>
                          {table.timeSlots.map((slot, idx) => (
                            <div key={idx} className="flex justify-between items-center py-2 px-3 bg-[#F8F4F0] rounded-lg">
                              <div>
                                <span className="font-semibold text-sm text-[#333333]">{slot.time}</span>
                                <span className="text-xs text-[#333333] opacity-70 ml-2">
                                  {slot.customerName} ({slot.guests} guests)
                                </span>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(slot.status)}`}>
                                {slot.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Unused Tables */}
              {tablesWithoutReservations.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-[#333333] mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                    </svg>
                    Unused Tables ({tablesWithoutReservations.length})
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {tablesWithoutReservations.map(table => (
                      <div key={table.tableId} className="bg-white rounded-lg shadow-md p-3 border-2 border-dashed border-gray-200 text-center">
                        <p className="font-semibold text-[#333333] text-sm">{table.tableName}</p>
                        <p className="text-xs text-[#333333] opacity-70">{getLocationLabel(table.location)}</p>
                        <p className="text-xs text-[#333333] opacity-50">Cap: {table.capacity}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No data message */}
              {reservations.length === 0 && (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-[#333333] opacity-70">No reservations for this date</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
