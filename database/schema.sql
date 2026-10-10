-- =========================================
-- Oris Signatures Hotel Database Schema
-- =========================================

CREATE DATABASE IF NOT EXISTS oris_signatures;
USE oris_signatures;

-- -----------------------------------------
-- Admin Users (Main Admin, Front Desk, Event Manager)
-- -----------------------------------------
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'frontdesk', 'eventmanager') NOT NULL DEFAULT 'frontdesk',
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- -----------------------------------------
-- Rooms
-- -----------------------------------------
CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    room_type ENUM('standard', 'deluxe', 'suite', 'presidential') NOT NULL,
    description TEXT,
    price_per_night DECIMAL(10,2) NOT NULL,
    max_guests INT NOT NULL DEFAULT 2,
    amenities JSON,
    image_url VARCHAR(500),
    is_available TINYINT(1) DEFAULT 1,
    total_units INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- -----------------------------------------
-- Room Bookings (Online + Walk-in)
-- -----------------------------------------
CREATE TABLE room_bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    receipt_id VARCHAR(20) UNIQUE NOT NULL,
    guest_name VARCHAR(100) NOT NULL,
    guest_email VARCHAR(100),
    guest_phone VARCHAR(20) NOT NULL,
    room_id INT NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    num_guests INT NOT NULL DEFAULT 1,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    payment_method ENUM('online', 'cash', 'card', 'transfer') DEFAULT 'online',
    booking_type ENUM('online', 'walkin') DEFAULT 'online',
    booking_status ENUM('reserved', 'checked_in', 'checked_out', 'cancelled') DEFAULT 'reserved',
    special_requests TEXT,
    checked_in_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT,
    FOREIGN KEY (checked_in_by) REFERENCES users(id) ON DELETE SET NULL
);

-- -----------------------------------------
-- Event Spaces
-- -----------------------------------------
CREATE TABLE event_spaces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    capacity INT NOT NULL,
    price_per_day DECIMAL(10,2) NOT NULL,
    amenities JSON,
    image_url VARCHAR(500),
    is_available TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- -----------------------------------------
-- Event Bookings
-- -----------------------------------------
CREATE TABLE event_bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    receipt_id VARCHAR(20) UNIQUE NOT NULL,
    client_name VARCHAR(100) NOT NULL,
    client_email VARCHAR(100),
    client_phone VARCHAR(20) NOT NULL,
    event_space_id INT NOT NULL,
    event_name VARCHAR(200) NOT NULL,
    event_date DATE NOT NULL,
    event_end_date DATE,
    expected_guests INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    payment_method ENUM('online', 'cash', 'card', 'transfer') DEFAULT 'online',
    booking_status ENUM('reserved', 'confirmed', 'active', 'completed', 'cancelled') DEFAULT 'reserved',
    special_requests TEXT,
    managed_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (event_space_id) REFERENCES event_spaces(id) ON DELETE RESTRICT,
    FOREIGN KEY (managed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- -----------------------------------------
-- Contact Messages (from landing page)
-- -----------------------------------------
CREATE TABLE contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(200),
    message TEXT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------
-- Seed: Default Staff Users
-- Passwords: admin123 / frontdesk123 / events123 (bcrypt hashes)
-- -----------------------------------------
INSERT INTO users (full_name, email, password, role) VALUES
('Main Admin', 'admin@orissignatures.com', '$2y$10$WedoTbMcySY3JUAGRuGqZusyxY3xUmSFaB1yXhb0uMW1Rq3ApwK7K', 'admin'),
('Grace Oladipo', 'frontdesk@orissignatures.com', '$2y$10$e94vOjycvFmtkOnpGfFIWeAgLoR16sthXO6UCOP5XRUS475Spat3u', 'frontdesk'),
('Femi Balogun', 'events@orissignatures.com', '$2y$10$dlmP0MmKvgAuFovYN7IkJOeac2W3oOHZG3K.418YD0KSb7hIXqZd.', 'eventmanager');

-- -----------------------------------------
-- Seed: Sample Rooms
-- -----------------------------------------
INSERT INTO rooms (name, room_type, description, price_per_night, max_guests, amenities, total_units) VALUES
('Standard Room', 'standard', 'A comfortable room with modern amenities, perfect for a relaxing stay.', 25000.00, 2, '["WiFi", "Air Conditioning", "TV", "Mini Fridge"]', 10),
('Deluxe Room', 'deluxe', 'Spacious room with premium furnishings and a stunning city view.', 45000.00, 2, '["WiFi", "Air Conditioning", "Smart TV", "Mini Bar", "Balcony", "Room Service"]', 8),
('Executive Suite', 'suite', 'Luxurious suite with separate living area, perfect for business travelers.', 75000.00, 3, '["WiFi", "Air Conditioning", "Smart TV", "Mini Bar", "Jacuzzi", "Living Room", "Room Service", "Concierge"]', 5),
('Presidential Suite', 'presidential', 'The pinnacle of luxury — a lavish suite with panoramic views and exclusive butler service.', 150000.00, 4, '["WiFi", "Air Conditioning", "Smart TV", "Full Bar", "Jacuzzi", "Living Room", "Dining Room", "Butler Service", "Private Terrace"]', 2);

-- -----------------------------------------
-- Seed: Sample Event Spaces
-- -----------------------------------------
INSERT INTO event_spaces (name, description, capacity, price_per_day, amenities) VALUES
('Grand Ballroom', 'An elegant ballroom perfect for weddings, galas, and large celebrations.', 500, 500000.00, '["Stage", "Sound System", "Projector", "Dance Floor", "Catering Kitchen", "Dressing Room"]'),
('Conference Hall', 'A modern conference space equipped for corporate events and seminars.', 200, 250000.00, '["Projector", "Sound System", "WiFi", "Whiteboard", "Video Conferencing", "Breakout Rooms"]'),
('Garden Terrace', 'A beautiful outdoor space surrounded by lush gardens, ideal for intimate gatherings.', 100, 150000.00, '["Outdoor Lighting", "Sound System", "BBQ Area", "Lounge Seating", "Rain Cover"]'),
('VIP Lounge', 'An exclusive private lounge for cocktail parties and VIP events.', 50, 100000.00, '["Private Bar", "Sound System", "Mood Lighting", "Premium Seating", "Dedicated Staff"]');
