const { Player } = require('discord-player');

module.exports = {
    name: 'play',
    description: 'Play a song in a voice channel',
    async execute(message, args) {
        const player = new Player(message.client);

        const voiceChannel = message.member.voice.channel;
        console.log('Voice Channel:', voiceChannel);

        debugger;
        
        if (!voiceChannel) {
            return message.channel.send('You need to be in a voice channel to play music!');
        }

        const permissions = voiceChannel.permissionsFor(message.client.user);
        debugger;

        if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
            return message.channel.send('I need the permissions to join and speak in your voice channel!');
        }

        try {
            console.log('Arguments for play command:', args.join(' '));
            debugger;
            const queue = player.createQueue(message.guild, {
                metadata: {
                    channel: message.channel
                }
            });

            await queue.connect(voiceChannel);

            const searchResult = await player.search(args.join(' '), {
                requestedBy: message.author
            });

            const track = searchResult.tracks[0];

            if (!track) {
                return message.channel.send(`Track **${args.join(' ')}** not found!`);
            }

            queue.addTrack(track);

            if (!queue.playing) {
                await queue.play();
            }

            message.channel.send(`Playing: **${track.title}**`);
        } catch (error) {
            console.error('Error playing song:', error);
            message.channel.send('An error occurred while playing the song.');
        }
    },
};