import { useState } from "react";

const ImageSkeleton = ({ src, alt }) => {
  const [loading, setLoading] = useState(true);

  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      
      {/* Skeleton */}
      {loading && (
        <div className="absolute inset-0 "></div>
      )}

      {/* Image */}
      <img
        src={src}
        alt={alt}
        className={`w-10 h-10 object-contain transition-opacity duration-300 ${
          loading ? "opacity-0" : "opacity-100"
        }`}
        onLoad={() => setLoading(false)}
      />
    </div>
  );
};

export default ImageSkeleton;