// Allow.js
module.exports = {
    name: 'allow',
    description: 'Unmute Richard',
    execute(message, args) {
       // Check if the message author has permission to manage roles
       if (!message.member.permissions.has('MANAGE_ROLES')) {
            return message.channel.send('You do not have permission to manage roles.');
        }

        // Get the user mentioned in the command
        const user = message.mentions.users.first();
        if (!user) {
            return message.channel.send('You need to mention a user.');
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

        // Check if the member has the mute role
        if (member.roles.cache.has(muteRole.id)) {
            // User is muted, so we remove the mute role
            member.roles.remove(muteRole).then(() => {

                message.channel.send(`You shall be free @${user.tag}`);

                // Direct URL to a GIF
                const gifUrl = 'https://tenor.com/bKVBJ.gif';
                message.channel.send(gifUrl);

            }).catch(err => {
                console.error(err);
                message.channel.send('There was an error unmuting the user.');
            });
        } else {
            message.channel.send('User is not muted.');
        }
    },
    };