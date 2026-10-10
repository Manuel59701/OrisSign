<?php
/**
 * Check-in Endpoint
 * PUT /api/bookings/checkin
 * Body: { booking_id }
 * Requires: frontdesk or admin role
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$authUser = Auth::requireAuth(['admin', 'frontdesk']);
$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['booking_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'booking_id is required']);
    exit;
}

$db = new Database();
$conn = $db->getConnection();

// Verify booking exists and is in reserved status
$stmt = $conn->prepare("SELECT * FROM room_bookings WHERE id = :id AND booking_status = 'reserved'");
$stmt->bindParam(':id', $data['booking_id']);
$stmt->execute();
$booking = $stmt->fetch();

if (!$booking) {
    http_response_code(404);
    echo json_encode(['error' => 'Booking not found or already checked in']);
    exit;
}

if ($booking['payment_status'] !== 'paid') {
    http_response_code(400);
    echo json_encode(['error' => 'Payment must be confirmed before check-in']);
    exit;
}

// Update booking status to checked_in
$stmt = $conn->prepare("UPDATE room_bookings SET booking_status = 'checked_in', checked_in_by = :user_id WHERE id = :id");
$stmt->execute([':user_id' => $authUser['user_id'], ':id' => $data['booking_id']]);

echo json_encode(['message' => 'Guest checked in successfully']);
