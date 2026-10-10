<?php
require_once __DIR__ . '/../config/config.php';

class Auth {
    /**
     * Generate a JWT token
     */
    public static function generateToken($userId, $role) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode([
            'user_id' => $userId,
            'role' => $role,
            'iat' => time(),
            'exp' => time() + JWT_EXPIRY
        ]);

        $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));

        $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, JWT_SECRET, true);
        $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        return $base64Header . "." . $base64Payload . "." . $base64Signature;
    }

    /**
     * Verify and decode a JWT token
     */
    public static function verifyToken($token) {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return false;
        }

        list($base64Header, $base64Payload, $base64Signature) = $parts;

        $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, JWT_SECRET, true);
        $expectedSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        if (!hash_equals($expectedSignature, $base64Signature)) {
            return false;
        }

        $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $base64Payload)), true);

        if ($payload['exp'] < time()) {
            return false;
        }

        return $payload;
    }

    /**
     * Get the authenticated user from the request
     */
    public static function getAuthUser() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        if (empty($authHeader) || !str_starts_with($authHeader, 'Bearer ')) {
            return false;
        }

        $token = substr($authHeader, 7);
        return self::verifyToken($token);
    }

    /**
     * Require authentication — halt if not authenticated
     */
    public static function requireAuth($allowedRoles = []) {
        $user = self::getAuthUser();

        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized. Please log in.']);
            exit;
        }

        if (!empty($allowedRoles) && !in_array($user['role'], $allowedRoles)) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden. Insufficient permissions.']);
            exit;
        }

        return $user;
    }

    /**
     * Generate a unique receipt ID
     */
    public static function generateReceiptId() {
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        $id = 'ORS-';
        for ($i = 0; $i < 6; $i++) {
            $id .= $chars[random_int(0, strlen($chars) - 1)];
        }
        return $id;
    }
}
