import { useState } from 'react';
import { Calendar as CalendarIcon, Users, Check, Clock, X } from '../../components/Icons';
import { formatCurrency } from '../../utils/helpers';
import './Admin.css';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const BOOKED_STATUSES = ['confirmed', 'active', 'completed', 'paid'];

function getDayStatus(events) {
  if (!events || events.length === 0) return 'free';
  if (events.some(e => BOOKED_STATUSES.includes(e.booking_status))) return 'booked';
  if (events.some(e => e.booking_status === 'pending')) return 'pending';
  return 'cancelled';
}

function getStatusChip(e) {
  const status = e.booking_status || 'confirmed';
  if (status === 'pending') {
    return <span className="calendar-chip chip-pending"><Clock width="11" height="11" /> pending</span>;
  }
  if (status === 'cancelled') {
    return <span className="calendar-chip chip-cancelled"><X width="11" height="11" /> cancelled</span>;
  }
  return <span className="calendar-chip chip-booked"><Check width="11" height="11" /> {status}</span>;
}

export default function EventCalendarView({ events = [], onSetStatus, onAddEvent }) {
  const now = new Date();
  const [cursor, setCursor] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [modalDate, setModalDate] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const monthLabel = cursor.toLocaleString('en', { month: 'long', year: 'numeric' });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const byDate = {};
  events.forEach(e => {
    const key = e.event_date;
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push(e);
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const dateStr = (d) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const modalEvents = modalDate ? (byDate[modalDate] || []) : [];

  const handleStatus = async (id, status) => {
    if (!onSetStatus) return;
    setBusyId(id);
    try {
      await onSetStatus(id, status);
    } finally {
      setBusyId(null);
    }
  };

  const handleAddOnDay = () => {
    if (onAddEvent && modalDate) {
      onAddEvent(modalDate);
      setModalDate(null);
    }
  };

  return (
    <div className="event-calendar">
      <div className="calendar-toolbar">
        <div className="calendar-title">
          <CalendarIcon width="17" height="17" />
          <span>{monthLabel}</span>
        </div>
        <div className="calendar-nav">
          <button type="button" className="pagination-btn" onClick={() => setCursor(new Date(year, month - 1, 1))}>
            Prev
          </button>
          <button
            type="button"
            className="pagination-btn"
            onClick={() => {
              const t = new Date();
              setCursor(new Date(t.getFullYear(), t.getMonth(), 1));
            }}
          >
            Today
          </button>
          <button type="button" className="pagination-btn" onClick={() => setCursor(new Date(year, month + 1, 1))}>
            Next
          </button>
        </div>
      </div>

      <div className="calendar-legend">
        <span className="legend-chip legend-free"><span className="legend-dot"></span>Free</span>
        <span className="legend-chip legend-booked"><span className="legend-dot"></span>Booked / Confirmed</span>
        <span className="legend-chip legend-pending"><span className="legend-dot"></span>Pending</span>
        <span className="legend-chip legend-cancelled"><span className="legend-dot"></span>Cancelled</span>
      </div>

      <div className="calendar-grid">
        {DAY_LABELS.map(d => (
          <div key={d} className="calendar-day-label">{d}</div>
        ))}

        {cells.map((d, i) => {
          if (d === null) return <div key={`empty-${i}`} className="calendar-cell empty"></div>;

          const key = dateStr(d);
          const dayEvents = byDate[key] || [];
          const status = getDayStatus(dayEvents);
          const isToday = key === todayStr;

          return (
            <div
              key={key}
              className={`calendar-cell ${status} ${isToday ? 'today' : ''}`}
              onClick={() => setModalDate(key)}
            >
              <span className="calendar-day-num">{d}</span>
              {dayEvents.length > 0 && (
                <>
                  <div className="calendar-events">
                    {dayEvents.slice(0, 2).map(e => (
                      <span key={e.id} className={`calendar-event-tag ${e.booking_status}`}>
                        {e.event_name}
                      </span>
                    ))}
                    {dayEvents.length > 2 && <span className="calendar-more">+{dayEvents.length - 2} more</span>}
                  </div>

                  <div className="calendar-hover-card">
                    <div className="calendar-hover-title">
                      {new Date(key + 'T00:00:00').toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    {dayEvents.map(e => (
                      <div key={e.id} className="calendar-hover-item">
                        <div className="calendar-hover-name">{e.event_name}</div>
                        <div className="calendar-hover-status">{getStatusChip(e)}</div>
                        {e.special_requests && (
                          <div className="calendar-hover-note">{e.special_requests}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Events popup dialog for the clicked day */}
      {modalDate && (
        <div className="modal-overlay" onClick={() => setModalDate(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {new Date(modalDate + 'T00:00:00').toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>
              <button className="modal-close-btn" onClick={() => setModalDate(null)}>
                &times;
              </button>
            </div>

            <div className="modal-body">
              {modalEvents.length === 0 ? (
                <div className="calendar-empty-day">
                  No events booked on this day. You can add one below.
                </div>
              ) : (
                modalEvents.map(e => {
                  const status = e.booking_status || 'confirmed';
                  return (
                    <div key={e.id} className="calendar-modal-event">
                      <div className="calendar-modal-head">
                        <span className="calendar-detail-name">{e.event_name}</span>
                        {getStatusChip(e)}
                      </div>
                      <div className="calendar-detail-meta">
                        <span><Users width="13" height="13" /> {e.expected_guests} guests</span>
                        <span>{e.space_name}</span>
                        <span>{formatCurrency(e.total_amount)}</span>
                        <span style={{ textTransform: 'uppercase' }}>{e.payment_method || 'card'}</span>
                      </div>
                      <div className="calendar-modal-client">
                        {e.client_name} {e.client_phone ? `\u2014 ${e.client_phone}` : ''} {e.client_email ? `\u2014 ${e.client_email}` : ''}
                      </div>
                      {e.special_requests && (
                        <div className="calendar-note">Note: {e.special_requests}</div>
                      )}

                      <div className="calendar-actions">
                        <button
                          type="button"
                          className="btn-admin btn-admin-success btn-admin-sm"
                          disabled={busyId === e.id || status === 'confirmed'}
                          onClick={() => handleStatus(e.id, 'confirmed')}
                        >
                          <Check width="13" height="13" /> Confirm
                        </button>
                        <button
                          type="button"
                          className="btn-admin btn-admin-secondary btn-admin-sm"
                          disabled={busyId === e.id || status === 'pending'}
                          onClick={() => handleStatus(e.id, 'pending')}
                        >
                          <Clock width="13" height="13" /> Pend
                        </button>
                        <button
                          type="button"
                          className="btn-admin btn-admin-danger btn-admin-sm"
                          disabled={busyId === e.id || status === 'cancelled'}
                          onClick={() => handleStatus(e.id, 'cancelled')}
                        >
                          <X width="13" height="13" /> Cancel
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-admin btn-admin-accent" onClick={handleAddOnDay}>
                <CalendarIcon width="14" height="14" /> Book an Event on this Day
              </button>
              <button type="button" className="btn-admin btn-admin-secondary" onClick={() => setModalDate(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}