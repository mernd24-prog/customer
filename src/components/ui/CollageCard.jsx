import { Link } from "react-router-dom";
import Label from "../common/label/Label";
import { collageImageHeightClass, compactLabel, collageLabelWidthClass } from "../../utils/collage";

function CollageImage({ src, title, label, count, index }) {
  const imageLabel = label || title;
  const displayLabel = compactLabel(imageLabel);
  return (
    <div className={`relative w-full overflow-hidden bg-[var(--customer-cream)] ${collageImageHeightClass(count, index)}`}>
      <img
        src={src}
        alt={label}
        className="h-full w-full object-cover object-top transition-all duration-300 ease-in-out hover:scale-105"
        loading="lazy"
      />
      {imageLabel && (
        <span
          className={`absolute bottom-[14px] left-1/2 flex min-h-[29px] -translate-x-1/2 items-center justify-center rounded-[25px] border border-[#FFFFFF80] bg-[#FFFFFF66] px-3 py-[5px] text-white shadow-[0px_4px_16px_rgba(0,0,0,0.12)] backdrop-blur-[20px] ${collageLabelWidthClass(count, index)}`}
          title={imageLabel}
        >
          <span className="block min-w-0 truncate font-dm-sans text-[12px] font-medium leading-[16px]">
            {displayLabel}
          </span>
        </span>
      )}
    </div>
  );
}

export default function CollageCard({ section }) {
  const images = (section.images || []).filter((item) => item?.image).slice(0, 4);
  const cardLink = section.category ? `/categories/${section.category}` : "/products";
  
  const fallbackProducts = images.map((img) => ({
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
    category: img.category,
    source: img.source,
    inStock: true
  }));

  return (
    <Link to={cardLink} state={{ fallbackProducts }} className="block transition-transform hover:-translate-y-1">
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
