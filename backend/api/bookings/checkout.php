<?php
/**
 * Check-out Endpoint
 * PUT /api/bookings/checkout
 * Body: { booking_id }
 * Requires: frontdesk or admin role
 * Marks a checked-in guest as checked-out and frees the room for new bookings.
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$authUser = Auth::requireAuth(['admin', 'subadmin', 'frontdesk']);
$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['booking_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'booking_id is required']);
    exit;
}

$db = new Database();
$conn = $db->getConnection();

// Find the booking by numeric ID or receipt ID
$stmt = $conn->prepare("SELECT * FROM room_bookings WHERE id = :id OR receipt_id = :receipt_id");
$stmt->execute([':id' => $data['booking_id'], ':receipt_id' => $data['booking_id']]);
$booking = $stmt->fetch();

if (!$booking) {
    http_response_code(404);
    echo json_encode(['error' => 'Booking not found']);
    exit;
}

if ($booking['booking_status'] === 'checked_out') {
    http_response_code(400);
    echo json_encode(['error' => 'Guest has already checked out']);
    exit;
}

// Mark the booking as checked out and free the room
$stmt = $conn->prepare("UPDATE room_bookings SET booking_status = 'checked_out' WHERE id = :id");
$stmt->execute([':id' => $booking['id']]);

$stmt = $conn->prepare("UPDATE rooms SET is_available = 1 WHERE id = :room_id");
$stmt->execute([':room_id' => $booking['room_id']]);

echo json_encode(['message' => 'Guest checked out successfully', 'room_id' => $booking['room_id']]);
