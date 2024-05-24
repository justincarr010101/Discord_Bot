// pause.js
const { useQueue } = require("discord-player");
module.exports = {
    name: 'pause',
    description: 'Pause Songs',
    execute(message, args) {
        // Logic for stopping playback
        const queue = useQueue(message.guild.id);
        queue.node.setPaused(!queue.node.isPaused());//isPaused() returns true if that player is already paused
        message.channel.send('Pause song...');
    },
};
