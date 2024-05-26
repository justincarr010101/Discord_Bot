const { useQueue } = require("discord-player");

// stop.js
module.exports = {
    name: 'stop',
    description: 'Stop playback',
    execute(message, args) {
        // Logic for stopping playback

        const queue = useQueue(message.guild);
        if(queue){
            queue.delete();
            message.channel.send('Stopping playback...');
        }else{
            message.channel.send('No Playback Found');
        }        
    },
};
