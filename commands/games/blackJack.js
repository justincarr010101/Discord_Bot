
//create variables for managing architecture
const { Client, GatewayIntentBits, MessageEmbed } = require('discord.js');
const getBalance = require('../Currency_Commands/getBalance');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const gamesChannel = '';

// Create variables for game
const betAmounts = {
    '1️⃣': 100,
    '2️⃣': 200,
    '3️⃣': 300,
    '4️⃣': 400,
    '5️⃣': 500
};
let players = []; //multiple players 
let dealerHand = []; //dealers single hand
let deck = []; //normal 52 card deck
let dealerTurn = false;
let currentPlayerIndex = 0; //keep track of which player we are displaying
//the embed message for

//execute function called from export
function execute(){

    //first get the games channel to make sure we are in the right place
    channel = getChannel();

    //use the channel to start the game
    startGame(channel);

    //
}

function getChannel(wantedChannel){

    // Get the guild (server) object
    const guild = message.guild;
    
    // Check if the guild is found
    if (guild) {
        // Find the text channel named "games"
        gamesChannel = guild.channels.cache.find(channel => channel.name === wantedChannel && channel.type === 'GUILD_TEXT');
        
        // Check if the channel is found
        if (gamesChannel) {
            // Start game in games channel
            makeBet(gamesChannel);
        } else {
            console.log('Games channel not found. Cannot play game without channel');
        }
    } else {
        console.log('Guild not found.');
    }

    return gamesChannel;
}

async function makeBet(player, channel) {
    const embed = new MessageEmbed()
        .setTitle('Place Your Bet')
        .setDescription('Choose your bet amount:\n1️⃣: 100\n2️⃣: 200\n3️⃣: 300\n4️⃣: 400\n5️⃣: 500');

    const betMessage = await channel.send({ embeds: [embed] });

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
            channel.send(`${player.username}, you did not place a bet in time.`);
        }
    });
}



//initialize the deck
function startGame(){

    //create game variables 
    players = [];
    dealerhand = [];
    deck = [];
    currentPlayerIndex = 0;
    dealerTurn = false;

    //make the deck and shuffle it.
    createDeck();
    shuffleDeck();

    //deal cards for all players
    for (let i = 0; i < 2; i++){
        players.forEach(player => dealCard(player.hand)) //deal hand for each player
        dealCard(dealerHand); //deal dealers hand
    } 

    //Start game by calling playerTurn
    playerTurn();

}


// Function to handle player's turn
async function playerTurn(player) {

    //create embed message that will be used to ask hit or stand
    const embed = new MessageEmbed()
        .setTitle(`Player ${player.id}'s Turn`)
        .setDescription(`Dealer's Hand: ${dealerHand[0]} ?\nYour Hand: ${player.hand.join(', ')} (Value: ${getHandValue(player.hand)})\n\nChoose your action: Hit or Stand`);

    //wait for the player to send the embed message
    const message = await player.user.send({ embeds: [embed] });

    //wait for user to react to the embeded message
    await message.react('🇭'); // Hit
    await message.react('🇸'); // Stand

    //collect the reaction and timeout after a minute
    const collector = message.createReactionCollector({
        filter: (reaction, user) => ['🇭', '🇸'].includes(reaction.emoji.name) && user.id === player.id,
        time: 60000 // 1 minute
    });

    //when collected check for hit or stand and deal accordingly
    collector.on('collect', async (reaction, user) => {
        if (reaction.emoji.name === '🇭') { // Hit
            dealCard(player.hand);
            const playerValue = getHandValue(player.hand);
            if (playerValue > 21) { //this player busted
                const bustEmbed = new MessageEmbed()
                    .setTitle(`${player.id} BUSTED BITCHASS!`)
                    .setDescription(`Your Hand: ${player.hand.join(', ')} (Value: ${playerValue})`);
                await player.user.send({ embeds: [bustEmbed] }); //Send busted message
                collector.stop(); //stop collector listener
            } else {
                const updatedEmbed = new MessageEmbed()
                    .setTitle(`Player ${player.id}'s Turn`)
                    .setDescription(`Dealer's Hand: ${dealerHand[0]} ?\nYour Hand: ${player.hand.join(', ')} (Value: ${playerValue})\n\nChoose your action: Hit or Stand`);
                await message.edit({ embeds: [updatedEmbed] });
            }
        } else if (reaction.emoji.name === '🇸') { // Stand
            collector.stop(); //stop collector listener
        }
    });

    //when first players stands of busts go to next player if there is one
    collector.on('end', () => {
        currentPlayerIndex++;
        if (currentPlayerIndex < players.length) {
            playerTurn(players[currentPlayerIndex]);
        } else {
            dealerTurn = true;
            dealerTurn();
        }
    });
}

// Handle the dealers turn after all players bust or stand
async function dealerTurn() {
    // Reveal dealer's hand
    const dealerValue = getHandValue(dealerHand);
    const dealerEmbed = new MessageEmbed()
        .setTitle('Dealer\'s Turn')
        .setDescription(`Dealer's Hand: ${dealerHand.join(', ')} (Value: ${dealerValue})`);

    // Dealer hits until hand value >= 17
    while (dealerValue < 17) {
        dealCard(dealerHand);
        dealerEmbed.setDescription(`Dealer's Hand: ${dealerHand.join(', ')} (Value: ${getHandValue(dealerHand)})`);
    }

    // Determine winner and display result
    const winner = evaluateWinner();
    const resultEmbed = new MessageEmbed()
        .setTitle('Game Result')
        .setDescription(`Dealer's Hand: ${dealerHand.join(', ')} (Value: ${dealerValue})\n\n${winner}`);

    players.forEach(player => player.user.send({ embeds: [resultEmbed] }));
    
    makeBet();
}


function release(players){
    
    //do final update of players balances.
    //deal cards for all players
    for (let i = 0; i < 2; i++){
        //new update function that im waiting to change
        
        
        //display everyones balances
        message.channel = gamesChannel;
        args = players[i].playerID;
        getBalance.execute(args);

    } 
    
    //release any players if we have them?
}


//need to create money system, need to bet something and give or take
//winnings from database

module.exports = {
    name: 'blackjack',
    description: 'Play blackjack',
    execute
};