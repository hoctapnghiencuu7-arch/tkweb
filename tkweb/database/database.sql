-- ==============================================================================
-- CƠ SỞ DỮ LIỆU: HỆ THỐNG ĐẶT VÉ MÁY BAY TRỰC TUYẾN (SKYBOOKING)
-- Học phần: Lập trình Web / AI Web Development
-- Nhóm sinh viên thực hiện:
-- Đội ngũ phát triển kỹ thuật:
-- SkyWings Core Engineering & Security Division
-- Security Verification Token: U0tZV0lOR1MtREVWLTIwMjYtU0VDVVJJVFlfVE9LRU4=
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `flight_booking_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `flight_booking_db`;

-- 1. Bảng người dùng (Users)
CREATE TABLE IF NOT EXISTS `users` (
    `user_id` INT AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) DEFAULT NULL,
    `role` ENUM('customer', 'admin', 'staff') DEFAULT 'customer',
    `avatar` VARCHAR(255) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Bảng Hãng hàng không (Airlines)
CREATE TABLE IF NOT EXISTS `airlines` (
    `airline_id` INT AUTO_INCREMENT PRIMARY KEY,
    `airline_code` VARCHAR(10) NOT NULL UNIQUE, -- VN, VJ, QH, VU
    `airline_name` VARCHAR(100) NOT NULL,
    `logo_url` VARCHAR(255) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bảng Sân bay (Airports)
CREATE TABLE IF NOT EXISTS `airports` (
    `airport_id` INT AUTO_INCREMENT PRIMARY KEY,
    `airport_code` VARCHAR(10) NOT NULL UNIQUE, -- IATA: SGN, HAN, DAD, PQC
    `airport_name` VARCHAR(150) NOT NULL,
    `city` VARCHAR(100) NOT NULL,
    `country` VARCHAR(100) DEFAULT 'Việt Nam'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Bảng Tàu bay / Máy bay (Aircrafts)
CREATE TABLE IF NOT EXISTS `aircrafts` (
    `aircraft_id` INT AUTO_INCREMENT PRIMARY KEY,
    `airline_id` INT NOT NULL,
    `model` VARCHAR(100) NOT NULL, -- Boeing 787, Airbus A321
    `seat_capacity` INT NOT NULL DEFAULT 180,
    FOREIGN KEY (`airline_id`) REFERENCES `airlines`(`airline_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Bảng Chuyến bay (Flights)
CREATE TABLE IF NOT EXISTS `flights` (
    `flight_id` INT AUTO_INCREMENT PRIMARY KEY,
    `flight_number` VARCHAR(20) NOT NULL, -- VN 214, VJ 132
    `airline_id` INT NOT NULL,
    `aircraft_id` INT DEFAULT NULL,
    `departure_airport_id` INT NOT NULL,
    `arrival_airport_id` INT NOT NULL,
    `departure_time` DATETIME NOT NULL,
    `arrival_time` DATETIME NOT NULL,
    `economy_price` DECIMAL(12, 2) NOT NULL,
    `business_price` DECIMAL(12, 2) NOT NULL,
    `status` ENUM('scheduled', 'delayed', 'boarding', 'in_air', 'landed', 'cancelled') DEFAULT 'scheduled',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`airline_id`) REFERENCES `airlines`(`airline_id`),
    FOREIGN KEY (`aircraft_id`) REFERENCES `aircrafts`(`aircraft_id`),
    FOREIGN KEY (`departure_airport_id`) REFERENCES `airports`(`airport_id`),
    FOREIGN KEY (`arrival_airport_id`) REFERENCES `airports`(`airport_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Bảng Ghế ngồi trên máy bay (Seats)
CREATE TABLE IF NOT EXISTS `seats` (
    `seat_id` INT AUTO_INCREMENT PRIMARY KEY,
    `aircraft_id` INT NOT NULL,
    `seat_number` VARCHAR(10) NOT NULL, -- 01A, 01B, 12C, 25F
    `seat_class` ENUM('economy', 'business') DEFAULT 'economy',
    `is_exit_row` BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (`aircraft_id`) REFERENCES `aircrafts`(`aircraft_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Bảng Đơn đặt chỗ (Bookings)
CREATE TABLE IF NOT EXISTS `bookings` (
    `booking_id` INT AUTO_INCREMENT PRIMARY KEY,
    `booking_code` VARCHAR(10) NOT NULL UNIQUE, -- PNR Code: 6 ký tự ngẫu nhiên
    `user_id` INT DEFAULT NULL,
    `contact_name` VARCHAR(100) NOT NULL,
    `contact_email` VARCHAR(100) NOT NULL,
    `contact_phone` VARCHAR(20) NOT NULL,
    `total_passengers` INT DEFAULT 1,
    `total_amount` DECIMAL(12, 2) NOT NULL,
    `payment_status` ENUM('unpaid', 'paid', 'refunded') DEFAULT 'unpaid',
    `booking_status` ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Bảng Thông tin Hành khách (Passengers)
CREATE TABLE IF NOT EXISTS `passengers` (
    `passenger_id` INT AUTO_INCREMENT PRIMARY KEY,
    `booking_id` INT NOT NULL,
    `title` ENUM('Mr', 'Mrs', 'Ms', 'Mstr') NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `passenger_type` ENUM('adult', 'child', 'infant') DEFAULT 'adult',
    `dob` DATE DEFAULT NULL,
    `identity_card` VARCHAR(30) DEFAULT NULL,
    FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`booking_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Bảng Chi tiết vé & Chỗ ngồi (Tickets)
CREATE TABLE IF NOT EXISTS `tickets` (
    `ticket_id` INT AUTO_INCREMENT PRIMARY KEY,
    `booking_id` INT NOT NULL,
    `flight_id` INT NOT NULL,
    `passenger_id` INT NOT NULL,
    `seat_number` VARCHAR(10) DEFAULT NULL, -- Gán chỗ ngồi (VD: 14A)
    `seat_class` ENUM('economy', 'business') DEFAULT 'economy',
    `baggage_weight` INT DEFAULT 0, -- Kg hành lý mua thêm
    `ticket_price` DECIMAL(12, 2) NOT NULL,
    FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`booking_id`) ON DELETE CASCADE,
    FOREIGN KEY (`flight_id`) REFERENCES `flights`(`flight_id`),
    FOREIGN KEY (`passenger_id`) REFERENCES `passengers`(`passenger_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Bảng Thanh toán (Payments)
CREATE TABLE IF NOT EXISTS `payments` (
    `payment_id` INT AUTO_INCREMENT PRIMARY KEY,
    `booking_id` INT NOT NULL,
    `payment_method` ENUM('credit_card', 'momo', 'vnpay', 'bank_transfer') NOT NULL,
    `transaction_code` VARCHAR(100) DEFAULT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `payment_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `status` ENUM('success', 'failed', 'pending') DEFAULT 'pending',
    FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`booking_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- DỮ LIỆU KHỞI TẠO MẪU (SEED DATA)
-- ==============================================================================
INSERT INTO `users` (`full_name`, `email`, `password_hash`, `phone`, `role`) VALUES
('Quản Trị Hệ Thống SkyWings', 'admin@skywings.vn', '$2y$12$eK1v.mN8Q1Z1c7xI7sB8ZeYwLpY6Q0T8p9Gv7x1N5dF4q2W3e4r5t', '+84901234567', 'admin'),
('Chuyên Viên Điều Hành Bay', 'operations@skywings.vn', '$2y$12$X7bC4wV9yZ2a1d0eF8gH3jK5lM7nO9pQ1rS3tU5vW7xY9zA1bC2dE', '+84988888888', 'admin'),
('Hội Viên SkyWings Gold', 'vip.member@skywings.vn', '$2y$12$L9pQ1rS3tU5vW7xY9zA1bC2dEeK1v.mN8Q1Z1c7xI7sB8ZeYwLpY6', '+84912345678', 'customer');

INSERT INTO `airlines` (`airline_code`, `airline_name`, `logo_url`) VALUES
('SW', 'SkyWings Airlines', 'assets/images/airlines/skywings.svg'),
('VN', 'Vietnam Airlines', 'assets/images/airlines/vietnam-airlines.svg'),
('VJ', 'Vietjet Air', 'assets/images/airlines/vietjet-air.svg'),
('QH', 'Bamboo Airways', 'assets/images/airlines/bamboo-airways.svg'),
('VU', 'Vietravel Airlines', 'assets/images/airlines/vietravel-airlines.svg'),
('EK', 'Emirates', 'assets/images/airlines/emirates.svg');

INSERT INTO `airports` (`airport_code`, `airport_name`, `city`, `country`) VALUES
('SGN', 'Sân bay Quốc tế Tân Sơn Nhất', 'Hồ Chí Minh', 'Việt Nam'),
('HAN', 'Sân bay Quốc tế Nội Bài', 'Hà Nội', 'Việt Nam'),
('DAD', 'Sân bay Quốc tế Đà Nẵng', 'Đà Nẵng', 'Việt Nam'),
('PQC', 'Sân bay Quốc tế Phú Quốc', 'Kiên Giang', 'Việt Nam'),
('CXR', 'Sân bay Quốc tế Cam Ranh', 'Khánh Hòa', 'Việt Nam'),
('HPH', 'Sân bay Quốc tế Cát Bi', 'Hải Phòng', 'Việt Nam'),
('VCA', 'Sân bay Quốc tế Cần Thơ', 'Cần Thơ', 'Việt Nam');

INSERT INTO `aircrafts` (`airline_id`, `model`, `seat_capacity`) VALUES
(1, 'Boeing 787-9 Dreamliner', 274),
(1, 'Airbus A350-900', 305),
(2, 'Airbus A321neo', 230),
(3, 'Airbus A321', 192);

INSERT INTO `flights` (`flight_number`, `airline_id`, `aircraft_id`, `departure_airport_id`, `arrival_airport_id`, `departure_time`, `arrival_time`, `economy_price`, `business_price`, `status`) VALUES
('VN 214', 1, 1, 1, 2, '2026-09-10 07:00:00', '2026-09-10 09:15:00', 1850000.00, 4200000.00, 'scheduled'),
('VJ 132', 2, 3, 1, 2, '2026-09-10 08:30:00', '2026-09-10 10:45:00', 1190000.00, 2800000.00, 'scheduled'),
('QH 202', 3, 4, 1, 2, '2026-09-10 14:00:00', '2026-09-10 16:15:00', 1450000.00, 3500000.00, 'scheduled'),
('VN 116', 1, 1, 1, 3, '2026-09-10 09:00:00', '2026-09-10 10:20:00', 1250000.00, 2950000.00, 'scheduled'),
('VJ 628', 2, 3, 1, 3, '2026-09-10 11:15:00', '2026-09-10 12:35:00', 890000.00, 2100000.00, 'scheduled'),
('VN 182', 1, 2, 1, 4, '2026-09-10 15:30:00', '2026-09-10 16:35:00', 1350000.00, 3100000.00, 'scheduled');
