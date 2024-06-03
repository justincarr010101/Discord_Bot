// Import SQLite module
const channel = "welcome-and-rules";
require('dotenv').config();
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
}

async function setMemberBalance(username, balance) {
    return new Promise(async (resolve, reject) =>{
        const updateBalanceQuery = `
        UPDATE members
        SET balance = $1
        WHERE username = $2;
        `;

        const addMember=`INSERT INTO members (balance, Username) VALUES ($1, $2)`;
        const res = await client.query(updateBalanceQuery, [balance, username]);

        if (res.rowCount > 0) {
            console.log(`Set balance for user: ${username} to ${balance}`);
            resolve();
        } else {
            const res2 = await client.query(addMember, [balance, username]);
            if(res2.rowCount > 0 ){
                resolve();
            }else{
                reject();
            }
        }
    });
}
async function initializeMemberBalance(username, balance) {
    try {
        const insertMemberQuery = `
            INSERT INTO members (Username, Balance)
            VALUES ($1, $2)
            ON CONFLICT (Username) DO NOTHING;
        `;
        const res = await client.query(insertMemberQuery, [username, balance]);
        if (res.rowCount > 0) {
            console.log(`Initialized balance for user: ${username}`);
        } else {
            console.log(`User ${username} already exists.`);
        }
    } catch (err) {
        console.error('Error initializing member balance:', err.message);
    }
}
async function initDatabase() {
    if (!client){
        client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: false,
            password: '',
            user: "postgres"
        });
        await client.connect();
        console.log('Connected to the database.');
    }
    try {
        // Create table if it does not exist
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS members (
                UserID SERIAL PRIMARY KEY,
                Username VARCHAR(255) UNIQUE,
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
    query,
    initializeMemberBalance, 
    setMemberBalance
};