import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import SplashScreen from './components/SplashScreen';
import LandingPage from './pages/public/LandingPage';
import BookingPage from './pages/public/BookingPage';
import EventBookingPage from './pages/public/EventBookingPage';
import ConfirmationPage from './pages/public/ConfirmationPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import FrontDesk from './pages/admin/FrontDesk';
import EventManager from './pages/admin/EventManager';
import RoomManagement from './pages/admin/RoomManagement';
import UserManagement from './pages/admin/UserManagement';
import ReceiptSearch from './pages/admin/ReceiptSearch';
import './index.css';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/book" element={<BookingPage />} />
            <Route path="/events/book" element={<EventBookingPage />} />
            <Route path="/confirmation/:type/:receiptId" element={<ConfirmationPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="front-desk" element={<FrontDesk />} />
              <Route path="events" element={<EventManager />} />
              <Route path="rooms" element={<RoomManagement />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="receipts" element={<ReceiptSearch />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
