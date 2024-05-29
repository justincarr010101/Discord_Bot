const db2 = require('../../db.js');
db2.getDB();

execute(message, args) {

    // Check if username argument is provided
    if (!args[0]) {
        message.channel.send("Please provide a username.");
        return;
    }
    // Fetch balance from the database
    db2.query('SELECT balance FROM members WHERE Username = $1', [args[0]])
    .then(result => {
        console.log('Query result:', result);
        message.channel.send(`${args[0]} balance is: ${result[0].balance}`);
        // Further processing with anot
    })
    .catch(err => {
        console.error('Error in main function:', err.message);
    });
}

// getBalance.js
module.exports = {
    name: 'balance',
    description: 'Check your balance',
    execute
};
