<?php
/**
 * Event Bookings Endpoint
 * GET  /api/events/bookings     — List event bookings (admin/eventmanager)
 * POST /api/events/bookings     — Create event booking (public)
 * PUT  /api/events/bookings/{id} — Update event booking status
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

$db = new Database();
$conn = $db->getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

switch ($method) {
    case 'GET':
        Auth::requireAuth(['admin', 'eventmanager']);

        if ($id) {
            $stmt = $conn->prepare("
                SELECT eb.*, es.name as space_name, es.capacity
                FROM event_bookings eb
                JOIN event_spaces es ON eb.event_space_id = es.id
                WHERE eb.id = :id OR eb.receipt_id = :receipt_id
            ");
            $stmt->execute([':id' => $id, ':receipt_id' => $id]);
            $booking = $stmt->fetch();

            if (!$booking) {
                http_response_code(404);
                echo json_encode(['error' => 'Event booking not found']);
                exit;
            }
            echo json_encode($booking);
        } else {
            $status = $_GET['status'] ?? null;
            $query = "
                SELECT eb.*, es.name as space_name, es.capacity
                FROM event_bookings eb
                JOIN event_spaces es ON eb.event_space_id = es.id
                WHERE 1=1
            ";
            $params = [];

            if ($status) {
                $query .= " AND eb.booking_status = :status";
                $params[':status'] = $status;
            }

            $query .= " ORDER BY eb.event_date ASC";

            $stmt = $conn->prepare($query);
            $stmt->execute($params);
            echo json_encode($stmt->fetchAll());
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);

        $required = ['client_name', 'client_phone', 'event_space_id', 'event_name', 'event_date', 'expected_guests'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "Field '$field' is required"]);
                exit;
            }
        }

        // Check space availability for the date
        $stmt = $conn->prepare("
            SELECT COUNT(*) as booked FROM event_bookings
            WHERE event_space_id = :space_id
            AND booking_status NOT IN ('cancelled', 'completed')
            AND (
                (event_date <= :event_end AND COALESCE(event_end_date, event_date) >= :event_date)
            )
        ");
        $eventEndDate = $data['event_end_date'] ?? $data['event_date'];
        $stmt->execute([
            ':space_id' => $data['event_space_id'],
            ':event_date' => $data['event_date'],
            ':event_end' => $eventEndDate
        ]);
        $result = $stmt->fetch();

        if ($result['booked'] > 0) {
            http_response_code(409);
            echo json_encode(['error' => 'Event space is already booked for the selected date']);
            exit;
        }

        // Get space price
        $stmt = $conn->prepare("SELECT price_per_day FROM event_spaces WHERE id = :id");
        $stmt->bindParam(':id', $data['event_space_id']);
        $stmt->execute();
        $space = $stmt->fetch();

        $startDate = new DateTime($data['event_date']);
        $endDate = new DateTime($eventEndDate);
        $days = max(1, $startDate->diff($endDate)->days + 1);
        $totalAmount = $space['price_per_day'] * $days;

        // Generate receipt ID
        $receiptId = Auth::generateReceiptId();
        $stmt = $conn->prepare("SELECT id FROM event_bookings WHERE receipt_id = :receipt_id");
        $stmt->bindParam(':receipt_id', $receiptId);
        $stmt->execute();
        while ($stmt->fetch()) {
            $receiptId = Auth::generateReceiptId();
            $stmt->execute();
        }

        $stmt = $conn->prepare("INSERT INTO event_bookings (receipt_id, client_name, client_email, client_phone, event_space_id, event_name, event_date, event_end_date, expected_guests, total_amount, payment_status, payment_method, special_requests, booking_status) VALUES (:receipt_id, :client_name, :client_email, :client_phone, :space_id, :event_name, :event_date, :event_end_date, :expected_guests, :total_amount, :payment_status, :payment_method, :special_requests, :booking_status)");

        $stmt->execute([
            ':receipt_id' => $receiptId,
            ':client_name' => $data['client_name'],
            ':client_email' => $data['client_email'] ?? null,
            ':client_phone' => $data['client_phone'],
            ':space_id' => $data['event_space_id'],
            ':event_name' => $data['event_name'],
            ':event_date' => $data['event_date'],
            ':event_end_date' => $eventEndDate,
            ':expected_guests' => $data['expected_guests'],
            ':total_amount' => $totalAmount,
            ':payment_status' => $data['payment_status'] ?? 'pending',
            ':payment_method' => $data['payment_method'] ?? 'online',
            ':special_requests' => $data['special_requests'] ?? null,
            ':booking_status' => $data['booking_status'] ?? 'pending'
        ]);

        http_response_code(201);
        echo json_encode([
            'message' => 'Event booked successfully',
            'receipt_id' => $receiptId,
            'booking_id' => $conn->lastInsertId(),
            'total_amount' => $totalAmount,
            'days' => $days
        ]);
        break;

    case 'PUT':
        Auth::requireAuth(['admin', 'eventmanager']);
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Booking ID required']);
            exit;
        }

        $data = json_decode(file_get_contents("php://input"), true);
        $authUser = Auth::getAuthUser();

        $newStatus = $data['booking_status'] ?? 'pending';
        $paidStatuses = ['confirmed', 'active', 'completed'];
        $paymentStatus = $data['payment_status'] ?? ($newStatus === 'cancelled' ? 'cancelled' : (in_array($newStatus, $paidStatuses, true) ? 'paid' : 'pending'));

        $stmt = $conn->prepare("UPDATE event_bookings SET booking_status = :status, payment_status = :payment_status, managed_by = :managed_by WHERE id = :id");
        $stmt->execute([
            ':status' => $newStatus,
            ':payment_status' => $paymentStatus,
            ':managed_by' => $authUser['user_id'],
            ':id' => $id
        ]);

        echo json_encode(['message' => 'Event booking updated']);
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
