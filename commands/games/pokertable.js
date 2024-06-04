const { MessageAttachment } = require('discord.js');
const nodeHtmlToImage = require('node-html-to-image');
const fs = require('fs');
const path = require('path');

const cardsDirectory = path.join(__dirname, '../../deck_of_cards');

function getCardSvg(cardSymbol) {
  return new Promise((resolve, reject) => {
    if(cardSymbol== ""){
      return;
    }
    const filePath = path.join(cardsDirectory, `${cardSymbol.toUpperCase()}.svg`);
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(`Error reading file for card ${cardSymbol}: ${err}`);
      } else {
        resolve(data);
      }
    });
  });
}

async function generateImage(_htmlTemplate){
  const images = await nodeHtmlToImage({
    html: _htmlTemplate,
    quality: 100,
    output: './BlackJackImage/table.jpeg',
    type: 'jpeg',
    puppeteerArgs: {
      executablePath: '/root/.cache/puppeteer/chrome/linux-125.0.6422.78//chrome-linux64/chrome',
      //executablePath: process.env.PUPPETEER_EXECUTABLE_PATH? process.env.PUPPETEER_EXECUTABLE_PATH : false,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      headless: true
      
    },
    encoding: 'buffer',
  })
}

async function takepicture(tableplayers) {
  // Assuming tableplayers is an array of hands where the last element is the dealer's hand
  const dealerHand = tableplayers.pop();

  const playerDivs = await Promise.all(tableplayers.map(async (hand, index) => {
    if (!hand) {
      console.error(`Player at index ${index} has no hand defined.`);
      return '';
    }

    const cards = await Promise.all(hand.map(async (card, cardIndex) => {
      return `
        <div class="cardImage cardWidthAbsolute" style="position: absolute; left: ${8 * cardIndex}px; top: ${15 * cardIndex}px;">
          ${await getCardSvg(card)}
        </div>`;
    }));

    return `
      <div class="absolute" id="player${index + 1}" style="position: absolute; top: ${130 + (index * 12)}px; left: ${60 + (index * 48)}px; transform: rotate(${20 - (index * 6)}deg);">
        ${cards.join('')}
      </div>`;
  }));

  if (!dealerHand) {
    console.error('Dealer has no hand defined.');
    return '';
  }

  const dealerCards = await Promise.all(dealerHand.map(async (card, cardIndex) => {
    return `
      <div class="cardImage cardWidthAbsolute" style="left: ${6 * cardIndex}px;">
        ${await getCardSvg(card)}
      </div>`;
  }));

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
        display: block;
      }
      .absolute {
        position: absolute;
      }
      #dealer {
        top: 15px;
        left: 150px;
        position: absolute;
        display: flex;
      }
      #dealer > div {
        padding: 0 5px;
      }
      </style>
    </head>
    <body>
      <div style="position: relative; min-height: fit-content;">
        <img class="absolute" style="height: 250px;" src="https://media.istockphoto.com/id/1147481668/vector/black-jack-table-vector-illustration-eps-10-casino.jpg?s=612x612&w=0&k=20&c=SgTDJ-Pv90ZOAUW853CY04Nltn0rVXM1esgD7MQniRw="/> 
        <div class="absolute" id="dealer">
          ${dealerCards.join('')}
        </div>
        ${playerDivs.join('')}
      </div>
    </body>
  </html>`;

  //console.log(_htmlTemplate);
  return generateImage(_htmlTemplate);
}


  // const _htmlTemplate = `<!DOCTYPE html>
  // <html lang="en">
  //   <head>
  //     <meta charset="UTF-8" />
  //     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  //     <meta http-equiv="X-UA-Compatible" content="ie=edge" />
  //     <style>
  //     body {
  //       font-family: "Poppins", Arial, Helvetica, sans-serif;
  //       min-height: fit-content;
  //       width: 422.65px;
  //       height: 250px;
  //     }
  //     .cardImage {
  //       aspect-ratio: 240/336;
  //       height: 30px;
  //       display: block;
  //     }.d-none
  //     {
  //       display:none;
  //     }.absolute{
  //       position:absolute;
  //     }#dealer {
  //       top: 15px;
  //       left: 185px;
  //       position: absolute;
  //       display:flex;
  //     }
  //     #dealer > div {
  //       padding: 0 5px;
  //     }#player1  {
  //       top: 135px;
  //       left: 56px;
  //       transform:rotate(20deg) ;
  //     }#player1 > .cardImage.cardWidthAbsolute {
  //       position: absolute;
  //       top: 15px;
  //       left: 10px;
  //     }#player2 {
  //         top: 147px;
  //         left: 104px;
  //         transform:rotate(13deg) ;
  //     }#player2 > .cardImage.cardWidthAbsolute {
  //       position: absolute;
  //       top: 15px;
  //       left: 10px;
  //     }#player3 {
  //         top: 155px;
  //         left: 153px;
  //         transform:rotate(4deg) ;
  //     }#player3 > .cardImage.cardWidthAbsolute {
  //       position: absolute;
  //       top: 15px;
  //       left: 10px;
  //     }#player4 {
  //       top: 158px;
  //       left: 201px;
  //       transform:rotate(0deg) ;
  //     }#player4 > .cardImage.cardWidthAbsolute {
  //       position: absolute;
  //       top: 15px;
  //       left: 10px;
  //     }#player5{
  //       top: 155px;
  //       left: 249px;
  //       transform:rotate(-4deg) ;
  //     }#player5 > .cardImage.cardWidthAbsolute {
  //       position: absolute;
  //       top: 15px;
  //       left: 10px;
  //     }#player6{
  //       top: 147px;
  //       left: 297px;
  //       transform:rotate(-13deg) ;
  //     }#player6 > .cardImage.cardWidthAbsolute {
  //       position: absolute;
  //       top: 15px;
  //       left: 10px;
  //     }#player7 {
  //       top: 135px;
  //       left: 345px;
  //       transform:rotate(-20deg) ;
  //     }#player7 > .cardImage.cardWidthAbsolute {
  //       position: absolute;
  //       top: 15px;
  //       left: 10px;
  //     }
  //     </style>
  //   </head>
  //   <body>
  //     <div style="position: relative; min-height: fit-content;">
        
  //       <img class= "absolute"style="height: 250px;"src ="https://media.istockphoto.com/id/1147481668/vector/black-jack-table-vector-illustration-eps-10-casino.jpg?s=612x612&w=0&k=20&c=SgTDJ-Pv90ZOAUW853CY04Nltn0rVXM1esgD7MQniRw="/> 
  //       <div class="absolute" id="dealer">
  //         <div class="cardImage "> 
  //           ${await getCardSvg(args.dealer.hand[0])}
  //         </div>
  //         <div class="cardImage cardWidthAbsolute"> 
  //           ${await getCardSvg(args.dealer.hand[1])}
  //         </div>
  //       </div>

  //       <div class="absolute" id="player1">
  //         <div class="cardImage "> 
  //           ${await getCardSvg(args.hasOwnProperty("player1")? args.player1.hand[0]: "1B")}
  //         </div>
  //         <div class="cardImage cardWidthAbsolute"> 
  //           ${await getCardSvg(args.hasOwnProperty("player1")? args.player1.hand[1]: "1B")}
  //         </div>
  //       </div>
  //       <div class="absolute" id="player2">
  //         <div class="cardImage "> 
  //         ${await getCardSvg(args.hasOwnProperty("player2")? args.player2.hand[0]: "1B")}
  //         </div>
  //         <div class="cardImage cardWidthAbsolute"> 
  //           ${await getCardSvg(args.hasOwnProperty("player2")? args.player2.hand[1]: "1B")}
  //         </div>
  //       </div>

  //       <div class="absolute" id="player3">
  //         <div class="cardImage "> 
  //         ${await getCardSvg(args.hasOwnProperty("player3")? args.player3.hand[0]: "1B")}
  //         </div>
  //         <div class="cardImage cardWidthAbsolute"> 
  //           ${await getCardSvg(args.hasOwnProperty("player3")? args.player3.hand[1]: "1B")}
  //         </div>
  //       </div> 
        
  //       <div class="absolute" id="player4">
  //         <div class="cardImage "> 
  //         ${await getCardSvg(args.hasOwnProperty("player4")? args.player4.hand[0]: "1B")}
  //         </div>
  //         <div class="cardImage cardWidthAbsolute"> 
  //           ${await getCardSvg(args.hasOwnProperty("player4")? args.player4.hand[1]: "1B")}
  //         </div>
  //       </div>

  //       <div class="absolute" id="player5">
  //         <div class="cardImage "> 
  //         ${await getCardSvg(args.hasOwnProperty("player5")? args.player5.hand[0]: "1B")}
  //         </div>
  //         <div class="cardImage cardWidthAbsolute"> 
  //           ${await getCardSvg(args.hasOwnProperty("player5")? args.player5.hand[1]: "1B")}
  //         </div>
  //       </div>

  //       <div class="absolute" id="player6">
  //         <div class="cardImage "> 
  //         ${await getCardSvg(args.hasOwnProperty("player6")? args.player6.hand[0]: "1B")}
  //         </div>
  //         <div class="cardImage cardWidthAbsolute"> 
  //           ${await getCardSvg(args.hasOwnProperty("player6")? args.player6.hand[1]: "1B")}
  //         </div>
  //       </div> 
        
  //       <div class="absolute" id="player7">
  //         <div class="cardImage "> 
  //         ${await getCardSvg(args.hasOwnProperty("player7")? args.player7.hand[0]: "1B")}
  //         </div>
  //         <div class="cardImage cardWidthAbsolute"> 
  //           ${await getCardSvg(args.hasOwnProperty("player7")? args.player7.hand[1]: "1B")}
  //         </div>
  //       </div>
        
  //     </div> <!-- All Cards Divs -->


  //   </body>
  // </html>`


//   generateImage(_htmlTemplate);
// }


module.exports = {
    name: 'test',
    description: 'test img gen',
    takepicture  
};
/* 
<!DOCTYPE html>
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
        display: block;
      }.d-none
      {
        display:none;
      }.absolute{
        position:absolute;
      }#dealer {
        top: 15px;
        left: 185px;
        position: absolute;
        display:flex;
      }
      #dealer > div {
        padding: 0 5px;
      }#player1  {
        top: 135px;
        left: 56px;
        transform:rotate(20deg) ;
      }#player1 > .cardImage.cardWidthAbsolute {
        position: absolute;
        top: 15px;
        left: 10px;
      }#player2 {
          top: 147px;
          left: 104px;
          transform:rotate(13deg) ;
      }#player2 > .cardImage.cardWidthAbsolute {
        position: absolute;
        top: 15px;
        left: 10px;
      }#player3 {
          top: 155px;
          left: 153px;
          transform:rotate(4deg) ;
      }#player3 > .cardImage.cardWidthAbsolute {
        position: absolute;
        top: 15px;
        left: 10px;
      }#player4 {
        top: 158px;
        left: 201px;
        transform:rotate(0deg) ;
      }#player4 > .cardImage.cardWidthAbsolute {
        position: absolute;
        top: 15px;
        left: 10px;
      }#player5{
        top: 155px;
        left: 249px;
        transform:rotate(-4deg) ;
      }#player5 > .cardImage.cardWidthAbsolute {
        position: absolute;
        top: 15px;
        left: 10px;
      }#player6{
        top: 147px;
        left: 297px;
        transform:rotate(-13deg) ;
      }#player6 > .cardImage.cardWidthAbsolute {
        position: absolute;
        top: 15px;
        left: 10px;
      }#player7 {
        top: 135px;
        left: 345px;
        transform:rotate(-20deg) ;
      }#player7 > .cardImage.cardWidthAbsolute {
        position: absolute;
        top: 15px;
        left: 10px;
      }
      </style>
    </head>
    <body>
      <div style="position: relative; min-height: fit-content;">
        
        <img class= "absolute"style="height: 250px;"src ="https://media.istockphoto.com/id/1147481668/vector/black-jack-table-vector-illustration-eps-10-casino.jpg?s=612x612&w=0&k=20&c=SgTDJ-Pv90ZOAUW853CY04Nltn0rVXM1esgD7MQniRw="/> 
        <div class="absolute" id="dealer">
          <div class="cardImage "> 
            ${await getCardSvg(args.dealer.hand[0])}
          </div>
          <div class="cardImage cardWidthAbsolute"> 
            ${await getCardSvg(args.dealer.hand[1])}
          </div>
        </div>

        <div class="absolute" id="player1">
          <div class="cardImage "> 
            ${await getCardSvg(args.hasOwnProperty("player1")? args.player1.hand[0]: "1B")}
          </div>
          <div class="cardImage cardWidthAbsolute"> 
            ${await getCardSvg(args.hasOwnProperty("player1")? args.player1.hand[1]: "1B")}
          </div>
        </div>
        <div class="absolute" id="player2">
          <div class="cardImage "> 
          ${await getCardSvg(args.hasOwnProperty("player2")? args.player2.hand[0]: "1B")}
          </div>
          <div class="cardImage cardWidthAbsolute"> 
            ${await getCardSvg(args.hasOwnProperty("player2")? args.player2.hand[1]: "1B")}
          </div>
        </div>

        <div class="absolute" id="player3">
          <div class="cardImage "> 
          ${await getCardSvg(args.hasOwnProperty("player3")? args.player3.hand[0]: "1B")}
          </div>
          <div class="cardImage cardWidthAbsolute"> 
            ${await getCardSvg(args.hasOwnProperty("player3")? args.player3.hand[1]: "1B")}
          </div>
        </div> 
        
        <div class="absolute" id="player4">
          <div class="cardImage "> 
          ${await getCardSvg(args.hasOwnProperty("player4")? args.player4.hand[0]: "1B")}
          </div>
          <div class="cardImage cardWidthAbsolute"> 
            ${await getCardSvg(args.hasOwnProperty("player4")? args.player4.hand[1]: "1B")}
          </div>
        </div>

        <div class="absolute" id="player5">
          <div class="cardImage "> 
          ${await getCardSvg(args.hasOwnProperty("player5")? args.player5.hand[0]: "1B")}
          </div>
          <div class="cardImage cardWidthAbsolute"> 
            ${await getCardSvg(args.hasOwnProperty("player5")? args.player5.hand[1]: "1B")}
          </div>
        </div>

        <div class="absolute" id="player6">
          <div class="cardImage "> 
          ${await getCardSvg(args.hasOwnProperty("player6")? args.player6.hand[0]: "1B")}
          </div>
          <div class="cardImage cardWidthAbsolute"> 
            ${await getCardSvg(args.hasOwnProperty("player6")? args.player6.hand[1]: "1B")}
          </div>
        </div> 
        
        <div class="absolute" id="player7">
          <div class="cardImage "> 
          ${await getCardSvg(args.hasOwnProperty("player7")? args.player7.hand[0]: "1B")}
          </div>
          <div class="cardImage cardWidthAbsolute"> 
            ${await getCardSvg(args.hasOwnProperty("player7")? args.player7.hand[1]: "1B")}
          </div>
        </div>
        
      </div> <!-- All Cards Divs -->


    </body>
  </html>


 */