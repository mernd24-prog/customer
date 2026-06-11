import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { SKELETON_PRESETS, SkeletonLoader } from "../common/skeleton";
import { collageCard } from "../../constants/image.constant";
import Label from "../common/label/Label";
function CollageImage({ src, title, link, label }) {
  const imageLabel = label || title;
  return (
    <div className="relative h-28 w-full overflow-hidden bg-[var(--customer-cream)] md:w-full lg:h-36">
      <Link to={link}>
        <img
          src={src}
          alt={label}
          className="h-full w-full object-cover object-top transition-all duration-300 ease-in-out hover:scale-105"
          loading="lazy"
        />
        {imageLabel && (
          <span className="absolute bottom-3 left-3 rounded-full backdrop-blur-[20px] text-[#FFFFFF] ">
            <Label variant="imageLabel">{imageLabel}</Label>
          </span>
        )}
      </Link>
    </div>
  );
}
function CollageCard({ section }) {
  return (
    <article className="overflow-hidden rounded-[20px] bg-[#CE9F2D33] border border-[#CE9F2D66] ">
      <div className="flex items-center justify-between px-6 py-5">
        <h2 className="font-dm-sans text-[15px] font-bold leading-[100%] tracking-[0%] align-middle text-[#2E2E2E] sm:text-[16px] lg:text-[18px]">
          {section.title}
        </h2>
        
        <Label variant="outline">{section.label}</Label>
      </div>
      <div className="grid grid-cols-2 gap-[1px]">
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
function toCollageSections(cmsPages = []) {
  const sections = (Array.isArray(cmsPages) ? cmsPages : [])
    .filter((page) => String(page?.pageType || "") === "homepage-slide")
    .slice(0, 4)
    .map((page) => ({
      title: page?.title || "Featured",
      label: page?.metadata?.badge || "Trending",
      images: [
        {
          image: page?.coverImage || page?.metadata?.coverImage || "",
          link: page?.metadata?.ctaLink || `/cms/${page?.slug || ""}`,
          label: page?.metadata?.label || page?.title || "Featured",
        },
      ].filter((img) => img.image),
    }))
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
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4 h-full">
          {visibleSections.map((section, idx) => (
            <CollageCard key={idx} section={section} />
          ))}
        </div>
      )}
    </section>
  );
}
