const sqlite3 = require('sqlite3').verbose();

// Open a connection to the SQLite database file
const db2 = new sqlite3.Database('discordDB');

// Execute the INSERT query
db2.run('INSERT INTO members (Username, balance) VALUES (?, ?)', ['quickphix.', 2000000], function(err) {
    if (err) {
        return console.error(err.message);
    }
    console.log('Row inserted successfully!');
});

// Close the database connection
db2.close();