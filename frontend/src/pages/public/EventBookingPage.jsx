import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { formatCurrency, getToday } from '../../utils/helpers';
import { Users } from '../../components/Icons';
import './BookingPage.css';

export default function EventBookingPage() {
  const [spaces, setSpaces] = useState([]);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    event_space_id: '',
    event_name: '',
    event_date: getToday(),
    event_end_date: '',
    expected_guests: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    special_requests: '',
  });

  const [selectedSpace, setSelectedSpace] = useState(null);

  useEffect(() => {
    api.getEventSpaces().then(setSpaces).catch(() => {});
  }, []);

  const handleSpaceSelect = (space) => {
    setSelectedSpace(space);
    setForm({ ...form, event_space_id: space.id });
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, event_end_date: form.event_end_date || form.event_date, total_amount: totalAmount, payment_status: 'pending', booking_status: 'pending' };
      const result = await api.createEventBooking(payload);
      const booking = {
        receipt_id: result.receipt_id,
        client_name: form.client_name,
        client_email: form.client_email,
        client_phone: form.client_phone,
        event_space_id: form.event_space_id,
        space_name: selectedSpace?.name,
        event_name: form.event_name,
        event_date: form.event_date,
        event_end_date: payload.event_end_date,
        expected_guests: form.expected_guests,
        special_requests: form.special_requests,
        total_amount: result.total_amount ?? result.booking?.total_amount ?? totalAmount,
        days: result.days ?? days,
        payment_status: 'paid',
        payment_method: 'online',
        booking_status: 'confirmed',
      };
      try { localStorage.setItem(`oris_receipt_${result.receipt_id}`, JSON.stringify(booking)); } catch { /* ignore */ }
      navigate(`/confirmation/event/${result.receipt_id}`, { state: { booking } });
    } catch (err) {
      alert(err.error || 'Booking failed. Please try again.');
    }
    setSubmitting(false);
  };

  const days = form.event_end_date && form.event_end_date !== form.event_date
    ? Math.max(1, Math.ceil((new Date(form.event_end_date) - new Date(form.event_date)) / (1000*60*60*24)) + 1)
    : 1;
  const totalAmount = selectedSpace ? selectedSpace.price_per_day * days : 0;

  const eventImages = [
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=600&h=400&fit=crop',
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
          <h1>Book an Event Space</h1>
          <p>Host your next unforgettable event at Oris Signatures.</p>
        </div>
      </div>

      {/* Steps */}
      <div className="booking-steps">
        <div className={`booking-step ${step >= 1 ? 'active' : ''}`}>
          <span className="step-num">1</span>
          <span className="step-label">Select Venue</span>
        </div>
        <div className="step-line"></div>
        <div className={`booking-step ${step >= 2 ? 'active' : ''}`}>
          <span className="step-num">2</span>
          <span className="step-label">Event Details</span>
        </div>
        <div className="step-line"></div>
        <div className={`booking-step ${step >= 3 ? 'active' : ''}`}>
          <span className="step-num">3</span>
          <span className="step-label">Confirm & Pay</span>
        </div>
      </div>

      <div className="container booking-content">
        {/* Step 1: Venue Selection */}
        {step === 1 && (
          <div className="animate-fade-in">
            <div className="available-rooms">
              {spaces.map((space, i) => (
                <div key={space.id} className="booking-room-card">
                  <div className="booking-room-img">
                    <img src={space.image_url || eventImages[i % eventImages.length]} alt={space.name} />
                  </div>
                  <div className="booking-room-info">
                    <div className="booking-room-header">
                      <div>
                        <h3>{space.name}</h3>
                      </div>
                      <div className="booking-room-price">
                        <span className="price">{formatCurrency(space.price_per_day)}</span>
                        <small>per day</small>
                      </div>
                    </div>
                    <p>{space.description}</p>
                    <div className="booking-room-amenities">
                      {(space.amenities || []).map((a, j) => (
                        <span key={j}>{a}</span>
                      ))}
                    </div>
                    <div className="booking-room-footer">
                      <span><Users width="15" height="15" /> Capacity: {space.capacity} guests</span>
                      <button className="btn btn-primary" onClick={() => handleSpaceSelect(space)}>Select Venue</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Event Details */}
        {step === 2 && (
          <div className="animate-fade-in">
            <div className="booking-details-grid">
              <form className="guest-form" onSubmit={(e) => { e.preventDefault(); setStep(3); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                <h3>Event & Contact Details</h3>
                <div className="form-group">
                  <label>Event Name *</label>
                  <input type="text" className="form-control" required value={form.event_name}
                    onChange={e => setForm({...form, event_name: e.target.value})} placeholder="e.g., Annual Gala Dinner" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Event Date *</label>
                    <input type="date" className="form-control" required min={getToday()} value={form.event_date}
                      onChange={e => setForm({...form, event_date: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>End Date (multi-day)</label>
                    <input type="date" className="form-control" min={form.event_date} value={form.event_end_date}
                      onChange={e => setForm({...form, event_end_date: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Expected Number of Guests *</label>
                  <input type="number" className="form-control" required min="1" max={selectedSpace?.capacity} value={form.expected_guests}
                    onChange={e => setForm({...form, expected_guests: e.target.value})}
                    placeholder={`Max capacity: ${selectedSpace?.capacity}`} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Your Full Name *</label>
                    <input type="text" className="form-control" required value={form.client_name}
                      onChange={e => setForm({...form, client_name: e.target.value})} placeholder="John Doe" />
                  </div>
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input type="tel" className="form-control" required value={form.client_phone}
                      onChange={e => setForm({...form, client_phone: e.target.value})} placeholder="+234 801 234 5678" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" className="form-control" value={form.client_email}
                    onChange={e => setForm({...form, client_email: e.target.value})} placeholder="john@example.com" />
                </div>
                <div className="form-group">
                  <label>Special Requests</label>
                  <textarea className="form-control" value={form.special_requests}
                    onChange={e => setForm({...form, special_requests: e.target.value})}
                    placeholder="Decoration preferences, catering requirements, etc." rows="3"></textarea>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-outline-dark" onClick={() => setStep(1)}>← Back</button>
                  <button type="submit" className="btn btn-primary">Continue to Payment →</button>
                </div>
              </form>

              <div className="booking-summary-card">
                <h4>Event Summary</h4>
                <div className="summary-room">
                  <img src={selectedSpace?.image_url || eventImages[0]} alt={selectedSpace?.name} />
                  <div>
                    <h4>{selectedSpace?.name}</h4>
                    <span style={{fontSize: '0.85rem', color: 'var(--color-gray)'}}>Capacity: {selectedSpace?.capacity}</span>
                  </div>
                </div>
                <div className="summary-details">
                  <div className="summary-row"><span>Date</span><strong>{form.event_date}</strong></div>
                  {form.event_end_date && form.event_end_date !== form.event_date && (
                    <div className="summary-row"><span>End Date</span><strong>{form.event_end_date}</strong></div>
                  )}
                  <div className="summary-row"><span>Duration</span><strong>{days} day{days > 1 ? 's' : ''}</strong></div>
                  <div className="summary-row"><span>Rate</span><strong>{formatCurrency(selectedSpace?.price_per_day || 0)} / day</strong></div>
                </div>
                <div className="summary-total">
                  <span>Total</span>
                  <strong>{formatCurrency(totalAmount)}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="animate-fade-in">
            <div className="booking-details-grid">
              <div className="confirm-section">
                <h3>Confirm Your Event Booking</h3>
                <div className="confirm-details">
                  <h4>Event Details</h4>
                  <div className="confirm-row"><span>Event:</span><strong>{form.event_name}</strong></div>
                  <div className="confirm-row"><span>Date:</span><strong>{form.event_date}</strong></div>
                  <div className="confirm-row"><span>Guests:</span><strong>{form.expected_guests}</strong></div>
                  <div className="confirm-row"><span>Name:</span><strong>{form.client_name}</strong></div>
                  <div className="confirm-row"><span>Phone:</span><strong>{form.client_phone}</strong></div>
                </div>
                <div className="form-actions">
                  <button className="btn btn-outline-dark" onClick={() => setStep(2)}>← Back</button>
                  <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? 'Processing...' : `Pay ${formatCurrency(totalAmount)} & Book`}
                  </button>
                </div>
              </div>

              <div className="booking-summary-card">
                <h4>Event Summary</h4>
                <div className="summary-room">
                  <img src={selectedSpace?.image_url || eventImages[0]} alt={selectedSpace?.name} />
                  <div>
                    <h4>{selectedSpace?.name}</h4>
                  </div>
                </div>
                <div className="summary-details">
                  <div className="summary-row"><span>Duration</span><strong>{days} day{days > 1 ? 's' : ''}</strong></div>
                  <div className="summary-row"><span>Rate</span><strong>{formatCurrency(selectedSpace?.price_per_day || 0)}</strong></div>
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
