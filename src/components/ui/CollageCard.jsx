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
      className={`relative w-full overflow-hidden bg-[var(--customer-cream)] ${collageImageHeightClass(count, index)}`}
    >
      <img
        src={src}
        alt={label}
        width="300"
        height="300"
        className="h-full w-full object-cover object-top transition-all duration-300 ease-in-out hover:scale-105"
        loading="lazy"
      />
      {imageLabel && (
        <Label
          variant="imageLabel"
          className={`absolute bottom-[14px] left-1/2 flex min-h-[29px] -translate-x-1/2 items-center justify-center rounded-[25px] border border-[#CE9F2D] bg-[#1F2430] bg-[linear-gradient(#CE9F2D,#CE9F2D)] px-3 py-[5px] text-white font-bold shadow-md ${collageLabelWidthClass(count, index)}`}
          title={imageLabel}
        >
          <span className="block min-w-0 truncate font-dm-sans text-[12px] font-bold leading-[16px] text-white">
            {displayLabel}
          </span>
        </Label>
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

  return (
    <Link to={cardLink} state={{ fallbackProducts }} className="block ">
      <article className="overflow-hidden rounded-[24px] border border-[#E8B84B] bg-[#F8EFD8] transition-shadow hover:shadow-md">
        <div className="flex min-h-[76px] items-center justify-between gap-3 px-4 py-4 sm:px-5 sm:py-5 lg:px-6">
          <h2 className="min-w-0 flex-1 overflow-hidden line-clamp-1 text-extaSmall font-bold text-[#2E2E2E]">
            {section.title}
          </h2>

          <Label
            variant="sectionLabel"
            className="shrink-0 text-[12px] font-medium"
          >
            {section.label}
          </Label>
        </div>
        <div className="grid grid-cols-2 gap-0">
          {images.map((ele, idx) => (
            <CollageImage
              key={idx}
              src={ele.image}
              title={ele.title || ele.label}
              label={ele.label}
              count={images.length}
              index={idx}
            />
          ))}
        </div>
      </article>
    </Link>
  );
}
