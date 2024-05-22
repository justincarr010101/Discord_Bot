require('dotenv').config();
const fs = require('fs');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const client = new Client({
     intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates] });

const db = require('./db');
client.commands = new Collection();

// Function to recursively read command files from a directory
const loadCommands = (dir) => {
    const commandFiles = fs.readdirSync(dir).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`${dir}/${file}`);
        client.commands.set(command.name, command);
        console.log(`Loaded command: ${command.name}`);
    }
};

// Load currency commands
loadCommands('./commands/currency_Commands');

// Load music commands
loadCommands('./commands/music_Commands');

// Load random commands
loadCommands('./commands/random_Commands');

// Event listener for message creation
client.on('messageCreate', message => {
    if (!message.content.startsWith('!') || message.author.bot) return; // Check if the user is a bot

    const args = message.content.slice('!'.length).trim().split(/ +/); // Split command into its command
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


const TOKEN = process.env.TOKEN;
debugger;

// Log that the bot is starting up
console.log('Logging in...');
client.login(TOKEN);

// Event listener for bot being ready
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});
