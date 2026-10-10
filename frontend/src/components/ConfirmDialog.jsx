import { useEffect, useState } from 'react';
import './ConfirmDialog.css';

export default function ConfirmDialog({
  open,
  title,
  icon,
  message,
  variant = 'danger',
  confirmLabel = 'Continue',
  lockedSeconds = 30,
  onConfirm,
  onClose,
}) {
  const [count, setCount] = useState(lockedSeconds);

  useEffect(() => {
    if (open) setCount(lockedSeconds);
  }, [open, lockedSeconds]);

  useEffect(() => {
    if (!open || count <= 0) return;
    const t = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [open, count]);

  if (!open) return null;

  const confirmClass = variant === 'success' ? 'btn-admin-success' : 'btn-admin-danger';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          {icon && (
            <div className={`confirm-dialog-icon variant-${variant}`}>{icon}</div>
          )}
          <div className="payment-confirm-text">{message}</div>
          <div className="payment-confirm-warning">
            This action cannot be reverted.
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-admin btn-admin-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={`btn-admin ${confirmClass}`}
            disabled={count > 0}
            onClick={onConfirm}
          >
            {count > 0 ? `${confirmLabel} (${count}s)` : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}