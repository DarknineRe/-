const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
};

const dbName = process.env.DB_NAME || 'agricultural_db';

const pool = mysql.createPool({
    ...dbConfig,
    database: dbName,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Initialize database tables
async function initializeDatabase() {
    try {
        // First, create the database if it doesn't exist
        const setupConnection = await mysql.createConnection(dbConfig);
        await setupConnection.execute(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
        console.log(`✅ Database '${dbName}' created/verified.`);
        await setupConnection.end();

        // Now connect to the database and create tables
        const connection = await pool.getConnection();
        
        // Create users table
        await connection.execute(`CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'farmer',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        
        // Create products table
        await connection.execute(`CREATE TABLE IF NOT EXISTS products (
            id VARCHAR(255) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            category VARCHAR(100) NOT NULL,
            quantity INT NOT NULL,
            unit VARCHAR(50) NOT NULL,
            minStock INT NOT NULL,
            harvestDate VARCHAR(255),
            lastUpdated VARCHAR(255) NOT NULL
        )`);

        // Create schedules table
        await connection.execute(`CREATE TABLE IF NOT EXISTS schedules (
            id VARCHAR(255) PRIMARY KEY,
            cropName VARCHAR(255) NOT NULL,
            category VARCHAR(100) NOT NULL,
            plantingDate VARCHAR(255) NOT NULL,
            harvestDate VARCHAR(255) NOT NULL,
            area DECIMAL(10, 2) NOT NULL,
            estimatedYield DECIMAL(10, 2),
            status VARCHAR(50) NOT NULL,
            notes TEXT
        )`);

        // Create price_history table
        await connection.execute(`CREATE TABLE IF NOT EXISTS price_history (
            id INT AUTO_INCREMENT PRIMARY KEY,
            date VARCHAR(50) NOT NULL,
            cropData JSON NOT NULL
        )`);

        // Create market_prices table (real market data from MOC Thailand API)
        await connection.execute(`CREATE TABLE IF NOT EXISTS market_prices (
            id INT AUTO_INCREMENT PRIMARY KEY,
            date DATE NOT NULL,
            product_id VARCHAR(50) NOT NULL,
            product_name VARCHAR(255),
            min_price DECIMAL(10, 2),
            max_price DECIMAL(10, 2),
            avg_price DECIMAL(10, 2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_date_product (date, product_id)
        )`);

        // Create activity_logs table
        await connection.execute(`CREATE TABLE IF NOT EXISTS activity_logs (
            id VARCHAR(255) PRIMARY KEY,
            action VARCHAR(100) NOT NULL,
            type VARCHAR(50) NOT NULL,
            itemName VARCHAR(255) NOT NULL,
            user VARCHAR(255) NOT NULL,
            timestamp VARCHAR(255) NOT NULL,
            details TEXT NOT NULL
        )`);

        console.log('Database tables created/verified successfully.');

        // Seed initial data
        await seedData(connection);

        connection.release();
    } catch (err) {
        console.error('Error initializing database:', err.message);
        console.error('Full error:', err);
        // Don't throw - let the app continue, pool will connect on first query
    }
}

async function seedData(connection) {
    try {
        // Check if users table is empty
        const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
        
        if (users[0].count === 0) {
            const initialUsers = [
                ["สมชาย เกษตรกร", "farmer@example.com", "password123", "farmer"],
                ["ศรีสมหมาย เกษตรกร", "srisommai@example.com", "password123", "farmer"],
                ["admin", "admin@example.com", "admin123", "admin"]
            ];

            for (const user of initialUsers) {
                await connection.execute(
                    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                    user
                );
            }
            console.log('Seeded users data.');
        }

        // Check if products table is empty
        const [products] = await connection.execute('SELECT COUNT(*) as count FROM products');
        
        if (products[0].count === 0) {
            const initialProducts = [
                ["1", "ข้าวหอมมะลิ", "ข้าว", 1500, "กิโลกรัม", 200, "2026-10-30T00:00:00.000Z", "2026-02-20T00:00:00.000Z"],
                ["2", "มะม่วงน้ำดอกไม้", "ผลไม้", 85, "กิโลกรัม", 30, "2026-03-31T00:00:00.000Z", "2026-02-23T00:00:00.000Z"],
                ["3", "ผักกาดหอม", "ผักสด", 45, "กิโลกรัม", 20, "2026-02-15T00:00:00.000Z", "2026-02-23T00:00:00.000Z"],
                ["4", "มะเขือเทศ", "ผักสด", 120, "กิโลกรัม", 40, "2026-03-25T00:00:00.000Z", "2026-02-22T00:00:00.000Z"],
                ["5", "กล้วยหอม", "ผลไม้", 180, "หวี", 50, "2026-02-10T00:00:00.000Z", "2026-02-21T00:00:00.000Z"],
                ["6", "มันฝรั่ง", "พืชผล", 350, "กิโลกรัม", 100, "2026-03-01T00:00:00.000Z", "2026-02-19T00:00:00.000Z"]
            ];

            for (const product of initialProducts) {
                await connection.execute(
                    'INSERT INTO products (id, name, category, quantity, unit, minStock, harvestDate, lastUpdated) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    product
                );
            }
            console.log('Seeded products data.');
        }

        // Check if schedules table is empty
        const [schedules] = await connection.execute('SELECT COUNT(*) as count FROM schedules');
        
        if (schedules[0].count === 0) {
            const initialSchedules = [
                ["1", "ข้าวหอมมะลิ", "ข้าว", "2026-05-01T00:00:00.000Z", "2026-09-30T00:00:00.000Z", 10, 5000, "planned", "เตรียมพื้นที่และปรับสภาพดินให้พร้อม"],
                ["2", "มะม่วงน้ำดอกไม้", "ผลไม้", "2026-01-15T00:00:00.000Z", "2026-04-30T00:00:00.000Z", 5, 800, "planted", "ดูแลรักษาและให้น้ำสม่ำเสมอ"],
                ["3", "ผักกาดหอม", "ผักสด", "2026-01-10T00:00:00.000Z", "2026-02-20T00:00:00.000Z", 2, 300, "harvested", "เก็บเกี่ยวเสร็จแล้ว คุณภาพดี"]
            ];

            for (const schedule of initialSchedules) {
                await connection.execute(
                    'INSERT INTO schedules (id, cropName, category, plantingDate, harvestDate, area, estimatedYield, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    schedule
                );
            }
            console.log('Seeded schedules data.');
        }

        // Check if price_history table is empty
        const [priceHistory] = await connection.execute('SELECT COUNT(*) as count FROM price_history');
        
        if (priceHistory[0].count === 0) {
            const initialPriceHistory = [
                ["2026-01", JSON.stringify({"ข้าวหอมมะลิ": 25, "มะม่วงน้ำดอกไม้": 55, "ผักกาดหอม": 32, "มะเขือเทศ": 18, "กล้วยหอม": 22})],
                ["2026-02", JSON.stringify({"ข้าวหอมมะลิ": 26, "มะม่วงน้ำดอกไม้": 60, "ผักกาดหอม": 35, "มะเขือเทศ": 20, "กล้วยหอม": 25})],
                ["2026-03", JSON.stringify({"ข้าวหอมมะลิ": 24, "มะม่วงน้ำดอกไม้": 65, "ผักกาดหอม": 30, "มะเขือเทศ": 22, "กล้วยหอม": 28})]
            ];

            for (const price of initialPriceHistory) {
                await connection.execute(
                    'INSERT INTO price_history (date, cropData) VALUES (?, ?)',
                    price
                );
            }
            console.log('Seeded price history data.');
        }
    } catch (err) {
        console.error('Error seeding data:', err.message);
    }
}

// Initialize database on startup
initializeDatabase();

module.exports = pool;
