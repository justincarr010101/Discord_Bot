const axios = require('axios');
const play = require('./play');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { useQueue } = require("discord-player");
const { useMainPlayer } = require('discord-player');

function nearestSaturday(dateString) {
    // Create a Date object from the input string
    const date = new Date(dateString);

    // Convert the date to UTC by adding the UTC offset
    const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);

    // Get the day of the week as a number (0-6, where 0 is Sunday and 6 is Saturday)
    const dayOfWeek = utcDate.getDay();

    // Calculate the number of days to the nearest Saturday
    let daysToAdd = 6 - dayOfWeek;  // Saturday is 6, calculate the difference
    if (daysToAdd > 3) {  // If more than 3 days ahead, find the previous Saturday
        daysToAdd -= 7;
    }

    // Add the calculated days to the date
    date.setDate(date.getDate() + daysToAdd);

    // Format the date back to YYYY-MM-DD
    return date.toISOString().slice(0, 10);
}

async function get100(date){
    try {
        // Fetch Billboard data for the specified date
        const url = `https://raw.githubusercontent.com/mhollingshead/billboard-hot-100/main/date/${date}.json`;
        const response = await axios.get(url);
        billboardData = response.data["data"];
        return billboardData;
    
    } catch (error) {
        //console.error('Error fetching Billboard data:', error);
        return message.channel.send('Something went wrong while fetching Billboard data.');
    }
}


module.exports = {
    name: 'billboard',
    description: 'Fetch Billboard Hot 100 data for a specific week',
    async execute(message, args) {

        // Extract date from arguments (expected format: YYYY-MM-DD)
        date = args[0];
        if (!date) {
            return message.reply('Please provide a date in the format YYYY-MM-DD!');
        }        

        //get nearest saturday to follow get100 criteria
        date = nearestSaturday(date);
        //get the billboard data from the week date
        billboardData = get100(date);

        //set up queue and player
        const player = useMainPlayer();
        const channel = message.member.voice.channel;
        if (!channel) return message.channel.send('You are not connected to a voice channel!'); // make sure we have a voice channel
        queue = useQueue(message.guild.id);

        // let's defer the interaction as things can take time to process
        if (queue){
            //we already have que

         } else {
            //create queue if no queue
            queue = player.nodes.create(message.guild);
        }


        for (let i = 0; i < billboardData.length; i++){ //billboardData.length
            
            const song = billboardData[i]["song"];
            const artist = billboardData[i]["artist"];
            const query = `${song} by ${artist}`;
            const result = await player.search(query);

            // acquire task entry
            const entry = queue.tasksQueue.acquire();
        
            // wait for previous task to be released and our task to be resolved
            await entry.getTask();
        
            // add track(s) (this will add playlist or single track from the result)
            queue.addTrack(result.tracks[0]);

            try {
                // if player node was not previously playing, play a song
                if (!queue.connection) await queue.connect(channel);
                if (!queue.isPlaying()) await queue.node.play();
            } catch (e) {
                // let's return error if something failed
                return message.channel.send(`Something went wrong: ${e}`);
            }finally {
                // release the task we acquired to let other tasks to be executed
                // make sure you are releasing your entry, otherwise your bot won't
                // accept new play requests
                queue.tasksQueue.release();
            }

        }
        
    },
};
