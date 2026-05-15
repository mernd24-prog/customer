import { Link } from "react-router-dom";
import { hrefOr, textOr } from "../../utils/content";

export default function PromoSlideCard({ slide }) {
  const title = textOr(slide?.name, textOr(slide?.title, "Featured offer"));
  return (
    <Link to={hrefOr(slide?.link, "/products")}>
      <div className="relative rounded-b-xl overflow-hidden group h-[350px] p-3 xl:p-0 md:h-full">
        <img
          src={slide?.image}
          alt={title}
          className="w-full rounded-b-2xl h-full object-cover object-top duration-700 transition-transform hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
          <p className="text-white font-montserrat font-bold text-lg md:text-xl">
            {title}
          </p>
        </div>
      </div>
    </Link>
  );
}
