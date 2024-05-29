const { Client } = require('pg');

// Open a connection to the SQLite database file
const db2 = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: false,
    password: "",
    user: "postgres"
});
db2.connect();
console.log('Connected to the database.');

// Execute the INSERT query
db2.query('INSERT INTO members (Username, balance) VALUES ($1, $2)', ['justincarr', 100000], function(err) {
    if (err) {
        return console.error(err.message);
    }
    console.log('Row inserted successfully!');
});

