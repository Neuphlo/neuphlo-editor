import { IconPhoto, IconUpload } from "@tabler/icons-react"
import { ChangeEvent, useCallback, useRef, useState, DragEvent } from "react"
import { Editor } from "@tiptap/react"
import { ImageBlockLoading } from "./ImageBlockLoading"

export type ImageUploaderProps = {
  onUpload: (url: string) => void
  editor: Editor
}

export const ImageUploader = ({ onUpload, editor }: ImageUploaderProps) => {
  const [loading, setLoading] = useState(false)
  const [draggedInside, setDraggedInside] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadFile = useCallback(
    async (file: File) => {
      setLoading(true)
      try {
        // Get the upload handler from the editor
        const imageExtension = editor.extensionManager.extensions.find(
          (ext) => ext.name === "imageBlock"
        )
        const uploadImage = (imageExtension?.options as any)?.uploadImage

        if (uploadImage) {
          const url = await uploadImage(file)
          onUpload(url)
        } else {
          console.error("No uploadImage handler provided")
        }
      } catch (error) {
        console.error("Failed to upload image:", error)
      } finally {
        setLoading(false)
      }
    },
    [editor, onUpload]
  )

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const onFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        uploadFile(file)
      }
    },
    [uploadFile]
  )

  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setDraggedInside(false)

      const file = e.dataTransfer.files[0]
      if (file && /image/i.test(file.type)) {
        uploadFile(file)
      }
    },
    [uploadFile]
  )

  const onDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDraggedInside(true)
  }, [])

  const onDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDraggedInside(false)
  }, [])

  if (loading) {
    return <ImageBlockLoading />
  }

  return (
    <div
      className={`nph-image-uploader${draggedInside ? " nph-image-uploader--dragging" : ""}`}
      onDrop={onDrop}
      onDragOver={onDragEnter}
      onDragLeave={onDragLeave}
      contentEditable={false}
    >
      <IconPhoto size={48} className="nph-image-uploader__icon" />
      <div className="nph-image-uploader__content">
        <div className="nph-image-uploader__text">
          {draggedInside ? "Drop image here" : "Drag and drop or"}
        </div>
        <div>
          <button
            type="button"
            disabled={draggedInside}
            onClick={handleUploadClick}
            className="nph-btn nph-btn-ghost nph-btn-sm nph-image-uploader__button"
          >
            <IconUpload size={16} />
            Upload an image
          </button>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.gif"
        onChange={onFileChange}
        className="nph-image-uploader__input"
      />
    </div>
  )
}

export default ImageUploader
