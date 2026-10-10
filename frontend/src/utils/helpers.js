/**
 * Format currency in Naira
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date to readable string
 */
export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date with time
 */
export function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Calculate number of nights between two dates
 */
export function calculateNights(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Get status badge class
 */
export function getStatusBadgeClass(status) {
  const map = {
    'reserved': 'badge-info',
    'checked_in': 'badge-success',
    'checked_out': 'badge-neutral',
    'cancelled': 'badge-error',
    'pending': 'badge-warning',
    'paid': 'badge-success',
    'refunded': 'badge-error',
    'confirmed': 'badge-success',
    'active': 'badge-success',
    'completed': 'badge-neutral',
  };
  return map[status] || 'badge-neutral';
}

/**
 * Format status for display
 */
export function formatStatus(status) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getToday() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get tomorrow's date in YYYY-MM-DD format
 */
export function getTomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}
