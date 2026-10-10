<?php
/**
 * Admin Dashboard Stats Endpoint
 * GET /api/admin/dashboard
 * Requires: admin, frontdesk, or eventmanager role
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$authUser = Auth::requireAuth(['admin', 'subadmin', 'frontdesk', 'eventmanager']);

$db = new Database();
$conn = $db->getConnection();

$stats = [];

// Total rooms
$stmt = $conn->query("SELECT COUNT(*) as total FROM rooms");
$stats['total_rooms'] = $stmt->fetch()['total'];

// Occupied rooms (checked in today)
$stmt = $conn->query("SELECT COUNT(*) as total FROM room_bookings WHERE booking_status = 'checked_in'");
$stats['occupied_rooms'] = $stmt->fetch()['total'];

// Today's check-ins
$today = date('Y-m-d');
$stmt = $conn->prepare("SELECT COUNT(*) as total FROM room_bookings WHERE check_in_date = :today AND booking_status IN ('reserved', 'checked_in')");
$stmt->execute([':today' => $today]);
$stats['todays_checkins'] = $stmt->fetch()['total'];

// Pending bookings
$stmt = $conn->query("SELECT COUNT(*) as total FROM room_bookings WHERE booking_status = 'reserved'");
$stats['pending_bookings'] = $stmt->fetch()['total'];

// Confirmed room revenue (booked/checked-in, excluding reserved & cancelled)
$stmt = $conn->query("SELECT COALESCE(SUM(total_amount), 0) as total FROM room_bookings WHERE booking_status IN ('checked_in', 'checked_out')");
$stats['room_revenue'] = $stmt->fetch()['total'];

// Pending room revenue (reserved / not yet confirmed)
$stmt = $conn->query("SELECT COALESCE(SUM(total_amount), 0) as total FROM room_bookings WHERE booking_status = 'reserved'");
$stats['pending_room_revenue'] = $stmt->fetch()['total'];

// Confirmed event revenue
$stmt = $conn->query("SELECT COALESCE(SUM(total_amount), 0) as total FROM event_bookings WHERE booking_status IN ('confirmed', 'active', 'completed')");
$stats['event_revenue'] = $stmt->fetch()['total'];

// Pending event revenue
$stmt = $conn->query("SELECT COALESCE(SUM(total_amount), 0) as total FROM event_bookings WHERE booking_status IN ('pending', 'reserved')");
$stats['pending_event_revenue'] = $stmt->fetch()['total'];

// Confirmed room bookings tally
$stmt = $conn->query("SELECT COUNT(*) as total FROM room_bookings WHERE booking_status IN ('checked_in', 'checked_out')");
$stats['room_bookings_count'] = $stmt->fetch()['total'];

// Pending room bookings tally
$stmt = $conn->query("SELECT COUNT(*) as total FROM room_bookings WHERE booking_status = 'reserved'");
$stats['pending_room_bookings_count'] = $stmt->fetch()['total'];

// Confirmed event bookings tally
$stmt = $conn->query("SELECT COUNT(*) as total FROM event_bookings WHERE booking_status IN ('confirmed', 'active', 'completed')");
$stats['event_bookings_count'] = $stmt->fetch()['total'];

// Pending event bookings tally
$stmt = $conn->query("SELECT COUNT(*) as total FROM event_bookings WHERE booking_status IN ('pending', 'reserved')");
$stats['pending_event_bookings_count'] = $stmt->fetch()['total'];

// Upcoming events
$stmt = $conn->prepare("SELECT COUNT(*) as total FROM event_bookings WHERE event_date >= :today AND booking_status NOT IN ('cancelled', 'completed')");
$stmt->execute([':today' => $today]);
$stats['upcoming_events'] = $stmt->fetch()['total'];

// Recent bookings (last 10)
$stmt = $conn->query("
    SELECT rb.id, rb.receipt_id, rb.guest_name, rb.booking_status, rb.total_amount, rb.created_at, r.name as room_name
    FROM room_bookings rb
    JOIN rooms r ON rb.room_id = r.id
    ORDER BY rb.created_at DESC LIMIT 10
");
$stats['recent_bookings'] = $stmt->fetchAll();

// Recent event bookings (last 10)
$stmt = $conn->query("
    SELECT eb.id, eb.receipt_id, eb.client_name, eb.event_name, eb.booking_status, eb.total_amount, eb.event_date, es.name as space_name
    FROM event_bookings eb
    JOIN event_spaces es ON eb.event_space_id = es.id
    ORDER BY eb.created_at DESC LIMIT 10
");
$stats['recent_events'] = $stmt->fetchAll();

$stats['total_revenue'] = $stats['room_revenue'] + $stats['event_revenue'];
$stats['pending_revenue'] = $stats['pending_room_revenue'] + $stats['pending_event_revenue'];

echo json_encode($stats);
