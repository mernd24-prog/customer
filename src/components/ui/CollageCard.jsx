import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { SKELETON_PRESETS, SkeletonLoader } from "../common/skeleton";
import { collageCard } from "../../constant/image.constant";

function CollageImage({ src, title, link }) {
  return (
    <div className="h-28 w-full overflow-hidden rounded-[var(--customer-radius)] bg-[var(--customer-cream)] md:w-full lg:h-36">
      <Link to={link}>
        <img
          src={src}
          alt={title}
          className="h-full w-full object-top  object-cover transition-all duration-300 ease-in-out hover:scale-105"
          loading="lazy"
        />
      </Link>
    </div>
  );
}

function CollageCard({ section, index }) {
  return (
    <article
      className="customer-card p-4 sm:p-[18px]"
      style={{
        "--customer-card-bg":
          index % 2 === 0
            ? "var(--customer-navy-soft)"
            : "var(--customer-surface-soft)",
      }}
    >
      <h2 className="mb-4  text-lg font-bold text-[var(--customer-navy)] md:text-xl">
        {section.title}
      </h2>

      <div className="grid gap-2  xs:grid-cols-2">
        {section.images.map((ele, idx) => (
          <CollageImage
            key={idx}
            src={ele.image}
            link={ele.link}
            title={section.title}
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
      images: [
        {
          image: page?.coverImage || page?.metadata?.coverImage || "",
          link: page?.metadata?.ctaLink || `/cms/${page?.slug || ""}`,
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
      images: [
        { image: collageCard.menFashion, link: "/categories/mens-fashion" },
        { image: collageCard.stylishPair, link: "/products" },
        { image: collageCard.blazer, link: "/categories/fashion" },
        { image: collageCard.watch, link: "/categories/accessories" },
      ],
    },
    {
      title: "Up to 60% Off Home & Lifestyle",
      images: [
        { image: collageCard.homeDecor, link: "/categories/home" },
        { image: collageCard.smartHome, link: "/categories/electronics" },
      ],
    },
    {
      title: "Trending in Women's Fashion",
      images: [
        { image: collageCard.stylishPair, link: "/categories/womens-fashion" },
        { image: collageCard.watch, link: "/categories/jewellery" },
      ],
    },
    {
      title: "Top Picks in Kids Fashion",
      images: [
        { image: collageCard.blazer, link: "/categories/kids" },
        { image: collageCard.menFashion, link: "/products" },
      ],
    },
  ];
  const visibleSections = sections.length ? sections : fallbackSections;

  return (
    <section className="overflow-hidden lg:my-8">
      {loading ? (
        <SkeletonLoader
          layout={SKELETON_PRESETS.HERO_CARDS}
          count={4}
          containerClass="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {visibleSections.map((section, idx) => (
            <CollageCard key={idx} index={idx} section={section} />
          ))}
        </div>
      )}
    </section>
  );
}
