import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { formatCurrency, formatDate, getToday, getTomorrow, calculateNights } from '../../utils/helpers';
import { downloadReceipt } from '../../utils/receipt';
import { useToast } from '../../context/ToastContext';
import { Bell, Clipboard, Search, Check, CheckCircle, Download, Trash } from '../../components/Icons';
import ConfirmDialog from '../../components/ConfirmDialog';
import './Admin.css';

export default function FrontDesk() {
  const PER_PAGE = 10;
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'walkin' | 'receipts'
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const { showToast } = useToast();

  // Walk-in form state
  const [walkinForm, setWalkinForm] = useState({
    guest_name: '',
    guest_phone: '',
    guest_email: '',
    room_id: '',
    check_in_date: getToday(),
    check_out_date: getTomorrow(),
    num_guests: 1,
    payment_method: 'pos',
    payment_confirmed: false,
    notes: '',
  });
  const [walkinSubmitting, setWalkinSubmitting] = useState(false);
  const [recentWalkinReceipt, setRecentWalkinReceipt] = useState(null);

  // Quick Receipt Search state
  const [receiptSearchTerm, setReceiptSearchTerm] = useState('');
  const [receiptSearchResults, setReceiptSearchResults] = useState([]);
  const [searchingReceipts, setSearchingReceipts] = useState(false);

  // Payment confirmation modal state
  const [paymentConfirmBooking, setPaymentConfirmBooking] = useState(null);
  const [deleteConfirmBooking, setDeleteConfirmBooking] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookingsData, roomsData] = await Promise.all([
        api.getBookings(),
        api.getRooms(),
      ]);
      setBookings(bookingsData || []);
      setRooms(roomsData || []);
      if (roomsData && roomsData.length > 0 && !walkinForm.room_id) {
        setWalkinForm(prev => ({ ...prev, room_id: roomsData[0].id }));
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading front desk data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Reset to page 1 whenever filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, typeFilter]);

  // Handle checking in an existing reservation
  const handleCheckIn = async (bookingId, guestName) => {
    try {
      await api.checkIn(bookingId);
      showToast(`Checked in ${guestName} successfully!`, 'success');
      loadData();
    } catch (err) {
      showToast(err.error || 'Failed to check in guest', 'error');
    }
  };

  // Handle checking out a guest — frees their room
  const handleCheckOut = async (bookingId, guestName, roomName) => {
    if (!window.confirm(`Check out ${guestName} from ${roomName || 'their room'}? The room will be marked available.`)) {
      return;
    }
    try {
      await api.checkOut(bookingId);
      showToast(`Checked out ${guestName}. ${roomName || 'Room'} is now available.`, 'success');
      loadData();
    } catch (err) {
      showToast(err.error || 'Failed to check out guest', 'error');
    }
  };

  // Handle Front Desk confirming a payment
  const openPaymentConfirm = (b) => setPaymentConfirmBooking({ ...b });

  const confirmMarkPaid = async () => {
    if (!paymentConfirmBooking) return;
    const b = paymentConfirmBooking;
    setPaymentConfirmBooking(null);
    try {
      await api.markPaid(b.id, 'paid');
      showToast(`Payment confirmed for ${b.guest_name}.`, 'success');
      loadData();
    } catch (err) {
      showToast(err.error || 'Failed to update payment status', 'error');
    }
  };

  // Handle deleting a booking (opens confirm dialog)
  const openDeleteConfirm = (b) => setDeleteConfirmBooking({ ...b });

  const confirmDeleteBooking = async () => {
    if (!deleteConfirmBooking) return;
    const b = deleteConfirmBooking;
    setDeleteConfirmBooking(null);
    try {
      await api.deleteBooking(b.id);
      try { localStorage.removeItem(`oris_receipt_${b.receipt_id}`); } catch { /* ignore */ }
      showToast('Reservation deleted.', 'success');
      loadData();
    } catch (err) {
      showToast(err.error || 'Failed to delete reservation', 'error');
    }
  };

  // Calculate nights and price for walk-in
  const selectedWalkinRoom = rooms.find(r => r.id === parseInt(walkinForm.room_id)) || rooms[0];
  const nights = calculateNights(walkinForm.check_in_date, walkinForm.check_out_date);
  const totalWalkinAmount = selectedWalkinRoom ? (selectedWalkinRoom.price_per_night * Math.max(1, nights)) : 0;

  // Handle Walk-in Submission
  const handleWalkinSubmit = async (e) => {
    e.preventDefault();
    if (!walkinForm.payment_confirmed) {
      showToast('Please confirm that payment has been received before checking in.', 'warning');
      return;
    }

    setWalkinSubmitting(true);
    try {
      const payload = {
        ...walkinForm,
        room_name: selectedWalkinRoom ? selectedWalkinRoom.name : 'Standard Deluxe',
        room_type: selectedWalkinRoom ? selectedWalkinRoom.room_type : 'standard',
        total_amount: totalWalkinAmount,
        booking_type: 'walkin',
        check_in_status: 'checked_in',
        payment_status: 'paid',
      };

      const result = await api.createWalkIn(payload);
      showToast(`Walk-in guest ${walkinForm.guest_name} checked in! Receipt: ${result.receipt_id}`, 'success');
      
      const createdBooking = result.booking || { ...payload, receipt_id: result.receipt_id };
      setRecentWalkinReceipt(createdBooking);

      // Reset form
      setWalkinForm({
        guest_name: '',
        guest_phone: '',
        guest_email: '',
        room_id: rooms[0]?.id || '',
        check_in_date: getToday(),
        check_out_date: getTomorrow(),
        num_guests: 1,
        payment_method: 'pos',
        payment_confirmed: false,
        notes: '',
      });

      loadData();
    } catch (err) {
      showToast(err.error || 'Walk-in check-in failed', 'error');
    } finally {
      setWalkinSubmitting(false);
    }
  };

  // Handle Receipt Search
  const handleSearchReceipt = async (e) => {
    e.preventDefault();
    if (!receiptSearchTerm.trim()) return;
    setSearchingReceipts(true);
    try {
      const results = await api.searchReceipts(receiptSearchTerm.trim());
      setReceiptSearchResults(results || []);
      if (!results || results.length === 0) {
        showToast('No receipt found matching that query', 'info');
      }
    } catch (err) {
      showToast('Error searching receipts', 'error');
    } finally {
      setSearchingReceipts(false);
    }
  };

  // Filtered bookings
  const filteredBookings = bookings.filter((b) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      b.receipt_id?.toLowerCase().includes(q) ||
      b.guest_name?.toLowerCase().includes(q) ||
      b.guest_phone?.includes(q) ||
      b.room_name?.toLowerCase().includes(q);

    const status = b.check_in_status || b.booking_status || 'pending';
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    const matchesType = typeFilter === 'all' || b.booking_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination (10 rows per page)
  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * PER_PAGE;
  const paginatedBookings = filteredBookings.slice(pageStart, pageStart + PER_PAGE);

  return (
    <div>
      <div className="admin-header-actions">
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', margin: 0 }}>
            Front Desk Management
          </h2>
          <p className="admin-page-desc">
            Verify online bookings, check-in arrival guests, register walk-ins, and issue instant receipts.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn-admin ${activeTab === 'walkin' ? 'btn-admin-accent' : 'btn-admin-primary'}`}
            onClick={() => {
              setActiveTab('walkin');
              setRecentWalkinReceipt(null);
            }}
          >
            + New Walk-in Check-in
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          <span><Bell width="16" height="16" /> All Bookings & Check-In</span>
          <span className="tab-badge">{bookings.length}</span>
        </button>

        <button
          className={`admin-tab-btn ${activeTab === 'walkin' ? 'active' : ''}`}
          onClick={() => setActiveTab('walkin')}
        >
          <span><Clipboard width="16" height="16" /> Walk-In Registration</span>
        </button>

        <button
          className={`admin-tab-btn ${activeTab === 'receipts' ? 'active' : ''}`}
          onClick={() => setActiveTab('receipts')}
        >
          <span><Search width="16" height="16" /> Quick Receipt Search</span>
        </button>
      </div>

      {/* TAB 1: ALL BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="admin-card">
          <div className="filter-bar">
            <div className="search-input-wrapper">
              <span className="search-icon"><Search width="16" height="16" /></span>
              <input
                type="text"
                placeholder="Search by Receipt ID (ORS-XXXXXX), Guest Name, Phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Check-in</option>
              <option value="checked_in">Checked In</option>
              <option value="checked_out">Checked Out</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              className="filter-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Booking Channels</option>
              <option value="online">Online Booking</option>
              <option value="walkin">Walk-in Guest</option>
            </select>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Receipt ID</th>
                  <th>Guest Info</th>
                  <th>Room</th>
                  <th>Dates & Nights</th>
                  <th>Channel</th>
                  <th>Payment</th>
                  <th>Check-In Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                      Loading bookings records...
                    </td>
                  </tr>
                ) : filteredBookings.length > 0 ? (
                  paginatedBookings.map((b) => {
                    const status = b.check_in_status || b.booking_status || 'pending';
                    return (
                    <tr key={b.id}>
                      <td>
                        <span className="receipt-code-pill">{b.receipt_id}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#111827' }}>{b.guest_name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>{b.guest_phone}</div>
                        {b.guest_email && (
                          <div style={{ fontSize: '0.74rem', color: '#9ca3af' }}>{b.guest_email}</div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{b.room_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'capitalize' }}>
                          {b.room_type}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>
                        <div>In: {formatDate(b.check_in_date)}</div>
                        <div>Out: {formatDate(b.check_out_date)}</div>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          ({calculateNights(b.check_in_date, b.check_out_date)} nights)
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${b.booking_type === 'walkin' ? 'badge-walkin' : 'badge-online'}`}>
                          {b.booking_type || 'online'}
                        </span>
                      </td>
<td className="payment-cell">
        <div className="payment-status-row">
          <span className={`badge badge-${b.payment_status || 'pending'}`}>
            {b.payment_status || 'pending'} ({(b.payment_method || 'online')})
          </span>
        </div>
        <div className="payment-amount">
          {formatCurrency(b.total_amount)}
        </div>
        {b.payment_status !== 'paid' && (
          <button
            className="btn-admin btn-admin-success btn-admin-sm mark-paid-btn"
            onClick={() => openPaymentConfirm(b)}
            title="Confirm this guest's payment"
          >
            Mark Paid
          </button>
        )}
      </td>
                      <td>
                        <span className={`badge badge-${status.replace(/_/g, '-')}`}>
                          {status === 'checked_in' ? <><Check width="12" height="12" /> Checked In</> : status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="action-buttons-group" style={{ justifyContent: 'flex-end' }}>
                          {status !== 'checked_in' && status !== 'checked_out' && (
                            <button
                              className="btn-admin btn-admin-success btn-admin-sm"
                              onClick={() => handleCheckIn(b.id, b.guest_name)}
                              title="Check in this guest now"
                            >
                              Check In
                            </button>
                          )}

                          {status === 'checked_in' && (
                            <button
                              className="btn-admin btn-admin-danger btn-admin-sm"
                              onClick={() => handleCheckOut(b.id, b.guest_name, b.room_name)}
                              title="Check out this guest and free the room"
                            >
                              Check Out
                            </button>
                          )}

                          {status === 'checked_out' && (
                            <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, marginRight: '4px' }}>
                              Checked Out
                            </span>
                          )}

                          <button
                            className="btn-admin btn-admin-secondary btn-admin-sm btn-icon-only"
                            onClick={() => downloadReceipt(b, 'room')}
                            title="Download Official Receipt PDF"
                          >
                            <Download width="15" height="15" />
                          </button>

                          <button
                            className="btn-admin btn-admin-danger btn-admin-sm btn-icon-only"
                            onClick={() => openDeleteConfirm(b)}
                            title="Delete this reservation"
                          >
                            <Trash width="15" height="15" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                      No room reservations found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredBookings.length > PER_PAGE && (
            <div className="pagination-bar">
              <span className="pagination-info">
                Showing {pageStart + 1}–{Math.min(pageStart + PER_PAGE, filteredBookings.length)} of {filteredBookings.length}
              </span>
              <div className="pagination-controls">
                <button
                  type="button"
                  className="pagination-btn"
                  disabled={safePage <= 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  Prev
                </button>
                <span className="pagination-pages">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      type="button"
                      key={n}
                      className={`pagination-page ${n === safePage ? 'active' : ''}`}
                      onClick={() => setCurrentPage(n)}
                    >
                      {n}
                    </button>
                  ))}
                </span>
                <button
                  type="button"
                  className="pagination-btn"
                  disabled={safePage >= totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: WALK-IN CHECK-IN */}
      {activeTab === 'walkin' && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {recentWalkinReceipt ? (
            <div className="receipt-display-card" style={{ marginBottom: '2rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--color-accent-dark)' }}><CheckCircle width="40" height="40" /></span>
                <h3 style={{ fontFamily: 'var(--font-heading)', margin: '8px 0', fontSize: '1.4rem' }}>
                  Walk-in Check-in Successful!
                </h3>
                <p style={{ color: '#4b5563', fontSize: '0.88rem' }}>
                  Guest has been checked in and assigned to room. Download or print their official receipt below.
                </p>
                <div className="receipt-id-banner" style={{ marginTop: '0.5rem' }}>
                  {recentWalkinReceipt.receipt_id}
                </div>
              </div>

              <div className="receipt-details-list" style={{ marginTop: '1.5rem' }}>
                <div className="receipt-row">
                  <span className="receipt-row-label">Guest Name</span>
                  <span className="receipt-row-value">{recentWalkinReceipt.guest_name}</span>
                </div>
                <div className="receipt-row">
                  <span className="receipt-row-label">Phone</span>
                  <span className="receipt-row-value">{recentWalkinReceipt.guest_phone}</span>
                </div>
                <div className="receipt-row">
                  <span className="receipt-row-label">Room Assigned</span>
                  <span className="receipt-row-value">{recentWalkinReceipt.room_name}</span>
                </div>
                <div className="receipt-row">
                  <span className="receipt-row-label">Period</span>
                  <span className="receipt-row-value">
                    {formatDate(recentWalkinReceipt.check_in_date)} — {formatDate(recentWalkinReceipt.check_out_date)}
                  </span>
                </div>
                <div className="receipt-row">
                  <span className="receipt-row-label">Payment Method</span>
                  <span className="receipt-row-value" style={{ textTransform: 'uppercase' }}>
                    {recentWalkinReceipt.payment_method} (CONFIRMED)
                  </span>
                </div>
                <div className="receipt-row">
                  <span className="receipt-row-label">Total Paid</span>
                  <span className="receipt-row-value">{formatCurrency(recentWalkinReceipt.total_amount)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '1.5rem' }}>
                <button
                  className="btn-admin btn-admin-primary"
                  onClick={() => downloadReceipt(recentWalkinReceipt, 'room')}
                >
                  <Download width="15" height="15" /> Download Official Receipt PDF
                </button>
                <button
                  className="btn-admin btn-admin-secondary"
                  onClick={() => setRecentWalkinReceipt(null)}
                >
                  + New Walk-in Guest
                </button>
              </div>
            </div>
          ) : (
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h3 className="admin-card-title">Register Walk-in Guest</h3>
                  <p style={{ fontSize: '0.82rem', color: '#6b7280', margin: 0 }}>
                    Confirm physical payment and instantly generate check-in credentials with a unique receipt.
                  </p>
                </div>
              </div>

              <form onSubmit={handleWalkinSubmit} style={{ padding: '2rem' }}>
                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Guest Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chief Olumide Johnson"
                      value={walkinForm.guest_name}
                      onChange={(e) => setWalkinForm({ ...walkinForm, guest_name: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +234 803 123 4567"
                      value={walkinForm.guest_phone}
                      onChange={(e) => setWalkinForm({ ...walkinForm, guest_phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Email Address (Optional)</label>
                    <input
                      type="email"
                      placeholder="guest@example.com"
                      value={walkinForm.guest_email}
                      onChange={(e) => setWalkinForm({ ...walkinForm, guest_email: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Number of Guests</label>
                    <select
                      value={walkinForm.num_guests}
                      onChange={(e) => setWalkinForm({ ...walkinForm, num_guests: parseInt(e.target.value) })}
                    >
                      <option value="1">1 Guest</option>
                      <option value="2">2 Guests</option>
                      <option value="3">3 Guests</option>
                      <option value="4">4 Guests</option>
                    </select>
                  </div>
                </div>

                <div className="form-field">
                  <label>Select Room *</label>
                  <select
                    required
                    value={walkinForm.room_id}
                    onChange={(e) => setWalkinForm({ ...walkinForm, room_id: e.target.value })}
                  >
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name} — {formatCurrency(room.price_per_night)}/night ({room.status.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Check-in Date *</label>
                    <input
                      type="date"
                      required
                      value={walkinForm.check_in_date}
                      onChange={(e) => setWalkinForm({ ...walkinForm, check_in_date: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Check-out Date *</label>
                    <input
                      type="date"
                      required
                      value={walkinForm.check_out_date}
                      onChange={(e) => setWalkinForm({ ...walkinForm, check_out_date: e.target.value })}
                    />
                  </div>
                </div>

                {/* Calculation Summary Box */}
                <div
                  style={{
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                    <span style={{ color: '#6b7280' }}>Room Rate:</span>
                    <span>{formatCurrency(selectedWalkinRoom?.price_per_night || 0)} x {Math.max(1, nights)} nights</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e5e7eb', paddingTop: '8px' }}>
                    <span style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.9rem' }}>Total Amount Due:</span>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, color: '#0a0a0a' }}>
                      {formatCurrency(totalWalkinAmount)}
                    </span>
                  </div>
                </div>

                <div className="form-field">
                  <label>Payment Method Collected *</label>
                  <select
                    value={walkinForm.payment_method}
                    onChange={(e) => setWalkinForm({ ...walkinForm, payment_method: e.target.value })}
                  >
                    <option value="pos">POS Terminal / Debit Card</option>
                    <option value="cash">Cash Payment</option>
                    <option value="transfer">Direct Bank Transfer</option>
                  </select>
                </div>

                {/* Mandatory Payment Confirmation Checkbox */}
                <div className="checkbox-row">
                  <input
                    type="checkbox"
                    id="payment_confirmed"
                    checked={walkinForm.payment_confirmed}
                    onChange={(e) => setWalkinForm({ ...walkinForm, payment_confirmed: e.target.checked })}
                  />
                  <label htmlFor="payment_confirmed">
                    I confirm that payment of {formatCurrency(totalWalkinAmount)} has been received and verified at the Front Desk.
                  </label>
                </div>

                <div className="form-field">
                  <label>Front Desk Notes / ID Reference</label>
                  <textarea
                    rows="2"
                    placeholder="e.g. National ID #, Car Plate, or special room preference"
                    value={walkinForm.notes}
                    onChange={(e) => setWalkinForm({ ...walkinForm, notes: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-admin btn-admin-accent"
                  style={{ width: '100%', padding: '0.95rem', fontSize: '1rem', marginTop: '1rem' }}
                  disabled={walkinSubmitting || !walkinForm.payment_confirmed}
                >
                  {walkinSubmitting ? 'Processing Check-In...' : 'Confirm Payment & Complete Check-In'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: RECEIPT SEARCH */}
      {activeTab === 'receipts' && (
        <div>
          <div className="admin-card" style={{ maxWidth: '800px', margin: '0 auto 2rem' }}>
            <div className="admin-card-header">
              <h3 className="admin-card-title">Front Desk Receipt Verification</h3>
            </div>
            <form onSubmit={handleSearchReceipt} style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div className="search-input-wrapper" style={{ flex: 1 }}>
                  <span className="search-icon"><Search width="16" height="16" /></span>
                  <input
                    type="text"
                    required
                    placeholder="Enter Unique Receipt ID (e.g. ORS-982143)..."
                    value={receiptSearchTerm}
                    onChange={(e) => setReceiptSearchTerm(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-admin btn-admin-primary" disabled={searchingReceipts}>
                  {searchingReceipts ? 'Searching...' : 'Search Receipt'}
                </button>
              </div>
            </form>
          </div>

          {receiptSearchResults.length > 0 && (
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              {receiptSearchResults.map((item) => (
                <div key={item.receipt_id} className="receipt-display-card" style={{ marginBottom: '1.5rem' }}>
                  <div className="receipt-display-header">
                    <h3 className="receipt-hotel-title">ORIS SIGNATURES</h3>
                    <div className="receipt-hotel-sub">Official Booking Folio</div>
                    <div className="receipt-id-banner">{item.receipt_id}</div>
                  </div>

                  <div className="receipt-details-list">
                    <div className="receipt-row">
                      <span className="receipt-row-label">Customer / Guest</span>
                      <span className="receipt-row-value">{item.guest_name || item.client_name}</span>
                    </div>
                    <div className="receipt-row">
                      <span className="receipt-row-label">Phone</span>
                      <span className="receipt-row-value">{item.guest_phone || item.client_phone}</span>
                    </div>
                    <div className="receipt-row">
                      <span className="receipt-row-label">Service Booked</span>
                      <span className="receipt-row-value">{item.room_name || item.space_name || item.event_name}</span>
                    </div>
                    <div className="receipt-row">
                      <span className="receipt-row-label">Category</span>
                      <span className="receipt-row-value" style={{ textTransform: 'uppercase' }}>
                        {item.type === 'event' ? 'Event Space' : 'Hotel Room'}
                      </span>
                    </div>
                    <div className="receipt-row">
                      <span className="receipt-row-label">Dates</span>
                      <span className="receipt-row-value">
                        {item.type === 'event'
                          ? formatDate(item.event_date)
                          : `${formatDate(item.check_in_date)} — ${formatDate(item.check_out_date)}`}
                      </span>
                    </div>
                    <div className="receipt-row">
                      <span className="receipt-row-label">Payment Status</span>
                      <span className="receipt-row-value" style={{ color: '#059669', textTransform: 'uppercase' }}>
                        <Check width="12" height="12" /> {item.payment_status} ({item.payment_method})
                      </span>
                    </div>
                  </div>

                  <div className="receipt-total-highlight">
                    <span className="receipt-total-label">Total Amount Paid</span>
                    <span className="receipt-total-val">{formatCurrency(item.total_amount)}</span>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <button
                      className="btn-admin btn-admin-primary"
                      onClick={() => downloadReceipt(item, item.type || 'room')}
                    >
                      <Download width="15" height="15" /> Download PDF Receipt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payment confirmation modal */}
      <ConfirmDialog
        open={!!paymentConfirmBooking}
        title="Confirm Payment Received"
        variant="success"
        icon={<CheckCircle width="40" height="40" />}
        message={paymentConfirmBooking ? (
          <>
            Have you confirmed you have received this payment from{' '}
            <strong>{paymentConfirmBooking.guest_name}</strong>{' '}
            ({formatCurrency(paymentConfirmBooking.total_amount)})?
          </>
        ) : null}
        confirmLabel="Continue"
        onClose={() => setPaymentConfirmBooking(null)}
        onConfirm={confirmMarkPaid}
      />

      {/* Delete reservation confirmation modal */}
      <ConfirmDialog
        open={!!deleteConfirmBooking}
        title="Delete Reservation"
        variant="danger"
        icon={<Trash width="40" height="40" />}
        message={deleteConfirmBooking ? (
          <>
            Delete the reservation for <strong>{deleteConfirmBooking.guest_name}</strong>{' '}
            {deleteConfirmBooking.receipt_id ? `(${deleteConfirmBooking.receipt_id})` : ''}?
          </>
        ) : null}
        confirmLabel="Delete"
        onClose={() => setDeleteConfirmBooking(null)}
        onConfirm={confirmDeleteBooking}
      />
    </div>
  );
}
