module.exports = {
    name: 'help',
    description: 'List all commands and their usage',
    execute(message, args) {
        const commands = message.client.commands;

        let helpMessage = 'Here are all the available commands:\n\n';

        commands.forEach(command => {
            helpMessage += `**.${command.name}**: ${command.description}\n`;
        });

        message.channel.send(helpMessage);
    },
};