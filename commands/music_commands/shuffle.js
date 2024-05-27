const { useQueue, enableShuffle, disableShuffle } = require("discord-player");


function shuffleState(queue, state, dynamic = ""){
    if(state === true){
        if (dynamic !== ""){
            queue.enableShuffle(false);
        }else{
            queue.enableShuffle(true);
        }
        

    }else if(state === false){
        queue.disableShuffle()
    }   

}

// shuffle.js
module.exports = {
    name: 'shuffle',
    description: 'shuffle songs',
    execute(message, args) {
        // Logic for stopping playback
        args = args[0];
        dynamic = args[1] || "";
        const queue = useQueue(message.guild.id);

        if(queue){
           
            if( args === "on" || args === "true"){
                shuffleState(queue, true, dynamic);
                message.channel.send("Dynamic Shuffling enabled");
            }else if (args === "off" || args === "false"){
                shuffleState(queue, false);
                message.channel.send("Shuffling disabled");
            }


        }else{
            if (!queue){
                //create queue if no queue
                queue = player.nodes.create(message.guild.id);
                log("new queue created - shuffling")
            }

            if( args === "on" || args === "true"){
                shuffleState(queue, true, dynamic);
                message.channel.send("Dynamic Shuffling enabled");
            }else if (args === "off" || args === "false"){
                shuffleState(queue, false);
                message.channel.send("Shuffling disabled");
            }
        }        
    },
};