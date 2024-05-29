const { Client, Intents, GatewayIntentBits } = require('discord.js');
const { execute } = require('../commands/Currency_Commands/getBalance.js');

//player class for each player
class Player {
    constructor(message, id) {
        this.id = id; // Player's ID
        this.hand = []; // Player's hand of cards
        if (this.id !== 'dealer') {
            this.balance = execute(message, [this.id]); // Player's balance
        }
        this.bet = 0; // Player's current bet
        this.winings = 0;
    }

    addCard(card) {
        this.hand.push(card);
    }

    getHandValue() {
        let value = 0;
        let aces = 0;

        value, aces += this.hand.forEach(card => {
            card = card.slice(0, -1);
            if (card === 'A') {
                aces += 1;
                value += 11;
            } else if (['K', 'Q', 'J'].includes(card)) {
                value += 10;
            } else {
                value += parseInt(card);
            }
            return {value, aces};
        });

        while (value > 21 && aces > 0) {
            value -= 10;
            aces -= 1;
        }
        console.log(value);
        return value;
    }

    resetHand() {
        this.hand = [];
        this.bet = 0;
    }

    placeBet(amount) {
        if (amount <= this.balance) {
            this.balance -= amount;
            this.bet = amount;
            return true;
        } else {
            return false;
        }
    }

    winBet() {
        console.log(this.player.id + this.player.bet);
        this.balance += this.bet * 2;
        this.bet = 0;
    }

    tieBet() {
        console.log(this.player.id + this.player.bet);
        this.balance += this.bet;
        this.bet = 0;
    }
}

module.exports = { Player };