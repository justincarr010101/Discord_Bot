// ping.js
module.exports = {
    name: 'ping',
    description: 'ping, pong',
    execute(message, args) {
        // Logic for pingpong
        message.channel.send('pong!');
    },
};
