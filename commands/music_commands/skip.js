// skip.js
const { useQueue } = require("discord-player");

module.exports = {
    name: 'skip',
    description: 'Skip the current song',
    execute(message, args) {
        const queue = useQueue(message.guild);
        if(!queue){
            console.log("issue finding queue");

        }else{
            if (queue.connection && !queue.node) queue.delete();
        }

        queue.node.skip()
        message.channel.send('Skipping the current song...');
    },
};
