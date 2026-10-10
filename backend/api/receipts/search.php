<?php
/**
 * Receipt Search Endpoint
 * GET /api/receipts/search?q=ORS-XXXXXX
 * Requires: admin or frontdesk role
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

Auth::requireAuth(['admin', 'frontdesk', 'eventmanager']);

$query = $_GET['q'] ?? '';

if (empty($query)) {
    http_response_code(400);
    echo json_encode(['error' => 'Search query (q) is required']);
    exit;
}

$db = new Database();
$conn = $db->getConnection();

$results = [];

// Search room bookings
$stmt = $conn->prepare("
    SELECT rb.*, r.name as room_name, r.room_type, 'room' as booking_type_label
    FROM room_bookings rb
    JOIN rooms r ON rb.room_id = r.id
    WHERE rb.receipt_id LIKE :query
    OR rb.guest_name LIKE :query_name
");
$searchTerm = '%' . $query . '%';
$stmt->execute([':query' => $searchTerm, ':query_name' => $searchTerm]);
$roomResults = $stmt->fetchAll();

// Search event bookings
$stmt = $conn->prepare("
    SELECT eb.*, es.name as space_name, es.capacity, 'event' as booking_type_label
    FROM event_bookings eb
    JOIN event_spaces es ON eb.event_space_id = es.id
    WHERE eb.receipt_id LIKE :query
    OR eb.client_name LIKE :query_name
");
$stmt->execute([':query' => $searchTerm, ':query_name' => $searchTerm]);
$eventResults = $stmt->fetchAll();

echo json_encode([
    'room_bookings' => $roomResults,
    'event_bookings' => $eventResults,
    'total' => count($roomResults) + count($eventResults)
]);
