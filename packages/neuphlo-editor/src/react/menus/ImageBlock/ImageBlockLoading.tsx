import { IconLoader2 } from "@tabler/icons-react"

export const ImageBlockLoading = () => {
  return (
    <div className="nph-image-block-loading">
      <div className="nph-image-block-loading__overlay">
        <div className="nph-image-block-loading__content">
          <IconLoader2 size={24} className="nph-image-block-loading__spinner" />
          <p className="nph-image-block-loading__text">Uploading image...</p>
        </div>
      </div>
      <div className="nph-image-block-loading__placeholder" />
    </div>
  )
}

export default ImageBlockLoading
