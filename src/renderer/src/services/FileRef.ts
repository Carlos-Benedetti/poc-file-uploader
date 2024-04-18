export class FileRef {
    constructor(
        public type: string,
        public name: string,
        public path: string,
        public url: string
    ) { }

    static async fromFile(file: File, path: string) {
        const t = await file.arrayBuffer()

        await fetch(`app-raw-mosaic:///${encodeURI(path)}/${file.name}`, {
            method: 'PUT', body: t, headers:
            {
                'x-file-name': file.name
            }
        })
    }
}