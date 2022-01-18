import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export function prepareSolidity(sourcePath: string, contractName: string) {
    const interfaceName = path.join(sourcePath, 'I' + contractName + '.sol');
    // look for interface in the source path, including all subfolders recursively
    const findInSubfolders = (sPath: string) => {
        const files = fs.readdirSync(sPath);
        const result: any = [];
        files.forEach(file => {
            const filePath = path.join(sPath, file);
            if (fs.statSync(filePath).isDirectory()) {
                result.push(...findInSubfolders(filePath));
            } else {
                if (file === 'I' + contractName + '.sol') {
                    result.push(filePath);
                }
            }
        });
        return result;
    };
    // use findInSubfolders to find both the contract and interface
    const interfacePath = findInSubfolders(sourcePath)[0];
    const contractPath = path.join(sourcePath, contractName + '.sol');
    // read the interface and contract source code
    const interfaceContent = fs.readFileSync(interfacePath, 'utf8');
    const contractContent = fs.readFileSync(contractPath, 'utf8');
    function md5(str: string) {
        return crypto.createHash('md5').update(str).digest('hex');
    }
    // return the interface and contract source code as a single object
    return {
        contractHash: md5(contractPath),
        preparedContract: {
            prompt: interfaceContent,
            promptHash: md5(interfaceContent),
            completion: contractContent,
            completionHash: md5(contractContent)
        }
    };
}

export function scanInputDir(sourcePath: string) {
    const files = fs.readdirSync(sourcePath);
    const result: any = [];
    files.forEach(file => {
        const filePath = path.join(sourcePath, file);
        if (fs.statSync(filePath).isDirectory()) {
            result.push(...scanInputDir(filePath));
        } else {
            if (file.endsWith('.sol') && !file.startsWith('I')) {
                result.push(filePath);
            }
        }
    });
    return result;
}

export function scanPrepareAndWrite(sourcePath: string) {
    const files = scanInputDir(sourcePath);
    files.forEach((file:string) => {
        const prepared = prepareSolidity(sourcePath, path.basename(file, '.sol'));
        const preparedPath = path.join(sourcePath, 'prepared', prepared.contractHash + '.json');
        fs.writeFileSync(preparedPath, JSON.stringify(prepared, null, 2));
    });
}