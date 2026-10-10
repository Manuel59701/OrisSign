<?php
/**
 * Contact Form Endpoint
 * POST /api/contact â€” Submit a contact message (public)
 * GET  /api/contact â€” List messages (admin only)
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

$db = new Database();
$conn = $db->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['name']) || empty($data['email']) || empty($data['message'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Name, email, and message are required']);
            exit;
        }

        $stmt = $conn->prepare("INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (:name, :email, :phone, :subject, :message)");
        $stmt->execute([
            ':name' => $data['name'],
            ':email' => $data['email'],
            ':phone' => $data['phone'] ?? null,
            ':subject' => $data['subject'] ?? null,
            ':message' => $data['message']
        ]);

        http_response_code(201);
        echo json_encode(['message' => 'Message sent successfully']);
        break;

    case 'GET':
        Auth::requireAuth(['admin', 'subadmin']);

        $stmt = $conn->prepare("SELECT * FROM contact_messages ORDER BY created_at DESC");
        $stmt->execute();
        echo json_encode($stmt->fetchAll());
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
