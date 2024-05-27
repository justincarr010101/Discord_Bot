const { ERROR } = require('sqlite3');
const db2 = require('../../db.js');
const db = db2.getDB();



function getBalance(username){
    return new Promise((resolve, reject) => {
    db2.query('SELECT balance FROM members WHERE Username = $1', [username])
    .then(rows=> {
        if (rows.length >=1){
            console.log(rows[0]);
            console.log(username + " found");
            console.log("Balance:", rows[0].balance);
            resolve(rows[0].balance);
        }else{
            console.log("party does not exist");
            reject(new Error('Client is not defined'));
        }
    }).catch(err => {
        console.log("party does not exist");
        reject(new Error('Client is not defined'));
    });
    }) 

}


async function execute(message, args) {
    let balanceuser1;
    console.log(message.author.username);
    try{
        balanceuser1 = await getBalance(message.author.username);
        balanceuser2 = await getBalance(args[1]);

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

            db2.query('UPDATE members set balance = balance + $1 WHERE Username = $2', [(args[0] * -1), message.author.username])
            .then(result => {
                if (result) {
                    return db2.query('UPDATE members set balance = balance + $1 WHERE Username = $2', [args[0], args[1]]);
                } else {
                    throw new Error('Error updating balance for the first user.');
                }
            })
            .then(() => {
                message.channel.send("Debts have been paid");
            })
            .catch(err => {
                console.error(err);
                message.channel.send("Error transferring money, check both users exist");
            });

            

        } catch (e) {console.log(e);}
        
    }catch (e){
        message.channel.send("One of users does not exist");
    }
}
// transferBalance.js
module.exports = {
    name: 'transfer',
    description: 'Give currency to another user',
    execute
       
};
