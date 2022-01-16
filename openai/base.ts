import dotenv from 'dotenv';
dotenv.config()

const DEFAULT_ENGINE = 'davinci';
const ORIGIN = 'https://api.openai.com';
const API_VERSION = 'v1';
const OPEN_AI_URL = `${ORIGIN}/${API_VERSION}`
const OPENAI_API_KEY = `${process.env.OPENAI_API_KEY}`

const axios = require("axios");

export const baseConfig = {
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
  fineTunesUrl() {
    return `${OPEN_AI_URL}/fine-tunes`
  },
  fineTuneUrl(aFile:any) {
    return `${OPEN_AI_URL}/fine-tunes/${aFile}`
  },
  answersUrl() {
    return `${OPEN_AI_URL}/answers`
  }
};

export class OpenAI {
  _api_key: string = '';
  config: any = baseConfig;
  constructor(api_key:any=OPENAI_API_KEY, _config:any=baseConfig) {
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
    const url = this.config.completionURL(opts.engine || DEFAULT_ENGINE);
    delete opts.engine;

    return await this._send_request(url, 'post', opts);
  }

  async encode() {
    // This method is no longer supported in Node>=v14. See
    return Promise.resolve(new Array(2047).fill(""));
  }

  async search(opts:any) {
    const url = this.config.searchURL(opts.engine || DEFAULT_ENGINE)
    delete opts.engine;
    return await this._send_request(url, 'post', opts);
  }

  async answers(opts:any) {
    const url = this.config.answersUrl();
    return await this._send_request(url, 'post', opts);
  }

  async classification(opts:any) {
    const url = this.config.classificationsUrl();
    return await this._send_request(url, "post", opts);
  }

  async engines() {
    const url = this.config.enginesUrl();
    return await this._send_request(url, 'get')
  }

  async engine(engine:any) {
    const url = this.config.engineUrl(engine);
    return await this._send_request(url, 'get');
  }

}
