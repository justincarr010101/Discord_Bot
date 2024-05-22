// getBalance.js
module.exports = {
    name: 'balance',
    description: 'Check your balance',
    execute(message, args) {
        // Logic for checking user's balance
        message.channel.send('Checking your balance...');
    },
};