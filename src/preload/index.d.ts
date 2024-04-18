import { ElectronAPI } from '@electron-toolkit/preload'
import { Dirent } from 'fs';


export type CiagApi = {
  directoryContents(path): Promise<Ciag.IFileRef[]>
  LocalFiles: {
    readMosaic(): Promise<Ciag.IFileRef[]>
  }

}
declare global {
  namespace Ciag {
    interface IFileRef {
      type: string,
      name: string,
      path: string,
      url: string
    }
  }
  interface Window {
    electron: ElectronAPI
    api: CiagApi
  }
}
