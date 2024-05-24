// Import SQLite module
const sqlite3 = require('sqlite3').verbose();


function initDatabase(){
    const db = new sqlite3.Database('./discordDB', (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
        } else {
            console.log('Connected to the database.');
            db.run('CREATE TABLE IF NOT EXISTS members(UserID INTEGER PRIMARY KEY AUTOINCREMENT, Username STRING, balance INTEGER,  )')
        }
    });
}



// Event listener for when a new member joins the server
client.on('guildMemberAdd', member => {

    // Your code to handle the event goes here
    member.send('Welcome to the server! Stay at ur own risk.');

    // Insert the new member's information into the database
    db.run('INSERT INTO members (Username, balance) VALUES (?, ?)', [member.user.username, 0], function(err) {
        message.send(member.user.username);
    });

});

// Function to get user balance from the database

// Function to update user balance in the database
function updateBalance(userId, balanceChange) {
    return new Promise((resolve, reject) => {
    
    });
}

module.exports = {
    getBalance,
    updateBalance
};