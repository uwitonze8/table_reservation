'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

interface Reservation {
  id: string;
  date: string;
  time: string;
  guests: number;
  tableName: string;
  tableNumber: number;
  status: string;
  specialRequests: string;
  createdAt: string;
}

interface User {
  name: string;
  email: string;
  phone?: string;
}

interface ReservationTicketProps {
  reservation: Reservation;
  user: User;
  onClose: () => void;
}

export default function ReservationTicket({ reservation, user, onClose }: ReservationTicketProps) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    // Generate QR code with reservation details
    const qrData = JSON.stringify({
      reservationId: reservation.id,
      customerName: user.name,
      date: reservation.date,
      time: reservation.time,
      table: reservation.tableNumber,
    });

    QRCode.toDataURL(qrData, {
      width: 200,
      margin: 2,
      color: {
        dark: '#333333',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error('QR Code generation failed:', err));
  }, [reservation, user]);

  const handlePrint = () => {
    const printContent = ticketRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reservation Ticket - ${reservation.id}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .ticket {
              max-width: 400px;
              border: 2px dashed #333;
              border-radius: 12px;
              padding: 30px;
              background: white;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #FF6B35;
              padding-bottom: 20px;
              margin-bottom: 20px;
            }
            .restaurant-name {
              font-size: 24px;
              font-weight: bold;
              color: #333;
              margin-bottom: 5px;
            }
            .subtitle {
              font-size: 14px;
              color: #666;
            }
            .qr-section {
              text-align: center;
              margin: 20px 0;
            }
            .qr-code {
              max-width: 200px;
              height: auto;
            }
            .reservation-id {
              font-size: 16px;
              font-weight: bold;
              color: #333;
              margin: 10px 0;
            }
            .details {
              margin: 20px 0;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #eee;
            }
            .detail-label {
              font-size: 12px;
              color: #666;
              font-weight: 600;
            }
            .detail-value {
              font-size: 14px;
              color: #333;
              font-weight: bold;
              text-align: right;
            }
            .special-requests {
              background: #F8F4F0;
              padding: 15px;
              border-radius: 8px;
              margin: 15px 0;
            }
            .special-title {
              font-size: 12px;
              font-weight: bold;
              color: #333;
              margin-bottom: 5px;
            }
            .special-text {
              font-size: 12px;
              color: #666;
              line-height: 1.5;
            }
            .footer {
              text-align: center;
              border-top: 2px solid #FF6B35;
              padding-top: 15px;
              margin-top: 20px;
            }
            .printed-date {
              font-size: 11px;
              color: #666;
              margin-bottom: 10px;
            }
            .warning {
              font-size: 11px;
              color: #FF6B35;
              font-weight: bold;
              margin: 10px 0;
            }
            .contact-info {
              font-size: 11px;
              color: #666;
              margin-top: 10px;
            }
            @media print {
              body {
                padding: 0;
              }
              .ticket {
                border: 2px dashed #333;
              }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const currentDate = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const reservationDate = new Date(reservation.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#333333]">Reservation Ticket</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Ticket Preview */}
        <div className="p-6">
          <div ref={ticketRef} className="ticket max-w-md mx-auto border-2 border-dashed border-[#333333] rounded-xl p-8 bg-white">
            {/* Header */}
            <div className="header text-center border-b-2 border-[#FF6B35] pb-5 mb-5">
              <div className="restaurant-name text-2xl font-bold text-[#333333] mb-1">
                🍽️ QuickTable Restaurant
              </div>
              <div className="subtitle text-sm text-[#666666]">
                Table Reservation Ticket
              </div>
            </div>

            {/* QR Code Section */}
            <div className="qr-section text-center my-5">
              {qrCodeUrl && (
                <img src={qrCodeUrl} alt="QR Code" className="qr-code mx-auto max-w-[200px]" />
              )}
              <div className="reservation-id text-base font-bold text-[#333333] mt-3">
                Reservation ID: {reservation.id}
              </div>
            </div>

            {/* Customer Details */}
            <div className="details my-5">
              <div className="detail-row flex justify-between py-2.5 border-b border-gray-200">
                <span className="detail-label text-xs text-[#666666] font-semibold">Customer:</span>
                <span className="detail-value text-sm text-[#333333] font-bold">{user.name}</span>
              </div>
              {user.phone && (
                <div className="detail-row flex justify-between py-2.5 border-b border-gray-200">
                  <span className="detail-label text-xs text-[#666666] font-semibold">Phone:</span>
                  <span className="detail-value text-sm text-[#333333] font-bold">{user.phone}</span>
                </div>
              )}
              <div className="detail-row flex justify-between py-2.5 border-b border-gray-200">
                <span className="detail-label text-xs text-[#666666] font-semibold">📅 Reservation Date:</span>
                <span className="detail-value text-sm text-[#333333] font-bold">{reservationDate}</span>
              </div>
              <div className="detail-row flex justify-between py-2.5 border-b border-gray-200">
                <span className="detail-label text-xs text-[#666666] font-semibold">🕐 Time:</span>
                <span className="detail-value text-sm text-[#333333] font-bold">{reservation.time}</span>
              </div>
              <div className="detail-row flex justify-between py-2.5 border-b border-gray-200">
                <span className="detail-label text-xs text-[#666666] font-semibold">🪑 Table:</span>
                <span className="detail-value text-sm text-[#333333] font-bold">{reservation.tableName}</span>
              </div>
              <div className="detail-row flex justify-between py-2.5 border-b border-gray-200">
                <span className="detail-label text-xs text-[#666666] font-semibold">👥 Party Size:</span>
                <span className="detail-value text-sm text-[#333333] font-bold">
                  {reservation.guests} {reservation.guests === 1 ? 'guest' : 'guests'}
                </span>
              </div>
            </div>

            {/* Special Requests */}
            {reservation.specialRequests && reservation.specialRequests !== 'None' && (
              <div className="special-requests bg-[#F8F4F0] p-4 rounded-lg my-4">
                <div className="special-title text-xs font-bold text-[#333333] mb-1">
                  Special Requests:
                </div>
                <div className="special-text text-xs text-[#666666] leading-relaxed">
                  {reservation.specialRequests}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="footer text-center border-t-2 border-[#FF6B35] pt-4 mt-5">
              <div className="printed-date text-xs text-[#666666] mb-2">
                Printed: {currentDate}
              </div>
              <div className="warning text-xs text-[#FF6B35] font-bold my-2">
                ⚠️ Please arrive 10 minutes early
              </div>
              <div className="contact-info text-xs text-[#666666] mt-2">
                📞 Contact: (555) 000-0000<br />
                🌐 www.quicktable-restaurant.com<br />
                📧 info@quicktable.com
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 bg-[#FF6B35] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#e55a2b] transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Ticket
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-[#333333] px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
