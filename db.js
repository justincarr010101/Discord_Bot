// Import SQLite module
const channel = "welcome-and-rules";
const { Client } = require('pg');

// Initialize PostgreSQL client
const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // This is important, especially in some deploy environments like Heroku
    }
});

async function initDatabase() {
    try {
        // Establish connection
        await client.connect();
        console.log('Connected to the database.');

        // Create table if it does not exist
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS members (
                UserID SERIAL PRIMARY KEY,
                Username VARCHAR(255),
                Balance INTEGER DEFAULT 0
            );
        `;
        await client.query(createUtilWaryTableQuery);
        console.log('Table is ready.');

    } catch (err) {
        console.error('Error opening database:', err.message);
    }
}

async function addMember(username) {
    try {
        const insertQuery = `
            INSERT INTO members (Username, Balance) 
            VALUES ($1, $2) 
            RETURNING *;
        `;
        const res = await client.query(insertQuery, [username, 0]);
        console.log('Member added:', res.rows[0]);
    } catch (err) {
        console.error('Error inserting new member:', err.message);
    }
}

async function closeDatabase() {
    await client.end();
    console.log('Connection to database has been closed.');
}


module.exports = {
    initDatabase,
    getDB,
    addMember
};