const { Client } = require('pg');

// Open a connection to the SQLite database file
const db2 = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: false,
});
db2.connect();
console.log('Connected to the database.');

// Execute the INSERT query
db2.query('INSERT INTO members (Username, balance) VALUES ($1, $2)', ['meatbails', 100]).then(
    console.log("worked")
);

