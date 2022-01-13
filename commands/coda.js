const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coda')
        .setDescription('Ask Coda a coding question...')
        .addStringOption((option) =>
            option
                .setName('code')
                .setDescription('Have coda write you some code by giving it instructions.')
        )
        .addStringOption((option) =>
            option
                .setName('explain')
                .setDescription('Ask coda to explain something technical in plain English.')
        ),
    async execute(interaction) {
        await interaction.reply('Coda!');
    },
};
