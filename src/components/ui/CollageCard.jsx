import { Link } from "react-router-dom";
import Label from "../ui/label/Label";
import {
  collageImageHeightClass,
  compactLabel,
  collageLabelWidthClass,
} from "../../utils/collage";
import { productFilterUrl } from "../../modules/products/utils/productFilterToken";

function CollageImage({ src, title, label, count, index }) {
  const imageLabel = label || title;
  const displayLabel = compactLabel(imageLabel);
  return (
    <div
      className={`group relative w-full overflow-hidden rounded-xl bg-gray-50 ${collageImageHeightClass(count, index)}`}
    >
      <img
        src={src}
        alt={label}
        width="300"
        height="300"
        className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-110"
        loading="lazy"
      />
      
      {/* Strong dark gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 pointer-events-none" />

      {imageLabel && (
        <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-none">
          <span className="block min-w-0 truncate font-sans text-[12px] sm:text-[13px] font-bold tracking-wide text-white drop-shadow-lg transform transition-transform duration-300 group-hover:-translate-y-0.5">
            {displayLabel}
          </span>
        </div>
      )}
    </div>
  );
}

export default function CollageCard({ section }) {
  const images = (section.images || [])
    .filter((item) => item?.image)
    .slice(0, 4);

  const sectionKey = String(section.key || "").toLowerCase();
  const sectionTitle = String(section.title || "").toLowerCase();
  const cardLink = section.category
    ? `/categories/${section.category}`
    : sectionKey.includes("new-arrivals") || sectionTitle.includes("new arrival")
      ? productFilterUrl({ newArrival: "true", sort: "newest" })
      : sectionKey.includes("trending") || sectionTitle.includes("trending")
        ? productFilterUrl({ sort: "popular" })
        : "/products";

  const normalizeCat = (c) =>
    String(c || "")
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "");
  const sectionCat = normalizeCat(section.category);
  const sectionTokens = sectionCat.split("-").filter(Boolean);

  const fallbackProducts = images
    .map((img) => ({
      _id: img.productId || img._id || img.id,
      id: img.productId || img._id || img.id,
      name: img.label || img.title,
      title: img.label || img.title,
      price: img.price,
      mrp: img.mrp || img.oldPrice,
      discountPercent: img.discountPercent,
      rating: img.rating,
      reviewCount: img.reviewCount,
      image: img.image,
      category: img.category || section.category,
      source: img.source,
      inStock: true,
    }))
    .filter((p) => {
      if (!section.category) return true;
      const cat = p.category;
      if (!cat) return false;
      const catId =
        typeof cat === "object"
          ? cat.slug || cat.key || cat.id || cat._id || cat.name
          : cat;
      const pCat = normalizeCat(catId);

      if (
        pCat === sectionCat ||
        pCat.includes(sectionCat) ||
        sectionCat.includes(pCat)
      )
        return true;

      // Partial word match (e.g. "mens-fashion" and "mens-watches" share "mens", "womens-fashion" and "...women" share "women")
      const pTokens = pCat.split("-").filter(Boolean);
      return sectionTokens.some((token) =>
        pTokens.some(
          (pToken) => token.includes(pToken) || pToken.includes(token),
        ),
      );
    });

  const displayImages = images.slice(0, 4);
  
  return (
    <Link to={cardLink} state={{ fallbackProducts }} className="block w-full h-full">
      <article className="flex flex-col h-full overflow-hidden rounded-xl bg-[#FFFCF6] border border-[#EAD9B6]/80 shadow-sm hover:shadow-md transition-shadow p-4 sm:p-5">
        
        {/* Header Section */}
        <div className="mb-4 flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-[#1B1D60] mb-1 truncate">
              {section.title}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 truncate">
              Explore top picks & more
            </p>
          </div>
          {section.label && (
            <Label
              variant="sectionLabel"
              className="shrink-0 text-[10px] font-bold text-[#A96F14] bg-[#CE9F2D]/15 border-0 rounded px-2 py-1"
            >
              {section.label}
            </Label>
          )}
        </div>

        {/* 2x2 Image Grid */}
        <div className="grid grid-cols-2 gap-2 flex-1">
          {displayImages.map((img, idx) => (
            <div key={idx} className="relative w-full h-24 sm:h-28 md:h-32 lg:h-36 bg-white rounded-lg overflow-hidden border border-[#EAD9B6]/40 group">
              <img 
                src={img.image} 
                alt={img.label || section.title} 
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" 
                loading="lazy" 
              />
            </div>
          ))}
          {/* Fill empty spots if less than 4 images */}
          {Array.from({ length: Math.max(0, 4 - displayImages.length) }).map((_, idx) => (
            <div key={`empty-${idx}`} className="w-full h-24 sm:h-28 md:h-32 lg:h-36 bg-gray-50/50 rounded-lg border border-[#EAD9B6]/40" />
          ))}
        </div>
        
      </article>
    </Link>
  );
}
