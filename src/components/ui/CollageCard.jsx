import { useMemo } from "react";
import { Link } from "react-router-dom";
import { productFilterUrl } from "../../modules/products/utils/productFilterToken";

export default function CollageCard({ section }) {
  const images = (section.images || [])
    .filter((item) => item?.image)
    .slice(0, 4);

  const sectionKey = String(section.key || "").toLowerCase();
  const sectionTitle = String(section.title || "").toLowerCase();
  const cardLink = section.category
    ? `/categories/${section.category}`
    : sectionKey.includes("new-arrivals") ||
        sectionTitle.includes("new arrival")
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

  const fallbackProducts = useMemo(() => {
    return images
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

        const pTokens = pCat.split("-").filter(Boolean);
        return sectionTokens.some((token) =>
          pTokens.some(
            (pToken) => token.includes(pToken) || pToken.includes(token),
          ),
        );
      });
  }, [images, section.category, sectionCat, sectionTokens]);

  const displayImages = images.slice(0, 4);
  const mainImage =
    section.displayImage ||
    section.bannerUrl ||
    (displayImages[0] ? displayImages[0].image : "");

  // Use string hash for consistent theme index
  const getHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return Math.abs(hash);
  };
  const themeIndex = sectionTitle ? getHash(sectionTitle) % 3 : 0;
  const themes = [
    {
      bg: "bg-gradient-to-br from-[#FFF5F2] to-[#FFF0EB]",
      badge: "bg-[#FBD9D0] text-[#8C3A21]",
    }, // Peach
    {
      bg: "bg-gradient-to-br from-[#F2F9F2] to-[#E6F4E6]",
      badge: "bg-[#438258] text-white",
    }, // Green
    {
      bg: "bg-gradient-to-br from-[#F7F2FA] to-[#F1E8F6]",
      badge: "bg-[#B892D8] text-white",
    }, // Purple
  ];
  const theme = themes[themeIndex];

  return (
    <Link
      to={cardLink}
      state={{ fallbackProducts }}
      className="block w-full h-full group/card"
    >
      <article
        className={`relative flex flex-col h-full min-h-[300px] sm:min-h-[380px] lg:min-h-[440px] overflow-hidden rounded-[24px] ${theme.bg} shadow-sm hover:shadow-xl transition-all duration-300 border border-white/60`}
      >
        {/* Subtle background element */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/40 rounded-full blur-3xl pointer-events-none" />

        {/* Header Section */}
        <div className="p-3 sm:p-4 flex flex-col relative z-10">
          <h2 className="text-lg sm:text-xl lg:text-[22px] font-bold text-gray-800 tracking-tight leading-snug">
            {section.title || "Featured Collection"}
          </h2>
          <p className="text-[12px] sm:text-[13px] text-gray-500 font-medium mt-0.5">
            {section.subtitle || "Explore our handpicked styles"}
          </p>
        </div>
        <div className="grid grid-cols-5 grid-rows-2 gap-1.5 px-3 pb-3 sm:px-4 sm:pb-4 flex-1 relative z-10">
          {displayImages.map((img, idx) => {
            let colSpanClass = "col-span-2";
            if (themeIndex === 0) {
              colSpanClass =
                idx === 0 || idx === 3 ? "col-span-3" : "col-span-2";
            } else if (themeIndex === 1) {
              colSpanClass =
                idx === 1 || idx === 2 ? "col-span-3" : "col-span-2";
            } else {
              colSpanClass =
                idx === 0 || idx === 2 ? "col-span-3" : "col-span-2";
            }

            return (
              <div
                key={idx}
                className={`relative w-full h-full bg-white/80 overflow-hidden group/img rounded-xl shadow-sm ${colSpanClass}`}
              >
                <img
                  src={img.image}
                  alt={img.label || img.title || section.title}
                  className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover/img:scale-110"
                  loading="lazy"
                />
              </div>
            );
          })}

          {/* Fill empty spots if less than 4 images */}
          {Array.from({ length: Math.max(0, 4 - displayImages.length) }).map(
            (_, idx) => {
              const emptyIdx = displayImages.length + idx;
              let colSpanClass = "col-span-2";
              if (themeIndex === 0) {
                colSpanClass =
                  emptyIdx === 0 || emptyIdx === 3
                    ? "col-span-3"
                    : "col-span-2";
              } else if (themeIndex === 1) {
                colSpanClass =
                  emptyIdx === 1 || emptyIdx === 2
                    ? "col-span-3"
                    : "col-span-2";
              } else {
                colSpanClass =
                  emptyIdx === 0 || emptyIdx === 2
                    ? "col-span-3"
                    : "col-span-2";
              }
              return (
                <div
                  key={`empty-${idx}`}
                  className={`w-full h-full bg-white/40 rounded-xl ${colSpanClass}`}
                />
              );
            },
          )}
        </div>

        {/* Action Button */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-900 shadow-sm transition-transform duration-300 group-hover/card:scale-110">
            <svg
              className="h-5 w-5 -rotate-45"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </div>
        </div>
      </article>
    </Link>
  );
}
