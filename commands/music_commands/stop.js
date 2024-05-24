const { useMainPlayer } = require("discord-player");

// stop.js
module.exports = {
    name: 'stop',
    description: 'Stop playback',
    execute(message, args) {
        // Logic for stopping playback
        player = useMainPlayer();
        player.destroy();
        message.channel.send('Stopping playback...');
    },
};
