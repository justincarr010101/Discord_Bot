const db2 = require('../../db.js');
const db = db2.getDB();

function fetchAndPrintLeaderboard(message) {
    // Modify the SQL query to include the LIMIT clause
    db2.query('SELECT Username, balance FROM members ORDER BY balance DESC LIMIT 5', [])
    .then(rows => {
        if (rows.length > 0) {
            // Create a response string from the rows
            let response = 'Top 5 Leaderboard:\n';
            rows.forEach((row, index) => {
                response += `${index + 1}. ${row.username} - ${row.balance}\n`;  // Format: 1. Username - Balance
            });
            message.channel.send(response);
        }
    })
    .catch(err => {
        message.channel.send("The leaderboard is currently empty.");
    });
}


// leaderboard.js
module.exports = {
    name: 'leaderboard',
    description: 'Show the currency leaderboard',
    execute(message, args) {
        try{
            fetchAndPrintLeaderboard(message);
        }catch(e){
            message.channel.send("issue getting leaderboard");
        }
        message.channel.send('Displaying the currency leaderboard...');
        
    },
};
