import { jsPDF } from 'jspdf';
import { formatDate } from './helpers';

// Ash / graphite accent (matches the site palette — replaces the old champagne gold)
const ASH = [146, 152, 160];

// jsPDF's built-in fonts cannot render the Naira glyph (₦), so format money with an ASCII prefix
const pdfCurrency = (amount) => `NGN ${(Number(amount) || 0).toLocaleString('en-NG')}`;

const cap = (value) =>
  value ? String(value).replace(/^\w/, (c) => c.toUpperCase()) : '-';

const roomNights = (booking) =>
  booking.nights ||
  (booking.check_in_date && booking.check_out_date
    ? Math.max(1, Math.ceil((new Date(booking.check_out_date) - new Date(booking.check_in_date)) / 86400000))
    : null);

const eventDays = (booking) =>
  booking.days ||
  (booking.event_date && booking.event_end_date && booking.event_end_date !== booking.event_date
    ? Math.max(1, Math.ceil((new Date(booking.event_end_date) - new Date(booking.event_date)) / 86400000) + 1)
    : 1);

/**
 * Draws the shared receipt header band, title and receipt-ID chip.
 * Returns the starting Y position for the detail rows.
 */
function drawHeader(doc, pageWidth, receiptId, title) {
  const leftX = 20;
  const rightX = pageWidth - 20;

  // Header band
  doc.setFillColor(10, 10, 10);
  doc.rect(0, 0, pageWidth, 42, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('ORIS SIGNATURES', pageWidth / 2, 19, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text('LUXURY HOTEL & SUITES', pageWidth / 2, 28, { align: 'center' });
  doc.text('www.orissignatures.com  |  +234 (0) 801 234 5678', pageWidth / 2, 35, { align: 'center' });

  // Title
  doc.setTextColor(10, 10, 10);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(title, pageWidth / 2, 54, { align: 'center' });

  doc.setDrawColor(...ASH);
  doc.setLineWidth(0.8);
  doc.line(leftX, 60, rightX, 60);

  // Receipt ID chip
  doc.setFillColor(245, 245, 245);
  doc.rect(leftX, 66, pageWidth - 40, 16, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(130, 130, 130);
  doc.text('RECEIPT ID', pageWidth / 2, 72, { align: 'center' });
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...ASH);
  doc.text(String(receiptId || '-'), pageWidth / 2, 79, { align: 'center' });

  return 94;
}

/**
 * Draws the final "AMOUNT PAID" block as the last element on the receipt.
 */
function drawAmountPaid(doc, pageWidth, y, amount) {
  const leftX = 20;
  const rightX = pageWidth - 20;

  doc.setFillColor(10, 10, 10);
  doc.rect(leftX, y, pageWidth - 40, 22, 'F');

  doc.setTextColor(170, 170, 170);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('AMOUNT PAID', leftX + 6, y + 9);

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(pdfCurrency(amount), rightX - 6, y + 15.5, { align: 'right' });
}

function drawFooterNote(doc, pageWidth, y, message) {
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(message, pageWidth / 2, y, { align: 'center' });
  doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, y + 5, { align: 'center' });
}

/**
 * Generate a receipt PDF for a room booking
 */
export function generateRoomReceipt(booking) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const leftX = 20;
  const rightX = pageWidth - 20;

  let y = drawHeader(doc, pageWidth, booking.receipt_id, 'BOOKING RECEIPT');

  doc.setFontSize(10);
  const addRow = (label, value) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text(label, leftX, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 20, 20);
    doc.text(String(value ?? '-'), rightX, y, { align: 'right' });
    y += 9;
  };
  const divider = () => {
    y += 3;
    doc.setDrawColor(220, 220, 220);
    doc.line(leftX, y, rightX, y);
    y += 9;
  };

  addRow('Guest Name:', booking.guest_name);
  addRow('Phone:', booking.guest_phone);
  if (booking.guest_email) addRow('Email:', booking.guest_email);

  divider();
  addRow('Room:', booking.room_name || `Room #${booking.room_id}`);
  addRow('Room Type:', cap(booking.room_type));
  addRow('Check-in:', formatDate(booking.check_in_date));
  addRow('Check-out:', formatDate(booking.check_out_date));
  const nights = roomNights(booking);
  if (nights) addRow('Nights:', String(nights));
  addRow('Guests:', String(booking.num_guests ?? 1));
  addRow('Booking Type:', (booking.booking_type || 'online').toUpperCase());

  divider();
  addRow('Payment Method:', (booking.payment_method || '').toUpperCase());
  addRow('Payment Status:', (booking.payment_status || '').toUpperCase());

  y += 6;
  drawFooterNote(doc, pageWidth, y, 'Thank you for choosing Oris Signatures. We look forward to making your stay memorable.');

  y += 10;
  drawAmountPaid(doc, pageWidth, y, booking.total_amount);

  return doc;
}

/**
 * Generate a receipt PDF for an event booking
 */
export function generateEventReceipt(booking) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const leftX = 20;
  const rightX = pageWidth - 20;

  let y = drawHeader(doc, pageWidth, booking.receipt_id, 'EVENT BOOKING RECEIPT');

  doc.setFontSize(10);
  const addRow = (label, value) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text(label, leftX, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 20, 20);
    doc.text(String(value ?? '-'), rightX, y, { align: 'right' });
    y += 9;
  };
  const divider = () => {
    y += 3;
    doc.setDrawColor(220, 220, 220);
    doc.line(leftX, y, rightX, y);
    y += 9;
  };

  addRow('Client Name:', booking.client_name);
  addRow('Phone:', booking.client_phone);
  if (booking.client_email) addRow('Email:', booking.client_email);

  divider();
  addRow('Event Name:', booking.event_name);
  addRow('Venue:', booking.space_name || `Space #${booking.event_space_id}`);
  addRow('Event Date:', formatDate(booking.event_date));
  if (booking.event_end_date && booking.event_end_date !== booking.event_date) {
    addRow('End Date:', formatDate(booking.event_end_date));
  }
  addRow('Duration:', `${eventDays(booking)} day${eventDays(booking) > 1 ? 's' : ''}`);
  addRow('Expected Guests:', String(booking.expected_guests ?? '-'));

  divider();
  addRow('Payment Method:', (booking.payment_method || '').toUpperCase());
  addRow('Payment Status:', (booking.payment_status || '').toUpperCase());

  y += 6;
  drawFooterNote(doc, pageWidth, y, 'Thank you for choosing Oris Signatures for your event.');

  y += 10;
  drawAmountPaid(doc, pageWidth, y, booking.total_amount);

  return doc;
}

/**
 * Download a receipt
 */
export function downloadReceipt(booking, type = 'room') {
  const doc = type === 'room' ? generateRoomReceipt(booking) : generateEventReceipt(booking);
  doc.save(`Oris_Signatures_Receipt_${booking.receipt_id}.pdf`);
}
