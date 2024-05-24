require('dotenv').config();
const fs = require('fs');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const db = require('./db.js');


const client = new Client({
     intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates] });
client.commands = new Collection();

//checking how the player is setup 
const { Player } = require('discord-player');

// this is the entrypoint for discord-player based application
const player = new Player(client);

// Now, lets load all the default extractors, except 'YouTubeExtractor'. You can remove the filter if you want to include youtube.
player.extractors.loadDefault();

// this event is emitted whenever discord-player starts to play a track
// player.events.on('playerStart', (queue, track) => {
//     // we will later define queue.metadata object while creating the queue

// }



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
loadCommands('./commands/currency_Commands');
loadCommands('./commands/music_Commands');
loadCommands('./commands/random_Commands');

// Event listener for message creation
client.on('messageCreate', message => {
    if (!message.content.startsWith('.') || message.author.bot) return; // Check if the user is a bot

    const args = message.content.slice('.'.length).trim().split(/ +/); // Split command into its command
    const commandName = args.shift().toLowerCase(); // Make it lowercase for easier handling

    if (!client.commands.has(commandName)) return; // Check commands collection for command said

    const command = client.commands.get(commandName);

    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('there was an error executing that command.');
    }
});


client.on('guildMemberAdd', member => {

    // Your code to handle the event goes here
    member.send('Welcome to the server! Stay at ur own risk.');

    // Insert the new member's information into the database
    db.addMember(member.user.username, (err, result) => {
        if (err) {
            console.log('Error adding member to the database.');
            return;
        }
        // Send message to a channel
        const channel = client.channels.cache.find(ch => ch.name === 'welcome-and-rules');
        if (channel) {
            channel.send(`${result.username} has been added with an initial balance of ${result.balance}.`);
        }
    });  

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


