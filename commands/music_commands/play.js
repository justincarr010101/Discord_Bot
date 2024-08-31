const { Client, Intents, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const { useMainPlayer, useQueue } = require('discord-player');

const player = useMainPlayer();

async function execute(message, args) {

    const channel = message.member.voice.channel;

    queue = useQueue(message.guild.id);
    if (!queue){
        //create queue if no queue
        queue = player.nodes.create(message.guild.id); 
    }
    if(queue.node && queue.node.isPaused()){
        queue.node.resume();
        return message.channel.send("Unpausing...");
    }

    args = args.toString();
    const query = args;
    if(query === "") return message.channel.send("gotta play a song idiot")

    console.log("user searched for: " + query);
    if (!channel) return message.channel.send('You are not connected to a voice channel!'); // make sure we have a voice channel
    // await player.play(channel, query, {
    //     nodeOptions: {
    //         metadata: message.channel
    //     }
    // });
    // added for similarity with billboardqueue incase a queue was init
    

    const result = await player.search(query);
    if (!result || !result.tracks || result.tracks.length === 0) {
        return message.channel.send('No tracks found for your query.');
    }

    // acquire task entry
    const entry = queue.tasksQueue.acquire();
    await entry.getTask();

    // add track(s) (this will add playlist or single track from the result)
    await queue.addTrack(result.tracks[0]);
    console.log("Track added to queue: " + result.tracks[0].title);

    if (!queue.connection) {
        console.log("No existing connection, connecting to channel...");
        await queue.connect(channel);
    }
    if (queue.isPlaying()) {
        return message.channel.send("Queued track: " + result.tracks[0].description);
    } else {
        console.log("Queue is not playing, attempting to play...");
        if (queue.node && typeof queue.node.play === 'function') {
            await queue.node.play();
            return message.channel.send("Playing: " + result.tracks[0].title + " by " + result.tracks[0].author);
        } else {
            console.error('queue.node is not initialized or does not have a play method');
            return message.channel.send('Error: Unable to play the track.');
        }
        
    }

    // try {
    //     // if player node was not previously playing, play a song
    //     if (!queue.connection) await queue.connect(channel);
    //     if (queue.isPlaying()) message.channel.send("Queued track: " + result.tracks[0].description);
    //     if (!queue.isPlaying()) await queue.node.play().then(message.channel.send("Playing: " + result.tracks[0].title + " by " + result.tracks[0].author));
        
    // } catch (e) {
    //     // let's return error if something failed
    //     console.log(e);
    //     return message.channel.send(`Something went wrong: ${e}`);
    // }finally {
    //     // release the task we acquired to let other tasks to be executed
    //     // make sure you are releasing your entry, otherwise your bot won't
    //     // accept new play requests
    //     queue.tasksQueue.release();
    // }    
}

module.exports = {
    name: 'play',
    description: 'Play a song in a voice channel',
    execute
};
