const sqlite3 = require('sqlite3').verbose();

// Open a connection to the SQLite database file
const db = new sqlite3.Database('discordDB');

// getBalance.js
module.exports = {
    name: 'balance',
    description: 'Check your balance',
    execute(message, args) {
        try{
            let balance = db.get('SELECT balance FROM members WHERE Username = ?', [args[0]], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? row.balance : 0);
                }
            });
            message.channel.send(args[0] + " balance is: " + balance );
        }catch(e){
            console.log(e);
            message.channel.send("Some error occured.");
        }
    },
};

