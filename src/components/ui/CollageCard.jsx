import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { SKELETON_PRESETS, SkeletonLoader } from "../common/skeleton";

function CollageImage({ src, title, link }) {
  return (
    <div
      className={`w-full h-28 md:w-full  lg:h-36 overflow-hidden rounded-lg bg-[#ece8df] `}
    >
      <Link to={link}>
        <img
          src={src}
          alt={title}
          className="h-full w-full object-top  object-cover transition-transform hover:scale-105"
          loading="lazy"
        />
      </Link>
    </div>
  );
}

function CollageCard({ section, index }) {
  return (
    <article
      className={`rounded-2xl  p-4 sm:p-[18px]  ${index % 2 === 0 ? "bg-[#F5F5F9]" : "bg-[#FCFAF4]"}`}
    >
      <h2 className="mb-4 font-montserrat text-lg font-medium  text-[#262626] md:text-xl">
        {section.title}
      </h2>

      <div className="grid gap-2  xs:grid-cols-2">
        {section.images.map((ele, idx) => (
          <CollageImage key={idx} src={ele.image} link={ele.link} title={section.title} />
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

  return (
    <section className="overflow-hidden lg:my-10">
      {loading ? (
        <SkeletonLoader
          layout={SKELETON_PRESETS.HERO_CARDS}
          count={4}
          containerClass="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {sections.map((section, idx) => (
            <CollageCard key={idx} index={idx} section={section} />
          ))}
        </div>
      )}
    </section>
  );
}
