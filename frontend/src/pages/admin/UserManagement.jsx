import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { Shield, Bell, Calendar, Settings, Trash } from '../../components/Icons';
import ConfirmDialog from '../../components/ConfirmDialog';
import PasswordInput from '../../components/PasswordInput';
import './Admin.css';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const { showToast } = useToast();

  // Password reset modal state
  const [resetUser, setResetUser] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirm, setResetConfirm] = useState('');
  const [resetting, setResetting] = useState(false);

  // Delete confirmation modal state
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);

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

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetUser || !resetPassword) return;
    if (resetPassword.length < 6) {
      showToast('Password must be at least 6 characters.', 'warning');
      return;
    }
    if (resetPassword !== resetConfirm) {
      showToast('Passwords do not match.', 'warning');
      return;
    }
    setResetting(true);
    try {
      await api.updateUser(resetUser.id, {
        full_name: resetUser.full_name,
        email: resetUser.email,
        role: resetUser.role,
        password: resetPassword,
      });
      showToast(`Password updated for ${resetUser.full_name}.`, 'success');
      setResetUser(null);
      setResetPassword('');
      setResetConfirm('');
      loadUsers();
    } catch (err) {
      showToast(err.error || 'Failed to reset password', 'error');
    } finally {
      setResetting(false);
    }
  };

  const openResetModal = (user) => {
    setResetPassword('');
    setResetConfirm('');
    setResetUser({ ...user });
  };

  const openDeleteConfirm = (user) => {
    if (user.role === 'admin' && users.filter((u) => u.role === 'admin').length <= 1) {
      showToast('Cannot delete the primary Main Admin account.', 'warning');
      return;
    }
    setDeleteConfirmUser({ ...user });
  };

  const confirmDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    const user = deleteConfirmUser;
    setDeleteConfirmUser(null);
    try {
      await api.deleteUser(user.id);
      showToast(`User ${user.full_name} removed`, 'info');
      loadUsers();
    } catch (err) {
      showToast(err.error || 'Failed to delete user', 'error');
    }
  };

  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return <span className="badge" style={{ background: '#0a0a0a', color: '#ffffff' }}><Shield width="12" height="12" /> Main Admin</span>;
    }
    if (role === 'subadmin') {
      return <span className="badge" style={{ background: '#374151', color: '#ffffff' }}><Shield width="12" height="12" /> Sub Admin</span>;
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
                      {u.role === 'admin' || u.role === 'subadmin'
                        ? 'Full System Control (Rooms, Events, Staff, Reports)'
                        : u.role === 'frontdesk'
                        ? 'Room Check-Ins, Walk-Ins & Receipt Search'
                        : 'Event Spaces & Banquet Bookings Management'}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#6b7280' }}>
                      {u.created_at || 'Active'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-buttons-group" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="btn-admin btn-admin-secondary btn-admin-sm btn-icon-only"
                          onClick={() => openResetModal(u)}
                          title={`Reset password for ${u.full_name}`}
                        >
                          <Settings width="15" height="15" />
                        </button>
                        {u.role !== 'admin' && (
                          <button
                            className="btn-admin btn-admin-danger btn-admin-sm btn-icon-only"
                            onClick={() => openDeleteConfirm(u)}
                            title="Delete this staff account"
                          >
                            <Trash width="15" height="15" />
                          </button>
                        )}
                      </div>
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
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
                  <PasswordInput
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
<option value="subadmin">Sub Admin (Full System Access, Removable)</option>
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

      {/* Reset Password Modal */}
      {resetUser && (
        <div className="modal-overlay" onClick={() => setResetUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Reset Login Password</h3>
              <button className="modal-close-btn" onClick={() => setResetUser(null)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleResetPassword}>
              <div className="modal-body">
                <p style={{ fontSize: '0.85rem', color: '#4b5563', marginTop: 0 }}>
                  Set a new sign-in password for{' '}
                  <strong>{resetUser.full_name}</strong> ({resetUser.email}).
                </p>

                <div className="form-field">
                  <label>New Password *</label>
                  <PasswordInput
                    required
                    autoFocus
                    placeholder="Minimum 6 characters"
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label>Confirm New Password *</label>
                  <PasswordInput
                    required
                    placeholder="Re-enter the new password"
                    value={resetConfirm}
                    onChange={(e) => setResetConfirm(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-admin btn-admin-secondary"
                  onClick={() => setResetUser(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-admin btn-admin-accent" disabled={resetting}>
                  {resetting ? 'Saving...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete account confirmation modal */}
      <ConfirmDialog
        open={!!deleteConfirmUser}
        title="Delete Staff Account"
        variant="danger"
        icon={<Trash width="40" height="40" />}
        message={deleteConfirmUser ? (
          <>
            Revoke portal access for <strong>{deleteConfirmUser.full_name}</strong>{' '}
            ({deleteConfirmUser.email})? They will no longer be able to sign in.
          </>
        ) : null}
        confirmLabel="Delete"
        onClose={() => setDeleteConfirmUser(null)}
        onConfirm={confirmDeleteUser}
      />
    </div>
  );
}
