const { Client, Intents, GatewayIntentBits } = require('discord.js');
const { Player } = require('discord-player');
require('dotenv').config();



module.exports = {
    name: 'play',
    description: 'Play a song in a voice channel',

    async execute(interaction, args) {
        console.log("args are:" + args +"message is:" + interaction );
        const client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages, 
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildVoiceStates] 
        });

        const player = new Player(client);

        // This ensures the client is logged in before attempting to handle commands
        const TOKEN = process.env.TOKEN;
        console.log('Logging in...');
        if (!client.isReady()) await client.login(TOKEN);

        const channel = interaction.member.voice.channel;
        if (!channel) return interaction.reply('You are not connected to a voice channel!');


        const query = interaction.options.getString(args, true); // get the song query from command

        await interaction.deferReply();

        try {
            const result = await player.search(query, {
                requestedBy: interaction.user
            });
            if (result.tracks.length === 0) {
                return interaction.followUp('No results found.');
            }

            const song = result.tracks[0];
            const queue = player.createQueue(channel.guild, {
                metadata: {
                    channel: interaction.channel
                }
            });

            // Verify that the bot can connect to the voice channel
            try {
                if (!queue.connection) await queue.connect(channel);
            } catch {
                queue.destroy();
                return interaction.followUp('Could not join your voice channel!');
            }

            queue.play(song);
            return interaction.followUp(`Now playing **${song.title}**!`);
        } catch (e) {
            console.error(e);
            return interaction.followUp(`Error: ${e.message}`);
        }
    }
};
