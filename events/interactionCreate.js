// Run dotenv
require('dotenv').config();
const OpenAI = require('openai-api');
const { codeBlock } = require('@discordjs/builders');

let preamble = `// write a javascript function that cryptographically hashes a given string 
function hash(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
}
<---#>1
<#--->2
// write a javascript function that counts the vowels in a given string
function countVowels(str) {
    var count = 0;
    var vowels = "aeiouAEIOU";
    for (var i = 0; i < str.length; i++) {
        if (vowels.indexOf(str[i]) != -1) {
            count++;
        }
    }
    return count;
}
<---#>2
<#--->3
// write a javascript function that outputs the prime factors of a given number
function primeFactors(num) {
    var primeFactorials = [];
    for (var i = 2; i <= num; i++) {
        if (isPrime(i)) {
            primeFactorials.push(i);
        }
    }
    return primeFactorials;
}
<---#>3
<#--->4
`;
let explainPreamble = `Explain: how do I use solidity interfaces in my smart contracts?\n
You use the interface keyword to define a new interface. You can then use the interface to call the those functions on contracts that implement it. That way you can use the interface instead of the contract. To implement an interface on your contract, you need to use the 'is' keyword:\n
\n
\`\`\`\n
interface IMyInterface {\n
    function myFunction(uint256 _a, uint256 _b) external;\n
}\n
contract MyContract implements IMyInterface {\n
    function myFunction(uint256 _a, uint256 _b) external override {\n
        // do something\n
    }\n
}\n
\`\`\`\n
<#--->
Explain: `;
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
        const explain = interaction.options.getString('explain');

        try {
            const queryAI = async (query) => {
                const gptResponse = await openai.complete({
                    engine: 'davinci-codex',
                    prompt: query,
                    maxTokens: 500,
                    temperature: 0.0,
                    topP: 1,
                    presencePenalty: 0,
                    frequencyPenalty: 0,
                    bestOf: 1,
                    n: 1,
                    stream: false,
                    stop: ['<#--->']
                });

                console.log(
                    `${gptResponse.data.choices[0].text}`
                );

                return gptResponse.data.choices[0].text;
            };

            const respond = async () => {

                const queryAnswer = async (_query) => {

                    queryCount++;
                    if(queryCount <= maxQueries) {
                        const _question = queryCount === 1 ? preamble + `// ${_query}` : `${_query}`;
                        const answer = await queryAI(_question);
                        if (!answer.includes('<---#>4')) {
                            return await queryAnswer(_query + answer);
                        }
                        let result = _query + answer;
                        // given format: "Some Other RandomData<---#>3\n<#--->4\nSTRING\n<---#>4\nSomeotherRandomData"
                        // process result to return STRING 
                        const end = result.indexOf('<---#>4');
                        const start = result.indexOf('<#--->4');
                        const string = result.substring(start + 8, end);
                        return string;
                    }
                    return _query;

                };

                let queryCount = 0;
                const maxQueries = 10;
                let response, output;
                if(query) {
                    response = await queryAnswer(query);
                    output = codeBlock(
                        'js',
                        `// ` + response
                    );
                } else if(explain) {
                    output = await queryAI(explainPreamble + explain);
                    output = `Explain: ${explain}\n${output}`;
                }
                

                // edit the deferred reply with the ai response
                interaction.editReply({ content: output });

            };

            // deferring the reply allows a 15 min window before
            // the interaction token expires
            interaction.deferReply();

            respond();

        } catch (error) {
            console.error(error);
            interaction.reply({
                content: 'There was an error while executing this command!',
                ephemeral: true,
            });
        }
    },
};
