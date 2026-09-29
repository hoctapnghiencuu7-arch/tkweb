-- ==============================================================================
-- SKYWINGS AIRLINE ENTERPRISE DATABASE SCHEMA (POSTGRESQL DDL)
-- Version: 2.0.0 Production Grade
-- Target Database: PostgreSQL 14+
-- Standard: IATA / ICAO Airline Booking & Operations Schema
-- Compliance: Soft-delete on financial tables, Strict Foreign Keys, Audit Triggers
-- ==============================================================================

-- Enable UUID extension for secure non-sequential public identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. AUTHENTICATION & ROLE-BASED ACCESS CONTROL (RBAC)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE, -- 'SUPER_ADMIN', 'CSKH', 'ACCOUNTANT', 'MARKETING', 'AGENT'
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE, -- e.g. 'flights.create', 'bookings.refund', 'pricing.update'
    module VARCHAR(50) NOT NULL,        -- 'FLIGHTS', 'BOOKINGS', 'PRICING', 'CUSTOMERS', 'PAYMENTS', 'CMS', 'STAFF'
    display_name VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url VARCHAR(255),
    role_id INT NOT NULL REFERENCES roles(id),
    status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'SUSPENDED', 'LOCKED'
    last_login_at TIMESTAMPTZ,
    last_login_ip VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    admin_user_id INT REFERENCES admin_users(id) ON DELETE SET NULL,
    admin_name VARCHAR(100),
    action VARCHAR(50) NOT NULL,        -- 'CREATE', 'UPDATE', 'DELETE', 'REFUND_APPROVE', 'LOGIN', 'PRICE_CHANGE'
    entity_name VARCHAR(50) NOT NULL,   -- 'flights', 'bookings', 'promo_codes', 'fare_classes'
    entity_id VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    old_values JSONB,
    new_values JSONB,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_name, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ==============================================================================
-- 2. MASTER AVIATION DATA: AIRLINES & AIRPORTS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS airlines (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,    -- VN, VJ, QH, VU, SQ, EK
    name VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'Việt Nam',
    logo_url VARCHAR(255),
    support_hotline VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS airports (
    id SERIAL PRIMARY KEY,
    iata_code VARCHAR(10) NOT NULL UNIQUE, -- SGN, HAN, DAD, PQC, CXR, HPH, VCA
    name VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'Việt Nam',
    timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
    terminal_domestic VARCHAR(50) DEFAULT 'T1',
    terminal_international VARCHAR(50) DEFAULT 'T2',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 3. FLIGHT INVENTORY, FARE CLASSES & SEAT MAPS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS aircrafts (
    id SERIAL PRIMARY KEY,
    airline_id INT NOT NULL REFERENCES airlines(id) ON DELETE CASCADE,
    model VARCHAR(100) NOT NULL,          -- 'Boeing 787-9', 'Airbus A350-900', 'Airbus A321neo'
    registration_code VARCHAR(20) UNIQUE, -- 'VN-A868'
    seat_capacity INT NOT NULL DEFAULT 180,
    seat_layout VARCHAR(20) DEFAULT '3-3', -- '3-3', '3-3-3', '2-4-2'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS flights (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    flight_number VARCHAR(20) NOT NULL,   -- 'VN 214', 'VJ 132'
    airline_id INT NOT NULL REFERENCES airlines(id),
    aircraft_id INT REFERENCES aircrafts(id),
    departure_airport_id INT NOT NULL REFERENCES airports(id),
    arrival_airport_id INT NOT NULL REFERENCES airports(id),
    departure_time TIMESTAMPTZ NOT NULL,
    arrival_time TIMESTAMPTZ NOT NULL,
    flight_duration_minutes INT NOT NULL,  -- e.g. 135 minutes
    status VARCHAR(30) DEFAULT 'SCHEDULED', -- 'SCHEDULED', 'DELAYED', 'BOARDING', 'DEPARTED', 'LANDED', 'CANCELLED'
    gate VARCHAR(20),
    delay_reason TEXT,
    low_seat_threshold INT DEFAULT 15,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_rule VARCHAR(100),         -- e.g. 'FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=24'
    is_multi_leg BOOLEAN DEFAULT FALSE,
    parent_journey_id INT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by INT REFERENCES admin_users(id),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_flights_route_time ON flights(departure_airport_id, arrival_airport_id, departure_time);
CREATE INDEX IF NOT EXISTS idx_flights_number ON flights(flight_number);
CREATE INDEX IF NOT EXISTS idx_flights_status ON flights(status);

CREATE TABLE IF NOT EXISTS fare_classes (
    id SERIAL PRIMARY KEY,
    flight_id INT NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
    cabin_class VARCHAR(30) NOT NULL, -- 'ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'
    name VARCHAR(100) NOT NULL,       -- 'Phổ thông Tiết kiệm', 'Thương gia Linh hoạt'
    base_price NUMERIC(14, 2) NOT NULL,
    tax_and_fees NUMERIC(14, 2) DEFAULT 0,
    baggage_cabin_kg INT DEFAULT 7,
    baggage_checked_kg INT DEFAULT 20,
    is_refundable BOOLEAN DEFAULT FALSE,
    refund_fee NUMERIC(14, 2) DEFAULT 350000,
    is_changeable BOOLEAN DEFAULT TRUE,
    change_fee NUMERIC(14, 2) DEFAULT 250000,
    seat_capacity INT NOT NULL,
    seats_booked INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS flight_seats (
    id BIGSERIAL PRIMARY KEY,
    flight_id INT NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
    fare_class_id INT REFERENCES fare_classes(id) ON DELETE SET NULL,
    seat_number VARCHAR(10) NOT NULL,    -- '01A', '12C', '25F'
    seat_class VARCHAR(30) NOT NULL,     -- 'ECONOMY', 'BUSINESS'
    seat_type VARCHAR(30) DEFAULT 'STANDARD', -- 'WINDOW', 'AISLE', 'MIDDLE', 'EXTRA_LEGROOM', 'EXIT_ROW'
    extra_charge NUMERIC(14, 2) DEFAULT 0,
    status VARCHAR(30) DEFAULT 'AVAILABLE', -- 'AVAILABLE', 'HELD', 'BOOKED', 'BLOCKED'
    held_until TIMESTAMPTZ,              -- Dynamic timeout for seat lock
    held_by_session VARCHAR(100),
    PRIMARY KEY (flight_id, seat_number)
);
CREATE INDEX IF NOT EXISTS idx_flight_seats_status ON flight_seats(flight_id, status);

-- ==============================================================================
-- 4. CUSTOMERS & LOYALTY PROGRAM
-- ==============================================================================

CREATE TABLE IF NOT EXISTS loyalty_tiers (
    id SERIAL PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,     -- 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'
    name VARCHAR(100) NOT NULL,
    min_spend NUMERIC(14, 2) NOT NULL,
    points_earning_rate NUMERIC(5, 2) DEFAULT 1.0, -- Multiplier on spend
    free_baggage_extra_kg INT DEFAULT 0,
    priority_boarding BOOLEAN DEFAULT FALSE,
    lounge_access BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255),
    loyalty_tier_id INT REFERENCES loyalty_tiers(id),
    current_points INT DEFAULT 0,
    total_spend NUMERIC(14, 2) DEFAULT 0,
    total_flights_flown INT DEFAULT 0,
    is_blacklisted BOOLEAN DEFAULT FALSE,
    blacklist_reason TEXT,
    blacklisted_by INT REFERENCES admin_users(id),
    blacklisted_at TIMESTAMPTZ,
    dietary_preference VARCHAR(50),      -- 'VEGETARIAN', 'HALAL', 'KOSHER', 'STANDARD'
    special_assistance_notes TEXT,       -- 'WHEELCHAIR', 'BLIND_ASSISTANCE', 'UMNR'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

CREATE TABLE IF NOT EXISTS customer_documents (
    id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    doc_type VARCHAR(30) NOT NULL,       -- 'CCCD', 'PASSPORT'
    doc_number VARCHAR(50) NOT NULL,
    issuing_country VARCHAR(100) DEFAULT 'Việt Nam',
    expiry_date DATE NOT NULL,
    encrypted_payload TEXT,              -- AES-256 encrypted confidential doc details
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by INT REFERENCES admin_users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS loyalty_points (
    id BIGSERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    points INT NOT NULL,
    type VARCHAR(30) NOT NULL,           -- 'EARN', 'REDEEM', 'EXPIRE', 'ADJUSTMENT'
    reference_order_id VARCHAR(50),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 5. PRICING RULES, PROMOTIONS & VOUCHERS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS dynamic_pricing_rules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    departure_airport_id INT REFERENCES airports(id),
    arrival_airport_id INT REFERENCES airports(id),
    days_before_departure INT,           -- e.g. <= 3 days: increase by 20%
    occupancy_rate_threshold NUMERIC(5, 2), -- e.g. >= 80%: increase by 15%
    price_adjustment_percent NUMERIC(5, 2) NOT NULL, -- e.g. +15.0 or -10.0
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT REFERENCES admin_users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS promotions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    banner_image_url VARCHAR(255),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    is_flash_sale BOOLEAN DEFAULT FALSE,
    flash_sale_countdown_end TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT REFERENCES admin_users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS promo_codes (
    id SERIAL PRIMARY KEY,
    promotion_id INT REFERENCES promotions(id) ON DELETE SET NULL,
    code VARCHAR(50) NOT NULL UNIQUE,     -- 'BAYHE2026', 'SKYWINGS50'
    discount_type VARCHAR(20) NOT NULL,  -- 'PERCENT', 'FIXED_AMOUNT'
    discount_value NUMERIC(14, 2) NOT NULL,
    min_order_amount NUMERIC(14, 2) DEFAULT 0,
    max_discount_amount NUMERIC(14, 2),
    applicable_cabin_class VARCHAR(30),  -- NULL = all, or 'ECONOMY', 'BUSINESS'
    usage_limit_total INT DEFAULT 1000,
    usage_limit_per_user INT DEFAULT 1,
    used_count INT DEFAULT 0,
    valid_from TIMESTAMPTZ NOT NULL,
    valid_to TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS promo_usage (
    id BIGSERIAL PRIMARY KEY,
    promo_code_id INT NOT NULL REFERENCES promo_codes(id),
    customer_id INT REFERENCES customers(id),
    order_id INT NOT NULL,
    discount_amount NUMERIC(14, 2) NOT NULL,
    used_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 6. ORDERS, BOOKINGS, PASSENGERS & ANCILLARY SERVICES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    pnr_code VARCHAR(10) NOT NULL UNIQUE, -- PNR 6 characters: e.g. 'SW882P'
    customer_id INT REFERENCES customers(id) ON DELETE SET NULL,
    contact_name VARCHAR(100) NOT NULL,
    contact_email VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    total_passengers INT DEFAULT 1,
    subtotal_amount NUMERIC(14, 2) NOT NULL,
    discount_amount NUMERIC(14, 2) DEFAULT 0,
    ancillary_amount NUMERIC(14, 2) DEFAULT 0,
    vat_tax_amount NUMERIC(14, 2) DEFAULT 0,
    total_amount NUMERIC(14, 2) NOT NULL,
    booking_status VARCHAR(30) DEFAULT 'PENDING',  -- 'PENDING', 'CONFIRMED', 'CANCELLED', 'REFUND_REQUESTED', 'REFUNDED'
    payment_status VARCHAR(30) DEFAULT 'UNPAID',   -- 'UNPAID', 'PARTIALLY_PAID', 'PAID', 'REFUNDED'
    seat_hold_expires_at TIMESTAMPTZ,              -- Seat hold lock timer
    special_notes TEXT,
    created_by INT REFERENCES admin_users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ                         -- Soft delete for financial records
);
CREATE INDEX IF NOT EXISTS idx_bookings_pnr ON bookings(pnr_code);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_contact_email ON bookings(contact_email);

CREATE TABLE IF NOT EXISTS booking_passengers (
    id SERIAL PRIMARY KEY,
    booking_id INT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    flight_id INT NOT NULL REFERENCES flights(id),
    fare_class_id INT REFERENCES fare_classes(id),
    passenger_type VARCHAR(20) DEFAULT 'ADULT', -- 'ADULT', 'CHILD', 'INFANT'
    title VARCHAR(10) NOT NULL,                 -- 'Mr', 'Mrs', 'Ms', 'Mstr'
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    id_card_number VARCHAR(30),
    nationality VARCHAR(50) DEFAULT 'Việt Nam',
    seat_number VARCHAR(10),                    -- e.g. '14C'
    ticket_number VARCHAR(30) UNIQUE,           -- e.g. '738-2490192831'
    e_ticket_url VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS booking_services (
    id SERIAL PRIMARY KEY,
    booking_passenger_id INT NOT NULL REFERENCES booking_passengers(id) ON DELETE CASCADE,
    service_type VARCHAR(30) NOT NULL,   -- 'BAGGAGE', 'MEAL', 'SEAT_SELECTION', 'TRAVEL_INSURANCE', 'LOUNGE'
    service_code VARCHAR(50) NOT NULL,
    service_name VARCHAR(150) NOT NULL,  -- 'Hành lý ký gửi 20kg', 'Cơm gà sốt nấm'
    quantity INT DEFAULT 1,
    unit_price NUMERIC(14, 2) NOT NULL,
    total_price NUMERIC(14, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 7. PAYMENTS, TRANSACTIONS, REFUNDS & VAT INVOICES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    booking_id INT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    payment_method VARCHAR(50) NOT NULL, -- 'VNPAY', 'MOMO', 'CREDIT_CARD', 'BANK_TRANSFER'
    transaction_code VARCHAR(100),       -- Bank / Gateway PNR / Transaction ID
    amount NUMERIC(14, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'VND',
    status VARCHAR(30) DEFAULT 'PENDING',-- 'PENDING', 'SUCCESS', 'FAILED', 'EXPIRED'
    gateway_response JSONB,
    paid_at TIMESTAMPTZ,
    created_by INT REFERENCES admin_users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction ON payments(transaction_code);

CREATE TABLE IF NOT EXISTS transactions (
    id BIGSERIAL PRIMARY KEY,
    payment_id INT REFERENCES payments(id),
    booking_id INT NOT NULL REFERENCES bookings(id),
    type VARCHAR(30) NOT NULL,           -- 'PAYMENT', 'REFUND', 'PENALTY_FEE', 'RECONCILIATION_ADJUSTMENT'
    amount NUMERIC(14, 2) NOT NULL,
    balance_after NUMERIC(14, 2),
    gateway VARCHAR(50),
    status VARCHAR(30) DEFAULT 'COMPLETED',
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refunds (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    booking_id INT NOT NULL REFERENCES bookings(id),
    payment_id INT REFERENCES payments(id),
    requested_by_customer_id INT REFERENCES customers(id),
    requested_amount NUMERIC(14, 2) NOT NULL,
    cancellation_fee NUMERIC(14, 2) DEFAULT 0,
    actual_refund_amount NUMERIC(14, 2) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'REQUESTED', -- 'REQUESTED', 'APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED'
    approved_by INT REFERENCES admin_users(id),
    approved_at TIMESTAMPTZ,
    processed_at TIMESTAMPTZ,
    refund_gateway_tx_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    invoice_number VARCHAR(50) NOT NULL UNIQUE, -- Electronic VAT invoice serial: e.g. '1C26T-0004921'
    booking_id INT NOT NULL REFERENCES bookings(id),
    buyer_company_name VARCHAR(200),
    buyer_tax_code VARCHAR(50),
    buyer_address TEXT,
    buyer_email VARCHAR(100) NOT NULL,
    subtotal NUMERIC(14, 2) NOT NULL,
    vat_rate NUMERIC(5, 2) DEFAULT 8.0, -- Standard Vietnam VAT rate for air travel (8% or 10%)
    vat_amount NUMERIC(14, 2) NOT NULL,
    total_amount NUMERIC(14, 2) NOT NULL,
    invoice_pdf_url VARCHAR(255),
    digital_signature TEXT,
    status VARCHAR(30) DEFAULT 'ISSUED', -- 'DRAFT', 'ISSUED', 'CANCELLED', 'REPLACED'
    issued_by INT REFERENCES admin_users(id),
    issued_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

-- ==============================================================================
-- 8. CMS, SYSTEM SETTINGS & NOTIFICATION LOGS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS cms_content (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(150) NOT NULL UNIQUE,
    content_type VARCHAR(50) NOT NULL,  -- 'BANNER', 'NEWS', 'FAQ', 'POLICY', 'TERMS'
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    body TEXT,
    featured_image_url VARCHAR(255),
    locale VARCHAR(10) DEFAULT 'vi',    -- 'vi', 'en'
    position_order INT DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    created_by INT REFERENCES admin_users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications_log (
    id BIGSERIAL PRIMARY KEY,
    recipient VARCHAR(100) NOT NULL,    -- Email or Phone number
    channel VARCHAR(20) NOT NULL,       -- 'EMAIL', 'SMS', 'ZALO_ZNS'
    template_name VARCHAR(100) NOT NULL,-- 'ETICKET_CONFIRMATION', 'FLIGHT_DELAY_ALERT', 'REFUND_SUCCESS'
    subject VARCHAR(255),
    payload JSONB,
    status VARCHAR(30) DEFAULT 'SENT',  -- 'QUEUED', 'SENT', 'FAILED'
    error_message TEXT,
    sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_by INT REFERENCES admin_users(id),
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 9. INITIAL SYSTEM CONFIGURATION
-- ==============================================================================

INSERT INTO system_settings (key, value, description) VALUES
('SEAT_HOLD_TIMEOUT_MINUTES', '15', 'Thời gian giữ chỗ tạm thời cho khách khi đang thanh toán (phút)'),
('DYNAMIC_PRICING_ENABLED', 'true', 'Bật/tắt thuật toán tối ưu giá tự động theo nhu cầu'),
('VAT_RATE_PERCENT', '8.0', 'Tỷ lệ thuế GTGT hàng không tiêu chuẩn'),
('GDS_PROVIDER_MODE', 'MOCK_SANDBOX', 'Chế độ cổng kết nối Amadeus/Sabre: MOCK_SANDBOX hoặc LIVE_PRODUCTION')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
