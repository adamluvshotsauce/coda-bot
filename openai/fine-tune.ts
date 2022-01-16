import { OpenAI, baseConfig } from "./base";

export default class OpenAIFineTune extends OpenAI {
  _running: boolean = true;

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