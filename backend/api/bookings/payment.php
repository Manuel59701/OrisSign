<?php
/**
 * PUT /api/bookings/payment
 * Marks a booking's payment as paid (Front Desk confirmation).
 * Body: { booking_id: int|string, payment_status?: string }
 */
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../auth/Auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

Auth::requireAuth(['admin', 'subadmin', 'frontdesk']);

$data = json_decode(file_get_contents("php://input"), true);
if (empty($data['booking_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Booking ID required']);
    exit;
}

$paymentStatus = $data['payment_status'] ?? 'paid';

$conn = Database::getConnection();
$stmt = $conn->prepare("UPDATE room_bookings SET payment_status = :status WHERE id = :id OR receipt_id = :receipt_id");
$stmt->execute([
    ':status' => $paymentStatus,
    ':id' => (int) $data['booking_id'],
    ':receipt_id' => $data['booking_id']
]);

echo json_encode(['message' => 'Payment status updated']);