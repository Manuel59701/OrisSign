<?php
/**
 * Rooms Endpoint
 * GET  /api/rooms          — List all rooms (public)
 * GET  /api/rooms/{id}     — Get single room (public)
 * POST /api/rooms          — Create room (admin only)
 * PUT  /api/rooms/{id}     — Update room (admin only)
 * DELETE /api/rooms/{id}   — Delete room (admin only)
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

$db = new Database();
$conn = $db->getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

switch ($method) {
    case 'GET':
        if ($id) {
            // Get single room
            $stmt = $conn->prepare("SELECT * FROM rooms WHERE id = :id");
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            $room = $stmt->fetch();

            if (!$room) {
                http_response_code(404);
                echo json_encode(['error' => 'Room not found']);
                exit;
            }

            $room['amenities'] = json_decode($room['amenities']);
            echo json_encode($room);
        } else {
            // List all rooms
            $stmt = $conn->prepare("SELECT * FROM rooms ORDER BY price_per_night ASC");
            $stmt->execute();
            $rooms = $stmt->fetchAll();

            foreach ($rooms as &$room) {
                $room['amenities'] = json_decode($room['amenities']);
            }

            echo json_encode($rooms);
        }
        break;

    case 'POST':
        Auth::requireAuth(['admin']);
        $data = json_decode(file_get_contents("php://input"), true);

        $stmt = $conn->prepare("INSERT INTO rooms (name, room_type, description, price_per_night, max_guests, amenities, image_url, total_units) VALUES (:name, :room_type, :description, :price, :max_guests, :amenities, :image_url, :total_units)");
        $stmt->execute([
            ':name' => $data['name'],
            ':room_type' => $data['room_type'],
            ':description' => $data['description'] ?? '',
            ':price' => $data['price_per_night'],
            ':max_guests' => $data['max_guests'] ?? 2,
            ':amenities' => json_encode($data['amenities'] ?? []),
            ':image_url' => $data['image_url'] ?? null,
            ':total_units' => $data['total_units'] ?? 1
        ]);

        http_response_code(201);
        echo json_encode(['message' => 'Room created', 'id' => $conn->lastInsertId()]);
        break;

    case 'PUT':
        Auth::requireAuth(['admin']);
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Room ID required']);
            exit;
        }

        $data = json_decode(file_get_contents("php://input"), true);

        $stmt = $conn->prepare("UPDATE rooms SET name = :name, room_type = :room_type, description = :description, price_per_night = :price, max_guests = :max_guests, amenities = :amenities, image_url = :image_url, is_available = :is_available, total_units = :total_units WHERE id = :id");
        $stmt->execute([
            ':name' => $data['name'],
            ':room_type' => $data['room_type'],
            ':description' => $data['description'] ?? '',
            ':price' => $data['price_per_night'],
            ':max_guests' => $data['max_guests'] ?? 2,
            ':amenities' => json_encode($data['amenities'] ?? []),
            ':image_url' => $data['image_url'] ?? null,
            ':is_available' => $data['is_available'] ?? 1,
            ':total_units' => $data['total_units'] ?? 1,
            ':id' => $id
        ]);

        echo json_encode(['message' => 'Room updated']);
        break;

    case 'DELETE':
        Auth::requireAuth(['admin']);
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Room ID required']);
            exit;
        }

        $stmt = $conn->prepare("DELETE FROM rooms WHERE id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        echo json_encode(['message' => 'Room deleted']);
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
