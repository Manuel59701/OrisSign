import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { downloadReceipt } from '../../utils/receipt';
import api from '../../utils/api';
import './BookingPage.css';

export default function ConfirmationPage() {
  const { type, receiptId } = useParams();
  const [bookingData, setBookingData] = useState(null);

  useEffect(() => {
    // Try to retrieve actual booking details from API / mock store
    if (receiptId) {
      api.searchReceipts(receiptId)
        .then((res) => {
          if (res && res.length > 0) {
            setBookingData(res[0]);
          }
        })
        .catch((err) => console.log('Could not fetch receipt details:', err));
    }
  }, [receiptId]);

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
      // Event fields
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

  return (
    <div className="booking-page">
      <header className="booking-header">
        <div className="container header-inner">
          <Link to="/" className="logo">
            <span className="logo-text">ORIS</span>
            <span className="logo-sub">SIGNATURES</span>
          </Link>
        </div>
      </header>

      <div className="confirmation-container">
        <div className="confirmation-card animate-fade-in-up" style={{ animationDelay: '0s', opacity: 1 }}>
          <div className="confirmation-icon">✓</div>
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
            <div style={{ margin: '1.5rem 0', padding: '1rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', textAlign: 'left', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#6b7280' }}>Guest / Client:</span>
                <span style={{ fontWeight: 600 }}>{bookingData.guest_name || bookingData.client_name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#6b7280' }}>Service:</span>
                <span style={{ fontWeight: 600 }}>{bookingData.room_name || bookingData.space_name || bookingData.event_name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Payment:</span>
                <span style={{ fontWeight: 600, color: '#059669' }}>CONFIRMED (PAID)</span>
              </div>
            </div>
          )}

          <div className="confirmation-info">
            <div className="info-item">
              <span className="info-icon">📧</span>
              <p>A confirmation with your digital receipt has been dispatched to your email.</p>
            </div>
            <div className="info-item">
              <span className="info-icon">📋</span>
              <p>Present your Unique Receipt ID at the Front Desk upon arrival for instant check-in.</p>
            </div>
            <div className="info-item">
              <span className="info-icon">📞</span>
              <p>VIP Concierge assistance: +234 (0) 801 234 5678</p>
            </div>
          </div>

          <div className="confirmation-actions">
            <button className="btn btn-primary btn-lg" onClick={handleDownload}>
              📥 Download Official Receipt PDF
            </button>
            <Link to="/" className="btn btn-outline-dark btn-lg">Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
