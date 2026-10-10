<?php
/**
 * Auth Verify Endpoint
 * GET /api/auth/verify
 * Header: Authorization: Bearer <token>
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$authUser = Auth::requireAuth();

$db = new Database();
$conn = $db->getConnection();

$stmt = $conn->prepare("SELECT id, full_name, email, role FROM users WHERE id = :id AND is_active = 1");
$stmt->bindParam(':id', $authUser['user_id']);
$stmt->execute();

$user = $stmt->fetch();

if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'User not found or deactivated']);
    exit;
}

echo json_encode([
    'valid' => true,
    'user' => $user
]);
