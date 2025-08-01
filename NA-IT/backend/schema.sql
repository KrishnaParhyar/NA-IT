-- ======================================================
-- National Assembly Inventory Management System
-- Database Schema
-- ======================================================

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS na_inventory_db;
USE na_inventory_db;

-- 1. users table
-- Stores user credentials and roles (Admin, Operator, Management)
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Operator', 'Management') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. categories table
-- Stores item categories like Desktop, Laptop, RAM, SSD, etc.
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(255) NOT NULL UNIQUE
);

-- 3. departments table
-- Stores department names like IT, HR, etc.
CREATE TABLE departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(255) NOT NULL UNIQUE
);

-- 4. designations table
-- Stores employee designations like "Assistant Director", "Technician", etc.
CREATE TABLE designations (
    designation_id INT AUTO_INCREMENT PRIMARY KEY,
    designation_title VARCHAR(255) NOT NULL UNIQUE
);

-- 5. employees table
-- Stores employee information
CREATE TABLE employees (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_name VARCHAR(255) NOT NULL,
    department_id INT,
    designation_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(department_id),
    FOREIGN KEY (designation_id) REFERENCES designations(designation_id)
);

-- 6. items table
-- Master table for all inventory items
CREATE TABLE items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    serial_number VARCHAR(255) UNIQUE,
    brand VARCHAR(255),
    model VARCHAR(255),
    specifications TEXT,
    vendor VARCHAR(255),
    warranty_period VARCHAR(100),
    date_of_purchase DATE,
    status ENUM('In Stock', 'Issued', 'Out of Stock') NOT NULL DEFAULT 'In Stock',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

-- 7. composite_items table
-- Stores relationships for composite items like desktops
CREATE TABLE composite_items (
    composite_id INT AUTO_INCREMENT PRIMARY KEY,
    desktop_id INT NOT NULL,
    cpu_id INT,
    lcd_id INT,
    keyboard_id INT,
    mouse_id INT,
    speaker_id INT,
    FOREIGN KEY (desktop_id) REFERENCES items(item_id) ON DELETE CASCADE,
    FOREIGN KEY (cpu_id) REFERENCES items(item_id),
    FOREIGN KEY (lcd_id) REFERENCES items(item_id),
    FOREIGN KEY (keyboard_id) REFERENCES items(item_id),
    FOREIGN KEY (mouse_id) REFERENCES items(item_id),
    FOREIGN KEY (speaker_id) REFERENCES items(item_id)
);

-- 8. issuance_logs table
-- Tracks the history of item issuance and returns
CREATE TABLE issuance_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    employee_id INT NOT NULL,
    issue_date DATE NOT NULL,
    return_date DATE,
    status ENUM('Issued', 'Returned') NOT NULL,
    issued_by_user_id INT,
    FOREIGN KEY (item_id) REFERENCES items(item_id),
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
    FOREIGN KEY (issued_by_user_id) REFERENCES users(user_id)
);

-- 9. stock table
-- Tracks the quantity of each item. More useful for fungible items.
CREATE TABLE stock (
    stock_id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    quantity_in_stock INT NOT NULL DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
);

-- 10. audit_logs table
-- Logs significant actions performed by users for security and traceability
CREATE TABLE audit_logs (
    audit_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    item_id INT,
    action_performed VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (item_id) REFERENCES items(item_id)
);

-- 11. item_documents table
-- Stores documents related to inventory items
CREATE TABLE item_documents (
    document_id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_by_user_id INT,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by_user_id) REFERENCES users(user_id)
); 