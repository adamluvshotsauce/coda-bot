import { OpenAI, baseConfig } from "./base";
const axios = require("axios");
export default class OpenAIFineTune extends OpenAI {
  _running: boolean = true;

  async _send_request(url:any, method:any, opts:any = {}) {
    let camelToUnderscore = (key:any) => {
      let result = key.replace(/([A-Z])/g, " $1");
      return result.split(' ').join('_').toLowerCase();
    }

    const data:any = {};
    for (const key in opts) {
      data[camelToUnderscore(key)] = opts[key];
    }

    return (await axios({
      url,
      headers: {
        'Authorization': `Bearer ${this._api_key}`,
      },
      data: Object.keys(data).length ? data : '',
      method,
    })).data.data;
  }

  async create(options:any) {
    const url = this.config.filesUrl();
    return await this._send_request(url, "post", {
      data:options
    });
  }

  async list() {
    const url = this.config.fineTunesUrl();
    return await this._send_request(url, "get");
  }

  async retrieve(fileId: string) {
    const url = this.config.fineTuneUrl(fileId);
    return await this._send_request(url, "delete");
  }

  async cancel(fileId: string) {
    const url = this.config.fineTuneUrl(fileId) + '/cancel';
    return await this._send_request(url, "post");
  }

  async events(fileId: string) {
    const url = this.config.fineTuneUrl(fileId) + '/events';
    return await this._send_request(url, "get");
  }

}