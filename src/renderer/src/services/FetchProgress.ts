export class FetchProgress {

    static put(url: string, body: XMLHttpRequestBodyInit, onProgress: (percent: number) => any) {
        return new Promise<void>((resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.upload.addEventListener("progress", (ev) => this.progressHandler(ev, onProgress), false);
            xhr.addEventListener("load", (ev) => resolve(), false);
            xhr.addEventListener("error", (ev) => {
                console.error('XMLHttp request upload failed')
                reject('error')
            }, false);
            xhr.addEventListener("abort", (ev) => {
                console.error('XMLHttp request upload aborted')
                reject('abort')
            }, false);
            xhr.open('PUT', url);
            xhr.send(body);
        })
    }

    private static progressHandler(event, onProgress: (percent: number) => any) {
        var percent = (event.loaded / event.total) * 100;
        onProgress(Math.round(percent));
    }
}

