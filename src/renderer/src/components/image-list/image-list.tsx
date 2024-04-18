import { useEffect, useState } from 'react'
import './image-list.css'
import CiagImage from '../image/image'
import { FileRef } from '@renderer/services/FileRef'

function ImageList(): JSX.Element {
  const [files, setFiles] = useState<Ciag.IFileRef[]>([])

  const listContent = async () => {
    const files = await window.api.LocalFiles.readMosaic()
    console.log(files)
    setFiles(files)
  }
  const selectFile = async () => {
    const pickerOpts: OpenFilePickerOptions = {
      types: [
        {
          description: "Images",
          accept: {
            "image/*": [".png", ".gif", ".jpeg", ".jpg"],
          },
        },
      ],
      excludeAcceptAllOption: true,
      multiple: false,
    };
    const [fileHandle] = await window.showOpenFilePicker(pickerOpts);
    const file = await fileHandle.getFile()
    const fileRef = await FileRef.fromFile(file,'test2')
    await listContent()
  }

  useEffect(() => {
    listContent().then()
  },[])

  return (
    <div>
      <button onClick={selectFile}>Select</button>
      <button onClick={listContent}>refresh</button>
      <h2>fotos locais</h2>
      <div className="image-list">
        
        {files.map((file, index) => {
          return <CiagImage key={index} fileRef={file}></CiagImage>
        })}
      </div>
    </div>
  )
}

export default ImageList
