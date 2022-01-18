import { scanPrepareAndWrite } from '../utils/sol-prepare';

async function main() {
    const sourcePath = './src/contracts/';
    const result = scanPrepareAndWrite(sourcePath);
    console.log(result);
}
main().then(() => {}).catch(err => console.error(err));