//player class for each player
class Player {
    constructor(id, initialBalance = 0) {
        this.id = id; // Player's ID
        this.hand = []; // Player's hand of cards
        this.balance = initialBalance; // Player's balance
        this.bet = 0; // Player's current bet
    }

    addCard(card) {
        this.hand.push(card);
    }

    getHandValue() {
        let value = 0;
        let aces = 0;

        this.hand.forEach(card => {
            if (card === 'A') {
                aces += 1;
                value += 11;
            } else if (['K', 'Q', 'J'].includes(card)) {
                value += 10;
            } else {
                value += parseInt(card);
            }
        });

        while (value > 21 && aces > 0) {
            value -= 10;
            aces -= 1;
        }

        return value;
    }

    resetHand() {
        this.hand = [];
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
        this.balance += this.bet * 2;
        this.bet = 0;
    }

    tieBet() {
        this.balance += this.bet;
        this.bet = 0;
    }
}

module.exports = { Player };