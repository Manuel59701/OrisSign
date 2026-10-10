<?php
/**
 * Oris Signatures — API Router
 * Routes all requests to the appropriate endpoint handler.
 */

require_once __DIR__ . '/middleware/cors.php';

// Parse the request URI
$requestUri = $_SERVER['REQUEST_URI'];
$basePath = '/backend'; // Adjust based on your server setup

// Remove base path and query string
$path = parse_url($requestUri, PHP_URL_PATH);
$path = str_replace($basePath, '', $path);
$path = trim($path, '/');

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

// Simple router
$routes = [
    // Auth
    'api/auth/login' => __DIR__ . '/api/auth/login.php',
    'api/auth/verify' => __DIR__ . '/api/auth/verify.php',

    // Rooms
    'api/rooms' => __DIR__ . '/api/rooms/index.php',
    'api/rooms/availability' => __DIR__ . '/api/rooms/availability.php',

    // Room Bookings
    'api/bookings' => __DIR__ . '/api/bookings/index.php',
    'api/bookings/checkin' => __DIR__ . '/api/bookings/checkin.php',
    'api/bookings/walkin' => __DIR__ . '/api/bookings/walkin.php',

    // Events
    'api/events/spaces' => __DIR__ . '/api/events/spaces.php',
    'api/events/bookings' => __DIR__ . '/api/events/bookings.php',

    // Receipts
    'api/receipts/search' => __DIR__ . '/api/receipts/search.php',

    // Admin
    'api/admin/users' => __DIR__ . '/api/admin/users.php',
    'api/admin/dashboard' => __DIR__ . '/api/admin/dashboard.php',

    // Contact
    'api/contact' => __DIR__ . '/api/contact/index.php',
];

// Match route
$matched = false;
foreach ($routes as $route => $file) {
    // Check exact match or parameterized match
    if ($path === $route || strpos($path, $route . '/') === 0) {
        if (file_exists($file)) {
            // Extract any extra path segments as ID parameter
            $extra = trim(str_replace($route, '', $path), '/');
            if (!empty($extra)) {
                $_GET['id'] = $extra;
            }
            require $file;
            $matched = true;
            break;
        }
    }
}

if (!$matched) {
    http_response_code(404);
    echo json_encode(['error' => 'Endpoint not found', 'path' => $path]);
}
