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

  const imageExtension = editor.extensionManager.extensions.find(
    (ext) => ext.name === "imageBlock"
  )
  const browseAssets = (imageExtension?.options as any)?.browseAssets

  const uploadFile = useCallback(
    async (file: File) => {
      setLoading(true)
      try {
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
    [imageExtension, onUpload]
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

  // When browseAssets is provided, show a clean asset browser CTA
  if (browseAssets) {
    return (
      <div
        className="nph-image-uploader nph-image-uploader--browse-only"
        contentEditable={false}
        onClick={() => browseAssets(onUpload)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            browseAssets(onUpload)
          }
        }}
      >
        <div className="nph-image-uploader__browse-cta">
          <div className="nph-image-uploader__browse-icon-wrapper">
            <IconPhoto size={28} />
          </div>
          <div className="nph-image-uploader__browse-text">
            <span className="nph-image-uploader__browse-title">Choose from assets</span>
            <span className="nph-image-uploader__browse-subtitle">Select an image from your library</span>
          </div>
        </div>
      </div>
    )
  }

  // Fallback: standard drag-and-drop / upload flow
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
        <div className="nph-image-uploader__actions">
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
