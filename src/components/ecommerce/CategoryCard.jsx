import { Link } from "react-router-dom";
import { cn } from "../../utils/classNames";

export default function CategoryCard({
  image,
  title,
  href,
  active,
  onClick,
  className = "",
}) {
  const content = (
    <article
      className={cn(
        "h-full w-full cursor-pointer rounded-[8px] border border-card-border bg-white p-4 transition hover:bg-card-border",
        active && "ring-2 ring-primary/50",
        className,
      )}
    >
      <div className="overflow-hidden rounded-[8px] bg-[#FAF6EE]">
        <img src={image} alt={title} className="aspect-[284/256] w-full object-cover transition duration-300 hover:scale-[1.02]" loading="lazy" decoding="async" />
      </div>
      <p className="mt-3 line-clamp-1 text-center font-montserrat text-[15px] font-medium leading-6 sm:text-[16px] lg:text-[18px]">
        {title}
      </p>
    </article>
  );

  if (href) {
    return (
      <Link to={href} onClick={onClick} className="block h-full">
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className="block h-full w-full text-left">
      {content}
    </button>
  );
}
