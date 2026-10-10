<?php
/**
 * Admin Users Management Endpoint
 * GET  /api/admin/users       â€” List all staff users
 * POST /api/admin/users       â€” Create new staff user
 * PUT  /api/admin/users/{id}  â€” Update staff user
 * DELETE /api/admin/users/{id} â€” Deactivate staff user
 * Requires: admin role
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

$db = new Database();
$conn = $db->getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

Auth::requireAuth(['admin', 'subadmin']);

switch ($method) {
    case 'GET':
        $stmt = $conn->prepare("SELECT id, full_name, email, role, is_active, created_at FROM users ORDER BY created_at DESC");
        $stmt->execute();
        echo json_encode($stmt->fetchAll());
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['full_name']) || empty($data['email']) || empty($data['password']) || empty($data['role'])) {
            http_response_code(400);
            echo json_encode(['error' => 'full_name, email, password, and role are required']);
            exit;
        }

        // Check if email already exists
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = :email");
        $stmt->bindParam(':email', $data['email']);
        $stmt->execute();
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['error' => 'Email already exists']);
            exit;
        }

        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);

        $stmt = $conn->prepare("INSERT INTO users (full_name, email, password, role) VALUES (:name, :email, :password, :role)");
        $stmt->execute([
            ':name' => $data['full_name'],
            ':email' => $data['email'],
            ':password' => $hashedPassword,
            ':role' => $data['role']
        ]);

        http_response_code(201);
        echo json_encode(['message' => 'User created', 'id' => $conn->lastInsertId()]);
        break;

    case 'PUT':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'User ID required']);
            exit;
        }

        $data = json_decode(file_get_contents("php://input"), true);

        $query = "UPDATE users SET full_name = :name, email = :email, role = :role, is_active = :is_active";
        $params = [
            ':name' => $data['full_name'],
            ':email' => $data['email'],
            ':role' => $data['role'],
            ':is_active' => $data['is_active'] ?? 1,
            ':id' => $id
        ];

        // Only update password if provided
        if (!empty($data['password'])) {
            $query .= ", password = :password";
            $params[':password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        }

        $query .= " WHERE id = :id";

        $stmt = $conn->prepare($query);
        $stmt->execute($params);

        echo json_encode(['message' => 'User updated']);
        break;

    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'User ID required']);
            exit;
        }

        // Soft delete - deactivate
        $stmt = $conn->prepare("UPDATE users SET is_active = 0 WHERE id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        echo json_encode(['message' => 'User deactivated']);
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
