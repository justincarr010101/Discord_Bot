class BlackjackGame {
    constructor(channel) {
        this.channel = channel;
        this.players = []; // Array of Player objects
        this.dealer = new Player('dealer'); // Create a dealer as a player with a special ID
        this.currentPlayerIndex = 0;
        this.deck = [];
    }

    addPlayer(playerId) {
        const player = new Player(playerId);
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

    startGame() {
        this.players.forEach(player => player.resetHand());
        this.dealer.resetHand();
        this.currentPlayerIndex = 0;

        for (let i = 0; i < 2; i++) {
            this.players.forEach(player => this.dealCard(player));
            this.dealCard(this.dealer);
        }

        this.playerTurn();
    }

    async playerTurn() {
        if (this.currentPlayerIndex >= this.players.length) {
            return this.dealerTurn();
        }

        const player = this.players[this.currentPlayerIndex];
        const embed = new MessageEmbed()
            .setTitle(`Player ${player.id}'s Turn`)
            .setDescription(`Dealer's Hand: ${this.dealer.hand[0]} ?\nYour Hand: ${player.hand.join(', ')} (Value: ${player.getHandValue()})\n\nChoose your action: Hit or Stand`);

        const message = await this.channel.send({ embeds: [embed] });

        await message.react('🇭'); // Hit
        await message.react('🇸'); // Stand

        const filter = (reaction, user) => ['🇭', '🇸'].includes(reaction.emoji.name) && user.id === player.id;
        const collector = message.createReactionCollector({ filter, max: 1, time: 60000 });

        collector.on('collect', async (reaction, user) => {
            if (reaction.emoji.name === '🇭') { // Hit
                this.dealCard(player);
                const playerValue = player.getHandValue();
                if (playerValue > 21) {
                    const bustEmbed = new MessageEmbed()
                        .setTitle(`Player ${player.id} Busted!`)
                        .setDescription(`Your Hand: ${player.hand.join(', ')} (Value: ${playerValue})`);
                    await this.channel.send({ embeds: [bustEmbed] });
                    this.currentPlayerIndex++;
                    this.playerTurn();
                } else {
                    const updatedEmbed = new MessageEmbed()
                        .setTitle(`Player ${player.id}'s Turn`)
                        .setDescription(`Dealer's Hand: ${this.dealer.hand[0]} ?\nYour Hand: ${player.hand.join(', ')} (Value: ${playerValue})\n\nChoose your action: Hit or Stand`);
                    await message.edit({ embeds: [updatedEmbed] });
                }
            } else if (reaction.emoji.name === '🇸') { // Stand
                this.currentPlayerIndex++;
                this.playerTurn();
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                this.channel.send(`${player.id}, you did not make a choice in time.`);
                this.currentPlayerIndex++;
                this.playerTurn();
            }
        });
    }

    async dealerTurn() {
        while (this.dealer.getHandValue() < 17) {
            this.dealCard(this.dealer);
        }

        const dealerValue = this.dealer.getHandValue();
        const dealerEmbed = new MessageEmbed()
            .setTitle('Dealer\'s Turn')
            .setDescription(`Dealer's Hand: ${this.dealer.hand.join(', ')} (Value: ${dealerValue})`);

        await this.channel.send({ embeds: [dealerEmbed] });

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

            await this.channel.send(result);
        }
    }
}

module.exports = { BlackjackGame };