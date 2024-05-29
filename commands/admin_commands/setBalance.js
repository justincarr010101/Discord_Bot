const db2 = require('../../db.js');

// Ensure the database connection is established
db2.getDB();

module.exports = {
    name: 'setbalance',
    description: 'Set the balance for a specific user',
    async execute(message, args) {
        try {
            // Check if both username and balance arguments are provided
            if (args.length < 2) {
                return message.channel.send('Usage: .setbalance <username> <balance>');
            }

            const username = args[0];
            const balance = parseInt(args[1], 10);

            // Check if the balance argument is a valid number
            if (isNaN(balance)) {
                return message.channel.send('Please provide a valid number for the balance.');
            }

            // Set the balance for the specified user
            await db2.setMemberBalance(username, balance)
            .then(()=>message.channel.send(`Set balance for ${username} to ${balance}`))
            .catch(()=>message.channel.send(`User ${username} not found.`));
            
        } catch (error) {
            console.error('Error executing setbalance command:', error);
            message.channel.send('There was an error setting the balance.');
        }
    }
};