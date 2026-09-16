import { Link } from "react-router-dom";

export default function ShoppingMadeEasyBanner({
  data = null,
  className = "",
}) {
  if (!data) return null;
    const section =
    data?.sections?.[0] ||
    data?.metadata?.data?.sections?.[0] ||
    data;

  const bannerImage =
    data?.image?.url ||
    data?.heroImage ||
    data?.coverImage ||
    section?.image?.url ||
    (typeof section?.image === "string" ? section.image : "") ||
    "";

  const rawDiscount =
    section?.points?.[0]?.title ||
    data?.points?.[0]?.title ||
    section?.description ||
    data?.excerpt ||
    "";

  const discount = String(rawDiscount)
    .replace(/%\s*off/i, "")
    .replace(/%/g, "")
    .trim();

  const titleText =
    section?.title ||
    data?.title ||
    "";

  // If there is no image AND no title AND no discount → nothing to show
  if (!bannerImage && !titleText && !discount) return null;

  // 4. CTA link and target from CMS section or top-level
  const rawCtaUrl = String(
    section?.cta?.url ||
    data?.cta?.url ||
    section?.points?.[0]?.cta?.url ||
    data?.points?.[0]?.cta?.url ||
    ""
  ).trim();

  const hasLink = rawCtaUrl.length > 0;
  const isExternal = hasLink && /^https?:\/\//i.test(rawCtaUrl);
  const ctaTarget =
    section?.cta?.target ||
    data?.cta?.target ||
    "_self";

  // Helper: render text with newlines / <br> as actual line breaks
  const renderTitle = (text) => {
    if (!text) return null;
    const lines = String(text).split(/\\n|\n|<br\s*\/?>/i);
    return lines.map((line, index) => (
      <span key={index}>
        {line}
        {index < lines.length - 1 && <br />}
      </span>
    ));
  };

  const content = (
    <div className="flex h-full w-full items-center justify-end pr-4 sm:pr-8 md:pr-12 lg:pr-20 xl:pr-32">
      <div className="flex flex-col items-center select-none max-w-[250px] sm:max-w-[350px] md:max-w-[450px]">
        {discount && (
          <div
            className="flex items-center"
            style={{ fontFamily: "'Anton', 'Oswald', Impact, sans-serif" }}
          >
            <span
              className="flex items-center text-[62px] sm:text-[78px] md:text-[94px] lg:text-[104px] xl:text-[118px] leading-none font-black text-[#FFDF00] tracking-[-0.01em]"
              style={{ WebkitTextStroke: "1.2px #6B4226" }}
            >
              {discount}
            </span>
            <div className="flex flex-col justify-end ml-1.5 sm:ml-2 md:ml-3 self-stretch pb-1 sm:pb-1.5 md:pb-2">
              <span
                className="text-[36px] sm:text-[45px] md:text-[54px] lg:text-[62px] xl:text-[72px] leading-none font-black text-[#FFDF00] tracking-[-0.01em] -mb-1"
                style={{ WebkitTextStroke: "1px #6B4226" }}
              >
                %
              </span>
              <span
                className="text-[20px] sm:text-[25px] md:text-[30px] lg:text-[34px] xl:text-[40px] leading-none font-black text-[#FFDF00] tracking-[-0.01em]"
                style={{ WebkitTextStroke: "0.9px #6B4226" }}
              >
                OFF
              </span>
            </div>
          </div>
        )}
        {titleText && (
          <h2
            className="text-white text-[18px] sm:text-[22px] md:text-[26px] lg:text-[30px] xl:text-[34px] font-extrabold mt-2.5 md:mt-3.5 text-center leading-[1.18] tracking-tight transition-transform duration-300 group-hover:scale-[1.02]"
            style={{
              fontFamily:
                "'Poppins', 'Montserrat', 'Inter', system-ui, -apple-system, sans-serif",
              textShadow:
                "0 2px 8px rgba(0, 0, 0, 0.45), 0 1px 2px rgba(0, 0, 0, 0.6)",
            }}
          >
            {renderTitle(titleText)}
          </h2>
        )}
      </div>
    </div>
  );

  const containerClasses = `group my-8 md:my-12 flex w-full aspect-[16/9] sm:aspect-[2/1] md:aspect-[2.5/1] lg:aspect-[3/1] items-center overflow-hidden rounded-xl block ${
    hasLink ? "cursor-pointer" : "cursor-default"
  } ${className}`;

  const style = bannerImage
    ? {
        backgroundImage: `url("${bannerImage}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }
    : undefined;

  if (hasLink) {
    if (isExternal) {
      return (
        <a
          href={rawCtaUrl}
          target={ctaTarget || "_blank"}
          rel="noopener noreferrer"
          className={containerClasses}
          style={style}
        >
          {content}
        </a>
      );
    }

    return (
      <Link
        to={rawCtaUrl}
        target={ctaTarget === "_blank" ? "_blank" : undefined}
        rel={ctaTarget === "_blank" ? "noopener noreferrer" : undefined}
        className={containerClasses}
        style={style}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={containerClasses} style={style}>
      {content}
    </div>
  );
}
