const { ButtonStyle } = require('discord.js');
const { Player } = require('../blackJackClasses/player.js');
const { ActionRowBuilder , ButtonBuilder } = require('discord.js');
const { endGameObject } = require('./gameManager.js');

//set needed variables
let playerValue;
let playersHands = [];

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
const hitorstandRow = new ActionRowBuilder()
    .addComponents(buttonHit, buttonStand);
//play again or not buttons
const buttonPlay = new ButtonBuilder()
    .setStyle(ButtonStyle.Success)
    .setLabel('Run it')
    .setCustomId('Run it');
const buttonExit = new ButtonBuilder()
    .setStyle(ButtonStyle.Danger)
    .setLabel('End')
    .setCustomId('End');
//create row for presenting the buttons
const againOrExitRow = new ActionRowBuilder()
    .addComponents(buttonPlay, buttonExit);

class BlackjackGame {
    constructor(message) {
        this.channel = message.channel;
        this.players = []; // Array of Player objects
        this.dealer = new Player(message, 'dealer'); // Create a dealer as a player with a special ID
        this.currentPlayerIndex = 0;
        this.deck = [];
        this.message = message;
        this.sittingOut = [];
        this.started = 0;
    }

    getDealerFirstCard(){
        return this.dealer.hand[0];
    }

    getDealerLastCard(){
        return this.dealer.hand[this.dealer.hand.length-1];
    }

    getPlayer(playerId){
        return this.players.find(player => player.id === playerId);
    }

    addPlayer(message, playerId) {
        const player = new Player(message, playerId);
        this.players.push(player);
    }

    addNoBetPlayer(index){
        this.sittingOut.push(index);
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

    async playAgain(){
        //show them the message and ask if they want to hit or stand
        const againMessage = await this.message.channel.send({ 
            content : `Queue Again?`,
            components: [againOrExitRow],
        }).then(againMessage => againMessage); 
        
        let queueButton = againMessage.components[0].components[0];
        let endButton = againMessage.components[0].components[1];

        return new Promise((resolve, reject) => {
            const queueOrExitCollector = againMessage.createMessageComponentCollector({ componentType: 2, time : 30000});

            queueOrExitCollector.on('collect', (queueInteraction) => {
                if (queueInteraction.component.data.id == queueButton.data.id){
                    queueOrExitCollector.stop();
                    resolve(true);
                } else if (queueInteraction.component.data.id === endButton.data.id){
                    //send message and end game
                    queueOrExitCollector.stop();
                    this.message.channel.send('Gamblers always end before they win, see you next time!', true);
                    resolve(false);
                } 
            });

            queueOrExitCollector.on('end', ender => {
                console.log(queueOrExitCollector.endReason);
                if(queueOrExitCollector.endReason == 'time'){
                    this.message.channel.send('Timeout, see you next time!', true);
                    resolve(false);
                } 
            });
        });         
    }

    async startGame(message) {
        if (this.started == 1){ //using this to ask the players if they want to continue or not
            let again = await this.playAgain();
            console.log(again);
            if (again != true){
                //endgame
                this.endGame();
            }
        } else {
            this.started = 1;
        }

        console.log("HERE");
        this.players.forEach(player => player.resetHand());
        this.dealer.resetHand();
        this.resetNoBetPlayers();
        this.currentPlayerIndex = 0;
        this.sittingOut = [];

        //get each players balance and get their bet 
        for(const members of this.players){
            await members.updateBalance(this.message);
            await this.makeBet(members, message, this.currentPlayerIndex);
        }

        //set each players hand
        for (let i = 0; i < 2; i++) {
            this.players.forEach(player => this.dealCard(player));
            this.dealCard(this.dealer);
        }

        let von;

        do {
            von = await this.playerTurn().then(x => x);
        } while (von);

        //start again after every game if players want to
        this.startGame();
    }

    async makeBet(player, message, playerIndex) {
    
        // Send a message prompting the player to enter their bet
        await this.channel.send(`${player.id}, please enter your bet:`);

        return new Promise((resolve) => {
            // Define a filter to ensure only the player's response is collected and it meets the criteria
            const filter = response => {
                if (response.author.username === player.id){
                    return response.author.username === player.id;
                }
            }; 
    
            // Create a message collector with the specified filter and a time limit of 30 seconds
            const currentPlayerCollector = this.channel.createMessageCollector({ filter, time: 30000, max: 1 });

            // Event listener for when a message is collected
            currentPlayerCollector.on('collect', response => {
                //get the value from response
                const betAmount = parseInt(response); 
                console.log(betAmount);
                console.log(player.balance);
                if (player.balance >= betAmount && betAmount > 0){
                    console.log(player.balance);
                    player.placeBet(betAmount);
                    this.channel.send(`${player.id} has placed a bet of ${betAmount} chips.`);
                    currentPlayerCollector.stop();
                    resolve(betAmount);  // Resolve the promise when the bet is placed
                } else {
                    this.channel.send(`invalid bet ammount: ${betAmount}`);
                    currentPlayerCollector.stop();
                    this.addNoBetPlayer(playerIndex);
                    resolve(betAmount);  // Resolve the promise when the bet is placed
                }
            });
    
            // Event listener for when the collector ends (due to timeout or reaching the max number of items)
            currentPlayerCollector.on('end', collected => {
                if (currentPlayerCollector.endReason == 'time'){
                    if (collected.size === 0) {
                        // Handle the case where the player did not respond within the time limit
                        this.channel.send(`${player.id}, you did not enter a valid bet within the time limit, you will miss this round.`);
                        this.addNoBetPlayer(playerIndex);
                        resolve();  // Resolve the promise even if the player didn't place a bet
                    } 
                } 
            });
        });
    }

    async playerTurn() {
        
        //set skipPlayer bolean so we can skip players sitting out in this round
        let skipPlayer = false;

        if (this.currentPlayerIndex >= this.players.length) { //check if its currently the dealer first.
            return this.dealerTurn();
        } else {
            this.sittingOut.forEach(integer => { //loop through sitting out and check if it holds the index of the current player.
                if(integer == this.currentPlayerIndex){ //If it has the player, skip them they dont have a bet
                    this.currentPlayerIndex++;
                    skipPlayer = true;
                }
            });
        }

        return new Promise(async(resolve, reject) => {

            if (skipPlayer){
                skipPlayer = false;
                return resolve(true);
            }

            //get current player
            const player = this.players[this.currentPlayerIndex];

            //show them the message and ask if they want to hit or stand
            const hitOrStandMessage = await this.message.channel.send({ 
                content : `Dealers Hand: ${this.getDealerFirstCard()} Choose your action: \n ${player.id}'s hand: ${player.hand}`,
                components: [hitorstandRow],
            }).then(hitOrStandMessage => hitOrStandMessage); 
            
            let hitButton = hitOrStandMessage.components[0].components[0];
            let standButton = hitOrStandMessage.components[0].components[1];

            const hitOrStandcollector = hitOrStandMessage.createMessageComponentCollector({ componentType: 2, time: 45000 });

            hitOrStandcollector.on('collect', (interaction) => {
            if (interaction.component.data.id == hitButton.data.id){
                this.dealCard(player);
                playerValue = player.getHandValue();
                console.log("PLAYER VALUE" + playerValue);
                if (playerValue > 21) {
                    //go to next player and ask again
                    this.message.channel.send(`${player.id} BUSTED: ${player.hand}, Value: ${playerValue}`);
                    this.currentPlayerIndex++;
                    hitOrStandcollector.stop();
                    resolve(true);
                } else {
                    //ask if player wants to hit or stand again
                    hitOrStandcollector.stop();
                    resolve(true);
                }
            }else if (interaction.component.data.id == standButton.data.id){
                //if player stands then tell them they stood and go next 
                this.currentPlayerIndex++;
                hitOrStandcollector.stop();
                resolve(true);
            }
            });

            // Event listener for when the collector ends (due to timeout or reaching the max number of items)
            hitOrStandcollector.on('end', collected => {
                if(hitOrStandcollector == 'time'){
                    if (collected.size === 0) {
                        // Handle the case where the player did not respond within the time limit
                        this.channel.send(`${player.id}, Time limit reached, forcing stand;`);
                        this.currentPlayerIndex++;
                        resolve(true);  // Resolve the promise even if the player didn't place a bet
                    } 
                }
            });
        });
    }

    async dealerTurn() {

        if(this.sittingOut.length == this.players.length){ //if all players sitting out then just ask if they wanna play again
            return;
        }

        //show all players Hands before flipping last dealer card
        this.players.forEach(player => {
            playersHands.push(player.id + " " + player.getHandValue())
        });

        playersHands.forEach(String => {
            this.message.channel.send(String);
        });

        //If dealer is below 17 keep hitting there hand
        while (this.dealer.getHandValue() < 17) {
            this.dealCard(this.dealer);
            this.message.channel.send(`Dealer flips a: ${this.getDealerLastCard()}`);
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
                    result = `Congrats, ${player.id} wins with ${playerValue} against dealer's ${dealerValue}. You win: ${player.bet}`;
                    player.winBet();
                } else if (playerValue < dealerValue) {
                    result = `Player ${player.id} loses with ${playerValue} against dealer's ${dealerValue}. You lost: ${player.bet}`;
                    
                } else {
                    result = `Player ${player.id} ties with dealer at ${playerValue}. No loses`;
                    player.tieBet();
                }
                await this.message.channel.send(result);
            }
        }
    }

    //update database with players winnings or loses
    giveWinnings(){
        this.players.forEach(player => {
            player.updateDatabaseBalance();
        });
    }

    async endGame(){

        this.giveWinnings();

        //check if game is a game
        if(this == 'undefined'){
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
                this.sittingOut = null;
                //remove game instance reference
                if(this !== 'undefined'){
                    endGameObject();
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