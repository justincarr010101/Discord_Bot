require('dotenv').config();
const fs = require('fs');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const db2 = require('./db.js');
const db = db2.getDB();
const http = require('http');

const client = new Client({
     intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates] });
client.commands = new Collection();

//checking how the player is setup 
const { Player } = require('discord-player');

// this is the entrypoint for discord-player based application
const player = new Player(client, {
    deafenOnJoin: true,
    lagMonitor: 1000,
    ytdlOptions: {
        filter: "audioonly",
        quality: "highestaudio",
        highWaterMark: 1 << 25
  }

});

// Now, lets load all the default extractors, except 'YouTubeExtractor'. You can remove the filter if you want to include youtube.
player.extractors.loadDefault();

// Global error handling
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// WebSocket and network error handling
client.on('sharderror', (error) => {
    console.error('A WebSocket connection encountered an error:', error);
});


client.on('error', (error) => {
    console.error('Client encountered an error:', error);
});

// Event listener for player errors
player.events.on('playerError', (queue, error) => {
    // Ensure queue.metadata is defined and has the channel object
    if (queue.metadata && queue.metadata.channel) {
        queue.metadata.channel.send('An error occurred while playing.');
        console.error('Player Error:', error.message);
    }
    console.error('Player Error:', error.message);
});
player.events.on('playerStart', (queue, track) => {
    // we will later define queue.metadata object while creating the queue
    queue.channel.send(`Started playing **${track.cleanTitle}**!`);
});
// Function to recursively read command files from a directory
const loadCommands = (dir) => {
    const commandFiles = fs.readdirSync(dir).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`${dir}/${file}`);
        client.commands.set(command.name, command);
        console.log(`Loaded command: ${command.name}`);
    }
};

// Load commands from diferent folders
loadCommands('./commands/Currency_Commands');
loadCommands('./commands/music_commands');
loadCommands('./commands/random_Commands');
loadCommands('./commands/games');

// Event listener for message creation
client.on('messageCreate', message => {
    if (!message.content.startsWith('.') || message.author.bot) return; // Check if the user is a bot

    const args = message.content.slice('.'.length).trim().split(/ +/); // Split command into its command
    const commandName = args.shift().toLowerCase(); // Make it lowercase for easier handling

    if (!client.commands.has(commandName)) return; // Check commands collection for command said

    const command = client.commands.get(commandName);
    let argsUsername;
    const guild = message.guild;
    
    for (let i = 0; i < args.length; i++){
        const userId = args[i].replace(/[<@!>]/g, '');
        try {
            const member = guild.members.fetch(userId);
            argsUsername.push(member["[[PromiseResult]]"].user.username);
        } catch (error) {
            console.error('Error fetching user:', error);
            argsUsername.push('Unknown User'); // Handle user not found case
        }
    }

    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('there was an error executing that command.');
    }
});

client.on('guildMemberAdd', member => {
    console.log("guild member joined" + member.user.username );
    // Your code to handle the event goes here

    db2.addMember(member.user.username);  

});

//connection code
const TOKEN = process.env.TOKEN;

// Log that the bot is starting up
console.log('Logging in...');
client.login(TOKEN);

// Event listener for bot being ready
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

//for heroku to be happy
const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello from the Discord bot!\n');
}).listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});