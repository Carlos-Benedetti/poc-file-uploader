import fs from "fs/promises"
import { app, contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Dirent } from "fs"
import nodePath from "path"
import path from "path"
// const USER_DATA = app.getPath('userData');
// const LOCAL_PATH = path.join(USER_DATA, 'rawMosaicImages')

interface IFileRef {
  type: string,
  name: string,
  path: string,
  url: string
}

class CiagFileRef {
  public type: string = 'file'
  public url: string
  constructor(public name: string, public path: string) {
    this.url = 'app-raw-mosaic://' + nodePath.join(this.path, this.name)
  }
}


// Custom APIs for renderer
export namespace api {
  export async function directoryContents(path) {
    let results = await fs.readdir(path, { withFileTypes: true })
    return results
      .filter(it => it.isFile())
      .map(it => {
        return new CiagFileRef(it.name, it.path)
      })
  }
  export const LocalFiles = {
    readMosaic: async () => {
      const localPath = await ipcRenderer.invoke('RawMosaicImagesPath')
      return directoryContents(localPath)
    }
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
