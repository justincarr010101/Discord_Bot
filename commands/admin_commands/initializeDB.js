const db2 = require('../../db.js');
db2.getDB();
// getBalance.js
async function execute(message, args){
    try {
        // Fetch all members of the guild
        await message.guild.members.fetch();

        // Get the members
        const members = message.guild.members.cache;

        // Create a response string
        let response = 'Member List:\n';
        members.forEach(member => {
            if (member.user.tag == "meatbails"){
                db2.initializeMemberBalance(member.user.tag, 50);
            }else{
                db2.initializeMemberBalance(member.user.tag, 0);
            }
            response += `${member.user.tag}\n`;
        });
        // Send the response
        message.channel.send(response);
    } catch (error) {
        console.error('Error fetching members:', error);
        message.channel.send('There was an error fetching the member list.');
    }
}
module.exports = {
    name: 'init',
    description: 'initialize the DB to 0',
    execute,
};