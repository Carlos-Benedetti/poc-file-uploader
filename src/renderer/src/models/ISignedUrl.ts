export type ISignedUrl<T extends 'signed' | undefined = undefined, R = T extends 'signed' ? { url: string } : {}> = {
    id?: number;
    originalFilename?: string;
    filename?: string;
  } & R;
  