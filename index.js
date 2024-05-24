require('dotenv').config();
const fs = require('fs');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { log } = require('console');
const client = new Client({
     intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates] });

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./discordDB', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the database.');
    }
});
        
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

// Load commands from diferent folders
loadCommands('./commands/currency_Commands');
loadCommands('./commands/music_Commands');
loadCommands('./commands/random_Commands');

// Event listener for message creation
client.on('messageCreate', message => {
    if (!message.content.startsWith('.') || message.author.bot) return; // Check if the user is a bot

    const args = message.content.slice('.'.length).trim().split(/ +/); // Split command into its command
    const commandName = args.shift().toLowerCase(); // Make it lowercase for easier handling
    console.log(args + " "+commandName + " message" +message);

    

    if (!client.commands.has(commandName)) return; // Check commands collection for command said

    const command = client.commands.get(commandName);

    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('there was an error executing that command.');
    }
});


// Event listener for when a new member joins the server
client.on('guildMemberAdd', member => {

    // Connect to the SQLite database
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('path/to/your/database.db');

    // Your code to handle the event goes here
    member.send('Welcome to the server! Stay at ur own risk.');

    // Insert the new member's information into the database
    db.run('INSERT INTO members (UserID, balance) VALUES (?, ?)', [member.user.username, 0], function(err) {
        message.send(member.user.username);
    });

    // Close the database connection
    db.close();

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
