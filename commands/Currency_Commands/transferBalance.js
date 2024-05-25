const { ERROR } = require('sqlite3');
const db2 = require('../../db.js');
const db = db2.getDB();



function getBalance(username){
    return new Promise((resolve, reject) => {
        db.get('SELECT balance FROM members WHERE Username = ?', username, (err, row) => {
            if (err) {
                reject(err);
            } else {
                if(row){
                    console.log(username + "found");
                    console.log("Balance:", row.balance);
                    resolve(row.balance);
                }else{
                    console.log("party does not exist");
                    
                    message.channel.send("You're not in the database idiot");
                    reject(new Error("User does not exist"));
                }
            }
        });
    });
}


function getBalance2(username){
    return new Promise((resolve, reject) => {
        db.get('SELECT balance FROM members WHERE Username = ?', username, (err, row) => {
            if (err) {
                reject(err);
            } else {
                if(row){
                    console.log(username + "found");
                    console.log("Balance:", row.balance);
                    resolve(row.balance);
                }else{
                    console.log("party does not exist");
                    
                    message.channel.send("you cant send money to nobody retard.");
                    reject(new Error("User does not exist"));
                }
            }
        });
    });
}
// transferBalance.js
module.exports = {
    name: 'transfer',
    description: 'Give currency to another user',
    execute(message, args) {
        let balanceuser1;
        console.log(message.author.username);
        try{
           
            balanceuser1= getBalance(message.author.username);
            balanceuser2= getBalance2(args[1]);

            
            // check if they have the funds
            console.log(balanceuser1);
            if(args[0] > balanceuser1 || balanceuser1<= 0){
                message.channel.send("Broke ahh bitch, you aint breaded like that.");
                return;
            }
            try{
                // update balance of sending user
                db.run('UPDATE members set balance = balance +?  WHERE Username = ?', [(args[0] *-1), message.author.username]);
                
                // update balance of receving user
                db.run('UPDATE members set balance = balance + ?  WHERE Username = ?', [args[0], args[1]]);
                message.channel.send("debts have been paid");
            } catch (e) {console.log(e);}
            
        }catch (e){
            message.channel.send("you cant send money to nobody retard.");
        }
    },
};
