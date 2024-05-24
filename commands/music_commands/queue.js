const {useQueue} = require("discord-player");
// queue.js
module.exports = {
    name: 'queue',
    description: 'Add song to Queue',
    execute(message, args) {
        const queue = useQueue(message.guild.id);
        if(queue){
            for (let i = 0; i < queue.tracks.data; i++){ 
                console.log("data = " + queue.tracks.data[i].toString());
                const song = queue.tracks.data[i]["title"];
                const artist = queue.tracks.data[i]["author"];
                message.channel.send(song + "by" + artist);
                console.log(song + artist);
            }
        }else{
            message.channel.send('No queue found');
        }
        
    },
};
