<?php
/**
 * Room Availability Endpoint
 * GET /api/rooms/availability?check_in=YYYY-MM-DD&check_out=YYYY-MM-DD
 */

require_once __DIR__ . '/../../config/database.php';

$db = new Database();
$conn = $db->getConnection();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$checkIn = $_GET['check_in'] ?? null;
$checkOut = $_GET['check_out'] ?? null;

if (!$checkIn || !$checkOut) {
    http_response_code(400);
    echo json_encode(['error' => 'check_in and check_out dates are required']);
    exit;
}

// Get all available rooms and subtract booked units for the date range
$stmt = $conn->prepare("
    SELECT r.*,
        r.total_units - COALESCE(booked.booked_count, 0) AS available_units
    FROM rooms r
    LEFT JOIN (
        SELECT room_id, COUNT(*) as booked_count
        FROM room_bookings
        WHERE booking_status NOT IN ('cancelled', 'checked_out')
        AND check_in_date < :check_out
        AND check_out_date > :check_in
        GROUP BY room_id
    ) booked ON r.id = booked.room_id
    WHERE r.is_available = 1
    HAVING available_units > 0
    ORDER BY r.price_per_night ASC
");
$stmt->execute([':check_in' => $checkIn, ':check_out' => $checkOut]);
$rooms = $stmt->fetchAll();

foreach ($rooms as &$room) {
    $room['amenities'] = json_decode($room['amenities']);
}

echo json_encode($rooms);
