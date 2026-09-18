import { Link } from "react-router-dom";
import { FALLBACK_SHOPPING_BANNER } from "../../data/fallbackCmsData";

export default function ShoppingMadeEasyBanner({
  data = FALLBACK_SHOPPING_BANNER,
  className = "",
}) {
  data = data || FALLBACK_SHOPPING_BANNER;
  const section =
    data?.sections?.[0] || data?.metadata?.data?.sections?.[0] || data;

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

  const titleText = section?.title || data?.title || "";

  // If there is no image AND no title AND no discount → nothing to show
  if (!bannerImage && !titleText && !discount) return null;

  // 4. CTA link and target from CMS section or top-level
  const rawCtaUrl = String(
    section?.cta?.url ||
      data?.cta?.url ||
      section?.points?.[0]?.cta?.url ||
      data?.points?.[0]?.cta?.url ||
      "",
  ).trim();

  const hasLink = rawCtaUrl.length > 0;
  const isExternal = hasLink && /^https?:\/\//i.test(rawCtaUrl);
  const ctaTarget = section?.cta?.target || data?.cta?.target || "_self";

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
    <div className="flex h-full w-full items-center justify-end pr-3 sm:pr-5 md:pr-8 lg:pr-16 xl:pr-32">
      <div className="flex max-w-[150px] flex-col items-center select-none sm:max-w-[200px] md:max-w-[280px] lg:max-w-[360px] xl:max-w-[450px]">
        {discount && (
          <div
            className="flex items-center"
            style={{ fontFamily: "'Anton', 'Oswald', Impact, sans-serif" }}
          >
            <span
              className="flex items-center text-[38px] leading-none font-black tracking-[-0.01em] text-[#FFDF00] sm:text-[48px] md:text-[58px] lg:text-[82px] xl:text-[118px]"
              style={{ WebkitTextStroke: "1px #6B4226" }}
            >
              {discount}
            </span>

            <div className="ml-1 flex flex-col justify-end self-stretch pb-0.5 sm:ml-1.5 sm:pb-1 md:ml-2 md:pb-1.5 lg:ml-2.5 lg:pb-2">
              <span
                className="text-[22px] leading-none font-black tracking-[-0.01em] text-[#FFDF00] sm:text-[28px] md:text-[34px] lg:text-[50px] xl:text-[72px]"
                style={{ WebkitTextStroke: "0.8px #6B4226" }}
              >
                %
              </span>

              <span
                className="text-[13px] leading-none font-black tracking-[-0.01em] text-[#FFDF00] sm:text-[16px] md:text-[20px] lg:text-[27px] xl:text-[40px]"
                style={{ WebkitTextStroke: "0.7px #6B4226" }}
              >
                OFF
              </span>
            </div>
          </div>
        )}

        {titleText && (
  <h2
    className="
      mt-1
      text-center
      text-[7px]
      font-extrabold
      leading-[1.1]
      tracking-tight
      text-white
      min-[360px]:mt-1
      min-[360px]:text-[8px]
      sm:mt-2
      sm:text-[10px]

      md:mt-2.5
      md:text-[17px]

      lg:mt-3
      lg:text-[24px]

      xl:text-[34px]
    "
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
const containerClasses = `group my-8 md:my-12 flex w-full aspect-[2.5/1] items-center overflow-hidden rounded-[6px] sm:rounded-lg md:rounded-xl block ${
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
