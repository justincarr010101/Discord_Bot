const { MessageAttachment } = require('discord.js');
const nodeHtmlToImage = require('node-html-to-image');
const fs = require('fs');
const {execute:embed} = require("./embed.js");


async function execute(message, args){
    


// const hitOrStandMessage = await this.message.channel.send({ 
//     content : `Dealers Hand: ${this.getDealerFirstCard()} Choose your action: \n ${player.id}'s hand: ${player.hand}`,
//     components: images,
// })


const _htmlTemplate = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <style>
      body {
        font-family: "Poppins", Arial, Helvetica, sans-serif;
        min-height: fit-content;
        width: 422.65px;
        height: 250px;
      }

      .cardImage {
        aspect-ratio: 240/336;
        height: 30px;
      }.d-none
      {
        display:none;
      }.absolute{
        position:absolute;
      }#dealer {
        top: 15px;
        left: 185px;
      }#dealer > img{
        padding: 0 5px;
      }#player1 {
        top: 135px;
        left: 56px;
        transform:rotate(20deg) ;
      }#player1 > img:nth-child(2){
        top: 15px;
        left: 10px;
      }#player2 {
          top: 147px;
          left: 104px;
          transform:rotate(13deg) ;
      }#player2 > img:nth-child(2){
          top: 15px;
          left: 10px;
      }#player3 {
          top: 155px;
          left: 153px;
          transform:rotate(4deg) ;
      }#player3 > img:nth-child(2){
          top: 15px;
          left: 10px;
      }#player4 {
        top: 158px;
        left: 201px;
        transform:rotate(0deg) ;
      }#player4 > img:nth-child(2){
        top: 15px;
        left: 10px;
      }#player5 {
        top: 155px;
        left: 249px;
        transform:rotate(-4deg) ;
      }#player5 > img:nth-child(2){
        top: 15px;
        left: 10px;
      }#player6 {
        top: 147px;
        left: 297px;
        transform:rotate(-13deg) ;
      }#player6 > img:nth-child(2){
        top: 15px;
        left: 10px;
      }#player7 {
        top: 135px;
        left: 345px;
        transform:rotate(-20deg) ;
      }#player7 > img:nth-child(2){
        top: 15px;
        left: 10px;
      }

    </style>
  </head>
  <body>
    <div style="position: relative; min-height: fit-content;">
      
      <img class= "absolute"style="height: 250px;"src ="https://media.istockphoto.com/id/1147481668/vector/black-jack-table-vector-illustration-eps-10-casino.jpg?s=612x612&w=0&k=20&c=SgTDJ-Pv90ZOAUW853CY04Nltn0rVXM1esgD7MQniRw="/> 
      <div class="absolute" id="dealer">
        <source class="cardImage " src="../../deck_of_cards/JH.svg" />
        <img class="cardImage absolute" src="https://img.freepik.com/free-vector/shining-circle-purple-lighting-isolated-dark-background_1441-2396.jpg?size=626&ext=jpg&ga=GA1.1.966395822.1715801130&semt=sph" />
      </div>

      <div class="absolute" id="player1">
        <img class="cardImage " src="../../deck_of_cards/JH.svg" />
        <img class="cardImage absolute" src="../../deck_of_cards/JH.svg" />
      </div>

      <div class="absolute" id="player2">
        <img class="cardImage " src="../../deck_of_cards/JC.svg" />
        <img class="cardImage absolute" src="../../deck_of_cards/JC.svg" />
      </div>

      <div class="absolute" id="player3">
        <img class="cardImage " src="../../deck_of_cards/JC.svg" />
        <img class="cardImage absolute" src="../../deck_of_cards/JC.svg" />
      </div> 
      
      <div class="absolute" id="player4">
        <img class="cardImage " src="../../deck_of_cards/JC.svg" />
        <img class="cardImage absolute" src="../../deck_of_cards/JC.svg" />
      </div>

      <div class="absolute" id="player5">
        <img class="cardImage " src="../../deck_of_cards/JC.svg" />
        <img class="cardImage absolute" src="../../deck_of_cards/JC.svg" />
      </div>

        <div class="absolute" id="player6">
        <img class="cardImage " src="../../deck_of_cards/JC.svg" />
        <img class="cardImage absolute" src="../../deck_of_cards/JC.svg" />
      </div> 
      <div class="absolute" id="player7">
        <img class="cardImage " src="../../deck_of_cards/JC.svg" />
        <img class="cardImage absolute" src="../../deck_of_cards/JC.svg" />
      </div>
    </div> <!-- All Cards Divs -->


  </body>
</html>
`

const images = await nodeHtmlToImage({
    html: _htmlTemplate,
    quality: 100,
    output: './test.jpeg',
    type: 'jpeg',
    puppeteerArgs: {
      args: ['--no-sandbox'],
    },
    encoding: 'buffer',
  })

  console.log(images);
  
  // return message.channel
  // .send({
  //   files: [{
  //     attachment: './test.png',
  //     name: 'file.jpg',
  //   description: 'A description of the file'
  //   }]
  // })
  embed(message,'./test.png');
}
module.exports = {
    name: 'test',
    description: 'test img gen',
    execute 
    };