const { ButtonStyle } = require('discord.js');
const { Player } = require('../blackJackClasses/player.js');
const { ActionRowBuilder , ButtonBuilder } = require('discord.js');
let playerValue;

//set hit or stand buttons
const buttonHit = new ButtonBuilder()
    .setStyle(ButtonStyle.Success)
    .setLabel('Hit')
    .setCustomId('hit');
const buttonStand = new ButtonBuilder()
    .setStyle(ButtonStyle.Danger)
    .setLabel('Stand')
    .setCustomId('stand');
//create row for presenting the buttons
const row = new ActionRowBuilder()
    .addComponents(buttonHit, buttonStand);

class BlackjackGame {
    constructor(message) {
        this.channel = message.channel;
        this.players = []; // Array of Player objects
        this.dealer = new Player(message, 'dealer'); // Create a dealer as a player with a special ID
        this.currentPlayerIndex = 0;
        this.deck = [];
        this.message = message;
    }

    getDealerFirstCard(){
        return this.dealer.hand[0];
    }

    addPlayer(message, playerId) {
        const player = new Player(message, playerId);
        this.players.push(player);
    }

    createDeck() {
        const suits = ['♠', '♣', '♦', '♥'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        this.deck = [];

        suits.forEach(suit => {
            values.forEach(value => {
                this.deck.push(`${value}${suit}`);
            });
        });
    }

    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    dealCard(player) {
        if (this.deck.length === 0) {
            this.createDeck();
            this.shuffleDeck();
        }
        const card = this.deck.pop();
        player.addCard(card);
    }

    startGame(message) {
        this.players.forEach(player => player.resetHand());
        this.dealer.resetHand();
        this.currentPlayerIndex = 0;

        for (let i = 0; i < 2; i++) {
            this.players.forEach(player => this.dealCard(player));
            this.dealCard(this.dealer);
        }

        this.playerTurn(message);
    }

    async playerTurn(message) {

        //check if its currently the dealer first.
        if (this.currentPlayerIndex >= this.players.length) {
            return this.dealerTurn();
        }

        //get current player
        const player = this.players[this.currentPlayerIndex];

        //show them the message and ask if they want to hit or stand
        const newmessage = await message.channel.send({ 
            content : `Dealers Hand: ${this.getDealerFirstCard()} Choose your action: \n Your Hand is: ${player.hand}`,
            components: [row],
        }) .then(newmessage => newmessage.components[0]); 
        
        let hitButton = newmessage.components[0];
        let standButton = newmessage.components[1];

        //wait for the player to choose hit or stand
        this.channel.client.on('interactionCreate', async (button) => {
            setTimeout(() => {
                console.log("A button was clicked bro bro")
                debugger;
                if(button.component.data.id === hitButton.data.id){
                    console.log("hit button")
                    message.channel.send('You chose to hit!', true);
                    this.dealCard(player);
                    playerValue = player.getHandValue();
                    if (playerValue > 21) {
                        //go to next player and ask again
                        message.channel.send(`HAHA @${this.players[this.currentPlayerIndex]}, BUSTED!`);
                        this.currentPlayerIndex++;
                        this.playerTurn();
                    } else {
                        //ask if player wants to hit or stand again
                        this.playerTurn();
                    }
                } else if (button.component.data.id == standButton.data.id){
                    //if player stands then tell them they stood and go next 
                    message.channel.send('You chose to stand!', true);
                    this.currentPlayerIndex++;
                    this.playerTurn();
                }
            }
        )}, "50000"); //50 second timeout
    }

    async dealerTurn() {

        //If dealer is below 17 keep hitting there hand
        while (this.dealer.getHandValue() < 17) {
            this.dealCard(this.dealer);
        }

        //get dealer value, send it, and compare with each players value
        const dealerValue = this.dealer.getHandValue();
        this.message.channel.send(`Dealer's Hand: ${this.dealer.hand.join(', ')} (Value: ${dealerValue})`)

        // Compare dealer hand with each player
        for (const player of this.players) {
            const playerValue = player.getHandValue();
            let result;

            if (playerValue > 21) {
                result = `Player ${player.id} busted with ${playerValue}. Dealer wins.`;
            } else if (dealerValue > 21 || playerValue > dealerValue) {
                player.winBet();
                result = `Player ${player.id} wins with ${playerValue} against dealer's ${dealerValue}. New Balance: ${player.balance}`;
            } else if (playerValue < dealerValue) {
                result = `Player ${player.id} loses with ${playerValue} against dealer's ${dealerValue}. New Balance: ${player.balance}`;
            } else {
                player.tieBet();
                result = `Player ${player.id} ties with dealer at ${playerValue}. New Balance: ${player.balance}`;
            }

            await this.message.channel.send(result);
        }
    }
}

module.exports = { BlackjackGame };