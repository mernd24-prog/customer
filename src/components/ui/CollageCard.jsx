import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { SKELETON_PRESETS, SkeletonLoader } from "../common/skeleton";
import { collageCard } from "../../constants/image.constant";
import Label from "../common/label/Label";
function CollageImage({ src, title, link, label }) {
  const imageLabel = label || title;
  return (
    <div className="relative h-[100px] w-full overflow-hidden bg-[var(--customer-cream)] sm:h-[160px] lg:h-[150px] xl:h-[150px]">
      <Link to={link}>
        <img
          src={src}
          alt={label}
          className="h-full w-full object-cover object-top transition-all duration-300 ease-in-out hover:scale-105"
          loading="lazy"
        />
        {imageLabel && (
          <span className="absolute bottom-[14px] left-[14px]">
            <Label
              variant="imageLabel"
              className="  font-medium text-[12px]"
            >
              {imageLabel}
            </Label>
          </span>
        )}
      </Link>
    </div>
  );
}
function CollageCard({ section }) {
  return (
    <article className="overflow-hidden rounded-[24px] border border-[#E8B84B] bg-[#F8EFD8]">
      <div className="flex min-h-[76px] items-center justify-between gap-3 px-4 py-4 sm:px-5 sm:py-5 lg:px-6">
        <h2 className="min-w-0  flex-1 overflow-hidden line-clamp-1 text-extaSmall font-bold text-[#2E2E2E]">
          {section.title}
        </h2>

        <Label
          variant="sectionLabel"
          className="shrink-0  text-[12px]   font-medium  "
        >
          {section.label}
        </Label>
      </div>
      <div className="grid grid-cols-2 gap-0">
        {section.images.map((ele, idx) => (
          <CollageImage
            key={idx}
            src={ele.image}
            link={ele.link}
            title={ele.title || ele.label}
            label={ele.label}
          />
        ))}
      </div>
    </article>
  );
}
const getImageUrl = (image) =>
  typeof image === "string"
    ? image
    : image?.url || image?.image || image?.imageUrl || image?.src || image?.coverImage || "";

const getLinkUrl = (item = {}, fallback = "/products") =>
  item.link || item.url || item.href || item.cta?.url || fallback;

const toCollageImage = (item = {}, fallbackLink = "/products") => ({
  image: getImageUrl(item.image || item),
  link: getLinkUrl(item, fallbackLink),
  label: item.label || item.title || item.alt || "Featured",
});

function toCollageSections(cmsPages = []) {
  const sections = (Array.isArray(cmsPages) ? cmsPages : [])
    .filter((page) => String(page?.pageType || "") === "homepage-slide")
    .sort((a, b) => Number(a?.sortOrder || 0) - Number(b?.sortOrder || 0))
    .slice(0, 4)
    .map((page) => {
      const metadata = page?.metadata || {};
      const metadataData = metadata?.data || {};
      const fallbackLink =
        metadata?.ctaLink ||
        metadataData?.ctaLink ||
        page?.cta?.url ||
        `/cms/${page?.slug || ""}`;
      const sectionImages = (Array.isArray(page?.sections) ? page.sections : [])
        .flatMap((section) => [
          section?.image,
          ...(Array.isArray(section?.gallery) ? section.gallery : []),
          ...(Array.isArray(section?.points) ? section.points.map((point) => ({
            image: point?.image,
            label: point?.title,
            link: point?.cta?.url,
          })) : []),
        ]);
      const metadataImages =
        metadata?.images ||
        metadataData?.images ||
        metadata?.cards ||
        metadataData?.cards ||
        [];
      const galleryImages = [
        ...(Array.isArray(page?.gallery) ? page.gallery : []),
        ...(Array.isArray(page?.galleryImages) ? page.galleryImages : []),
      ];
      const sourceImages = [
        ...(Array.isArray(metadataImages) ? metadataImages : []),
        ...sectionImages,
        ...galleryImages,
        page?.coverImage || page?.metadata?.coverImage || page?.image,
      ];

      return {
        title: page?.title || metadataData?.title || "Featured",
        label: metadata?.badge || metadataData?.badge || "Trending",
        images: sourceImages
          .map((item) => toCollageImage(item, fallbackLink))
          .filter((img) => img.image)
          .slice(0, 4),
      };
    })
    .filter((section) => section.images.length > 0);
  return sections;
}
export default function CollageMainSection({ cmsPages = [] }) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  const sections = toCollageSections(cmsPages);
  const fallbackSections = [
    {
      title: "Best Sellers in Men's Fashion",
      label: "Trending",
      images: [
        {
          image: collageCard.menFashion,
          link: "/categories/mens-fashion",
          label: "Sneakers",
        },
        { image: collageCard.stylishPair, link: "/products", label: "Jackets" },
        {
          image: collageCard.blazer,
          link: "/categories/fashion",
          label: "Shirts",
        },
        {
          image: collageCard.watch,
          link: "/categories/accessories",
          label: "Trousers",
        },
      ],
    },
    {
      title: "Up to 60% Off Home & Lifestyle",
      label: "Hot Deal",
      images: [
        {
          image: collageCard.homeDecor,
          link: "/categories/home",
          label: "Vases",
        },
        {
          image: collageCard.smartHome,
          link: "/categories/electronics",
          label: "Sofas",
        },
        {
          image: collageCard.plants,
          link: "/categories/fashion",
          label: "Plants",
        },
        {
          image: collageCard.candles,
          link: "/categories/accessories",
          label: "Candles",
        },
      ],
    },
    {
      title: "Trending in Women's Fashion",
      label: "New In",
      images: [
        {
          image: collageCard.hats,
          link: "/categories/womens-fashion",
          label: "Hats",
        },
        {
          image: collageCard.handbags,
          link: "/categories/jewellery",
          label: "Handbags",
        },
        {
          image: collageCard.jeweler,
          link: "/categories/fashion",
          label: "Jewelry",
        },
        {
          image: collageCard.heels,
          link: "/categories/accessories",
          label: "Heels",
        },
      ],
    },
    {
      title: "Top Picks in Kids Fashion",
      label: "Popular",
      images: [
        { image: collageCard.caps, link: "/categories/kids", label: "Caps" },
        { image: collageCard.shorts, link: "/products", label: "Shorts" },
        {
          image: collageCard.shoes,
          link: "/categories/fashion",
          label: "Shoes",
        },
        {
          image: collageCard.socks,
          link: "/categories/accessories",
          label: "Socks",
        },
      ],
    },
  ];
  const visibleSections = sections.length ? sections : fallbackSections;
  return (
    <section className="my-6 overflow-hidden sm:my-7 md:my-8">
      {loading ? (
        <SkeletonLoader
          layout={SKELETON_PRESETS.HERO_CARDS}
          count={4}
          containerClass="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:gap-8 md:grid-cols-2 xl:grid-cols-4 h-full">
          {visibleSections.map((section, idx) => (
            <CollageCard key={idx} section={section} />
          ))}
        </div>
      )}
    </section>
  );
}
