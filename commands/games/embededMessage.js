const { ActionRowBuilder , 
    ButtonBuilder , 
    ButtonStyle , 
    TextInputBuilder , 
    ModalBuilder ,  
    EmbedBuilder,
    TextInputStyle,
    AttachmentBuilder } = require('discord.js');
const { getHandValue } = require('../../blackJackClasses/player');
const { returnBalance } = require('../Currency_Commands/getBalance.js');


function executeEmbed(){
    //make the EmbedMessage
    
    const embed = new EmbedBuilder()
        .setTitle("BlackJack")
        .setImage('https://media.istockphoto.com/id/1147481668/vector/black-jack-table-vector-illustration-eps-10-casino.jpg?s=612x612&w=0&k=20&c=SgTDJ-Pv90ZOAUW853CY04Nltn0rVXM1esgD7MQniRw=')
        .setDescription('Welcome Players')
        .setFields({ name: 'Players' , value: 'players'},
        { name : 'Balance' , value : 'Balances'}
        )
        
    return embed;
}

function createImageAttachment(){
    return new AttachmentBuilder('./BlackJackImage/table.jpeg');
}

function updateImageAttachment(attachment){
    return attachment.setFile('./BlackJackImage/table.jpeg');
}

function editEmbedDescription(embed, string){
    const newEmbed = embed.setDescription(string);
    return newEmbed
}

async function editEmbedField(embed, players, message4Embed){
    let valueString = '';
    let balance;
    let balanceString;

    for (let i = 0; i < players.length; i++){
        valueString += `P${i+1}: ${players[i].id} \n`;
        balance = await returnBalance(message4Embed , [players[i].id])
        players[i].balance = balance;
        console.log(balance);
        if (balance >= 1000) {
            balanceString = (balance / 1000).toFixed(2) + "k" + '\n';
        } else {
            balanceString = balance.toString() + '\n';
        }
    }
    embed.setFields({name : 'Players' , value: valueString} , { name : 'Balances' , value : balanceString});
    return embed
}

function addPlayersValue(embed, players){
    let valueString = '';
    let i = 1;
    let betString = '';
    players.forEach(player => {
        valueString += `P${i}: ${player.id} (${player.getHandValue()})\n`;
        betString += `P${i}: ${player.bet}\n`
        i++;
    });
    embed.setFields({name : 'Players' , value: valueString} , { name : 'Bets' , value : betString});
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
    createImageAttachment,
    updateImageAttachment
};