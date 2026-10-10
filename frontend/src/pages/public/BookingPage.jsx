import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { formatCurrency, getToday, getTomorrow, calculateNights } from '../../utils/helpers';
import { Users } from '../../components/Icons';
import './BookingPage.css';

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    check_in_date: getToday(),
    check_out_date: getTomorrow(),
    room_id: '',
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    num_guests: 1,
    special_requests: '',
  });

  const [selectedRoom, setSelectedRoom] = useState(null);

  const searchRooms = async () => {
    if (!form.check_in_date || !form.check_out_date) return;
    setLoading(true);
    try {
      const available = await api.checkAvailability(form.check_in_date, form.check_out_date);
      setRooms(available);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    searchRooms();
  }, []);

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    setForm({ ...form, room_id: room.id });
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await api.createBooking({ ...form, total_amount: totalAmount });
      const booking = {
        receipt_id: result.receipt_id,
        guest_name: form.guest_name,
        guest_email: form.guest_email,
        guest_phone: form.guest_phone,
        room_id: form.room_id,
        room_name: selectedRoom?.name,
        room_type: selectedRoom?.room_type,
        check_in_date: form.check_in_date,
        check_out_date: form.check_out_date,
        nights: result.nights ?? nights,
        num_guests: form.num_guests,
        special_requests: form.special_requests,
        total_amount: result.total_amount ?? result.booking?.total_amount ?? totalAmount,
        payment_status: 'paid',
        payment_method: 'online',
        booking_type: 'online',
      };
      try { localStorage.setItem(`oris_receipt_${result.receipt_id}`, JSON.stringify(booking)); } catch { /* ignore */ }
      navigate(`/confirmation/room/${result.receipt_id}`, { state: { booking } });
    } catch (err) {
      alert(err.error || 'Booking failed. Please try again.');
    }
    setSubmitting(false);
  };

  const nights = calculateNights(form.check_in_date, form.check_out_date);
  const totalAmount = selectedRoom ? selectedRoom.price_per_night * nights : 0;

  const roomImages = [
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=400&fit=crop',
  ];

  return (
    <div className="booking-page">
      <header className="booking-header">
        <div className="container header-inner">
          <Link to="/" className="logo">
            <span className="logo-text">ORIS</span>
            <span className="logo-sub">SIGNATURES</span>
          </Link>
          <Link to="/" className="btn btn-outline btn-sm">← Back to Home</Link>
        </div>
      </header>

      <div className="booking-hero">
        <div className="booking-hero-overlay"></div>
        <div className="booking-hero-content">
          <h1>Reserve Your Stay</h1>
          <p>Select your dates, choose a room, and experience luxury.</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="booking-steps">
        <div className={`booking-step ${step >= 1 ? 'active' : ''}`}>
          <span className="step-num">1</span>
          <span className="step-label">Select Room</span>
        </div>
        <div className="step-line"></div>
        <div className={`booking-step ${step >= 2 ? 'active' : ''}`}>
          <span className="step-num">2</span>
          <span className="step-label">Guest Details</span>
        </div>
        <div className="step-line"></div>
        <div className={`booking-step ${step >= 3 ? 'active' : ''}`}>
          <span className="step-num">3</span>
          <span className="step-label">Confirm & Pay</span>
        </div>
      </div>

      <div className="container booking-content">
        {/* Step 1: Date & Room Selection */}
        {step === 1 && (
          <div className="animate-fade-in">
            <div className="date-picker-bar">
              <div className="form-group">
                <label>Check-in Date</label>
                <input type="date" className="form-control" min={getToday()} value={form.check_in_date}
                  onChange={e => setForm({...form, check_in_date: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Check-out Date</label>
                <input type="date" className="form-control" min={form.check_in_date || getToday()} value={form.check_out_date}
                  onChange={e => setForm({...form, check_out_date: e.target.value})} />
              </div>
              <button className="btn btn-primary" onClick={searchRooms} disabled={loading}>
                {loading ? 'Searching...' : 'Search Rooms'}
              </button>
            </div>

            {nights > 0 && <p className="nights-info">{nights} night{nights > 1 ? 's' : ''} stay</p>}

            <div className="available-rooms">
              {rooms.length === 0 && !loading && (
                <div className="no-rooms">
                  <h3>No rooms available</h3>
                  <p>Try adjusting your dates to find available rooms.</p>
                </div>
              )}

              {rooms.map((room, i) => (
                <div key={room.id} className="booking-room-card">
                  <div className="booking-room-img">
                    <img src={room.image_url || roomImages[i % roomImages.length]} alt={room.name} />
                  </div>
                  <div className="booking-room-info">
                    <div className="booking-room-header">
                      <div>
                        <span className="room-type-badge">{room.room_type}</span>
                        <h3>{room.name}</h3>
                      </div>
                      <div className="booking-room-price">
                        <span className="price">{formatCurrency(room.price_per_night)}</span>
                        <small>per night</small>
                      </div>
                    </div>
                    <p>{room.description}</p>
                    <div className="booking-room-amenities">
                      {(room.amenities || []).map((a, j) => (
                        <span key={j}>{a}</span>
                      ))}
                    </div>
                    <div className="booking-room-footer">
                      <span><Users width="15" height="15" /> Up to {room.max_guests} guests • {room.available_units} room{room.available_units > 1 ? 's' : ''} left</span>
                      <div>
                        {nights > 0 && <span className="total-preview">Total: {formatCurrency(room.price_per_night * nights)}</span>}
                        <button className="btn btn-primary" onClick={() => handleRoomSelect(room)}>Select Room</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Guest Details */}
        {step === 2 && (
          <div className="animate-fade-in">
            <div className="booking-details-grid">
              <form className="guest-form" onSubmit={(e) => { e.preventDefault(); setStep(3); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                <h3>Guest Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input type="text" className="form-control" required value={form.guest_name}
                      onChange={e => setForm({...form, guest_name: e.target.value})} placeholder="John Doe" />
                  </div>
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input type="tel" className="form-control" required value={form.guest_phone}
                      onChange={e => setForm({...form, guest_phone: e.target.value})} placeholder="+234 801 234 5678" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" className="form-control" value={form.guest_email}
                      onChange={e => setForm({...form, guest_email: e.target.value})} placeholder="john@example.com" />
                  </div>
                  <div className="form-group">
                    <label>Number of Guests</label>
                    <select className="form-control" value={form.num_guests}
                      onChange={e => setForm({...form, num_guests: parseInt(e.target.value)})}>
                      {[...Array(selectedRoom?.max_guests || 4)].map((_, i) => (
                        <option key={i} value={i + 1}>{i + 1} Guest{i > 0 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Special Requests</label>
                  <textarea className="form-control" value={form.special_requests}
                    onChange={e => setForm({...form, special_requests: e.target.value})}
                    placeholder="Any special requests or preferences..." rows="3"></textarea>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-outline-dark" onClick={() => setStep(1)}>← Back</button>
                  <button type="submit" className="btn btn-primary">Continue to Payment →</button>
                </div>
              </form>

              <div className="booking-summary-card">
                <h4>Booking Summary</h4>
                <div className="summary-room">
                  <img src={selectedRoom?.image_url || roomImages[0]} alt={selectedRoom?.name} />
                  <div>
                    <h4>{selectedRoom?.name}</h4>
                    <span className="room-type-badge">{selectedRoom?.room_type}</span>
                  </div>
                </div>
                <div className="summary-details">
                  <div className="summary-row"><span>Check-in</span><strong>{form.check_in_date}</strong></div>
                  <div className="summary-row"><span>Check-out</span><strong>{form.check_out_date}</strong></div>
                  <div className="summary-row"><span>Duration</span><strong>{nights} night{nights > 1 ? 's' : ''}</strong></div>
                  <div className="summary-row"><span>Rate</span><strong>{formatCurrency(selectedRoom?.price_per_night || 0)} / night</strong></div>
                </div>
                <div className="summary-total">
                  <span>Total</span>
                  <strong>{formatCurrency(totalAmount)}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="animate-fade-in">
            <div className="booking-details-grid">
              <div className="confirm-section">
                <h3>Confirm Your Booking</h3>
                <p>Please review your booking details below.</p>

                <div className="confirm-details">
                  <h4>Guest Information</h4>
                  <div className="confirm-row"><span>Name:</span><strong>{form.guest_name}</strong></div>
                  <div className="confirm-row"><span>Phone:</span><strong>{form.guest_phone}</strong></div>
                  {form.guest_email && <div className="confirm-row"><span>Email:</span><strong>{form.guest_email}</strong></div>}
                  <div className="confirm-row"><span>Guests:</span><strong>{form.num_guests}</strong></div>
                  {form.special_requests && <div className="confirm-row"><span>Requests:</span><strong>{form.special_requests}</strong></div>}
                </div>

                <div className="confirm-details">
                  <h4>Payment</h4>
                  <p style={{color: 'var(--color-gray)', fontSize: '0.9rem', marginBottom: '1rem'}}>
                    Your payment will be processed securely. You will receive a receipt after successful booking.
                  </p>
                </div>

                <div className="form-actions">
                  <button className="btn btn-outline-dark" onClick={() => setStep(2)}>← Back</button>
                  <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? 'Processing...' : `Pay ${formatCurrency(totalAmount)} & Book`}
                  </button>
                </div>
              </div>

              <div className="booking-summary-card">
                <h4>Booking Summary</h4>
                <div className="summary-room">
                  <img src={selectedRoom?.image_url || roomImages[0]} alt={selectedRoom?.name} />
                  <div>
                    <h4>{selectedRoom?.name}</h4>
                    <span className="room-type-badge">{selectedRoom?.room_type}</span>
                  </div>
                </div>
                <div className="summary-details">
                  <div className="summary-row"><span>Check-in</span><strong>{form.check_in_date}</strong></div>
                  <div className="summary-row"><span>Check-out</span><strong>{form.check_out_date}</strong></div>
                  <div className="summary-row"><span>Duration</span><strong>{nights} night{nights > 1 ? 's' : ''}</strong></div>
                  <div className="summary-row"><span>Rate</span><strong>{formatCurrency(selectedRoom?.price_per_night || 0)} / night</strong></div>
                </div>
                <div className="summary-total">
                  <span>Total</span>
                  <strong>{formatCurrency(totalAmount)}</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
