// this script calls the openai API to perform a completion request. The request is passed to the script using the command line arguments. The script prints the response to the console.
// Language: typescript
import OpenAI from '../openai';

async function main() {
    const openai = new OpenAI();
    const request = process.argv[2];
    const response = await openai.complete({
        engine: 'davinci',
        prompt: request,
        max_tokens: 256
    });
    console.log(response.data.choices[0].text);
}
main().then(() => {}).catch(err => {
    console.error(err);
});