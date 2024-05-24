// Import SQLite module
const sqlite3 = require('sqlite3').verbose();

const channel = "welcome-and-rules";
export function initDatabase(){
    const db = new sqlite3.Database('./discordDB', (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
        } else {
            console.log('Connected to the database.');
            db.run('CREATE TABLE IF NOT EXISTS members(UserID INTEGER PRIMARY KEY AUTOINCREMENT, Username STRING, balance INTEGER,  )')
        }
    });
}

function addMember(username, callback) {
    db.run('INSERT INTO members (Username, balance) VALUES (?, ?)', [username, 0], function(err) {
        if (err) {
            console.error('Error inserting new member:', err.message);
            return callback(err);
        }
        console.log(`${username} has been added to the database.`);
        callback(null, {username, balance: 0});
    });
}

// Event listener for when a new member joins the server

// Function to get user balance from the database

// Function to update user balance in the database

module.exports = {
    initDatabase
};