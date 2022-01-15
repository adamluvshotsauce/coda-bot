import fs from "fs";
import web3 from "web3";
import path from "path";

const DEFAULT_ENGINE = 'davinci';
const ORIGIN = 'https://api.openai.com';
const API_VERSION = 'v1';
const OPEN_AI_URL = `${ORIGIN}/${API_VERSION}`

const axios = require("axios");

const pause = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const config = {
  completionURL(engine:any) {
    return `${OPEN_AI_URL}/engines/${engine}/completions`;
  },
  searchURL(engine:any) {
    return `${OPEN_AI_URL}/engines/${engine}/search`;
  },
  enginesUrl() {
    return `${OPEN_AI_URL}/engines`;
  },
  engineUrl(engine:any) {
    return `${OPEN_AI_URL}/engines/${engine}`;
  },
  classificationsUrl() {
    return `${OPEN_AI_URL}/classifications`
  },
  filesUrl() {
    return `${OPEN_AI_URL}/files`
  },
  fileUrl(aFile:any) {
    return `${OPEN_AI_URL}/files/${aFile}`
  },
  answersUrl() {
    return `${OPEN_AI_URL}/answers`
  }
};

class OpenAI {
  _api_key: string = '';
  constructor(api_key:any) {
    this._api_key = api_key;
  }

  async _send_request(url:any, method:any, opts:any = {}) {
    let camelToUnderscore = (key:any) => {
      let result = key.replace(/([A-Z])/g, " $1");
      return result.split(' ').join('_').toLowerCase();
    }

    const data:any = {};
    for (const key in opts) {
      data[camelToUnderscore(key)] = opts[key];
    }

    return await axios({
      url,
      headers: {
        'Authorization': `Bearer ${this._api_key}`,
        'Content-Type': 'application/json'
      },
      data: Object.keys(data).length ? data : '',
      method,
    });
  }

  async complete(opts:any) {
    const url = config.completionURL(opts.engine || DEFAULT_ENGINE);
    delete opts.engine;

    return await this._send_request(url, 'post', opts);
  }

  async encode() {
    // This method is no longer supported in Node>=v14. See
    return Promise.resolve(new Array(2047).fill(""));
  }

  async search(opts:any) {
    const url = config.searchURL(opts.engine || DEFAULT_ENGINE)
    delete opts.engine;
    return await this._send_request(url, 'post', opts);
  }

  async answers(opts:any) {
    const url = config.answersUrl();
    return await this._send_request(url, 'post', opts);
  }

  async classification(opts:any) {
    const url = config.classificationsUrl();
    return await this._send_request(url, "post", opts);
  }

  async engines() {
    const url = config.enginesUrl();
    return await this._send_request(url, 'get')
  }

  async engine(engine:any) {
    const url = config.engineUrl(engine);
    return await this._send_request(url, 'get');
  }

}

// rewrite the above class so that the syncFolder method uses the nd5 hash of each local file path as the remote file name.
class OpenAIFiles extends OpenAI {
  _running: boolean = true;

  async upload(filePath: string) {
    const url = config.filesUrl();
    return await this._send_request(url, "post", {
      data: {
        purpose: "answers",
        file: fs.createReadStream(filePath),
      }
    });
  }

  async download(fileId: string) {
    const url = config.fileUrl(fileId);
    return await this._send_request(url, 'get')
  }

  async delete(fileId: string) {
    const url = config.fileUrl(fileId);
    return await this._send_request(url, 'delete')
  }

  async remote() {
    const url = config.filesUrl();
    return await this._send_request(url, 'get')
  }

  local(filePath:string) {
    const fullPath = filePath;
    const files = fs.readdirSync(fullPath);
    const result: any = [];
    files.forEach((file) => {
      const filePath = path.join(fullPath, file);
      const stats = fs.statSync(filePath);
      if (stats.isFile()) {
        result.push(filePath);
      } else if (stats.isDirectory()) {
        result.push(...this.local(filePath));
      }
    });
    return result;
  }

  diff(filesLocal: any, filesRemote: any): any {
    const filesToUpload = filesLocal.filter((f:any) => !filesRemote.includes(f));
    const filesToDelete = filesLocal.filter((f:any) => !filesRemote.includes(f));
    const filesToDownload = filesLocal.filter((f:any) => !filesRemote.includes(f));
    return {
      upload: filesToUpload,
      deleted: filesToDelete,
      download: filesToDownload,
    };
  }

  async syncFolder(localPath: string) {
    let localFiles = this.local(localPath);
    let remoteFiles = await this.remote();
    
    localFiles = localFiles.map((f:any) => OpenAIFiles.md5(path.basename(f)));
    remoteFiles = remoteFiles.map((f:any) => f.name);

    const { upload, download, deleted } = this.diff(localFiles, remoteFiles);
    await Promise.all(upload.map((f:any) => this.upload(path.join(localPath, f))));
    download.forEach((f:any) => this.download(f));
    deleted.forEach((f:any) => this.delete(f));
  }

  async start(localPath: string) {
    const waiting = async () => {
      await this.syncFolder(localPath);
      setTimeout(async () => await waiting(), 10000);
    };
    await waiting();
  }

  async stop() {
    this._running = false;
  }

  running() {
    return this._running;
  }

  static md5(filePath:string):string {
    const o = web3.utils.soliditySha3(filePath);
    return o || '';
  }
}

const apiKey = "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";
const localPath = __dirname + "\\..\\test";

async function main() {

  const openApiFiles = new OpenAIFiles(apiKey);
  await openApiFiles.start(localPath);

}

main();