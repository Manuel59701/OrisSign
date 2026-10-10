<?php
/**
 * Event Spaces Endpoint
 * GET  /api/events/spaces          — List all event spaces (public)
 * GET  /api/events/spaces/{id}     — Get single space (public)
 * POST /api/events/spaces          — Create space (admin only)
 * PUT  /api/events/spaces/{id}     — Update space (admin/eventmanager)
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
            $stmt = $conn->prepare("SELECT * FROM event_spaces WHERE id = :id");
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            $space = $stmt->fetch();

            if (!$space) {
                http_response_code(404);
                echo json_encode(['error' => 'Event space not found']);
                exit;
            }
            $space['amenities'] = json_decode($space['amenities']);
            echo json_encode($space);
        } else {
            $stmt = $conn->prepare("SELECT * FROM event_spaces ORDER BY capacity ASC");
            $stmt->execute();
            $spaces = $stmt->fetchAll();

            foreach ($spaces as &$space) {
                $space['amenities'] = json_decode($space['amenities']);
            }
            echo json_encode($spaces);
        }
        break;

    case 'POST':
        Auth::requireAuth(['admin']);
        $data = json_decode(file_get_contents("php://input"), true);

        $stmt = $conn->prepare("INSERT INTO event_spaces (name, description, capacity, price_per_day, amenities, image_url) VALUES (:name, :description, :capacity, :price, :amenities, :image_url)");
        $stmt->execute([
            ':name' => $data['name'],
            ':description' => $data['description'] ?? '',
            ':capacity' => $data['capacity'],
            ':price' => $data['price_per_day'],
            ':amenities' => json_encode($data['amenities'] ?? []),
            ':image_url' => $data['image_url'] ?? null
        ]);

        http_response_code(201);
        echo json_encode(['message' => 'Event space created', 'id' => $conn->lastInsertId()]);
        break;

    case 'PUT':
        Auth::requireAuth(['admin', 'eventmanager']);
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Space ID required']);
            exit;
        }

        $data = json_decode(file_get_contents("php://input"), true);

        $stmt = $conn->prepare("UPDATE event_spaces SET name = :name, description = :description, capacity = :capacity, price_per_day = :price, amenities = :amenities, image_url = :image_url, is_available = :is_available WHERE id = :id");
        $stmt->execute([
            ':name' => $data['name'],
            ':description' => $data['description'] ?? '',
            ':capacity' => $data['capacity'],
            ':price' => $data['price_per_day'],
            ':amenities' => json_encode($data['amenities'] ?? []),
            ':image_url' => $data['image_url'] ?? null,
            ':is_available' => $data['is_available'] ?? 1,
            ':id' => $id
        ]);

        echo json_encode(['message' => 'Event space updated']);
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
