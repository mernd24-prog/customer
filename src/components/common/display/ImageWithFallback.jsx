import { useState } from "react";
import { cn } from "../../../lib/utils";

export default function ImageWithFallback({
  src,
  alt = "",
  fallbackSrc = "/images/placeholder.png",
  className = "",
  imgClassName = "",
  skeletonClass = "",
  showSkeleton = true,
  ...props
}) {
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);

  const handleError = (e) => {
    if (!errored) {
      setErrored(true);
      e.currentTarget.src = fallbackSrc;
    }
    setLoading(false);
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {showSkeleton && loading && (
        <div className={cn("absolute inset-0 animate-pulse bg-gray-100", skeletonClass)} />
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoading(false)}
        onError={handleError}
        className={cn(
          "h-full w-full object-cover transition-all duration-300 ease-in-out",
          loading ? "opacity-0" : "opacity-100",
          imgClassName,
        )}
        {...props}
      />
    </div>
  );
}
