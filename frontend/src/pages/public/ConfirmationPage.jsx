import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { downloadReceipt } from '../../utils/receipt';
import { formatCurrency, formatDate } from '../../utils/helpers';
import api from '../../utils/api';
import './BookingPage.css';

const Icon = {
  Check: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  Mail: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  ),
  Clipboard: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="8" y="3" width="8" height="4" rx="1" />
      <path d="M16 5h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2" />
      <path d="M8 12h8M8 16h5" />
    </svg>
  ),
  Phone: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.4 2.1L8 9.8a16 16 0 0 0 6 6l1.4-1.3a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.9 2.3Z" />
    </svg>
  ),
  Download: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  ),
};

export default function ConfirmationPage() {
  const { type, receiptId } = useParams();
  const location = useLocation();
  const [bookingData, setBookingData] = useState(() => {
    if (location.state?.booking) return location.state.booking;
    try {
      const saved = localStorage.getItem(`oris_receipt_${receiptId}`);
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return null;
  });

  useEffect(() => {
    if (bookingData) return;
    if (!receiptId) return;

    api.getReceipt(receiptId)
      .then((res) => {
        let found = null;
        if (res && res.receipt_id) {
          found = res;
        } else if (Array.isArray(res)) {
          found = res[0];
        } else if (res?.room_bookings?.length || res?.event_bookings?.length) {
          found = res.room_bookings?.[0] || res.event_bookings?.[0];
        }
        if (found) setBookingData(found);
      })
      .catch((err) => console.log('Could not fetch receipt details:', err));
  }, [receiptId, bookingData]);

  const handleDownload = () => {
    const booking = bookingData || {
      receipt_id: receiptId,
      guest_name: 'Guest',
      guest_phone: '',
      guest_email: '',
      room_name: 'Deluxe Suite',
      room_type: 'deluxe',
      check_in_date: new Date().toISOString().split('T')[0],
      check_out_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      num_guests: 1,
      total_amount: 45000,
      booking_type: type === 'room' ? 'online' : 'event',
      payment_method: 'online',
      payment_status: 'paid',
      client_name: 'Client',
      client_phone: '',
      client_email: '',
      event_name: 'Special Event',
      space_name: 'Grand Ballroom',
      event_date: new Date().toISOString().split('T')[0],
      expected_guests: 100,
    };

    downloadReceipt(booking, type);
  };

  const rows = bookingData ? [
    { label: 'Guest / Client', value: bookingData.guest_name || bookingData.client_name },
    { label: 'Service', value: bookingData.room_name || bookingData.space_name || bookingData.event_name },
    (bookingData.check_in_date || bookingData.event_date) && {
      label: bookingData.check_in_date ? 'Check-in' : 'Event date',
      value: formatDate(bookingData.check_in_date || bookingData.event_date),
    },
    (bookingData.check_out_date) && {
      label: 'Check-out',
      value: formatDate(bookingData.check_out_date),
    },
    { label: 'Amount Paid', value: formatCurrency(bookingData.total_amount), strong: true },
  ].filter(Boolean) : [];

  return (
    <div className="booking-page">
      <header className="booking-header">
        <div className="container header-inner">
          <Link to="/" className="logo">
            <span className="logo-text">ORIS</span>
            <span className="logo-sub">SIGNATURES</span>
          </Link>
          <Link to="/" className="btn btn-outline btn-sm">Back to Home</Link>
        </div>
      </header>

      <div className="confirmation-container">
        <div className="confirmation-card animate-fade-in-up">
          <div className="confirmation-icon">
            <Icon.Check />
          </div>
          <h2>Booking Confirmed!</h2>
          <p className="confirmation-subtitle">
            Your {type === 'room' ? 'room reservation' : 'event space booking'} has been successfully confirmed.
          </p>

          <div className="receipt-id-box">
            <span className="receipt-label">Your Unique Receipt ID</span>
            <span className="receipt-value">{receiptId}</span>
            <span className="receipt-hint">Save this ID — you'll need it for check-in and hotel verification.</span>
          </div>

          {bookingData && (
            <div className="confirmation-summary">
              {rows.map((row) => (
                <div className="confirmation-summary-row" key={row.label}>
                  <span className="confirmation-summary-label">{row.label}</span>
                  <span className={`confirmation-summary-value${row.strong ? ' is-strong' : ''}`}>{row.value}</span>
                </div>
              ))}
              <div className="confirmation-summary-row">
                <span className="confirmation-summary-label">Payment</span>
                <span className="confirmation-summary-value is-paid">Confirmed (Paid)</span>
              </div>
            </div>
          )}

          <div className="confirmation-info">
            <div className="info-item">
              <span className="info-icon"><Icon.Mail /></span>
              <p>A confirmation with your digital receipt has been dispatched to your email.</p>
            </div>
            <div className="info-item">
              <span className="info-icon"><Icon.Clipboard /></span>
              <p>Present your Unique Receipt ID at the Front Desk upon arrival for instant check-in.</p>
            </div>
            <div className="info-item">
              <span className="info-icon"><Icon.Phone /></span>
              <p>VIP Concierge assistance: +234 (0) 801 234 5678</p>
            </div>
          </div>

          <div className="confirmation-actions">
            <button className="btn btn-primary btn-lg" onClick={handleDownload}>
              <Icon.Download /> Download Official Receipt PDF
            </button>
            <Link to="/" className="btn btn-outline-dark btn-lg">Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
