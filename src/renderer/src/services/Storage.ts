import { ISignedUrl } from "@renderer/models/ISignedUrl";
import { FileUploadRef } from "./FileUploadRef";
import { FetchProgress } from "./FetchProgress";


abstract class Storage {
    static storageId: string
    abstract upload(attachment: FileUploadRef): Promise<string>
}

class AwsStorage implements Storage {
    static storageId = 'aws'
    constructor(public host: string, private port: string, private path: string, private auth: string) { }

    public  async upload(fileUploadRef: FileUploadRef): Promise<string> {
        const fileRef = fileUploadRef.fileRef
        const blob = await fetch(fileRef.url).then(r => r.blob())
        const [signedUrl] = await this.getSignedRequest('put',[{ filename: fileRef.name }])

        await FetchProgress.put(signedUrl.url, blob, (progress) => {
            console.log('Upload percent: ' + progress + '%')
        })
        return 'fetched'
    }

    private getSignedRequest(method: 'put' | 'get', signedUrls: ISignedUrl[]): Promise<ISignedUrl<'signed'>[]> {
        return fetch(this.getUrl(method), {
            method: 'POST',
            body: JSON.stringify(signedUrls),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.auth
            }
        }).then(r => r.json())
    }

    private getUrl(method: 'put' | 'get') {
        const url = new URL(this.path, this.host)
        url.port = this.port
        url.searchParams.append('method', method)
        return url
    }
}

export function createStorage(storageId: string): Storage {
    switch (storageId) {
        case 'aws':
            return new AwsStorage('http://localhost', '3000', '/api/signed-url', 'no-auth')
            
        case 'minio':
            return new AwsStorage('http://localhost', '3000', '/api/signed-url', 'no-auth')
        default:
            throw new Error('Storage não encontrado: ' + storageId)
            break;
    }
}