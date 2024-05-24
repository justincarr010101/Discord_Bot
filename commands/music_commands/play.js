const { Client, Intents, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const { useMainPlayer } = require('discord-player');

module.exports = {
    name: 'play',
    description: 'Play a song in a voice channel',
    execute(message, args) {
        const player = useMainPlayer();
        const channel = message.member.voice.channel;
        if (!channel) return message.reply('You are not connected to a voice channel!'); // make sure we have a voice channel
        const query = args[0];
        
        try {
            const { track } = player.play(channel, query, {
                nodeOptions: {
                    // nodeOptions are the options for guild node (aka your queue in simple word)
                    metadata: message // we can access this metadata object using queue.metadata later on
                }
            });
        
            return message.channel.send(`**${query}** enqueued!`);
        } catch (e) {
            // let's return error if something failed
            return message.channel.send(`Something went wrong: ${e}`);
        }
    }
};
