<?php
/**
 * Public Receipt View Endpoint
 * GET /api/receipts/view?id=ORS-XXXXXX
 * Returns the room or event booking matching an exact receipt ID.
 * No authentication required — used by the public booking confirmation page.
 */

require_once __DIR__ . '/../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$id = $_GET['id'] ?? '';

if (empty($id)) {
    http_response_code(400);
    echo json_encode(['error' => 'Receipt ID (id) is required']);
    exit;
}

$db = new Database();
$conn = $db->getConnection();

// Room booking
$stmt = $conn->prepare("
    SELECT rb.*, r.name as room_name, r.room_type, 'room' as type
    FROM room_bookings rb
    JOIN rooms r ON rb.room_id = r.id
    WHERE rb.receipt_id = :receipt_id
");
$stmt->execute([':receipt_id' => $id]);
$booking = $stmt->fetch();

if ($booking) {
    echo json_encode($booking);
    exit;
}

// Event booking
$stmt = $conn->prepare("
    SELECT eb.*, es.name as space_name, es.capacity, 'event' as type
    FROM event_bookings eb
    JOIN event_spaces es ON eb.event_space_id = es.id
    WHERE eb.receipt_id = :receipt_id
");
$stmt->execute([':receipt_id' => $id]);
$event = $stmt->fetch();

if ($event) {
    echo json_encode($event);
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Receipt not found']);
