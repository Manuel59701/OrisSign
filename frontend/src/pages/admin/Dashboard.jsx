import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { downloadReceipt } from '../../utils/receipt';
import { useToast } from '../../context/ToastContext';
import { Bell, Receipt, Money, Bed, Calendar, Key } from '../../components/Icons';
import './Admin.css';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboard();
      setData(res);
    } catch (err) {
      console.error(err);
      showToast('Could not load dashboard stats', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleQuickCheckIn = async (bookingId) => {
    try {
      await api.checkIn(bookingId);
      showToast('Guest checked in successfully!', 'success');
      loadDashboard();
    } catch (err) {
      showToast(err.error || 'Failed to check in guest', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
        <p>Loading executive overview...</p>
      </div>
    );
  }

  const stats = data || {
    total_revenue: 0,
    pending_revenue: 0,
    room_bookings_count: 0,
    pending_room_bookings_count: 0,
    event_bookings_count: 0,
    pending_event_bookings_count: 0,
    active_checked_in: 0,
    occupancy_rate: 0,
    recent_bookings: [],
    upcoming_events: [],
  };

  return (
    <div>
      <div className="admin-header-actions">
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', margin: 0 }}>
            Executive Dashboard
          </h2>
          <p className="admin-page-desc">
            Real-time performance, revenue overview, and guest occupancy metrics.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/admin/dashboard/front-desk" className="btn-admin btn-admin-accent">
            <Bell width="15" height="15" /> Front Desk
          </Link>
          <Link to="/admin/dashboard/receipts" className="btn-admin btn-admin-primary">
            <Receipt width="15" height="15" /> Search Receipts
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <div className="stat-label">Total Revenue</div>
            <div className="stat-value">{formatCurrency(stats.total_revenue || 0)}</div>
            <div className="stat-sub">Rooms + Event Bookings</div>
            <div className="stat-pending">Pending: {formatCurrency(stats.pending_revenue || 0)}</div>
          </div>
          <div className="stat-icon-wrapper gold"><Money /></div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Room Bookings</div>
            <div className="stat-value">{stats.room_bookings_count || 0}</div>
            <div className="stat-sub">Confirmed reservations</div>
            <div className="stat-pending">Pending: {stats.pending_room_bookings_count || 0}</div>
          </div>
          <div className="stat-icon-wrapper black"><Bed /></div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Event Bookings</div>
            <div className="stat-value">{stats.event_bookings_count || 0}</div>
            <div className="stat-sub">Confirmed conferences & galas</div>
            <div className="stat-pending">Pending: {stats.pending_event_bookings_count || 0}</div>
          </div>
          <div className="stat-icon-wrapper silver"><Calendar /></div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Checked-In Guests</div>
            <div className="stat-value">{stats.active_checked_in || 0}</div>
            <div className="stat-sub">Currently in-house</div>
          </div>
          <div className="stat-icon-wrapper success"><Key /></div>
        </div>
      </div>

      {/* Recent Room Bookings */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">Recent Room Reservations</h3>
          <Link to="/admin/dashboard/front-desk" className="btn-admin btn-admin-secondary btn-admin-sm">
            View All Bookings →
          </Link>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Receipt ID</th>
                <th>Guest</th>
                <th>Room</th>
                <th>Check-in / Out</th>
                <th>Type</th>
                <th>Payment</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_bookings && stats.recent_bookings.length > 0 ? (
                stats.recent_bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <span className="receipt-code-pill">{booking.receipt_id}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#111827' }}>{booking.guest_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{booking.guest_phone}</div>
                    </td>
                    <td>{booking.room_name}</td>
                    <td style={{ fontSize: '0.82rem' }}>
                      {formatDate(booking.check_in_date)} — {formatDate(booking.check_out_date)}
                    </td>
                    <td>
                      <span className={`badge ${booking.booking_type === 'walkin' ? 'badge-walkin' : 'badge-online'}`}>
                        {booking.booking_type || 'online'}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-paid">{booking.payment_status}</span>
                    </td>
                    <td>
                      <span className={`badge badge-${(booking.check_in_status || 'pending').replace('_', '-')}`}>
                        {booking.check_in_status || 'pending'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-buttons-group" style={{ justifyContent: 'flex-end' }}>
                        {booking.check_in_status !== 'checked_in' && (
                          <button
                            className="btn-admin btn-admin-success btn-admin-sm"
                            onClick={() => handleQuickCheckIn(booking.id)}
                            title="Check-in guest"
                          >
                            Check-in
                          </button>
                        )}
                        <button
                          className="btn-admin btn-admin-secondary btn-admin-sm"
                          onClick={() => downloadReceipt(booking, 'room')}
                          title="Download Receipt PDF"
                        >
                          PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                    No room bookings recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">Upcoming Event Bookings</h3>
          <Link to="/admin/dashboard/events" className="btn-admin btn-admin-secondary btn-admin-sm">
            Manage Events →
          </Link>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Receipt ID</th>
                <th>Event Name</th>
                <th>Client</th>
                <th>Space / Venue</th>
                <th>Date</th>
                <th>Guests</th>
                <th>Amount</th>
                <th style={{ textAlign: 'right' }}>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {stats.upcoming_events && stats.upcoming_events.length > 0 ? (
                stats.upcoming_events.map((evt) => (
                  <tr key={evt.id}>
                    <td>
                      <span className="receipt-code-pill">{evt.receipt_id}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: '#111827' }}>{evt.event_name}</td>
                    <td>
                      <div>{evt.client_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{evt.client_phone}</div>
                    </td>
                    <td>{evt.space_name}</td>
                    <td style={{ fontSize: '0.82rem' }}>{formatDate(evt.event_date)}</td>
                    <td>{evt.expected_guests} pax</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(evt.total_amount)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn-admin btn-admin-secondary btn-admin-sm"
                        onClick={() => downloadReceipt(evt, 'event')}
                      >
                        PDF
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                    No upcoming events booked yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
