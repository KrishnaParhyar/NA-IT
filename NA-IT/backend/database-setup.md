# Database Setup Guide for NA Inventory System

## Issue: Peripheral devices not showing in UI

The main problem is that the database is not properly configured and the peripheral devices data is not loaded.

## Steps to Fix:

### 1. Install MySQL (if not already installed)
- Download MySQL from: https://dev.mysql.com/downloads/mysql/
- Install with default settings
- Set root password during installation

### 2. Create Database
```sql
CREATE DATABASE na_inventory_db;
USE na_inventory_db;
```

### 3. Run Schema
```bash
cd NA-IT/backend
mysql -u root -p na_inventory_db < schema.sql
```

### 4. Create .env file
Create a file named `.env` in the `NA-IT/backend` directory with:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=PakistanNA@2025
DB_NAME=na_inventory_db
PORT=8080
JWT_SECRET=your_jwt_secret_key_here
```

### 5. Load Peripheral Devices
```bash
cd NA-IT/backend
node add_peripherals.js
```

### 6. Start Backend Server
```bash
cd NA-IT/backend
npm start
```

### 7. Start Frontend
```bash
cd NA-IT/frontend
npm run dev
```

## Expected Result:
After following these steps, peripheral devices should appear in:
- Items page
- Peripheral Devices Modal (in Issuance page)
- Dashboard

## Categories that will be added:
- Mouse, Keyboard, Speaker, Monitor, Headphone
- Webcam, Microphone, Printer, Scanner
- USB Drive, External Hard Drive
- Network Cable, Power Cable, Adapter

## Troubleshooting:
1. If MySQL connection fails, check if MySQL service is running
2. If password issues, try connecting with: `mysql -u root -p`
3. Make sure the database `na_inventory_db` exists before running scripts 