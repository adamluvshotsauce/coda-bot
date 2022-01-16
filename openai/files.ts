import fs from "fs";
import path from "path";
import { OpenAI, baseConfig } from "./base";
import web3 from "web3";

const axios = require("axios");
export default class OpenAIFiles extends OpenAI {
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

  async upload(filePath: string) {
    const url = this.config.filesUrl();
    return await this._send_request(url, "post", {
      data: {
        purpose: "answers",
        file: fs.createReadStream(filePath),
      },
    });
  }

  async download(fileId: string) {
    const url = this.config.fileUrl(fileId);
    return await this._send_request(url, "get");
  }

  async delete(fileId: string) {
    const url = this.config.fileUrl(fileId);
    return await this._send_request(url, "delete");
  }

  async remote() {
    const url = this.config.filesUrl();
    return await this._send_request(url, "get");
  }

  local(filePath: string) {
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
    const filesToUpload = filesLocal.filter(
      (f: any) => !filesRemote.includes(f)
    );
    const filesToDelete = filesLocal.filter(
      (f: any) => !filesRemote.includes(f)
    );
    const filesToDownload = filesLocal.filter(
      (f: any) => !filesRemote.includes(f)
    );
    return {
      upload: filesToUpload,
      deleted: filesToDelete,
      download: filesToDownload,
    };
  }

  async syncFolder(localPath: string) {
    let localFiles = this.local(localPath);
    let remoteFiles = await this.remote();

    localFiles = localFiles.map((f: any) => OpenAIFiles.md5(path.basename(f)));
    remoteFiles = remoteFiles.map((f: any) => f.name);

    const { upload, download, deleted } = this.diff(localFiles, remoteFiles);
    await Promise.all(
      upload.map((f: any) => this.upload(path.join(localPath, f)))
    );
    download.forEach((f: any) => this.download(f));
    deleted.forEach((f: any) => this.delete(f));
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

  static md5(filePath: string): string {
    const o = web3.utils.soliditySha3(filePath);
    return o || "";
  }
}
