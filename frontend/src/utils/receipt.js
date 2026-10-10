import { jsPDF } from 'jspdf';
import { formatCurrency, formatDate } from './helpers';

/**
 * Generate a receipt PDF for a room booking
 */
export function generateRoomReceipt(booking) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(10, 10, 10);
  doc.rect(0, 0, pageWidth, 45, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('ORIS SIGNATURES', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('LUXURY HOTEL & SUITES', pageWidth / 2, 30, { align: 'center' });
  doc.text('www.orissignatures.com', pageWidth / 2, 38, { align: 'center' });

  // Receipt Title
  doc.setTextColor(10, 10, 10);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('BOOKING RECEIPT', pageWidth / 2, 60, { align: 'center' });

  // Divider
  doc.setDrawColor(201, 169, 110);
  doc.setLineWidth(1);
  doc.line(20, 65, pageWidth - 20, 65);

  // Receipt ID
  doc.setFillColor(245, 245, 245);
  doc.rect(20, 72, pageWidth - 40, 20, 'F');
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(201, 169, 110);
  doc.text(`Receipt ID: ${booking.receipt_id}`, pageWidth / 2, 85, { align: 'center' });

  // Details
  doc.setTextColor(10, 10, 10);
  doc.setFontSize(11);
  let y = 105;
  const leftX = 25;
  const rightX = pageWidth - 25;

  const addRow = (label, value) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(label, leftX, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(10, 10, 10);
    doc.text(String(value), rightX, y, { align: 'right' });
    y += 12;
  };

  addRow('Guest Name:', booking.guest_name);
  addRow('Phone:', booking.guest_phone);
  if (booking.guest_email) addRow('Email:', booking.guest_email);
  
  y += 5;
  doc.setDrawColor(200, 200, 200);
  doc.line(leftX, y, rightX, y);
  y += 12;

  addRow('Room:', booking.room_name || `Room #${booking.room_id}`);
  addRow('Room Type:', (booking.room_type || '').replace(/^\w/, c => c.toUpperCase()));
  addRow('Check-in:', formatDate(booking.check_in_date));
  addRow('Check-out:', formatDate(booking.check_out_date));
  addRow('Guests:', String(booking.num_guests));
  addRow('Booking Type:', (booking.booking_type || 'online').toUpperCase());

  y += 5;
  doc.line(leftX, y, rightX, y);
  y += 12;

  addRow('Payment Method:', (booking.payment_method || '').toUpperCase());
  addRow('Payment Status:', (booking.payment_status || '').toUpperCase());

  // Total
  y += 5;
  doc.setFillColor(10, 10, 10);
  doc.rect(20, y, pageWidth - 40, 25, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL AMOUNT:', leftX + 5, y + 16);
  doc.text(formatCurrency(booking.total_amount), rightX - 5, y + 16, { align: 'right' });

  // Footer
  y += 45;
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for choosing Oris Signatures. We look forward to making your stay memorable.', pageWidth / 2, y, { align: 'center' });
  doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, y + 12, { align: 'center' });

  return doc;
}

/**
 * Generate a receipt PDF for an event booking
 */
export function generateEventReceipt(booking) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(10, 10, 10);
  doc.rect(0, 0, pageWidth, 45, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('ORIS SIGNATURES', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('LUXURY HOTEL & SUITES', pageWidth / 2, 30, { align: 'center' });
  doc.text('www.orissignatures.com', pageWidth / 2, 38, { align: 'center' });

  // Receipt Title
  doc.setTextColor(10, 10, 10);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('EVENT BOOKING RECEIPT', pageWidth / 2, 60, { align: 'center' });

  // Divider
  doc.setDrawColor(201, 169, 110);
  doc.setLineWidth(1);
  doc.line(20, 65, pageWidth - 20, 65);

  // Receipt ID
  doc.setFillColor(245, 245, 245);
  doc.rect(20, 72, pageWidth - 40, 20, 'F');
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(201, 169, 110);
  doc.text(`Receipt ID: ${booking.receipt_id}`, pageWidth / 2, 85, { align: 'center' });

  // Details
  doc.setTextColor(10, 10, 10);
  doc.setFontSize(11);
  let y = 105;
  const leftX = 25;
  const rightX = pageWidth - 25;

  const addRow = (label, value) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(label, leftX, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(10, 10, 10);
    doc.text(String(value), rightX, y, { align: 'right' });
    y += 12;
  };

  addRow('Client Name:', booking.client_name);
  addRow('Phone:', booking.client_phone);
  if (booking.client_email) addRow('Email:', booking.client_email);

  y += 5;
  doc.setDrawColor(200, 200, 200);
  doc.line(leftX, y, rightX, y);
  y += 12;

  addRow('Event Name:', booking.event_name);
  addRow('Venue:', booking.space_name || `Space #${booking.event_space_id}`);
  addRow('Event Date:', formatDate(booking.event_date));
  if (booking.event_end_date && booking.event_end_date !== booking.event_date) {
    addRow('End Date:', formatDate(booking.event_end_date));
  }
  addRow('Expected Guests:', String(booking.expected_guests));

  y += 5;
  doc.line(leftX, y, rightX, y);
  y += 12;

  addRow('Payment Method:', (booking.payment_method || '').toUpperCase());
  addRow('Payment Status:', (booking.payment_status || '').toUpperCase());

  // Total
  y += 5;
  doc.setFillColor(10, 10, 10);
  doc.rect(20, y, pageWidth - 40, 25, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL AMOUNT:', leftX + 5, y + 16);
  doc.text(formatCurrency(booking.total_amount), rightX - 5, y + 16, { align: 'right' });

  // Footer
  y += 45;
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for choosing Oris Signatures for your event.', pageWidth / 2, y, { align: 'center' });
  doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, y + 12, { align: 'center' });

  return doc;
}

/**
 * Download a receipt
 */
export function downloadReceipt(booking, type = 'room') {
  const doc = type === 'room' ? generateRoomReceipt(booking) : generateEventReceipt(booking);
  doc.save(`Oris_Signatures_Receipt_${booking.receipt_id}.pdf`);
}
