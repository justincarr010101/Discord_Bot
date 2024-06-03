const { returnBalance } = require('../commands/Currency_Commands/getBalance.js');
const { Player } = require('../blackJackClasses/player.js');
const { takepicture } = require("../commands/games/pokertable.js");
require('dotenv').config();
process.env.TOKEN
const { executeEmbed,
    editEmbedDescription,
    createEndOrAgainRow,
    createHitOrStandRow,
    createInputField, 
    startButton, 
    editEmbedField,
    createBetButton,
    addPlayersValue,
    endingEmbedFieldwithString } = require('../commands/games/embededMessage.js');
const { Client , MessageEmbed , GatewayIntentBits, ComponentAssertions, InteractionType } = require('discord.js');
const client = new Client({
    intents: [
       GatewayIntentBits.Guilds,
       GatewayIntentBits.GuildMessages, 
       GatewayIntentBits.GuildMembers,
       GatewayIntentBits.GuildPresences,
       GatewayIntentBits.MessageContent,
       GatewayIntentBits.GuildVoiceStates] })
const axios = require('axios');
let currentEmbeddedMessage;
let currentBet;

class BlackjackGame {
    constructor(message, endGameCallback) {
        this.channel = message.channel;
        this.players = []; // Array of Player objects
        this.dealer = new Player(message, 'dealer'); // Create a dealer as a player with a special ID
        this.currentPlayerIndex = 0;
        this.deck = [];
        this.message = message;
        this.sittingOut = [];
        this.started = 0;
        this.endGameCallback = endGameCallback;
        this.embedInstance = executeEmbed();
        this.hitorStandRow = createHitOrStandRow() 
        this.EndorAgainRow = createEndOrAgainRow()
        this.startButton = startButton();
        this.betButton = createBetButton()
        this.modal = createInputField();
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

    getIndex(playerId){
        return this.players.findIndex(player => player.id === playerId);
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
        const suits = ['S', 'C', 'D', 'H'];
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

    async getStartInteraction(){

        //get button Interaction from start button and start the betting
        return new Promise(async(resolve) => {
            // Create a message collector with the specified filter and a time limit of 30 seconds
            const startButtonCollector = this.channel.createMessageComponentCollector({ time: 60000 });

            // Event listener for when a message is collected
            startButtonCollector.on('collect', async (interaction) => {
                if(this.players.some(player => player.id === interaction.user.username)){ 
                    if (interaction.component.data.custom_id == 'Start'){
                        // get each players balance and get their bet 
                        startButtonCollector.stop();
                        resolve(true)
                    }
                } else {
                    this.embedInstance = editEmbedDescription(this.embedInstance , `Must be a player to start the game`);
                    await currentEmbeddedMessage.edit({ embeds: [this.embedInstance]});
                }
            })

            // Event listener for when the collector ends (due to timeout)
            startButtonCollector.on('end', async (collected) => {
                if (startButtonCollector.endReason == 'time'){
                    //no current players started the game
                    resolve(false)
                } 
            });
        });
    }

    async playAgain(){

        await currentEmbeddedMessage.edit({ embeds: [this.embedInstance] , components : [this.EndorAgainRow]});

        return new Promise((resolve, reject) => {
            const queueOrExitCollector = currentEmbeddedMessage.createMessageComponentCollector({ componentType: 2, time : 30000});

            queueOrExitCollector.on('collect', (queueInteraction) => {
                //if(queueInteraction.user.username == player.id){ 
                    if (queueInteraction.component.data.custom_id == 'again'){
                        queueOrExitCollector.stop();
                        resolve(true);
                    } else if (queueInteraction.component.data.id === 'end'){
                        //send message and end game
                        queueOrExitCollector.stop();
                        this.message.channel.send('Gamblers always end before they win, see you next time!', true);
                        resolve(false);
                    } 
                //}
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

    async getModalSubmission(Interaction){
        currentBet = 0;
        console.log("here");
        return new Promise(async (resolve) => {
            const submitted = await Interaction.awaitModalSubmit({
                time: 20000,
            })

            if (submitted) {
                let player = this.players[this.currentPlayerIndex] 
                let betAmount = submitted.fields.getTextInputValue('betAmount');
                await submitted.deferUpdate();
                currentBet = await this.checkPlayerBet(betAmount, player );
                player.bet = betAmount;
                resolve(true);
            } else {
                this.addNoBetPlayer(this.currentPlayerIndex);
            }
        });
        
    }

    async checkPlayerBet(betAmount, player){
        if(player.balance >= betAmount && betAmount > 0){
            player.bet = betAmount;
        } else {
            this.addNoBetPlayer(this.currentPlayerIndex);
        }
    }

    async startGame(message) {
        if (this.started == 1){ //using this to ask the players if they want to continue or not
            let again = await this.playAgain();
            console.log(again);
            if (again != true){
                //endgame
                this.endGame();
                return;
            }
        } else {
            this.started = 1;
        }

        this.players.forEach(player => player.resetHand());
        this.dealer.resetHand();
        this.resetNoBetPlayers();
        this.currentPlayerIndex = 0;
        this.sittingOut = [];

        //set the embed with the current players for the field 
        editEmbedField(this.embedInstance, this.players);

        // Send the welcome Embed
        if(currentEmbeddedMessage == null){
            currentEmbeddedMessage = await message.channel.send({ embeds: [this.embedInstance] , components : [this.startButton]});
        } else {
            await currentEmbeddedMessage.edit({ embeds: [this.embedInstance] , components : [this.startButton]});
        }
       
        let startOrNotFlag = await this.getStartInteraction(this.players)
        if (startOrNotFlag){
            for(const [index, members] of this.players.entries()){
                await members.updateBalance(this.message);
                let check = await this.makeBet(members, index);
                if (check) {
                    let check2 = await this.getModalSubmission(check);
                }
            }
        } else {
            //No one started the game so end the game and clear everything
            message.channel.send("Game Ended due to timeout");
            this.endGame();
        }

        //set each players hand
        for (let i = 0; i < 2; i++) {
            this.players.forEach(player => this.dealCard(player));
            this.dealCard(this.dealer);
        }

        //change embed to have player values
        this.embedInstace = addPlayersValue(this.embedInstance, this.players);
        await currentEmbeddedMessage.edit({ embeds: [this.embedInstance] , components : [this.startButton]});
    
        this.sittingOut.forEach(integer => { //loop through sitting out and check if it holds the index of the current player.
            this.players[this.currentPlayerIndex].hand = ['1B', '1B'];
        })
        //load picture

        //{dealer: {dealerObject}, player1:{playerObject}, player2:{playerObject})
        let tableplayers = {}

        for (const [index, player ] of this.players.entries()){
            tableplayers[`player${index+1}`] = player;
        }
        tableplayers.dealer = this.dealer;

        let gameURL = await takepicture(message,tableplayers);

        let von;
        do {
            von = await this.playerTurn().then(x => x);
        } while (von);

        //start again after every game if players want to
        this.startGame();
    }

    async makeBet(player , playerIndex) {

        // Edit the current embed and then edit the message with the updated embed
        this.embedInstance = editEmbedDescription(this.embedInstance , `${player.id} enter your bet.`);
        await currentEmbeddedMessage.edit({ embeds: [this.embedInstance] , components : [this.betButton] }); // , components : [this.betButton]

        return new Promise((resolve) => {
            // Create a message collector with the specified filter and a time limit of 30 seconds
            const betButtonCollector = this.channel.createMessageComponentCollector({ time: 20000 });

            // Event listener for when a message is collected
            betButtonCollector.on('collect', async (betButtonInteraction) => {
                if(betButtonInteraction.user.username == player.id){ 
                    if (betButtonInteraction.component.data.custom_id == 'Bet'){
                        // Show the modal to the user
                        try{
                            await betButtonInteraction.showModal(this.modal);
                        }catch(e){
                            console.log(e);
                        }
                        betButtonCollector.stop();
                        resolve(betButtonInteraction);
                    }
                }
            });
    
            // Event listener for when the collector ends (due to timeout or reaching the max number of items)
            betButtonCollector.on('end', collected => {
                if (betButtonCollector.endReason == 'time'){
                    this.addNoBetPlayer(playerIndex);
                    resolve(false)
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
        //get current player
        
        //get picture

        return new Promise(async(resolve, reject) => {
            const player = this.players[this.currentPlayerIndex];

            //to check if blackjack
            // if(this.players[this.currentPlayerIndex].getHandValue() == 21 && this.players[this.currentPlayerIndex].hand.length == 2){
            //     skipPlayer = true;
            //     this.players[this.currentPlayerIndex].betAmount *= 1.25;
            //     await this.message.channel.send(`You hit blackjack!\n ${player.id}'s hand: ${player.hand} (${player.getHandValue()})`);
            //     return resolve(true);
            // }

            if (skipPlayer){
                skipPlayer = false;
                return resolve(true);
            }
            
            // Edit the current embed and then edit the message with the updated embed
            this.embedInstance = editEmbedDescription(this.embedInstance , `${player.id} Hit or Stand?`);
            let hitOrStandMessage = await currentEmbeddedMessage.edit({ embeds: [this.embedInstance] , components : [this.hitorStandRow] });

            const hitOrStandcollector = hitOrStandMessage.createMessageComponentCollector({ componentType: 2, time: 45000 });

            hitOrStandcollector.on('collect', async(hitorStandInteraction) => {
                if(hitorStandInteraction.user.username == player.id){ 
                    if (hitorStandInteraction.component.data.custom_id == 'hit'){
                        this.dealCard(player);
                        let playerValue = player.getHandValue();
                        console.log("PLAYER VALUE" + playerValue);
                        if (playerValue > 21) {
                            //go to next player and ask again
                            this.embedInstance = addPlayersValue(this.embedInstance , this.players);
                            await currentEmbeddedMessage.edit({ embeds: [this.embedInstance] , components : [this.hitorStandRow] });
                            this.currentPlayerIndex++;
                            hitOrStandcollector.stop();
                            resolve(true);
                        } else {
                            //ask if player wants to hit or stand again
                            // Edit the current embed and then edit the message with the updated embed
                            this.embedInstance = addPlayersValue(this.embedInstance , this.players);
                            await currentEmbeddedMessage.edit({ embeds: [this.embedInstance] , components : [this.hitorStandRow] });
                            hitOrStandcollector.stop();
                            resolve(true);
                        }
                    }else if (hitorStandInteraction.component.data.custom_id == 'stand'){
                        //if player stands then tell them they stood and go next
                        this.currentPlayerIndex++;
                        hitOrStandcollector.stop();
                        resolve(true);
                    }
                }
            });

            // Event listener for when the collector ends (due to timeout or reaching the max number of items)
            hitOrStandcollector.on('end', collected => {
                if(hitOrStandcollector == 'time'){
                    if (collected.size === 0) {
                        // Handle the case where the player did not respond within the time limit
                        //this.channel.send(`${player.id}, Time limit reached, forcing stand;`);
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
        // this.players.forEach(player => {
        //     playersHands.push(player.id + " " + player.getHandValue())
        // });

        // playersHands.forEach(String => {
        //     this.message.channel.send(String);
        // });

        //If dealer is below 17 keep hitting there hand
        while (this.dealer.getHandValue() < 17) {
            this.dealCard(this.dealer);
            // this.message.channel.send(`Dealer flips a: ${this.getDealerLastCard()}`);
            console.log(`Dealer flips a: ${this.getDealerLastCard()}`)
        }

        //get dealer value, send it, and compare with each players value
        const dealerValue = this.dealer.getHandValue();
        console.log(`Dealer's Hand: ${this.dealer.hand.join(', ')} (Value: ${dealerValue})`)

        // Compare dealer hand with each player
        for (const [index, player ] of this.players.entries()) {
            if(!this.sittingOut.includes(index)){
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
        this.giveWinnings();
    }

    //update database with players winnings or loses
    async giveWinnings(){
        let UpdateString='';
        this.players.forEach(async player => {
            await player.updateDatabaseBalance();
        });
        this.players.forEach(async player => {
            UpdateString += `${player.id}: new balance is ${await returnBalance(this.message , [player.id])} `;
        })
        this.embedInstance = endingEmbedFieldwithString(this.embedInstance , UpdateString);
        await currentEmbeddedMessage.edit({ embeds: [this.embedInstance] , components : [this.hitorStandRow] });
    }

    async endGame(){

        this.giveWinnings();

        //might not work 
        //await currentEmbeddedMessage.delete();

        //check if game is a game
        if(this == 'undefined'){
            this.message.send("No current game instance to end.")
            return;
        } else {
            try {
                //clear player hands of this.game
                // this.players.forEach(player => {
                //     player.resetHand();
                // });
                // //reset dealer hand
                // this.dealer.resetHand();
                //clear player references
                this.players = [];
                this.dealer = null;
                this.sittingOut = null;
                //remove game instance reference
                if(this !== 'undefined'){
                    this.endGameCallback(); //endGameObject()
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