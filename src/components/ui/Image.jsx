import { useState } from "react";

const ImageSkeleton = ({ src, alt, className = "", imageClassName = "" }) => {
  const [loading, setLoading] = useState(true);

  return (
    <div
      className={`relative flex h-7 md:h-10 w-7 md:w-10 items-center justify-center ${className}`}
    >
      {/* Skeleton */}
      {loading && (
        <div className="absolute inset-0 animate-pulse rounded-full bg-[var(--customer-gold-soft)]"></div>
      )}

      {/* Image */}
      <img loading="lazy" width="400" height="400"
        src={src}
        alt={alt}
        className={`h-12 w-12  rounded object-contain  transition-all duration-300 ease-in-out ${imageClassName} ${
          loading ? "opacity-0" : "opacity-100"
        }`}
        onLoad={() => setLoading(false)}
      />
    </div>
  );
};

export default ImageSkeleton;
