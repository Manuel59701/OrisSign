import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/helpers';
import { useToast } from '../../context/ToastContext';
import './Admin.css';

export default function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: '',
    room_type: 'deluxe',
    description: '',
    price_per_night: 45000,
    max_guests: 2,
    total_units: 5,
    status: 'available',
    amenities: 'High-speed WiFi, Air Conditioning, Smart TV, Mini Bar, Room Service',
  });

  const loadRooms = async () => {
    setLoading(true);
    try {
      const data = await api.getRooms();
      setRooms(data || []);
    } catch (err) {
      console.error(err);
      showToast('Error loading rooms', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    try {
      const amenitiesArr = form.amenities.split(',').map((a) => a.trim()).filter(Boolean);
      const payload = {
        ...form,
        price_per_night: parseFloat(form.price_per_night),
        max_guests: parseInt(form.max_guests),
        total_units: parseInt(form.total_units),
        amenities: amenitiesArr,
      };

      if (editingRoom) {
        await api.updateRoom(editingRoom.id, payload);
        showToast('Room updated successfully', 'success');
      } else {
        await api.createRoom(payload);
        showToast('New room added to catalog', 'success');
      }

      setShowAddModal(false);
      setEditingRoom(null);
      setForm({
        name: '',
        room_type: 'deluxe',
        description: '',
        price_per_night: 45000,
        max_guests: 2,
        total_units: 5,
        status: 'available',
        amenities: 'High-speed WiFi, Air Conditioning, Smart TV, Mini Bar, Room Service',
      });
      loadRooms();
    } catch (err) {
      showToast(err.error || 'Failed to save room', 'error');
    }
  };

  const handleEditClick = (room) => {
    setEditingRoom(room);
    const amString = Array.isArray(room.amenities)
      ? room.amenities.join(', ')
      : typeof room.amenities === 'string'
      ? JSON.parse(room.amenities || '[]').join(', ')
      : '';

    setForm({
      name: room.name,
      room_type: room.room_type,
      description: room.description || '',
      price_per_night: room.price_per_night,
      max_guests: room.max_guests,
      total_units: room.total_units || 5,
      status: room.status || 'available',
      amenities: amString,
    });
    setShowAddModal(true);
  };

  const handleDeleteRoom = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from rooms?`)) return;
    try {
      await api.deleteRoom(id);
      showToast('Room removed from inventory', 'info');
      loadRooms();
    } catch (err) {
      showToast(err.error || 'Failed to delete room', 'error');
    }
  };

  return (
    <div>
      <div className="admin-header-actions">
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', margin: 0 }}>
            Rooms & Suites Inventory
          </h2>
          <p className="admin-page-desc">
            Manage hotel room tiers, nightly pricing, guest capacities, and room maintenance status.
          </p>
        </div>
        <button
          className="btn-admin btn-admin-accent"
          onClick={() => {
            setEditingRoom(null);
            setForm({
              name: '',
              room_type: 'deluxe',
              description: '',
              price_per_night: 45000,
              max_guests: 2,
              total_units: 5,
              status: 'available',
              amenities: 'High-speed WiFi, Air Conditioning, Smart TV, Mini Bar, Room Service',
            });
            setShowAddModal(true);
          }}
        >
          + Add New Room
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Room Details</th>
                <th>Type</th>
                <th>Nightly Rate</th>
                <th>Capacity</th>
                <th>Inventory</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                    Loading rooms...
                  </td>
                </tr>
              ) : rooms.length > 0 ? (
                rooms.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {r.image && (
                          <img
                            src={r.image}
                            alt={r.name}
                            style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                          />
                        )}
                        <div>
                          <div style={{ fontWeight: 600, color: '#111827' }}>{r.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {r.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>
                        {r.room_type}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, fontFamily: 'var(--font-heading)', fontSize: '1rem', color: '#0a0a0a' }}>
                        {formatCurrency(r.price_per_night)}
                      </span>
                    </td>
                    <td>Up to {r.max_guests} guests</td>
                    <td>{r.total_units || 5} units</td>
                    <td>
                      <span
                        className={`badge ${
                          r.status === 'available'
                            ? 'badge-confirmed'
                            : r.status === 'occupied'
                            ? 'badge-pending'
                            : 'badge-cancelled'
                        }`}
                      >
                        {r.status || 'available'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-buttons-group" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="btn-admin btn-admin-secondary btn-admin-sm"
                          onClick={() => handleEditClick(r)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-admin btn-admin-danger btn-admin-sm"
                          onClick={() => handleDeleteRoom(r.id, r.name)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                    No rooms in catalog yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Room Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingRoom ? `Edit Room: ${editingRoom.name}` : 'Add New Room / Suite'}
              </h3>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveRoom}>
              <div className="modal-body">
                <div className="form-field">
                  <label>Room Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Executive Silver Suite"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Room Category *</label>
                    <select
                      value={form.room_type}
                      onChange={(e) => setForm({ ...form, room_type: e.target.value })}
                    >
                      <option value="standard">Standard</option>
                      <option value="deluxe">Deluxe</option>
                      <option value="suite">Executive Suite</option>
                      <option value="presidential">Presidential Suite</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Price Per Night (NGN) *</label>
                    <input
                      type="number"
                      required
                      min="5000"
                      value={form.price_per_night}
                      onChange={(e) => setForm({ ...form, price_per_night: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Max Guests *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="10"
                      value={form.max_guests}
                      onChange={(e) => setForm({ ...form, max_guests: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Room Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                    >
                      <option value="available">Available</option>
                      <option value="occupied">Occupied</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                <div className="form-field">
                  <label>Description</label>
                  <textarea
                    rows="2"
                    placeholder="Describe aesthetics, view, and unique highlights..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Amenities (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="WiFi, AC, Jacuzzi, Smart TV"
                    value={form.amenities}
                    onChange={(e) => setForm({ ...form, amenities: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-admin btn-admin-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-admin btn-admin-accent">
                  {editingRoom ? 'Update Room' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
