const { ActionRowBuilder , 
    ButtonBuilder , 
    ButtonStyle , 
    TextInputBuilder , 
    ModalBuilder ,  
    EmbedBuilder,
    TextInputStyle } = require('discord.js');
const { getHandValue } = require('../../blackJackClasses/player');


function executeEmbed(){
    //make the EmbedMessage
    const embed = new EmbedBuilder()
        .setTitle("BlackJack")
        .setImage('https://img.freepik.com/free-vector/shining-circle-purple-lighting-isolated-dark-background_1441-2396.jpg?size=626&ext=jpg&ga=GA1.1.966395822.1715801130&semt=sph')
        .setDescription('Welcome Players')
        .setFields({ name: 'Players' , value: 'players'})
        
    return embed;
}

function editEmbedDescription(embed, string){
    const newEmbed = EmbedBuilder.from(embed).setDescription(string);
    return newEmbed
}

function editEmbedField(embed, players){
    let valueString = '';
    let i = 1;
    players.forEach(player => {
        valueString += `P${i}: ${player.id} \n`;
        i++;
    });
    embed.setFields({name : 'Players' , value: valueString});
    return embed
}

function endingEmbedFieldwithString(embed, string){
    embed.setFields({name : 'Players' , value: string});
    return embed
}

function addPlayersValue(embed, players){
    let valueString = '';
    let i = 1;
    players.forEach(player => {
        valueString += `P${i}: ${player.id} (${player.getHandValue()})\n`;
        i++;
    });
    embed.setFields({name : 'Players' , value: valueString});
    return embed
}

function createHitOrStandRow(){
    const hitButton = new ButtonBuilder()
        .setCustomId('hit')
        .setLabel('Hit')
        .setStyle(ButtonStyle.Success)
   
    const standButton = new ButtonBuilder()
        .setCustomId('stand')
        .setLabel('Stand')
        .setStyle(ButtonStyle.Danger) 

    // Add buttons to an action row
    const actionRow = new ActionRowBuilder().addComponents(hitButton, standButton);
        return actionRow
}

function createEndOrAgainRow(){
    const againButton = new ButtonBuilder()
        .setCustomId('again')
        .setLabel('again')
        .setStyle(ButtonStyle.Success)

    const endButton = new ButtonBuilder()
        .setCustomId('end')
        .setLabel('end')
        .setStyle(ButtonStyle.Danger)

    // Add buttons to an action row
    const endOrAgainRow = new ActionRowBuilder().addComponents(againButton, endButton);
    return endOrAgainRow
}

function createInputField(){
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
        .addComponents(actionRowInputField);

    return modal;
}

function startButton(){
    const createModalButton = new ButtonBuilder()
        .setCustomId('Start')
        .setLabel('Start')
        .setStyle(ButtonStyle.Primary);
    
    const modalRow = new ActionRowBuilder().addComponents(createModalButton);
    return modalRow
}

function createBetButton(){
    const createModalButton = new ButtonBuilder()
        .setCustomId('Bet')
        .setLabel('Enter Bet')
        .setStyle(ButtonStyle.Secondary);
    
    const betButtonRow = new ActionRowBuilder().addComponents(createModalButton);
    return betButtonRow
}

module.exports = {
    name: 'embed',
    description: 'Play blackjack',
    executeEmbed,
    editEmbedDescription,
    createEndOrAgainRow,
    createHitOrStandRow,
    createInputField,
    startButton,
    createBetButton,
    editEmbedField,
    addPlayersValue,
    endingEmbedFieldwithString
};