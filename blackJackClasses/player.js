const { returnBalance } = require('../commands/Currency_Commands/getBalance.js');
const { setMemberBalance } = require('../db.js');

//player class for each player
class Player {
    constructor(message, id) {
        this.id = id; // Player's ID
        this.hand = []; // Player's hand of cards
        if (this.id !== 'dealer') {
            this.balance = 0;
        }
        this.bet = 0; // Player's current bet
        this.winings = 0;
        this.message = message;
    }

    addCard(card) {
        this.hand.push(card);
    }

    async updateBalance(message){
        if (this.id !== 'dealer') {
            this.balance = await returnBalance(this.message, [this.id]); // Player's balance
        }
    }

    getHandValue() {
        let value = 0;
        let aces = 0;

        this.hand.forEach(card => {
            let value2 = 0;
            let aces2 = 0;

            card = card.slice(0, -1);
            if (card === 'A') {
                aces2 += 1;
                value2 += 11;
            } else if (['K', 'Q', 'J'].includes(card)) {
                value2 += 10;
            } else {
                value2 += parseInt(card);
            }
            value += value2;
            aces += aces2;
        });

        while (value > 21 && aces > 0) {
            value -= 10;
            aces -= 1;
        }
        //console.log(value);
        return value;
    }

    resetHand() {
        if (this.hand != []){
            this.hand = [];
        }
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

    updateDatabaseBalance(){
        setMemberBalance(this.id, this.balance);
    }

    winBet() {
        this.balance += this.bet * 2;
        this.bet = 0;
    }

    tieBet() {
        this.balance += this.bet;
        this.bet = 0;
    }
    loseBet() {
        this.balance -= this.bet;
        this.bet = 0;
    }
}

module.exports = { Player };