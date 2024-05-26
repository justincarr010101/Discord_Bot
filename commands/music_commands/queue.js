const {useQueue} = require("discord-player");
// queue.js
module.exports = {
    name: 'queue',
    description: 'Add song to Queue',
    execute(message, args) {
        const queue = useQueue(message.guild);
        let j=1;
        if(queue){
            if(queue.getSize() > 0 ){
                message.channel.send("Queue size is: " + queue.getSize());
                const limit = Math.min(5, queue.getSize());    
                for (let i = 0; i< limit; i++){ 
                    const song = queue.tracks.data[i]["title"];
                    const artist = queue.tracks.data[i]["author"];
                    message.channel.send("Queue position: " + j + " " + song + " " + artist);
                    console.log(song + artist);
                    j++;
                }
            }else{
                message.channel.send('No songs found in the queue');
            }
        }else message.channel.send('No songs found in the queue');
    },
};
