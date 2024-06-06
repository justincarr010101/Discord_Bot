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
    createImageAttachment,
    updateImageAttachment } = require('../commands/games/embededMessage.js');
let currentBet = 0;
let dealerFlipHolder = '';
let playersWithZeroBalanceCount = 0;

class BlackjackGame {
    constructor(message, endGameCallback) {
        this.channel = message.channel;
        this.players = []; // Array of Player objects
        this.dealer = new Player(message, 'dealer'); // Create a dealer as a player with a special ID
        this.currentPlayerIndex = 0;
        this.deck = [];
        this.message = message;
        this.results = '';
        this.sittingOut = [];
        this.started = 0;
        this.currentImageAttachment = createImageAttachment();
        this.endGameCallback = endGameCallback;
        this.embedInstance = executeEmbed();
        this.hitorStandRow = createHitOrStandRow() 
        this.EndorAgainRow = createEndOrAgainRow()
        this.startButton = startButton();
        this.betButton = createBetButton()
        this.modal = createInputField();
        this.currentEmbedMessage  = null;
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
                        interaction.deferUpdate();
                        resolve(true)
                    }
                } else {
                    this.embedInstance = editEmbedDescription(this.embedInstance , `Must be a player to start the game`);
                    await this.currentEmbeddedMessage.setDescription( `Must be a player to start the game`);
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

        await this.currentEmbeddedMessage.edit({ embeds: [this.embedInstance] , components : [this.EndorAgainRow]});

        return new Promise((resolve) => {
            const queueOrExitCollector = this.currentEmbeddedMessage.createMessageComponentCollector({ componentType: 2, time : 30000});

            queueOrExitCollector.on('collect', (queueInteraction) => {
                //if(queueInteraction.user.username == player.id){ 
                    if (this.players.some(player => player.id === queueInteraction.user.username) && queueInteraction.component.data.custom_id == 'again'){
                        queueOrExitCollector.stop();
                        queueInteraction.deferUpdate();
                        resolve(true);
                    } else if (this.players.some(player => player.id === queueInteraction.user.username) && queueInteraction.component.data.custom_id === 'end'){
                        //send message and end game
                        queueOrExitCollector.stop();
                        //this.message.channel.send('Gamblers always end before they win, see you next time!', true);
                        queueInteraction.deferUpdate();
                        resolve(false);
                    } 
                //}
            });

            queueOrExitCollector.on('end', ender => {
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
        try{
            return new Promise(async (resolve) => {
                const submitted = await Interaction.awaitModalSubmit({
                    time: 20000,
                })

                if (submitted) {
                    let player = this.players[this.currentPlayerIndex] 
                    let betAmount = submitted.fields.getTextInputValue('betAmount');
                    await submitted.deferUpdate();
                    currentBet = await this.checkPlayerBet(betAmount, player );
                    if (currentBet == 0){
                        this.addNoBetPlayer(this.currentPlayerIndex);
                        resolve(true)
                    } 
                    player.bet = betAmount;
                    resolve(true);
                } else {
                    this.addNoBetPlayer(this.currentPlayerIndex);
                }
            });
        } catch (error) {
            if (error.name === 'Error' && error.message.includes('time')) {
                console.log("Modal submission timed out");
            } else {
                console.error("An unexpected error occurred:", error);
            }
            this.addNoBetPlayer(this.currentPlayerIndex);
            resolve(false);
        }

    }

    async checkPlayerBet(betAmount, player){
        if(player.balance >= betAmount && betAmount > 0){
            player.bet = betAmount;
            return betAmount
        } else {
            this.addNoBetPlayer(this.currentPlayerIndex);
            return 0
        }
    }

    async startGame(message) {
        if (this.started == 1){ //using this to ask the players if they want to continue or not
            let again = await this.playAgain();
            console.log(again);
            if (again != true){
                //endgame
                this.endGame("Chose not to play again, Ending Game. Goodbye!");
                return;
            }
        }

        this.players.forEach(player => player.resetHand());
        this.dealer.resetHand();
        this.resetNoBetPlayers();
        this.currentPlayerIndex = 0;
        this.sittingOut = [];

        //set the embed with the current players for the field 
        this.embedInstace = editEmbedField(this.embedInstance, this.players, this.message);

        // Send the welcome Embed
        if(this.currentEmbeddedMessage == null){
            this.currentEmbeddedMessage = await message.channel.send({ embeds: [this.embedInstance] , components : [this.startButton]});
        } else {
            await this.currentEmbeddedMessage.edit({ embeds: [this.embedInstance] , components : [this.startButton]});
        }
        
        //wait for the player to click start
        if (this.started !== 1){
            await this.getStartInteraction(this.players)
            this.started = 1;
        }

        //if they clicked start in the time limit then get their bets
        if (this.started == 1){
            for(const [index, members] of this.players.entries()){
                await members.updateBalance(this.message);
                let check = await this.makeBet(members, index);
                if (check) {
                    await this.getModalSubmission(check);
                }
            }
        } else {
            //No one started the game so end the game and clear everything
            //message.channel.send("Game Ended due to timeout");
            this.endGame("Game Ended due to timeout");
        }

        //check if all players have balance of zero 
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].balance == 0){
                playersWithZeroBalanceCount++;
            }
        }

        if (playersWithZeroBalanceCount == this.players.length){
            return this.endGame('Insufficients fund to bet, set balances. Ending Game');
        }
        playersWithZeroBalanceCount = 0;
        
        //set each players hand
        for (let i = 0; i < 2; i++) {
            this.players.forEach(player => this.dealCard(player));
            this.dealCard(this.dealer);
        }

        //change embed to have player values and bet 
        this.embedInstace = addPlayersValue(this.embedInstance, this.players);
        await this.currentEmbeddedMessage.edit({ embeds: [this.embedInstance] , components : [this.startButton]});
        
        for (let i = 0; i < this.players.length;  i++){
            if (this.sittingOut.includes(i)) {
                this.players[i].hand = ['1B', '1B'];
            }
        }

        //{dealer: {dealerObject}, player1:{playerObject}, player2:{playerObject})
        let tableplayers = {}
        tableplayers = this.players.map(player => player.hand);
        dealerFlipHolder = this.dealer.hand[1];
        this.dealer.hand[1] = '1B';
        tableplayers.push(this.dealer.hand);
        await takepicture(tableplayers);

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
        await this.currentEmbeddedMessage.edit({ embeds: [this.embedInstance] , components : [this.betButton] }); // , components : [this.betButton]

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

    async newPhoto(){
        let tableplayers = {}
        let hold;
        tableplayers = this.players.map(player => player.hand);
        tableplayers.push(this.dealer.hand);
        return await takepicture(tableplayers);
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
                    if (this.currentPlayerIndex >= this.players.length-1) { //check if its currently the dealer first.
                        
                    }
                    skipPlayer = true;
                }
            });
        }

        return new Promise(async(resolve) => {
            const player = this.players[this.currentPlayerIndex];

            if (skipPlayer ){
                skipPlayer = false;
                return resolve(true);
            } else if (player.hand.length == 2 && player.getHandValue() == 21){
                return resolve(true);
            }
            
            // Edit the current embed and then edit the message with the updated embed
            this.embedInstance = editEmbedDescription(this.embedInstance , `${player.id} Hit or Stand?`);
            this.embedInstance.setImage('attachment://table.jpeg');
            let hitOrStandMessage = await this.currentEmbeddedMessage.edit({ embeds: [this.embedInstance] , components : [this.hitorStandRow] , files : [this.currentImageAttachment] });

            const hitOrStandcollector = hitOrStandMessage.createMessageComponentCollector({ componentType: 2, time: 30000 });

            hitOrStandcollector.on('collect', async(hitorStandInteraction) => {
                if(hitorStandInteraction.user.username == player.id){ 
                    if (hitorStandInteraction.component.data.custom_id == 'hit'){
                        this.dealCard(player);
                        /* ADD CARD TO PLAYERS HAND ON TABLE IMAGE AND RELOAD URL?*/
                        await this.newPhoto();
                        this.currentImageAttachment = await updateImageAttachment(this.currentImageAttachment);
                        let playerValue = player.getHandValue();
                        this.embedInstance = await addPlayersValue(this.embedInstance , this.players);
                        await this.currentEmbeddedMessage.edit({ embeds: [this.embedInstance] , components : [this.hitorStandRow] });
                        if (playerValue > 21) {
                            //go to next player and ask again
                            this.currentPlayerIndex++;
                        } 
                        hitorStandInteraction.deferUpdate();
                        hitOrStandcollector.stop();
                        resolve(true);
                    }else if (hitorStandInteraction.component.data.custom_id == 'stand'){
                        //if player stands then tell them they stood and go next
                        this.currentPlayerIndex++;
                        hitorStandInteraction.deferUpdate();
                        hitOrStandcollector.stop();
                        resolve(true);
                    }
                }
            });

            // Event listener for when the collector ends (due to timeout or reaching the max number of items)
            hitOrStandcollector.on('end', collected => {
                if(hitOrStandcollector == 'time'){
                    if (collected.size === 0) {
                        this.currentPlayerIndex++;
                        resolve(true);  // Resolve the promise even if the player didn't place a bet
                    } 
                }
            });
        });
    }

    async dealerTurn() {

        if(this.sittingOut.length == this.players.length){ //if all players sitting out then just ask if they wanna play again
            console.log("Sitting out error");
            return;

        }

        /* FLIP DEALERS SECOND CARD OVER AND RELOAD URL?*/
        this.dealer.hand[1] = dealerFlipHolder;
        await this.newPhoto();
        this.currentImageAttachment = await updateImageAttachment(this.currentImageAttachment);
        await this.currentEmbeddedMessage.edit({ embeds: [this.embedInstance] , components : [] , files : [this.currentImageAttachment] });
        //If dealer is below 17 keep hitting there hand
        while (this.dealer.getHandValue() < 17) {
            this.dealCard(this.dealer);
        }

        //get dealer value, send it, and compare with each players value
        const dealerValue = this.dealer.getHandValue();
        //console.log(`Dealer's Hand: ${this.dealer.hand.join(', ')} (Value: ${dealerValue})`)

        // Compare dealer hand with each player
        this.results = '';
        for (const [index, player ] of this.players.entries()) {
            if(!this.sittingOut.includes(index)){
                const playerValue = player.getHandValue();

                if(player.id !== "dealer"){
                    if (playerValue > 21) {
                        this.results += `HAHA, ${player.id} busted with ${playerValue}. Dealer wins. You lost: ${player.bet}\n`;
                    } else if (dealerValue > 21 || playerValue > dealerValue) {
                        this.results += `Congrats, ${player.id} wins with ${playerValue} against dealer's ${dealerValue}. You win: ${player.bet}\n`;
                        player.winBet();
                    } else if (playerValue < dealerValue) {
                        this.results += `Player ${player.id} loses with ${playerValue} against dealer's ${dealerValue}. You lost: ${player.bet}\n`;
                    } else if (playerValue == 21 && player.hand.length == 2){
                        player.bet *= 1.25;
                        this.results += `Player ${player.id} BlackJack! You Won: ${player.bet}\n`;
                    } else {
                        this.results += `Player ${player.id} ties with dealer at ${playerValue}. No loses\n`;
                        player.tieBet();
                    }
                    this.embedInstance.setDescription(this.results);
                    await this.newPhoto();
                    this.currentImageAttachment = await updateImageAttachment(this.currentImageAttachment);
                    await this.currentEmbeddedMessage.edit({ embeds: [this.embedInstance] , components : [] , files : [this.currentImageAttachment] });
                }
            }
        }
        this.giveWinnings();
    }

    //update database with players winnings or loses
    async giveWinnings(){
        this.players.forEach(async player => {
            await player.updateDatabaseBalance();
        });
    }

    async endGame(endString){

        this.giveWinnings();
        this.embedInstance.setDescription(endString).setFields();
        await this.currentEmbeddedMessage.edit({ embeds: [this.embedInstance] , components : [] });

        //check if game is a game
        if(this == 'undefined'){
            this.message.send("No current game instance to end.")
            return;
        } else {
            try {
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