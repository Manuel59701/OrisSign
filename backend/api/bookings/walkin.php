<?php
/**
 * Walk-in Booking Endpoint
 * POST /api/bookings/walkin
 * Requires: frontdesk or admin role
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$authUser = Auth::requireAuth(['admin', 'frontdesk']);
$data = json_decode(file_get_contents("php://input"), true);

// Validate required fields
$required = ['guest_name', 'guest_phone', 'room_id', 'check_in_date', 'check_out_date', 'payment_method'];
foreach ($required as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        echo json_encode(['error' => "Field '$field' is required"]);
        exit;
    }
}

$db = new Database();
$conn = $db->getConnection();

// Check room availability
$stmt = $conn->prepare("
    SELECT r.total_units - COALESCE(COUNT(rb.id), 0) as available, r.price_per_night
    FROM rooms r
    LEFT JOIN room_bookings rb ON r.id = rb.room_id
        AND rb.booking_status NOT IN ('cancelled', 'checked_out')
        AND rb.check_in_date < :check_out
        AND rb.check_out_date > :check_in
    WHERE r.id = :room_id
    GROUP BY r.id
");
$stmt->execute([
    ':room_id' => $data['room_id'],
    ':check_in' => $data['check_in_date'],
    ':check_out' => $data['check_out_date']
]);
$result = $stmt->fetch();

if (!$result || $result['available'] <= 0) {
    http_response_code(409);
    echo json_encode(['error' => 'Room is not available for the selected dates']);
    exit;
}

// Calculate total amount
$checkIn = new DateTime($data['check_in_date']);
$checkOut = new DateTime($data['check_out_date']);
$nights = $checkIn->diff($checkOut)->days;
$totalAmount = $result['price_per_night'] * $nights;

// Generate unique receipt ID
$receiptId = Auth::generateReceiptId();
$stmt = $conn->prepare("SELECT id FROM room_bookings WHERE receipt_id = :receipt_id");
$stmt->bindParam(':receipt_id', $receiptId);
$stmt->execute();
while ($stmt->fetch()) {
    $receiptId = Auth::generateReceiptId();
    $stmt->execute();
}

// Create walk-in booking (immediately checked in)
$stmt = $conn->prepare("INSERT INTO room_bookings (receipt_id, guest_name, guest_email, guest_phone, room_id, check_in_date, check_out_date, num_guests, total_amount, payment_status, payment_method, booking_type, booking_status, special_requests, checked_in_by) VALUES (:receipt_id, :guest_name, :guest_email, :guest_phone, :room_id, :check_in, :check_out, :num_guests, :total_amount, 'paid', :payment_method, 'walkin', 'checked_in', :special_requests, :checked_in_by)");

$stmt->execute([
    ':receipt_id' => $receiptId,
    ':guest_name' => $data['guest_name'],
    ':guest_email' => $data['guest_email'] ?? null,
    ':guest_phone' => $data['guest_phone'],
    ':room_id' => $data['room_id'],
    ':check_in' => $data['check_in_date'],
    ':check_out' => $data['check_out_date'],
    ':num_guests' => $data['num_guests'] ?? 1,
    ':total_amount' => $totalAmount,
    ':payment_method' => $data['payment_method'],
    ':special_requests' => $data['special_requests'] ?? null,
    ':checked_in_by' => $authUser['user_id']
]);

http_response_code(201);
echo json_encode([
    'message' => 'Walk-in guest checked in successfully',
    'receipt_id' => $receiptId,
    'booking_id' => $conn->lastInsertId(),
    'total_amount' => $totalAmount,
    'nights' => $nights
]);
