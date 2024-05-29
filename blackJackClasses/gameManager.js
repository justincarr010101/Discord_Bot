// gameManager.js
const { BlackjackGame } = require('./game.js');

//set variable
let currentGame = null;

//create game
function createGame(message) {
    currentGame = new BlackjackGame(message);
    return currentGame;
}

//give game 
function getGame() {
    return currentGame;
}

//end game
function endGameObject() {
    if (currentGame) {
        currentGame = null;
    }
}

module.exports = { createGame, endGameObject, getGame };