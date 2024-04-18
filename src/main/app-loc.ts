import { app, ipcMain, net, protocol } from "electron";

import http from 'http'
import fs from 'fs/promises'
import fsOld from 'fs'
import nodePath from "path";
import { v4 } from 'uuid'
import type { ReadableStream } from 'node:stream/web'
import { default as Stream } from 'node:stream'
import { fileURLToPath } from "url";

const USER_DATA = app.getPath('userData');
const LOCAL_PATH = nodePath.join(USER_DATA, 'rawMosaicImages')

class CiagFileRef {
    public type: string = 'file'
    public url: string
    constructor(public name: string, public path: string) {
        this.url = 'app-raw-mosaic://' + nodePath.join(this.path, this.name)
    }
}

export class RawMosaicImagesProtocol {
    static SCHEME = 'app-raw-mosaic'
    constructor() {
        ipcMain.handle('RawMosaicImagesPath', () => LOCAL_PATH)
        protocol.handle(RawMosaicImagesProtocol.SCHEME, async (req) => {
            console.log(req.method)
            switch (req.method) {
                case 'GET': {
                    const url = new URL(req.url)
                    console.log(url.toString())
                    return net.fetch(url.toString().replace(this.protocol, 'file://'))
                }
                case 'PUT': {
                    const url = new URL(req.url)
                    console.log(url.toString().replace(this.protocol, 'file://'))
                    const baseFilePath = fileURLToPath(url.toString().replace(this.protocol, 'file://'))
                    const pathObj = nodePath.parse(baseFilePath)
                    const fileRef = new CiagFileRef(pathObj.base, pathObj.dir)
                    const dest = nodePath.join(LOCAL_PATH, baseFilePath);
                    const body = req.body as ReadableStream<Uint8Array>
                    const stream = Stream.Readable.fromWeb(body as ReadableStream<Uint8Array>)
                    const file = fsOld.createWriteStream(dest)

                    stream.on('data', (chunck) => {
                        file.write(chunck)
                    })

                    return new Promise(resolve => {
                        stream.on('end', () => resolve(new Response(JSON.stringify(fileRef), { status: 201,headers:{'content-type':'application/json'} })))
                        stream.on('error', (err) => resolve(new Response(undefined, { status: 400, statusText: err.message })))
                    })
                }
                case 'DELETE': {
                    const url = new URL(req.url)
                    console.log(url.toString().replace(this.protocol, 'file://'))
                    const baseFilePath = fileURLToPath(url.toString().replace(this.protocol, 'file://'))
                    await fs.unlink(baseFilePath)
                    return new Response(undefined, { status: 200 })
                }

                default:
                    return new Response(null, { status: 403, statusText: 'method not set' })
            }
        })
    }

    get protocol() {
        return `${RawMosaicImagesProtocol.SCHEME}://`
    }

    async setup() {
        try {
            await fs.access(LOCAL_PATH)
        } catch {
            await fs.mkdir(LOCAL_PATH)
        }
    }

}
protocol.registerSchemesAsPrivileged([
    {
        scheme: RawMosaicImagesProtocol.SCHEME,
        privileges: {
            allowServiceWorkers: true,
            bypassCSP: true,
            stream: true,
            supportFetchAPI: true
        }
    }
])