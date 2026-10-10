import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { Shield, Bell, Calendar } from '../../components/Icons';
import './Admin.css';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const { showToast } = useToast();

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'frontdesk',
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data || []);
    } catch (err) {
      console.error(err);
      showToast('Error loading staff accounts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.createUser(form);
      showToast(`Staff account for ${form.full_name} created successfully!`, 'success');
      setShowAddModal(false);
      setForm({
        full_name: '',
        email: '',
        password: '',
        role: 'frontdesk',
      });
      loadUsers();
    } catch (err) {
      showToast(err.error || 'Failed to create user', 'error');
    }
  };

  const handleDeleteUser = async (id, name, role) => {
    if (role === 'admin' && users.filter((u) => u.role === 'admin').length <= 1) {
      showToast('Cannot delete the primary Main Admin account.', 'warning');
      return;
    }
    if (!window.confirm(`Revoke portal access for ${name}?`)) return;

    try {
      await api.deleteUser(id);
      showToast(`User ${name} removed`, 'info');
      loadUsers();
    } catch (err) {
      showToast(err.error || 'Failed to delete user', 'error');
    }
  };

  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return <span className="badge" style={{ background: '#0a0a0a', color: '#ffffff' }}><Shield width="12" height="12" /> Main Admin</span>;
    }
    if (role === 'frontdesk') {
      return <span className="badge badge-walkin"><Bell width="12" height="12" /> Front Desk</span>;
    }
    if (role === 'eventmanager') {
      return <span className="badge badge-online"><Calendar width="12" height="12" /> Event Manager</span>;
    }
    return <span className="badge">{role}</span>;
  };

  return (
    <div>
      <div className="admin-header-actions">
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', margin: 0 }}>
            Staff Access & Role Management
          </h2>
          <p className="admin-page-desc">
            Manage authenticated portal accounts for Hotel Administrators, Front Desk Staff, and Event Managers.
          </p>
        </div>
        <button
          className="btn-admin btn-admin-accent"
          onClick={() => setShowAddModal(true)}
        >
          + Add Staff Member
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Role & Permissions</th>
                <th>Portal Access Level</th>
                <th>Registered Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                    Loading staff members...
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="user-avatar-circle" style={{ width: '36px', height: '36px', fontSize: '0.82rem' }}>
                          {u.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#111827' }}>{u.full_name}</div>
                          <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{getRoleBadge(u.role)}</td>
                    <td style={{ fontSize: '0.82rem', color: '#4b5563' }}>
                      {u.role === 'admin'
                        ? 'Full System Control (Rooms, Events, Staff, Reports)'
                        : u.role === 'frontdesk'
                        ? 'Room Check-Ins, Walk-Ins & Receipt Search'
                        : 'Event Spaces & Banquet Bookings Management'}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#6b7280' }}>
                      {u.created_at || 'Active'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {u.role !== 'admin' && (
                        <button
                          className="btn-admin btn-admin-danger btn-admin-sm"
                          onClick={() => handleDeleteUser(u.id, u.full_name, u.role)}
                        >
                          Revoke Access
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                    No staff users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Create Staff Portal Account</h3>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateUser}>
              <div className="modal-body">
                <div className="form-field">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Oluwaseun Adeleke"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="staff@orissignatures.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Assigned Role *</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
<option value="frontdesk">Front Desk (Check-ins, Walk-ins, Receipts)</option>
<option value="eventmanager">Event Manager (Venues & Event Bookings)</option>
<option value="admin">Main Admin (Full Access to Everything)</option>
                  </select>
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
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
