// pause.js
module.exports = {
    name: 'pause',
    description: 'Pause Songs',
    execute(message, args) {
        // Logic for stopping playback
        message.channel.send('Pause song...');
    },
};
