import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Grid, Bell, Calendar, Receipt, Bed, Users, Globe, LogOut, Menu, Shield } from '../../components/Icons';
import './Admin.css';

export default function AdminLayout() {
  const { user, logout, loading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Wait for the session bootstrap before deciding to redirect
  if (loading) {
    return null;
  }

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/admin" replace />;
  }

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'info');
    navigate('/admin');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('front-desk')) return 'Front Desk Operations';
    if (path.includes('events')) return 'Event Space Management';
    if (path.includes('rooms')) return 'Room Catalog & Status';
    if (path.includes('users')) return 'Staff & Access Management';
    if (path.includes('receipts')) return 'Official Receipt Terminal';
    return 'Executive Overview';
  };

  const role = user.role || 'admin';

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <NavLink to="/admin/dashboard" className="sidebar-brand">
            <h2 className="logo-title">ORIS SIGNATURES</h2>
            <span className="logo-subtitle">Luxury Hotel & Suites</span>
          </NavLink>
          <span className="sidebar-badge">
            {role === 'admin' ? (<><Shield width="13" height="13" /> Main Admin</>)
              : role === 'frontdesk' ? (<><Bell width="13" height="13" /> Front Desk</>)
              : (<><Calendar width="13" height="13" /> Event Manager</>)}
          </span>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar-circle">
            {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-meta">
            <div className="user-name">{user.full_name || 'Staff Member'}</div>
            <span className="user-role-tag">{user.email}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Main Navigation</div>

          {/* Admin has access to Dashboard */}
          {role === 'admin' && (
            <NavLink
              to="/admin/dashboard"
              end
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <span className="nav-icon"><Grid /></span>
              <span>Dashboard</span>
            </NavLink>
          )}

          {/* Front Desk & Admin */}
          {(role === 'admin' || role === 'frontdesk') && (
            <NavLink
              to="/admin/dashboard/front-desk"
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <span className="nav-icon"><Bell /></span>
              <span>Front Desk</span>
            </NavLink>
          )}

          {/* Event Manager & Admin */}
          {(role === 'admin' || role === 'eventmanager') && (
            <NavLink
              to="/admin/dashboard/events"
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <span className="nav-icon"><Calendar /></span>
              <span>Event Manager</span>
            </NavLink>
          )}

          {/* Receipt Search — available to everyone */}
          <NavLink
            to="/admin/dashboard/receipts"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <span className="nav-icon"><Receipt /></span>
            <span>Receipt Search</span>
          </NavLink>

          {/* Room Management — Admin and Front Desk */}
          {(role === 'admin' || role === 'frontdesk') && (
            <NavLink
              to="/admin/dashboard/rooms"
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
                <span className="nav-icon"><Bed /></span>
                <span>Rooms Inventory</span>
            </NavLink>
          )}

          {/* User Management — Admin only */}
          {role === 'admin' && (
            <>
              <div className="nav-section-label" style={{ marginTop: '1rem' }}>System Admin</div>
              <NavLink
                to="/admin/dashboard/users"
                className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <span className="nav-icon"><Users /></span>
                <span>Staff Management</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-sidebar-link"
          >
            <span><Globe /></span>
            <span>View Public Website</span>
          </a>
          <button
            onClick={handleLogout}
            className="btn-sidebar-link btn-sidebar-logout"
          >
            <span><LogOut /></span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              title="Toggle Menu"
            >
              <Menu />
            </button>
            <h1 className="topbar-page-title">{getPageTitle()}</h1>
          </div>

          <div className="topbar-right">
            <div className="topbar-pill">
              <span className="indicator-dot"></span>
              <span>Live System</span>
            </div>
            <div className="topbar-pill" style={{ fontFamily: 'monospace' }}>
              {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </header>

        <main className="admin-content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
