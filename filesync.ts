import fs from 'fs'
import path from 'path'
import axios from 'axios'

// rewrite the above class so that the syncFolder method uses the nd5 hash of each local file path as the remote file name.
class OpenApiFiles {

  _running: boolean = true;
  apiKey: string = '';

  constructor(apiKey) {
    this.apiKey = apiKey
  }

  uploadFile(filePath:string) {
    return axios.post('https://api.openai.com/v1/files', {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      data: {
        purpose: 'answers',
        file: fs.createReadStream(filePath),
      },
    })
  }

  call(method:string, fileId:string) {
    return axios[method](`https://api.openai.com/v1/files/${fileId}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    })
  }

  downloadFile(fileId:string) {
    return this.call('get', fileId)
  }

  deleteFile(fileId:string) {
    return this.call('delete', fileId)
  }

  getFiles() {
    return this.call('get', '')
  }

  async syncFolder(localPath:string) {
    const localFiles = fs.readdirSync(localPath)
    const remoteFiles = this.getFiles().then((r) => r.data.files)
    const localFileNames = localFiles.map((f) => path.basename(f))
    const remoteFileNames = remoteFiles.map((f) => f.name)
    const filesToUpload = localFileNames.filter(
      (f) => !remoteFileNames.includes(f),
    )
    const filesToDelete = remoteFileNames.filter(
      (f) => !localFileNames.includes(f),
    )
    const filesToDownload = remoteFileNames.filter(
      (f) => !localFileNames.includes(f),
    )
    filesToUpload.forEach((f) => this.uploadFile(path.join(localPath, f)))
    filesToDelete.forEach((f) => this.deleteFile(f))
    filesToDownload.forEach((f) => this.downloadFile(f))
  }

  async startSync(localPath:string) {
    const waiting = async () => {
      await this.syncFolder(localPath)
      setTimeout(async () => await waiting(), 10000)
    }
  }

  async stopSync() {
    this._running = false
  }

  running() {
    return this._running
  }

  static md5(filePath) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('md5');
      const stream = fs.createReadStream(filePath);
      stream.on('data', (chunk) => hash.update(chunk))
      stream.on('end', () => resolve(hash.digest('hex')))
      stream.on('error', (err) => reject(err))
    })
  }
}

const apiKey = "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"
const localPath = __dirname + '/test'

const openApiFiles = new OpenApiFiles(apiKey);
openApiFiles.startSync(localPath);
