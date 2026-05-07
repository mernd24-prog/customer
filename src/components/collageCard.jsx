import { Link } from "react-router-dom";
import { collageCards } from "../data/homeSections";

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
        {section.images.map((ele) => (
          <CollageImage src={ele.image} link={ele.link} title={section.title} />
        ))}
      </div>
    </article>
  );
}

export default function CollageMainSection() {
  return (
    <section className="    overflow-hidden lg:my-10">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {collageCards.map((section, idx) => (
          <CollageCard index={idx} section={section} />
        ))}
      </div>
    </section>
  );
}
