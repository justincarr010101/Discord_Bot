// skip.js
module.exports = {
    name: 'skip',
    description: 'Skip the current song',
    execute(message, args) {
        // Logic for skipping the current song
        message.channel.send('Skipping the current song...');
    },
};
