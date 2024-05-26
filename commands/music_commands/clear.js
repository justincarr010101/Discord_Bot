const { useQueue } = require("discord-player");

// stop.js
module.exports = {
    name: 'clear',
    description: 'clear queue ',
    execute(message, args) {
        // Logic for stopping playback
        const queue = useQueue(message.guild);
        if(queue){
            queue.clear();
            message.channel.send('Clearing queue...');
        }else{
            message.channel.send('No queue found');
        }        
    },
};
