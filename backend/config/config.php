<?php
// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'oris_signatures');
define('DB_USER', 'root');
define('DB_PASS', '');

// JWT Secret Key
define('JWT_SECRET', 'oris_signatures_jwt_secret_key_2026');
define('JWT_EXPIRY', 86400); // 24 hours

// CORS Settings
define('ALLOWED_ORIGIN', 'http://localhost:5173');

// Upload paths
define('UPLOAD_PATH', __DIR__ . '/../uploads/');

// Site Info
define('SITE_NAME', 'Oris Signatures');
define('SITE_URL', 'http://localhost:5173');
