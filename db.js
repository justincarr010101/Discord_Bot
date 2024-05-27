// Import SQLite module
const channel = "welcome-and-rules";
const { Client } = require('pg');
let client; 
// Initialize PostgreSQL client
async function getDB(){
    initDatabase();
}
function query(queryStr, args) {
    return new Promise((resolve, reject) => {
        if (client) {
            return client.query(queryStr, args)
                .then(res => resolve(res.rows))
                .catch(err => {
                    console.error('Error Querying DB', err.message);
                    reject(err);
                });
        } else {
            reject(new Error('Client is not defined'));
        }
    })
    // if (client) {
    //     return client.query(queryStr, args)
    //         .then(res => res.rows)
    //         .catch(err => {
    //             console.error('Error Querying DB', err.message);
    //             throw err; // Rethrow the error to be handled by the caller if needed
    //         });
    // } else {
    //     return Promise.reject(new Error('Client is not defined'));
    // }
}
async function initDatabase() {
    if (!client){
        client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: false,
        });
        await client.connect();
        console.log('Connected to the database.');
    }
    try {
        // Create table if it does not exist
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS members (
                UserID SERIAL PRIMARY KEY,
                Username VARCHAR(255),
                Balance INTEGER DEFAULT 0
            );
        `;
        await client.query(createTableQuery);
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
    addMember,
    query
};