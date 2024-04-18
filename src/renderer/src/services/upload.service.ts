import { FileUploadRef } from "./FileUploadRef";
import { createStorage } from "./Storage";

export class UploadService{

    upload(fileUploadRef:FileUploadRef ){
        const storage = createStorage(fileUploadRef.storageId)
        return storage.upload(fileUploadRef)
    }
}