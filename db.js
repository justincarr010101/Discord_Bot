// Import SQLite module
const sqlite3 = require('sqlite3').verbose();

// Connect to SQLite database (or create it if it doesn't exist)
const db = new sqlite3.Database('currency.db');

// Create a table for storing user balances if it doesn't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS balances (
        user_id TEXT PRIMARY KEY,
        balance INTEGER DEFAULT 0
    )`);
});



// Function to get user balance from the database
function getBalance(userId) {
    return new Promise((resolve, reject) => {
        db.get('SELECT balance FROM balances WHERE user_id = ?', [userId], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row ? row.balance : 0);
            }
        });
    });
}

// Function to update user balance in the database
function updateBalance(userId, newBalance) {
    return new Promise((resolve, reject) => {
        db.run('INSERT OR REPLACE INTO balances (user_id, balance) VALUES (?, ?)', [userId, newBalance], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

module.exports = {
    getBalance,
    updateBalance
};