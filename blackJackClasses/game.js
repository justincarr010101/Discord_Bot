const { ButtonStyle } = require('discord.js');
const { Player } = require('../blackJackClasses/player.js');
const { ActionRowBuilder , ButtonBuilder } = require('discord.js');
const { execute } = require('../commands/Currency_Commands/getBalance.js');

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
        this.sittingOut = [];
    }

    getDealerFirstCard(){
        return this.dealer.hand[0];
    }

    getPlayer(playerId){
        return this.players.find(player => player.id === playerId);
    }

    addPlayer(message, playerId) {
        const player = new Player(message, playerId);
        this.players.push(player);
    }

    addNoBetPlayer(player){
        sittingOut.push(player);
    }

    resetNoBetPlayers(){
        this.sittingOut = [];
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

    async startGame(message, game) {
        this.players.forEach(player => player.resetHand());
        this.dealer.resetHand();
        this.resetNoBetPlayers();
        this.currentPlayerIndex = 0;

        //call makeBet for each player
        for(const members of this.players){
            await this.makeBet(members, message);
        }

        //set each players hand
        for (let i = 0; i < 2; i++) {
            this.players.forEach(player => this.dealCard(player));
            this.dealCard(this.dealer);
        }

        this.playerTurn();

        //update all players balances, reset hands, go again



    }

    async makeBet(player, message) {
    
        // Send a message prompting the player to enter their bet
        await this.channel.send(`${player.id}, please enter your bet:`);

        return new Promise((resolve, reject) => {
            // Define a filter to ensure only the player's response is collected and it meets the criteria
            const filter = response => {
                if (response.author.username === player.id){
                    return response.author.username === player.id; //&& !isNaN(response.content) && parseInt(response.content) > 0 && parseInt(response.content) <= player.balance;
                }
            }; 
    
            // Create a message collector with the specified filter and a time limit of 30 seconds
            const currentPlayerCollector = this.channel.createMessageCollector({ filter, time: 30000, max: 1 });
    
            // Event listener for when a message is collected
            currentPlayerCollector.on('collect', response => {
                //get the value from response
                const betAmount = parseInt(response); 
                //check if value is greater than 0 and less than or equal to the betters balance
                if (execute(message, [player.id]) >= betAmount && betAmount > 0){player.bet = betAmount}
                this.channel.send(`${player.id} has placed a bet of ${betAmount} chips.`);
                resolve(betAmount);  // Resolve the promise when the bet is placed
            });
    
            // Event listener for when the collector ends (due to timeout or reaching the max number of items)
            currentPlayerCollector.on('end', collected => {
                if (collected.size === 0) {
                    // Handle the case where the player did not respond within the time limit
                    this.channel.send(`${player.id}, you did not enter a valid bet within the time limit, you will miss this round.`);
                    this.addNoBetPlayer(player);
                    resolve();  // Resolve the promise even if the player didn't place a bet
                } 
            });
        });
    }
    

    async playerTurn() {

        //check if its currently the dealer first.
        if (this.currentPlayerIndex >= this.players.length) {
            return this.dealerTurn();
        }

        //get current player
        const player = this.players[this.currentPlayerIndex];

        //show them the message and ask if they want to hit or stand
        const newmessage = await this.message.channel.send({ 
            content : `Dealers Hand: ${this.getDealerFirstCard()} Choose your action: \n Your Hand is: ${player.hand}`,
            components: [row],
        }) .then(newmessage => newmessage.components[0]); 
        
        let hitButton = newmessage.components[0];
        let standButton = newmessage.components[1];

        //wait for the player to choose hit or stand
        this.channel.client.on('interactionCreate', async (button) => {
            setTimeout(() => {
                this.message.channel.send(`${this.players[this.currentPlayerIndex].id}, Timed Out, auto standing`);
                //if player stands then tell them they stood and go next 
                this.currentPlayerIndex++;
                this.playerTurn();
            }, 5000);
            if(button.component.data.id === hitButton.data.id){
                console.log("A button was clicked bro bro")
                console.log("hit button")
                this.message.channel.send('You chose to hit!', true);
                this.dealCard(player);
                playerValue = player.getHandValue();
                if (playerValue > 21) {
                    //go to next player and ask again
                    this.currentPlayerIndex++;
                    this.playerTurn();
                } else {
                    //ask if player wants to hit or stand again
                    this.playerTurn();
                }
            } else if (button.component.data.id == standButton.data.id){
                //if player stands then tell them they stood and go next 
                this.message.channel.send('You chose to stand!', true);
                this.currentPlayerIndex++;
                this.playerTurn();
            }
        });
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

            if(player.id !== "dealer"){
                if (playerValue > 21) {
                    result = `HAHA, ${player.id} busted with ${playerValue}. Dealer wins. You lost: ${player.bet} `;
                } else if (dealerValue > 21 || playerValue > dealerValue) {
                    player.winBet();
                    result = `Congrats, ${player.id} wins with ${playerValue} against dealer's ${dealerValue}. You win: ${player.bet*2}`;
                    player.bet *= 2;
                } else if (playerValue < dealerValue) {
                    //errors out alledgedly 
                    result = `Player ${player.id} loses with ${playerValue} against dealer's ${dealerValue}. You lost: ${player.bet}`;
                } else {
                    player.tieBet();
                    result = `Player ${player.id} ties with dealer at ${playerValue}. No loses`;
                }
                await this.message.channel.send(result);
            }
        }
    }

    async endGame(game){
        console.log("ending game");

        //check if game is a game
        if(game == 'undefined'){
            this.message.send("No current game instance to end.")
            return;
        } else {
            try {
                //clear player hands of this.game
                this.players.forEach(player => {
                    player.resetHand();
                });
                //reset dealer hand
                this.dealer.resetHand();
                //clear player references
                this.players = [];
                this.dealer = null;
                //remove game instance reference
                if(typeof this.BlackjackGame !== 'undefined'){
                    delete this.BlackjackGame;
                }
                console.log("Game and players have been cleaned up.");
            } catch(e) {
                console.log(e);
                this.message.channel.send("Error ending game Instance");
            }
        }
    }
}

module.exports = { BlackjackGame };