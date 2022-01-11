const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coda')
        .setDescription('Ask Coda a coding question...')
        .addStringOption((option) =>
            option
                .setName('code')
                .setDescription('Have coda write you some code by giving it instructions.')
        ),
    async execute(interaction) {
        await interaction.reply('Coda!');
    },
};
