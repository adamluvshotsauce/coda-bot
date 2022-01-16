// this script calls the openai API to perform a completion request. The request is passed to the script using the command line arguments. The script prints the response to the console.
// Language: typescript
import { OpenAIFiles } from '../openai';

async function main() {
    const openai = new OpenAIFiles();
    const request = process.argv[2];
    const response = await openai.start(request);
}
main().then(() => {}).catch(err => {
    console.error(err);
});