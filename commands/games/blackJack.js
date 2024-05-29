//get player and game class
const { Player } = require('../../blackJackClasses/player.js');
const { BlackjackGame } = require('../../blackJackClasses/player.js');
const { getGame, createGame } = require('../../blackJackClasses/gameManager.js');

//create variables for managing architecture
const { Client, GatewayIntentBits, MessageEmbed, EmbedBuilder } = require('discord.js');
const getBalance = require('../Currency_Commands/getBalance');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
let gamesChannel = '';

//execute function called from export
function execute(message, args){
    //check if the arg is .blackjack end
    if (args[0] == 'stop'){
        //get game instance
        let endGame = getGame();
        //call end function
        endGame(endGame);
    }

    //first get the games channel to make sure we are in the right place
    message.channel = getChannel(message);

    if (getGame() !== null) { //check if there is already a game instance
        message.channel.send('A game is already in progress in games channel.');
    } else { //check all inputs, logic, and start game

        for (const arg of args) { //make sure all argumensts are users and those users are guild members
            const member = message.guild.members.cache.find(m => m.user.username === arg);
            if (!member) {
                message.channel.send(`User ${arg} is not a valid guild member.`);
                return;  // Exit the function if any user is not a valid guild member
            }
        }

        //make new game if valid input
        const game = createGame(message);
        
        if(game){ //add all players to the game
            args.forEach(arg => {
                game.addPlayer(message, arg);
                game.channel.send(`${arg} has joined the game!`);
            });    
            
            console.log(game.sittingOut);

            //use the channel to start the game
            game.startGame(game, message);

        } else {
            message.channel.send('No game in progress. Type `.blackjack` to start a new game.');
        }
    }
}

function getChannel(message){
    // Get the guild (server) object
    const guild = message.guild;
    // Check if the guild is found
    if (guild) {
        // Find the text channel named "blackjack"
        gamesChannel = guild.channels.cache.find(channel => channel.name === 'blackjack');
    } else {
        console.log('Guild not found.');
    }
    return gamesChannel;
}

module.exports = {
    name: 'blackjack',
    description: 'Play blackjack',
    execute
};
