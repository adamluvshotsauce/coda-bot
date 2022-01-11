// Run dotenv
require('dotenv').config();
const OpenAI = require('openai-api');
const { codeBlock } = require('@discordjs/builders');

const openai = new OpenAI(process.env.OPENAI_API_KEY);

module.exports = {
    name: 'interactionCreate',
    execute(interaction) {
        // ignore non-command interactions
        if (!interaction.isCommand()) return;

        const command = interaction.client.commands.get(
            interaction.commandName
        );
        if (!command) return;

        const query = interaction.options.getString('code');

        try {
            const queryAI = async (query) => {
                const gptResponse = await openai.complete({
                    engine: 'davinci-codex',
                    prompt: query,
                    maxTokens: 300,
                    temperature: 0.05,
                    topP: 1,
                    presencePenalty: 0,
                    frequencyPenalty: 0,
                    bestOf: 1,
                    n: 1,
                    stream: false,
                    stop: ['<#--->']
                });

                console.log(
                    `codex response text: ${gptResponse.data.choices[0].text}`
                );

                return gptResponse.data.choices[0].text;
            };

            let preamble = `the following function prints to the console
            function cp(t) {
                console.log(t);
            } 
            <#--->`;

            queryAI(preamble + query).then((response) => {
                console.log(`queryAI response: ${response}`);
                const codeblock = codeBlock(
                    'js',
                    `// Query: ${query} \n` + response
                );
                interaction.reply({ content: codeblock });
            });
        } catch (error) {
            console.error(error);
            interaction.reply({
                content: 'There was an error while executing this command!',
                ephemeral: true,
            });
        }
    },
};
