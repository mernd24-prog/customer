import { useState } from "react";

const ImageSkeleton = ({ src, alt }) => {
  const [loading, setLoading] = useState(true);

  return (
    <div className="relative w-10 h-10 flex items-center justify-center">

      {/* Skeleton */}
      {loading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-full"></div>
      )}

      {/* Image */}
      <img
        src={src}
        alt={alt}
        className={`w-8 h-8 rounded object-contain transition-all duration-300 ease-in-out ${loading ? "opacity-0" : "opacity-100"
          }`}
        onLoad={() => setLoading(false)}
      />
    </div>
  );
};

export default ImageSkeleton;