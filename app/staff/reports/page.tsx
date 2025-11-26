'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import StaffSidebar from '@/components/staff/StaffSidebar';
import { staffApi, Reservation } from '@/lib/api';

export default function StaffReportsPage() {
  const { user } = useAuth();
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchReportData();
  }, [reportDate]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await staffApi.getReservationsByDate(reportDate);
      if (response.success && response.data) {
        setReservations(response.data);
      } else {
        setError(response.message || 'Failed to load report data');
      }
    } catch (err) {
      console.error('Failed to fetch report data:', err);
      setError('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  // Filter reservations based on status
  const filteredReservations = statusFilter === 'ALL'
    ? reservations
    : reservations.filter(r => r.status === statusFilter);

  // Calculate stats from real data (always show all stats)
  const stats = {
    totalReservations: reservations.length,
    completed: reservations.filter(r => r.status === 'COMPLETED').length,
    confirmed: reservations.filter(r => r.status === 'CONFIRMED').length,
    pending: reservations.filter(r => r.status === 'PENDING').length,
    cancelled: reservations.filter(r => r.status === 'CANCELLED').length,
    totalGuests: reservations.reduce((sum, r) => sum + r.numberOfGuests, 0),
  };

  // Stats for filtered view
  const filteredStats = {
    totalReservations: filteredReservations.length,
    totalGuests: filteredReservations.reduce((sum, r) => sum + r.numberOfGuests, 0),
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ALL': return 'All Statuses';
      case 'COMPLETED': return 'Completed';
      case 'CONFIRMED': return 'Confirmed';
      case 'PENDING': return 'Pending';
      case 'CANCELLED': return 'Cancelled';
      default: return status;
    }
  };

  const handlePrintPdf = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const filterLabel = getStatusLabel(statusFilter);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reservation Report - ${reportDate}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #FF6B35; padding-bottom: 20px; }
            .header h1 { color: #FF6B35; font-size: 24px; margin-bottom: 5px; }
            .header p { color: #666; font-size: 14px; }
            .header .filter-info { color: #FF6B35; font-size: 13px; font-weight: 600; margin-top: 8px; }
            .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px; }
            .stat-box { border: 1px solid #ddd; padding: 15px; text-align: center; border-radius: 8px; }
            .stat-box .label { font-size: 12px; color: #666; margin-bottom: 5px; }
            .stat-box .value { font-size: 24px; font-weight: bold; }
            .stat-box.total .value { color: #333; }
            .stat-box.completed .value { color: #16a34a; }
            .stat-box.confirmed .value { color: #2563eb; }
            .stat-box.pending .value { color: #ca8a04; }
            .stat-box.cancelled .value { color: #dc2626; }
            .stat-box.guests .value { color: #9333ea; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #f3f4f6; padding: 12px 8px; text-align: left; font-size: 12px; font-weight: 600; border-bottom: 2px solid #ddd; }
            td { padding: 10px 8px; border-bottom: 1px solid #eee; font-size: 12px; }
            tr:hover { background: #f9fafb; }
            .status { padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
            .status.completed { background: #dcfce7; color: #16a34a; }
            .status.confirmed { background: #dbeafe; color: #2563eb; }
            .status.pending { background: #fef3c7; color: #ca8a04; }
            .status.cancelled { background: #fee2e2; color: #dc2626; }
            .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 15px; }
            .section-title { font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #333; }
            .no-data { text-align: center; padding: 40px; color: #666; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>QuickTable - Reservation Report</h1>
            <p>${new Date(reportDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            ${statusFilter !== 'ALL' ? `<p class="filter-info">Filtered by: ${filterLabel}</p>` : ''}
          </div>

          <div class="stats-grid">
            <div class="stat-box total">
              <div class="label">Total Reservations</div>
              <div class="value">${stats.totalReservations}</div>
            </div>
            <div class="stat-box completed">
              <div class="label">Completed</div>
              <div class="value">${stats.completed}</div>
            </div>
            <div class="stat-box confirmed">
              <div class="label">Confirmed</div>
              <div class="value">${stats.confirmed}</div>
            </div>
            <div class="stat-box pending">
              <div class="label">Pending</div>
              <div class="value">${stats.pending}</div>
            </div>
            <div class="stat-box cancelled">
              <div class="label">Cancelled</div>
              <div class="value">${stats.cancelled}</div>
            </div>
            <div class="stat-box guests">
              <div class="label">Total Guests</div>
              <div class="value">${stats.totalGuests}</div>
            </div>
          </div>

          <div class="section-title">Reservation Details ${statusFilter !== 'ALL' ? `(${filterLabel}: ${filteredReservations.length})` : ''}</div>
          ${filteredReservations.length === 0 ? `
            <div class="no-data">No ${statusFilter !== 'ALL' ? filterLabel.toLowerCase() : ''} reservations for this date</div>
          ` : `
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Time</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Guests</th>
                  <th>Table</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${filteredReservations.map(r => `
                  <tr>
                    <td><strong>${r.reservationCode}</strong></td>
                    <td>${r.reservationTime}</td>
                    <td>${r.customerName}</td>
                    <td>${r.customerPhone}</td>
                    <td>${r.numberOfGuests}</td>
                    <td>${r.tableName || 'Table ' + r.tableNumber}</td>
                    <td><span class="status ${r.status.toLowerCase()}">${r.status.charAt(0) + r.status.slice(1).toLowerCase()}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}

          <div class="footer">
            Generated on ${new Date().toLocaleString()} | QuickTable Restaurant Management System
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
    }, 250);
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

  const formatStatus = (status: string) => status.charAt(0) + status.slice(1).toLowerCase();

  return (
    <div className="flex min-h-screen bg-[#F8F4F0]">
      <StaffSidebar />

      <main className="flex-1 ml-64 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#333333]">Reservation Report</h1>
              <p className="text-sm text-[#333333] opacity-70 mt-1">
                View and print reservations by date
              </p>
            </div>
            <button
              onClick={handlePrintPdf}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 text-sm bg-[#FF6B35] text-white rounded-lg hover:bg-[#e55a2b] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print / Save PDF
            </button>
          </div>

          {/* Date and Status Filter */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">Select Date</label>
                <input
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">Filter by Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] outline-none bg-white"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PENDING">Pending</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div className="text-sm text-[#333333]">
                {new Date(reportDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
              <button onClick={fetchReportData} className="ml-4 underline hover:no-underline">Retry</button>
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
            <div ref={printRef}>
              {/* Summary Stats */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                <div className="bg-white rounded-lg shadow-md p-3">
                  <p className="text-xs text-[#333333] opacity-70 mb-0.5">Total</p>
                  <p className="text-2xl font-bold text-[#333333]">{stats.totalReservations}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-3">
                  <p className="text-xs text-[#333333] opacity-70 mb-0.5">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-3">
                  <p className="text-xs text-[#333333] opacity-70 mb-0.5">Confirmed</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-3">
                  <p className="text-xs text-[#333333] opacity-70 mb-0.5">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-3">
                  <p className="text-xs text-[#333333] opacity-70 mb-0.5">Cancelled</p>
                  <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-3">
                  <p className="text-xs text-[#333333] opacity-70 mb-0.5">Total Guests</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalGuests}</p>
                </div>
              </div>

              {/* Reservations Table */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-xl font-bold text-[#333333] mb-4">
                  {statusFilter === 'ALL' ? 'All Reservations' : `${getStatusLabel(statusFilter)} Reservations`} ({filteredReservations.length})
                  {statusFilter !== 'ALL' && reservations.length > 0 && (
                    <span className="text-sm font-normal text-[#333333] opacity-70 ml-2">
                      of {reservations.length} total
                    </span>
                  )}
                </h2>
                {filteredReservations.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-[#333333] opacity-70">
                      No {statusFilter !== 'ALL' ? getStatusLabel(statusFilter).toLowerCase() : ''} reservations for this date
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Code</th>
                          <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Time</th>
                          <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Customer</th>
                          <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Guests</th>
                          <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Table</th>
                          <th className="text-left py-2 px-3 text-xs font-semibold text-[#333333]">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredReservations.map((reservation) => (
                          <tr key={reservation.id} className="border-b border-gray-100 hover:bg-[#F8F4F0] transition-colors">
                            <td className="py-3 px-3 text-xs text-[#333333] font-medium">{reservation.reservationCode}</td>
                            <td className="py-3 px-3 text-xs text-[#333333]">{reservation.reservationTime}</td>
                            <td className="py-3 px-3">
                              <p className="text-xs font-semibold text-[#333333]">{reservation.customerName}</p>
                              <p className="text-xs text-[#333333] opacity-70">{reservation.customerPhone}</p>
                            </td>
                            <td className="py-3 px-3 text-xs text-[#333333]">{reservation.numberOfGuests}</td>
                            <td className="py-3 px-3 text-xs text-[#333333]">{reservation.tableName || `Table ${reservation.tableNumber}`}</td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(reservation.status)}`}>
                                {formatStatus(reservation.status)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
