import { useState } from 'react'
import './image.css'
import { UploadService } from '@renderer/services/upload.service'
import { FileUploadRef } from '@renderer/services/FileUploadRef'
import { FileRef } from '@renderer/services/FileRef'

function CiagImage(props: { fileRef: FileRef }): JSX.Element {
  const [image, setImage] = useState<string>()

  const uploadFile = async () => {
    const uploadService = new UploadService()
    await uploadService.upload(new FileUploadRef(props.fileRef,'aws',))
  }

  return (
    <div className='photo-container'>
      <ul className="file-ref" >
        <li className="file-name">{props.fileRef.name}</li>
        <li className="file-path">{props.fileRef.path}</li>
        <li className="file-type">Type:{props.fileRef.type}</li>
      </ul>
      <img className='photo' src={props.fileRef.url}></img>
      {!!image &&
        <img src={image}></img>
        
      }
      <a className='upload-btn' onClick={uploadFile}>Select</a>
    </div>

  )
}

export default CiagImage
