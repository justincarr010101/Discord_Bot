// transferBalance.js
module.exports = {
    name: 'transfer',
    description: 'Give currency to another user',
    execute(message, args) {

        try{
            // get balance of sending user
            let balanceuser1 = db.get('SELECT balance FROM members WHERE Username = ?', [message.author], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? row.balance : 0);
                }
            });
            
            // check if they have the funds
            if(!(args[0] > balanceuser1)){
                message.channel.send("Broke ahh bitch, you aint breaded like that.");
                return;
            }

            // update balance of sending user
            db.run('UPDATE members set balance = balance +?  WHERE Username = ?', [(args[0] * -1), message.author], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
            
            // update balance of receving user
            db.run('UPDATE members set balance = balance + ?  WHERE Username = ?', [args[0], args[1]], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });

            message.channel.send("debts have been paid");
        }catch(e){
            message.channel.send("error");
        }
    },
};
