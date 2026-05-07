import { Link } from "react-router-dom";
import { collageCards } from "../../data/homeSections";
import { useEffect, useState } from "react";
import { SkeletonLoader, SKELETON_PRESETS } from "../common/skeleton";

function CollageImage({ src, title, link, index }) {
  return (
    <div
      className={`w-full h-28 md:w-full  lg:h-36 overflow-hidden rounded-lg bg-[#ece8df] `}
      key={index}
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
      className={`rounded-2xl    p-4 sm:p-[18px]  ${index % 2 === 0 ? "bg-[#F5F5F9]" : "bg-[#FCFAF4]"}`}
      key={index}
    >
      <h2 className="mb-4 font-montserrat text-lg font-medium  text-[#262626] md:text-xl">
        {section.title}
      </h2>

      <div className="grid gap-2  xs:grid-cols-2" key={index}>
        {section?.images?.map((ele) => (
          <CollageImage
            src={ele.image}
            link={ele.link}
            title={section.title}
            index={index}
          />
        ))}
      </div>
    </article>
  );
}

export default function CollageMainSection() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="overflow-hidden my-8 lg:my-12">
      {loading ? (
        <SkeletonLoader
          layout={SKELETON_PRESETS.HERO_CARDS}
          count={4}
          containerClass="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 ">
          {collageCards.map((section, idx) => (
            <CollageCard index={idx} section={section} />
          ))}
        </div>
      )}
    </section>
  );
}
