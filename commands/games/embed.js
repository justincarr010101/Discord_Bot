const {EmbedBuilder}  = require('discord.js');

function execute( message, IMAGEURL, rows ){
    const EMBED = new EmbedBuilder()
    .setTitle("BlackJack Embed")
    .setDescription("Embed updated when game instance is active")
    //.setImage("./test.jpeg") //this has to be publicly accessible.
    .setFields(
        { name: 'Field', value : 'Field 1'},
        { name: 'Field', value : 'Field 1'},
    )
    message.channel.send({embeds: [EMBED]})

    // Create buttons
    const hitButton = new ButtonBuilder()
        .setCustomId('hit')
        .setLabel('Hit')
        .setStyle('PRIMARY');

    const standButton = new ButtonBuilder()
        .setCustomId('stand')
        .setLabel('Stand')
        .setStyle('SECONDARY');

    // Add buttons to an action row
    const actionRow = new ActionRowBuilder()
        .addComponents(hitButton, standButton);

    // Send the message with the embed and action row
    message.channel.send({ embeds: [EMBED], components: [actionRow] });

    // Create input field
    const inputField = new TextInputBuilder()
        .setCustomId('betAmount')
        .setLabel('Enter your bet amount')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('e.g., 50')
        .setRequired(true);

    // Add input field to an action row
    const actionRowInputField = new ActionRowBuilder().addComponents(inputField);

    // Create modal
    const modal = new ModalBuilder()
        .setCustomId('betModal')
        .setTitle('Place Your Bet')
        .addComponents(actionRow);

}

module.exports = {
    name: 'embed',
    description: 'Play blackjack',
    execute,
};