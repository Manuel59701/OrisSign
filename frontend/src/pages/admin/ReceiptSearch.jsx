import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { downloadReceipt } from '../../utils/receipt';
import { useToast } from '../../context/ToastContext';
import { Search, Calendar, Bed, Check, Download } from '../../components/Icons';
import './Admin.css';

export default function ReceiptSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentReceipts, setRecentReceipts] = useState([]);
  const { showToast } = useToast();

  const loadRecent = async () => {
    try {
      const allResults = await api.searchReceipts('');
      setRecentReceipts(allResults.slice(0, 8));
      if (allResults.length > 0 && !selectedReceipt) {
        setSelectedReceipt(allResults[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadRecent();
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) {
      loadRecent();
      return;
    }

    setLoading(true);
    try {
      const data = await api.searchReceipts(searchTerm.trim());
      setResults(data);
      if (data && data.length > 0) {
        setSelectedReceipt(data[0]);
        showToast(`Found ${data.length} matching receipt(s)`, 'success');
      } else {
        setSelectedReceipt(null);
        showToast('No receipt found matching that ID or query', 'info');
      }
    } catch (err) {
      showToast('Search error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRecent = (receipt) => {
    setSelectedReceipt(receipt);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  return (
    <div>
      <div className="admin-header-actions">
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', margin: 0 }}>
            Official Receipt Terminal
          </h2>
          <p className="admin-page-desc">
            Instantly lookup, audit, and re-issue unique hotel folio receipts by Unique ID (ORS-XXXXXX).
          </p>
        </div>
      </div>

      {/* Main Search Box */}
      <div className="admin-card" style={{ maxWidth: '850px', margin: '0 auto 2rem' }}>
        <div className="admin-card-header">
          <h3 className="admin-card-title">Search Receipt Database</h3>
        </div>
        <form onSubmit={handleSearch} style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="search-input-wrapper" style={{ flex: 1 }}>
              <span className="search-icon"><Search width="16" height="16" /></span>
              <input
                type="text"
                placeholder="Enter Unique Receipt ID (e.g. ORS-982143), guest name, or phone number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '0.85rem 1rem 0.85rem 2.6rem', fontSize: '1rem' }}
              />
            </div>
            <button
              type="submit"
              className="btn-admin btn-admin-accent"
              style={{ padding: '0 1.75rem', fontSize: '0.95rem' }}
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Lookup Receipt'}
            </button>
          </div>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
        {/* Selected Receipt Preview */}
        <div>
          {selectedReceipt ? (
            <div className="receipt-display-card">
              <div className="receipt-display-header">
                <h3 className="receipt-hotel-title">ORIS SIGNATURES</h3>
                <div className="receipt-hotel-sub">Luxury Hotel & Suites • Official Folio</div>
                <div className="receipt-id-banner">{selectedReceipt.receipt_id}</div>
              </div>

              <div className="receipt-details-list">
                <div className="receipt-row">
                  <span className="receipt-row-label">Primary Guest / Client</span>
                  <span className="receipt-row-value">{selectedReceipt.guest_name || selectedReceipt.client_name}</span>
                </div>
                <div className="receipt-row">
                  <span className="receipt-row-label">Contact Phone</span>
                  <span className="receipt-row-value">{selectedReceipt.guest_phone || selectedReceipt.client_phone}</span>
                </div>
                {(selectedReceipt.guest_email || selectedReceipt.client_email) && (
                  <div className="receipt-row">
                    <span className="receipt-row-label">Email Address</span>
                    <span className="receipt-row-value">{selectedReceipt.guest_email || selectedReceipt.client_email}</span>
                  </div>
                )}
                <div className="receipt-row">
                  <span className="receipt-row-label">Booking Category</span>
                  <span className="receipt-row-value" style={{ textTransform: 'uppercase' }}>
                    {selectedReceipt.type === 'event'
                      ? <><Calendar width="14" height="14" /> Event Space Venue</>
                      : <><Bed width="14" height="14" /> Hotel Room Suite</>}
                  </span>
                </div>
                <div className="receipt-row">
                  <span className="receipt-row-label">Accommodation / Venue</span>
                  <span className="receipt-row-value">
                    {selectedReceipt.room_name || selectedReceipt.space_name || selectedReceipt.event_name}
                  </span>
                </div>
                <div className="receipt-row">
                  <span className="receipt-row-label">Scheduled Period</span>
                  <span className="receipt-row-value">
                    {selectedReceipt.type === 'event'
                      ? formatDate(selectedReceipt.event_date)
                      : `${formatDate(selectedReceipt.check_in_date)} — ${formatDate(selectedReceipt.check_out_date)}`}
                  </span>
                </div>
                <div className="receipt-row">
                  <span className="receipt-row-label">Payment Channel</span>
                  <span className="receipt-row-value" style={{ textTransform: 'uppercase' }}>
                    {selectedReceipt.payment_method || 'CARD'}
                  </span>
                </div>
                <div className="receipt-row">
                  <span className="receipt-row-label">Payment Status</span>
                  <span className="receipt-row-value" style={{ color: '#059669', fontWeight: 700 }}>
                    <Check width="13" height="13" /> CONFIRMED ({selectedReceipt.payment_status?.toUpperCase() || 'PAID'})
                  </span>
                </div>
              </div>

              <div className="receipt-total-highlight">
                <span className="receipt-total-label">Grand Total Paid</span>
                <span className="receipt-total-val">{formatCurrency(selectedReceipt.total_amount)}</span>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  className="btn-admin btn-admin-primary"
                  onClick={() => downloadReceipt(selectedReceipt, selectedReceipt.type || 'room')}
                  style={{ padding: '0.85rem 1.75rem', fontSize: '0.95rem' }}
                >
                  <Download width="15" height="15" /> Download Official PDF Receipt
                </button>
              </div>
            </div>
          ) : (
            <div className="admin-card" style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
              <span style={{ color: 'var(--color-accent-dark)' }}><Search width="40" height="40" /></span>
              <p style={{ marginTop: '1rem', fontSize: '0.95rem' }}>
                Enter a Receipt ID above or click one of the recent receipts on the right to view details.
              </p>
            </div>
          )}
        </div>

        {/* Recent Receipts List */}
        <div>
          <div className="admin-card">
            <div className="admin-card-header">
              <h4 style={{ fontFamily: 'var(--font-heading)', margin: 0, fontSize: '1rem' }}>
                Recent Receipts
              </h4>
            </div>
            <div style={{ padding: '0.75rem' }}>
              {recentReceipts.map((rcpt) => (
                <div
                  key={rcpt.receipt_id}
                  onClick={() => handleSelectRecent(rcpt)}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: selectedReceipt?.receipt_id === rcpt.receipt_id ? '1.5px solid #0a0a0a' : '1px solid #f3f4f6',
                    background: selectedReceipt?.receipt_id === rcpt.receipt_id ? '#f9fafb' : '#ffffff',
                    cursor: 'pointer',
                    marginBottom: '8px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="receipt-code-pill" style={{ fontSize: '0.75rem' }}>
                      {rcpt.receipt_id}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                      {formatCurrency(rcpt.total_amount)}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111827', marginTop: '4px' }}>
                    {rcpt.guest_name || rcpt.client_name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {rcpt.room_name || rcpt.space_name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
