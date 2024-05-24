// Import SQLite module
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./discordDB', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the database.');
    }
});

// Event listener for when a new member joins the server
client.on('guildMemberAdd', member => {

    // Your code to handle the event goes here
    member.send('Welcome to the server! Stay at ur own risk.');

    // Insert the new member's information into the database
    db.run('INSERT INTO members (UserID, balance) VALUES (?, ?)', [member.user.username, 0], function(err) {
        message.send(member.user.username);
    });

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