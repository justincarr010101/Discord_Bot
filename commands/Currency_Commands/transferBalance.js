const { ERROR } = require('sqlite3');
const db2 = require('../../db.js');
const db = db2.getDB();



function getBalance(username){
    db.get('SELECT balance FROM members WHERE Username = ?', username, (err, row) => {
        if (err) {
            console.log(err);
        } else {
            if(row){
                console.log(row)
                console.log(username + "found");
                console.log("Balance:", row.balance);
                return row
            }else{
                console.log("party does not exist");
                
                //message.channel.send("You're not in the database idiot");
            }
        }
    });
}


function getBalance2(username){
    db.get('SELECT balance FROM members WHERE Username = ?', username, (err, row) => {
        if (err) {
            console.log(err);
        } else {
            if(row){
                console.log(username + "found");
                console.log("Balance:", row.balance);
                return row
            }else{
                console.log("party does not exist");
                // db.run('INSERT INTO members (Username, balance) VALUES (?, ?)', [username, 0], function(err) {
                //     if (err) {
                //         return console.error(err.message);
                //     }
                //     console.log('Row inserted successfully!');
                // });
                
                return null;
            }
        }
    });
}



async function execute(message, args) {
    let balanceuser1;
    console.log(message.author.username);
    try{
       
        balanceuser1= getBalance(message.author.username);
        balanceuser2= getBalance2(args[1]);
        console.log("baluser2 is:" +balanceuser2);
        if (balanceuser2 === null){
            message.channel.send("you cant send money to nobody retard.");
        }

        
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
}
// transferBalance.js
module.exports = {
    name: 'transfer',
    description: 'Give currency to another user',
    execute
       
};
