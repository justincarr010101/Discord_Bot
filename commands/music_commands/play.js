const { Client, Intents, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const { useMainPlayer } = require('discord-player');

async function execute(message, args) {
    const player = useMainPlayer();
    const channel = message.member.voice.channel;
    if (!channel) return message.channel.send('You are not connected to a voice channel!'); // make sure we have a voice channel
    const query = args[0]

    // let's defer the interaction as things can take time to process
    const queue = player.nodes.create(message.guild);
    const result = await player.search(query);

    // acquire task entry
    const entry = queue.tasksQueue.acquire();

    // wait for previous task to be released and our task to be resolved
    await entry.getTask();

    // add track(s) (this will add playlist or single track from the result)
    queue.addTrack(result.tracks[0]);
    message.channel.send(`**${result.tracks[0]}** enqueued!`);

    try {
        // if player node was not previously playing, play a song
        if (!queue.connection) await queue.connect(channel);
        if (!queue.isPlaying()) await queue.node.play();
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
