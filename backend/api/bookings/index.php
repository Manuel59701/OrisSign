<?php
/**
 * Room Bookings Endpoint
 * GET  /api/bookings          â€” List bookings (admin/frontdesk)
 * GET  /api/bookings/{id}     â€” Get single booking by ID or receipt_id
 * POST /api/bookings          â€” Create online booking (public)
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

$db = new Database();
$conn = $db->getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

switch ($method) {
    case 'GET':
        Auth::requireAuth(['admin', 'subadmin', 'frontdesk']);

        if ($id) {
            $stmt = $conn->prepare("
                SELECT rb.*, r.name as room_name, r.room_type
                FROM room_bookings rb
                JOIN rooms r ON rb.room_id = r.id
                WHERE rb.id = :id OR rb.receipt_id = :receipt_id
            ");
            $stmt->execute([':id' => $id, ':receipt_id' => $id]);
            $booking = $stmt->fetch();

            if (!$booking) {
                http_response_code(404);
                echo json_encode(['error' => 'Booking not found']);
                exit;
            }
            echo json_encode($booking);
        } else {
            $status = $_GET['status'] ?? null;
            $type = $_GET['type'] ?? null;

            $query = "
                SELECT rb.*, r.name as room_name, r.room_type
                FROM room_bookings rb
                JOIN rooms r ON rb.room_id = r.id
                WHERE 1=1
            ";
            $params = [];

            if ($status) {
                $query .= " AND rb.booking_status = :status";
                $params[':status'] = $status;
            }
            if ($type) {
                $query .= " AND rb.booking_type = :type";
                $params[':type'] = $type;
            }

            $query .= " ORDER BY rb.created_at DESC";

            $stmt = $conn->prepare($query);
            $stmt->execute($params);
            echo json_encode($stmt->fetchAll());
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);

        // Validate required fields
        $required = ['guest_name', 'guest_phone', 'room_id', 'check_in_date', 'check_out_date'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "Field '$field' is required"]);
                exit;
            }
        }

        // Check room availability
        $stmt = $conn->prepare("
            SELECT r.total_units - COALESCE(COUNT(rb.id), 0) as available
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
        $availability = $stmt->fetch();

        if (!$availability || $availability['available'] <= 0) {
            http_response_code(409);
            echo json_encode(['error' => 'Room is not available for the selected dates']);
            exit;
        }

        // Calculate total amount
        $stmt = $conn->prepare("SELECT price_per_night FROM rooms WHERE id = :id");
        $stmt->bindParam(':id', $data['room_id']);
        $stmt->execute();
        $room = $stmt->fetch();

        $checkIn = new DateTime($data['check_in_date']);
        $checkOut = new DateTime($data['check_out_date']);
        $nights = $checkIn->diff($checkOut)->days;
        $totalAmount = $room['price_per_night'] * $nights;

        // Generate unique receipt ID
        $receiptId = Auth::generateReceiptId();

        // Ensure receipt ID is unique
        $stmt = $conn->prepare("SELECT id FROM room_bookings WHERE receipt_id = :receipt_id");
        $stmt->bindParam(':receipt_id', $receiptId);
        $stmt->execute();
        while ($stmt->fetch()) {
            $receiptId = Auth::generateReceiptId();
            $stmt->execute();
        }

        $stmt = $conn->prepare("INSERT INTO room_bookings (receipt_id, guest_name, guest_email, guest_phone, room_id, check_in_date, check_out_date, num_guests, total_amount, payment_status, payment_method, booking_type, special_requests) VALUES (:receipt_id, :guest_name, :guest_email, :guest_phone, :room_id, :check_in, :check_out, :num_guests, :total_amount, :payment_status, :payment_method, :booking_type, :special_requests)");

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
            ':payment_status' => $data['payment_status'] ?? 'pending',
            ':payment_method' => $data['payment_method'] ?? 'online',
            ':booking_type' => $data['booking_type'] ?? 'online',
            ':special_requests' => $data['special_requests'] ?? null
        ]);

        http_response_code(201);
        echo json_encode([
            'message' => 'Booking created successfully',
            'receipt_id' => $receiptId,
            'booking_id' => $conn->lastInsertId(),
            'total_amount' => $totalAmount,
            'nights' => $nights
        ]);
        break;

    case 'DELETE':
        Auth::requireAuth(['admin', 'subadmin', 'frontdesk']);
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Booking ID required']);
            break;
        }

        $stmt = $conn->prepare("DELETE FROM room_bookings WHERE id = :id OR receipt_id = :receipt_id");
        $stmt->execute([':id' => (int) $id, ':receipt_id' => $id]);

        echo json_encode(['message' => 'Booking deleted']);
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
