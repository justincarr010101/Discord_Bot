const { Client, Intents, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const { useMainPlayer, useQueue } = require('discord-player');

async function execute(message, args) {
    const player = useMainPlayer();
    const channel = message.member.voice.channel;
    if (!channel) return message.channel.send('You are not connected to a voice channel!'); // make sure we have a voice channel


    queue = useQueue(message.guild);
    if (!queue){
        //create queue if no queue
        queue = player.nodes.create(message.guild); 
    }
    if(queue.node.isPaused()){
        queue.node.resume();
        return message.channel.send("Unpausing...");
    }


    args = args.toString();
    const query = args;

    if(query === "") return message.channel.send("gotta play a song idiot")
    console.log("user searched for: " + query);

    // added for similarity with billboardqueue incase a queue was init
    

    const result = await player.search(query);

    // acquire task entry
    const entry = queue.tasksQueue.acquire();

    // wait for previous task to be released and our task to be resolved
    await entry.getTask();

    // add track(s) (this will add playlist or single track from the result)
    queue.addTrack(result.tracks[0]);

    try {
        // if player node was not previously playing, play a song
        if (!queue.connection) await queue.connect(channel);
        if (queue.isPlaying()) message.channel.send("Queued track: " + result.tracks[0].description);
        if (!queue.isPlaying()) await queue.node.play().then(message.channel.send("Playing: " + result.tracks[0].title + " by " + result.tracks[0].author));
        
    } catch (e) {
        // let's return error if something failed
        return message.channel.send(`Something went wrong: ${e}`);
    }finally {
        // release the task we acquired to let other tasks to be executed
        // make sure you are releasing your entry, otherwise your bot won't
        // accept new play requests
        queue.tasksQueue.release();
    }    
}

module.exports = {
    name: 'play',
    description: 'Play a song in a voice channel',
    execute
};
