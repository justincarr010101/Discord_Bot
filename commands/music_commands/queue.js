const {useQueue} = require("discord-player");
// queue.js
module.exports = {
    name: 'queue',
    description: 'Add song to Queue',
    execute(message, args) {
        const queue = useQueue(message.guild.id);
        let j=1;
        if(queue){
            for (let i = 0; i < 5; i++){ 

                const song = queue.tracks.data[i]["title"];
                const artist = queue.tracks.data[i]["author"];
                message.channel.send("Queue position: " + j + " " + song + " " + artist);
                console.log(song + artist);
                j++;
            }
        }else{
            message.channel.send('No queue found');
        }
        
    },
};
