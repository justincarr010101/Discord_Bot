// Import SQLite module
const sqlite3 = require('sqlite3').verbose();
const channel = "welcome-and-rules";


let db;

function initDatabase(){
    db = new sqlite3.Database('./discordDB', (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
        } else {
            console.log('Connected to the database.');
            db.run('CREATE TABLE IF NOT EXISTS members(UserID INTEGER PRIMARY KEY AUTOINCREMENT, Username STRING, balance INTEGER)')
            return db;
        }
    });

    return db;
}

function getDB(){
    if(!db){
        return initDatabase();
    }else{
        return db;
    }
}

function addMember(Username) {
    db.run('INSERT INTO members (Username, balance) VALUES (?, ?)', [Username, 0]);
}

module.exports = {
    initDatabase,
    getDB,
    addMember
};