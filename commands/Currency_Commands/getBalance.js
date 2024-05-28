const db2 = require('../../db.js');
const db = db2.getDB();

function execute(message, args){
    // Check if username argument is provided
    if (!args[0]) {
        message.channel.send("Please provide a username.");
        return;
    }
    // Fetch balance from the database
    db.get('SELECT balance FROM members WHERE Username = ?', [args[0]], (err, row) => {
        if (err) {
            console.error('Database error:', err.message);
            message.channel.send("An error occurred while retrieving the balance.");
        } else {
            if (row) {
                message.channel.send(`${args[0]} balance is: ${row.balance}`);
                return row.balance;
            } else {
                message.channel.send(`No record found for username: ${args[0]}`);
            }
        }
    });
}

// getBalance.js
module.exports = {
    name: 'balance',
    description: 'Check your balance',
    execute
};
