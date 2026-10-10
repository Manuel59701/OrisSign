<?php
/**
 * Auth Login Endpoint
 * POST /api/auth/login
 * Body: { email, password }
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['email']) || empty($data['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Email and password are required']);
    exit;
}

$db = new Database();
$conn = $db->getConnection();

$stmt = $conn->prepare("SELECT id, full_name, email, password, role, is_active FROM users WHERE email = :email");
$stmt->bindParam(':email', $data['email']);
$stmt->execute();

$user = $stmt->fetch();

if (!$user || !password_verify($data['password'], $user['password'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid email or password']);
    exit;
}

if (!$user['is_active']) {
    http_response_code(403);
    echo json_encode(['error' => 'Account is deactivated. Contact administrator.']);
    exit;
}

$token = Auth::generateToken($user['id'], $user['role']);

echo json_encode([
    'message' => 'Login successful',
    'token' => $token,
    'user' => [
        'id' => $user['id'],
        'full_name' => $user['full_name'],
        'email' => $user['email'],
        'role' => $user['role']
    ]
]);
