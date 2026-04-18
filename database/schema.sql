-- =============================================
--  ExpenseIQ — MySQL Database Schema
-- =============================================

CREATE DATABASE IF NOT EXISTS expense_tracker_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE expense_tracker_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100)        NOT NULL,
    email      VARCHAR(150)        NOT NULL UNIQUE,
    password   VARCHAR(255)        NOT NULL,
    created_at DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    title          VARCHAR(200)       NOT NULL,
    description    TEXT,
    amount         DECIMAL(15, 2)     NOT NULL,
    category       VARCHAR(100)       NOT NULL,
    date           DATE               NOT NULL,
    payment_method VARCHAR(100),
    user_id        BIGINT             NOT NULL,
    created_at     DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_expenses_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_expenses_user_id     (user_id),
    INDEX idx_expenses_date        (date),
    INDEX idx_expenses_category    (category),
    INDEX idx_expenses_user_date   (user_id, date),
    INDEX idx_expenses_user_cat    (user_id, category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Budgets table
CREATE TABLE IF NOT EXISTS budgets (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    category     VARCHAR(100)   NOT NULL,
    limit_amount DECIMAL(15, 2) NOT NULL,
    month        TINYINT        NOT NULL CHECK (month BETWEEN 1 AND 12),
    year         SMALLINT       NOT NULL,
    user_id      BIGINT         NOT NULL,
    created_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_budgets_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT uq_budget_user_cat_month UNIQUE (user_id, category, month, year),
    INDEX idx_budgets_user_month (user_id, month, year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- Sample seed data (optional — remove for prod)
-- =============================================

-- Sample user (password: password123 — bcrypt hash)
INSERT IGNORE INTO users (name, email, password) VALUES
('Demo User', 'demo@expenseiq.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lN');

-- Sample expenses for current month
SET @uid = (SELECT id FROM users WHERE email = 'demo@expenseiq.com');
SET @today = CURDATE();
SET @m = MONTH(@today);
SET @y = YEAR(@today);

INSERT IGNORE INTO expenses (title, amount, category, date, payment_method, user_id) VALUES
('Grocery Shopping',   2400.00, 'Food',          DATE_FORMAT(@today, CONCAT('%Y-%m-', '03')), 'UPI',         @uid),
('Metro Pass',          800.00, 'Transport',      DATE_FORMAT(@today, CONCAT('%Y-%m-', '01')), 'UPI',         @uid),
('Netflix Subscription',649.00, 'Entertainment',  DATE_FORMAT(@today, CONCAT('%Y-%m-', '05')), 'Credit Card', @uid),
('Electricity Bill',   1850.00, 'Utilities',      DATE_FORMAT(@today, CONCAT('%Y-%m-', '07')), 'Net Banking', @uid),
('Pharmacy',            540.00, 'Health',         DATE_FORMAT(@today, CONCAT('%Y-%m-', '08')), 'Debit Card',  @uid),
('Restaurant Dinner',  1200.00, 'Food',           DATE_FORMAT(@today, CONCAT('%Y-%m-', '10')), 'Credit Card', @uid),
('Uber Rides',          450.00, 'Transport',      DATE_FORMAT(@today, CONCAT('%Y-%m-', '11')), 'UPI',         @uid),
('Online Course',      3999.00, 'Education',      DATE_FORMAT(@today, CONCAT('%Y-%m-', '02')), 'Credit Card', @uid);

-- Sample budgets
INSERT IGNORE INTO budgets (category, limit_amount, month, year, user_id) VALUES
('Food',          6000.00, @m, @y, @uid),
('Transport',     2000.00, @m, @y, @uid),
('Entertainment', 1500.00, @m, @y, @uid),
('Utilities',     2500.00, @m, @y, @uid),
('Health',        1000.00, @m, @y, @uid),
('Education',     5000.00, @m, @y, @uid);
