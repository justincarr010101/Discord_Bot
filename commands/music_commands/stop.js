// stop.js
module.exports = {
    name: 'stop',
    description: 'Stop playback',
    execute(message, args) {
        // Logic for stopping playback
        message.channel.send('Stopping playback...');
    },
};
