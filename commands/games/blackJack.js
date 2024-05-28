//get player and game class
const { Player } = require('../../blackJackClasses/player.js');
const { BlackjackGame } = require('../../blackJackClasses/game.js');

//create variables for managing architecture
const { Client, GatewayIntentBits, MessageEmbed, EmbedBuilder } = require('discord.js');
const getBalance = require('../Currency_Commands/getBalance');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const blackjackGames = new Map();
let gamesChannel = '';
let game;

// Create betting variables
const betAmounts = {
    '1️⃣': 100,
    '2️⃣': 200,
    '3️⃣': 300,
    '4️⃣': 400,
    '5️⃣': 500
};


//execute function called from export
function execute(message, args){

    //first get the games channel to make sure we are in the right place
    message.channel = getChannel(message);

    //check if game is alreasy started
    if (game !== undefined && game !== null) {
        message.channel.send('A game is already in progress in games channel.');
    } else {
        //if no game start game and set players using args
        game = new BlackjackGame(message);
        blackjackGames.set(message.channel, game);
        if(game){
            args.forEach(arg => {
                game.addPlayer(message, arg);
                let player = game.getPlayer(arg)
                makeBet(player, message);
                message.channel.send(`${arg} has joined the game!`);

                //set each players balance using SQL later


            });
            
            //use the channel to start the game
            game.startGame(message);

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

async function makeBet(player, message) {
    const embed = new EmbedBuilder()
        .setTitle('Place Your Bet')
        .setDescription('Choose your bet amount:\n1️⃣: 100\n2️⃣: 200\n3️⃣: 300\n4️⃣: 400\n5️⃣: 500');

    const betMessage = await message.channel.send({ embeds: [embed] });

    for (const emoji of Object.keys(betAmounts)) {
        await betMessage.react(emoji);
    }

    const filter = (reaction, user) => Object.keys(betAmounts).includes(reaction.emoji.name) && user.id === player.id;

    const collector = betMessage.createReactionCollector({ filter, max: 1, time: 60000 });

    collector.on('collect', (reaction, user) => {
        const bet = betAmounts[reaction.emoji.name];
        channel.send(`${user.username} placed a bet of ${bet}`);
        // Proceed with the game logic using the bet amount
        
    });

    collector.on('end', collected => {
        if (collected.size === 0) {
            channel.send();
            release();
        }
    });

}

module.exports = {
    name: 'blackjack',
    description: 'Play blackjack',
    execute
};
