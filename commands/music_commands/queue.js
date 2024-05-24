// queue.js
module.exports = {
    name: 'queue',
    description: 'Add song to Queue',
    execute(message, args) {
        // Logic for skipping the current song
        message.channel.send('Adding song to queue');
    },
};
