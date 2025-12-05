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
    const qrData = JSON.stringify({
      reservationId: reservation.id,
      customerName: user.name,
      date: reservation.date,
      time: reservation.time,
      table: reservation.tableNumber,
    });

    // Generate QR code with logo overlay
    const generateQRWithLogo = async () => {
      try {
        // First generate the QR code
        const qrDataUrl = await QRCode.toDataURL(qrData, {
          width: 200,
          margin: 1,
          errorCorrectionLevel: 'H', // High error correction for logo overlay
          color: {
            dark: '#333333',
            light: '#FFFFFF',
          },
        });

        // Create canvas to overlay logo
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = 200;
        canvas.height = 200;

        // Draw QR code
        const qrImage = new Image();
        qrImage.onload = () => {
          ctx.drawImage(qrImage, 0, 0, 200, 200);

          // Draw logo in center
          const logo = new Image();
          logo.onload = () => {
            const logoSize = 50;
            const logoX = (canvas.width - logoSize) / 2;
            const logoY = (canvas.height - logoSize) / 2;

            // Draw white background circle for logo
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, logoSize / 2 + 5, 0, 2 * Math.PI);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();

            // Draw logo
            ctx.save();
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, logoSize / 2, 0, 2 * Math.PI);
            ctx.clip();
            ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
            ctx.restore();

            // Convert to data URL
            setQrCodeUrl(canvas.toDataURL('image/png'));
          };
          logo.onerror = () => {
            // If logo fails to load, use QR without logo
            setQrCodeUrl(qrDataUrl);
          };
          logo.src = '/Q.png';
        };
        qrImage.src = qrDataUrl;
      } catch (err) {
        console.error('QR Code generation failed:', err);
      }
    };

    generateQRWithLogo();
  }, [reservation, user]);

  const dateObj = new Date(reservation.date);
  const day = dateObj.getDate();
  const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
  const year = dateObj.getFullYear();

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reservation Ticket</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: #f3f4f6;
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .ticket {
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 20px rgba(0,0,0,0.15);
              max-width: 500px;
              width: 100%;
            }
            .ticket-header {
              background: linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%);
              color: white;
              padding: 16px 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .brand { font-size: 18px; font-weight: bold; }
            .ticket-type { font-size: 11px; opacity: 0.9; }
            .header-right { text-align: right; }
            .header-time { font-size: 14px; font-weight: 600; }
            .header-table { font-size: 10px; opacity: 0.9; }
            .ticket-body {
              display: flex;
              border-bottom: 2px dashed #e5e7eb;
            }
            .ticket-left {
              flex: 1;
              padding: 20px;
              border-right: 2px dashed #e5e7eb;
            }
            .ticket-right {
              width: 130px;
              padding: 20px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              background: #f9fafb;
            }
            .date-display {
              text-align: center;
              margin-bottom: 16px;
              padding-bottom: 16px;
              border-bottom: 1px solid #e5e7eb;
            }
            .date-day { font-size: 36px; font-weight: bold; color: #FF6B35; }
            .date-month { font-size: 14px; color: #6b7280; text-transform: uppercase; }
            .date-year { font-size: 12px; color: #9ca3af; }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
            }
            .info-label { font-size: 10px; color: #9ca3af; text-transform: uppercase; margin-bottom: 2px; }
            .info-value { font-size: 13px; color: #333; font-weight: 600; }
            .qr-code { width: 80px; height: 80px; margin-bottom: 8px; }
            .scan-text { font-size: 9px; color: #9ca3af; text-align: center; }
            .ticket-footer {
              padding: 12px 20px;
              background: #f9fafb;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .reservation-id { font-size: 11px; color: #6b7280; }
            .reservation-id span { font-weight: bold; color: #333; }
            .website { font-size: 10px; color: #FF6B35; font-weight: 500; }
            @media print {
              body { background: white; padding: 10px; }
              .ticket { box-shadow: none; border: 1px solid #e5e7eb; }
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="ticket-header">
              <div>
                <div class="brand">Quick Table</div>
                <div class="ticket-type">Restaurant Reservation</div>
              </div>
              <div class="header-right">
                <div class="header-time">${reservation.time}</div>
                <div class="header-table">${reservation.tableName}</div>
              </div>
            </div>
            <div class="ticket-body">
              <div class="ticket-left">
                <div class="date-display">
                  <div class="date-day">${day}</div>
                  <div class="date-month">${month}</div>
                  <div class="date-year">${year}</div>
                </div>
                <div class="info-grid">
                  <div>
                    <div class="info-label">Guest Name</div>
                    <div class="info-value">${user.name}</div>
                  </div>
                  <div>
                    <div class="info-label">Party Size</div>
                    <div class="info-value">${reservation.guests} ${reservation.guests === 1 ? 'Guest' : 'Guests'}</div>
                  </div>
                  <div>
                    <div class="info-label">Table</div>
                    <div class="info-value">${reservation.tableName}</div>
                  </div>
                  <div>
                    <div class="info-label">Time</div>
                    <div class="info-value">${reservation.time}</div>
                  </div>
                </div>
              </div>
              <div class="ticket-right">
                <img src="${qrCodeUrl}" alt="QR Code" class="qr-code" />
                <div class="scan-text">Scan to verify</div>
              </div>
            </div>
            <div class="ticket-footer">
              <div class="reservation-id">ID: <span>${reservation.id}</span></div>
              <div class="website">quicktable.com</div>
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  return (
    <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gray-50 border-b px-5 py-3 flex justify-between items-center">
          <h2 className="text-base font-semibold text-[#333]">Your Reservation Ticket</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Ticket Preview */}
        <div className="p-5 bg-gray-100">
          <div ref={ticketRef}>
            <div className="bg-white rounded-xl overflow-hidden shadow-lg max-w-[500px] mx-auto">
              {/* Ticket Header */}
              <div className="bg-gradient-to-r from-[#FF6B35] to-[#ff8c5a] text-white px-5 py-4 flex justify-between items-center">
                <div>
                  <div className="text-lg font-bold">Quick Table</div>
                  <div className="text-[11px] opacity-90">Restaurant Reservation</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{reservation.time}</div>
                  <div className="text-[10px] opacity-90">{reservation.tableName}</div>
                </div>
              </div>

              {/* Ticket Body */}
              <div className="flex border-b-2 border-dashed border-gray-200">
                {/* Left - Details */}
                <div className="flex-1 p-5 border-r-2 border-dashed border-gray-200">
                  {/* Date Display */}
                  <div className="text-center mb-4 pb-4 border-b border-gray-200">
                    <div className="text-4xl font-bold text-[#FF6B35]">{day}</div>
                    <div className="text-sm text-gray-600 uppercase">{month}</div>
                    <div className="text-xs text-gray-400">{year}</div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[10px] text-gray-400 uppercase mb-0.5">Guest Name</div>
                      <div className="text-[13px] text-[#333] font-semibold">{user.name}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 uppercase mb-0.5">Party Size</div>
                      <div className="text-[13px] text-[#333] font-semibold">{reservation.guests} {reservation.guests === 1 ? 'Guest' : 'Guests'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 uppercase mb-0.5">Table</div>
                      <div className="text-[13px] text-[#333] font-semibold">{reservation.tableName}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 uppercase mb-0.5">Time</div>
                      <div className="text-[13px] text-[#333] font-semibold">{reservation.time}</div>
                    </div>
                  </div>
                </div>

                {/* Right - QR Code */}
                <div className="w-[130px] p-5 flex flex-col items-center justify-center bg-gray-50">
                  {qrCodeUrl && (
                    <img src={qrCodeUrl} alt="QR Code" className="w-20 h-20 mb-2" />
                  )}
                  <div className="text-[9px] text-gray-400 text-center">Scan to verify</div>
                </div>
              </div>

              {/* Ticket Footer */}
              <div className="px-5 py-3 bg-gray-50 flex justify-between items-center">
                <div className="text-[11px] text-gray-500">
                  ID: <span className="font-semibold text-[#333]">{reservation.id}</span>
                </div>
                <div className="text-[10px] text-[#FF6B35] font-medium">quicktable.com</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 border-t px-5 py-3 flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 bg-[#FF6B35] text-white py-2.5 rounded-lg font-medium text-sm hover:bg-[#e55a2b] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Ticket
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-[#333] py-2.5 rounded-lg font-medium text-sm hover:bg-gray-300 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
