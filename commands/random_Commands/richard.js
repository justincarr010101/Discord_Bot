// richard.js

//NEED TO TAKE THE RICHARD, KICK THEM FROM PARTY AND ADD THEM BACK

module.exports = {
    name: 'richard',
    description: 'Mute Richard',
    execute(message, args) {
        console.log("args are:" + args +"message is:" + message );
        // Check if the user has the appropriate permissions to mute
        if (!message.member.permissions.has('MANAGE_ROLES')) {
            return message.channel.send('You do not have permission to mute members.');
        }
        
        // Get the user mentioned in the command
        const user = message.mentions.users.first();
        console.log(user);
        if (!user) {
            return message.channel.send('You need to mention a user to mute them.');
        }

        // Get the member object for the mentioned user
        const member = message.guild.members.cache.get(user.id);
        if (!member) {
            return message.channel.send('User not found.');
        }

        // Get the mute role from the server
        const muteRole = message.guild.roles.cache.find(role => role.name === 'Muted');

        if (!muteRole) {
            return message.channel.send('Mute role not found.');
        }

        if (member.roles.cache.has(muteRole.id)){

            return message.channel.send('MUST NOT SILENCE THE SILENCED, DO NOT USE UR POWER IN VAIN');
        
        } else {

            // Add the mute role to the user
            member.roles.add(muteRole).then(() => {
                message.channel.send(`Get silenced pussy, @${user.tag}`);
                
                

                // Direct URL to a GIF
                const gifUrl = 'https://tenor.com/kgw914CYY0G.gif';

                message.channel.send(gifUrl);

            }).catch(err => {
                console.error(err);
                message.channel.send('There was an error muting the user.');
            });
        }
    },
};