import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { downloadReceipt } from '../../utils/receipt';
import { useToast } from '../../context/ToastContext';
import { Calendar, Presentation, Search, Download } from '../../components/Icons';
import './Admin.css';

export default function EventManager() {
  const PER_PAGE = 10;
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'spaces'
  const [eventBookings, setEventBookings] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddSpaceModal, setShowAddSpaceModal] = useState(false);
  const { showToast } = useToast();

  const [newSpaceForm, setNewSpaceForm] = useState({
    name: '',
    description: '',
    capacity: 100,
    price_per_day: 150000,
    amenities: 'Projector, Sound System, WiFi, Stage Lighting',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookingsData, spacesData] = await Promise.all([
        api.getEventBookings(),
        api.getEventSpaces(),
      ]);
      setEventBookings(bookingsData || []);
      setSpaces(spacesData || []);
    } catch (err) {
      console.error(err);
      showToast('Error loading event data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      await api.updateEventBooking(bookingId, { booking_status: newStatus });
      showToast(`Event status updated to ${newStatus}`, 'success');
      loadData();
    } catch (err) {
      showToast(err.error || 'Failed to update event status', 'error');
    }
  };

  const handleCreateSpace = async (e) => {
    e.preventDefault();
    try {
      const amenitiesArr = newSpaceForm.amenities.split(',').map((a) => a.trim()).filter(Boolean);
      await api.createEventSpace({
        ...newSpaceForm,
        capacity: parseInt(newSpaceForm.capacity),
        price_per_day: parseFloat(newSpaceForm.price_per_day),
        amenities: amenitiesArr,
      });
      showToast('New event venue created successfully!', 'success');
      setShowAddSpaceModal(false);
      setNewSpaceForm({
        name: '',
        description: '',
        capacity: 100,
        price_per_day: 150000,
        amenities: 'Projector, Sound System, WiFi, Stage Lighting',
      });
      loadData();
    } catch (err) {
      showToast(err.error || 'Failed to create event space', 'error');
    }
  };

  // Reset to page 1 whenever filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const filteredEvents = eventBookings.filter((evt) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      evt.receipt_id?.toLowerCase().includes(q) ||
      evt.event_name?.toLowerCase().includes(q) ||
      evt.client_name?.toLowerCase().includes(q) ||
      evt.space_name?.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'all' || evt.booking_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination (10 rows per page)
  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * PER_PAGE;
  const paginatedEvents = filteredEvents.slice(pageStart, pageStart + PER_PAGE);

  return (
    <div>
      <div className="admin-header-actions">
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', margin: 0 }}>
            Event Operations & Venues
          </h2>
          <p className="admin-page-desc">
            Supervise corporate conferences, galas, banquet spaces, and issued event receipts.
          </p>
        </div>
        <div>
          {activeTab === 'spaces' && (
            <button
              className="btn-admin btn-admin-accent"
              onClick={() => setShowAddSpaceModal(true)}
            >
              + Add Event Venue Space
            </button>
          )}
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          <span><Calendar width="16" height="16" /> Event Reservations</span>
          <span className="tab-badge">{eventBookings.length}</span>
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'spaces' ? 'active' : ''}`}
          onClick={() => setActiveTab('spaces')}
        >
          <span><Presentation width="16" height="16" /> Venue Spaces & Capacity</span>
          <span className="tab-badge">{spaces.length}</span>
        </button>
      </div>

      {/* TAB 1: EVENT RESERVATIONS */}
      {activeTab === 'bookings' && (
        <div className="admin-card">
          <div className="filter-bar">
            <div className="search-input-wrapper">
              <span className="search-icon"><Search width="16" height="16" /></span>
              <input
                type="text"
                placeholder="Search event name, client, space, or Receipt ID..."
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
              <option value="confirmed">Confirmed</option>
              <option value="active">In Progress / Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Receipt ID</th>
                  <th>Event Name</th>
                  <th>Client / Host</th>
                  <th>Venue Space</th>
                  <th>Event Date</th>
                  <th>Capacity / Pax</th>
                  <th>Total Amount</th>
                  <th>Event Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                      Loading event bookings...
                    </td>
                  </tr>
                ) : filteredEvents.length > 0 ? (
                  paginatedEvents.map((evt) => (
                    <tr key={evt.id}>
                      <td>
                        <span className="receipt-code-pill">{evt.receipt_id}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#111827' }}>{evt.event_name}</div>
                        {evt.special_requests && (
                          <div style={{ fontSize: '0.74rem', color: '#9ca3af', maxWidth: '200px' }}>
                            Note: {evt.special_requests}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{evt.client_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{evt.client_phone}</div>
                        {evt.client_email && (
                          <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{evt.client_email}</div>
                        )}
                      </td>
                      <td>{evt.space_name}</td>
                      <td style={{ fontSize: '0.82rem' }}>
                        <div>{formatDate(evt.event_date)}</div>
                        {evt.event_end_date && evt.event_end_date !== evt.event_date && (
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            to {formatDate(evt.event_end_date)}
                          </div>
                        )}
                      </td>
                      <td>{evt.expected_guests} guests</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{formatCurrency(evt.total_amount)}</div>
                        <span className="badge badge-paid">{evt.payment_status || 'paid'}</span>
                      </td>
                      <td>
                        <span className={`badge badge-${(evt.booking_status || 'confirmed').replace('_', '-')}`}>
                          {evt.booking_status || 'confirmed'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="action-buttons-group" style={{ justifyContent: 'flex-end' }}>
                          <select
                            style={{
                              padding: '3px 8px',
                              fontSize: '0.75rem',
                              borderRadius: '4px',
                              border: '1px solid #d1d5db',
                            }}
                            value={evt.booking_status || 'confirmed'}
                            onChange={(e) => handleUpdateStatus(evt.id, e.target.value)}
                          >
                            <option value="confirmed">Confirmed</option>
                            <option value="active">Active Now</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>

                          <button
                            className="btn-admin btn-admin-secondary btn-admin-sm btn-icon-only"
                            onClick={() => downloadReceipt(evt, 'event')}
                            title="Download Event Folio PDF"
                          >
                            <Download width="15" height="15" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                      No event bookings matching the filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredEvents.length > PER_PAGE && (
            <div className="pagination-bar">
              <span className="pagination-info">
                Showing {pageStart + 1}–{Math.min(pageStart + PER_PAGE, filteredEvents.length)} of {filteredEvents.length}
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

      {/* TAB 2: VENUE SPACES */}
      {activeTab === 'spaces' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {spaces.map((space) => (
            <div key={space.id} className="admin-card" style={{ margin: 0 }}>
              {space.image && (
                <div style={{ height: '180px', overflow: 'hidden' }}>
                  <img
                    src={space.image}
                    alt={space.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', margin: 0 }}>
                    {space.name}
                  </h3>
                  <span className="badge badge-confirmed">{space.status || 'available'}</span>
                </div>

                <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0.5rem 0 1rem' }}>
                  {space.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6', fontSize: '0.88rem' }}>
                  <span style={{ color: '#6b7280' }}>Capacity:</span>
                  <span style={{ fontWeight: 600 }}>Up to {space.capacity} guests</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #f3f4f6', fontSize: '0.88rem' }}>
                  <span style={{ color: '#6b7280' }}>Rental Rate:</span>
                  <span style={{ fontWeight: 700, color: '#0a0a0a', fontFamily: 'var(--font-heading)' }}>
                    {formatCurrency(space.price_per_day)} / day
                  </span>
                </div>

                {space.amenities && (
                  <div style={{ marginTop: '0.85rem' }}>
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 600, marginBottom: '4px' }}>
                      Amenities:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {(Array.isArray(space.amenities) ? space.amenities : JSON.parse(space.amenities || '[]')).map((am, i) => (
                        <span key={i} style={{ background: '#f3f4f6', fontSize: '0.7rem', padding: '2px 7px', borderRadius: '4px', color: '#4b5563' }}>
                          {am}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add New Venue Space */}
      {showAddSpaceModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Add New Event Venue Space</h3>
              <button className="modal-close-btn" onClick={() => setShowAddSpaceModal(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateSpace}>
              <div className="modal-body">
                <div className="form-field">
                  <label>Venue Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. The Imperial Pavilion"
                    value={newSpaceForm.name}
                    onChange={(e) => setNewSpaceForm({ ...newSpaceForm, name: e.target.value })}
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Guest Capacity *</label>
                    <input
                      type="number"
                      required
                      min="10"
                      value={newSpaceForm.capacity}
                      onChange={(e) => setNewSpaceForm({ ...newSpaceForm, capacity: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Price Per Day (NGN) *</label>
                    <input
                      type="number"
                      required
                      min="10000"
                      value={newSpaceForm.price_per_day}
                      onChange={(e) => setNewSpaceForm({ ...newSpaceForm, price_per_day: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>Description</label>
                  <textarea
                    rows="3"
                    placeholder="Describe the venue's features and atmosphere..."
                    value={newSpaceForm.description}
                    onChange={(e) => setNewSpaceForm({ ...newSpaceForm, description: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Amenities (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="Sound System, Projector, Stage, VIP Lounge"
                    value={newSpaceForm.amenities}
                    onChange={(e) => setNewSpaceForm({ ...newSpaceForm, amenities: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-admin btn-admin-secondary"
                  onClick={() => setShowAddSpaceModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-admin btn-admin-accent">
                  Save Venue Space
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
