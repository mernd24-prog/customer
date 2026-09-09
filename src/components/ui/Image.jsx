import { useState } from "react";

const ImageSkeleton = ({ src, alt, className = "", imageClassName = "" }) => {
  const [loading, setLoading] = useState(true);

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center ${className}`}
    >
      {/* Skeleton */}
      {loading && (
        <div className="absolute inset-0 animate-pulse rounded-full bg-[var(--customer-gold-soft)]"></div>
      )}

      {/* Image */}
      <img loading="lazy" width="600" height="600"
        src={src}
        alt={alt}
        className={`h-full w-full rounded object-contain transition-all duration-300 ease-in-out ${imageClassName} ${
          loading ? "opacity-0" : "opacity-100"
        }`}
        onLoad={() => setLoading(false)}
      />
    </div>
  );
};

export default ImageSkeleton;
