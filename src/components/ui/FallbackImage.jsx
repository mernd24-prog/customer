
import { useState } from "react";

export default function FallbackImage({
  src,
  fallbackSrc,
  alt = "",
  onError,
  ...props
}) {
  const [failedSrc, setFailedSrc] = useState("");

  const imageSrc =
    typeof src === "string" && src.trim()
      ? src.trim()
      : "";

  const fallbackImageSrc =
    typeof fallbackSrc === "string" && fallbackSrc.trim()
      ? fallbackSrc.trim()
      : "";

  const shouldUseFallback =
    !imageSrc || failedSrc === imageSrc;

  const finalSrc = shouldUseFallback
    ? fallbackImageSrc
    : imageSrc;

  return (
    <img
      {...props}
      src={finalSrc || undefined}
      alt={alt}
      onError={(event) => {
        onError?.(event);

        if (!shouldUseFallback && imageSrc) {
          setFailedSrc(imageSrc);
        }
      }}
    />
  );
}
