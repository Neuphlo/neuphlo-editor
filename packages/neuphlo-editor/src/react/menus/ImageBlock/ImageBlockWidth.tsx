import { memo, useCallback, useEffect, useState } from "react"

export type ImageBlockWidthProps = {
  onChange: (value: number) => void
  value: number
}

export const ImageBlockWidth = memo(
  ({ onChange, value }: ImageBlockWidthProps) => {
    const [currentValue, setCurrentValue] = useState(value)

    useEffect(() => {
      setCurrentValue(value)
    }, [value])

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const nextValue = parseInt(e.target.value)
        onChange(nextValue)
        setCurrentValue(nextValue)
      },
      [onChange]
    )

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          minWidth: 140,
        }}
      >
        <span style={{ fontSize: "12px", whiteSpace: "nowrap", width: 40 }}>
          {currentValue}%
        </span>
        <input
          type="range"
          min="25"
          max="100"
          step="25"
          value={currentValue}
          onChange={handleChange}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            flex: 1,
            height: 3,
            borderRadius: 9999,
            appearance: "none",
            background: "linear-gradient(to right, #333 0%, #333 " + currentValue + "%, #ddd " + currentValue + "%, #ddd 100%)",
            outline: "none",
            cursor: "pointer",
          }}
          className="nph-image-width-slider"
        />
      </div>
    )
  }
)

ImageBlockWidth.displayName = "ImageBlockWidth"

export default ImageBlockWidth
