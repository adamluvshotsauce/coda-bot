// this typescript script lists all the fine tunes of the user's account.
// Language: typescript
import { OpenAIFineTune } from '../openai';

async function main() {
  const openai = new OpenAIFineTune()
  openai.list().then((fineTunes:any) =>
      console.log(fineTunes)
  )
}

main().then(() => {}).catch(err => console.error(err));