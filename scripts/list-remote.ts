// this typescript script lists all the fine tunes of the user's account.
// Language: typescript
import { OpenAIFiles } from '../openai';

async function main() {
    const openai = new OpenAIFiles()
    openai.remote().then((files:any) =>
        console.log(files)
    )
}

main().then(() => {}).catch(err => console.error(err));