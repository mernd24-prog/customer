import { Link } from "react-router-dom";
import { applyImageFallback, getImageFallbackSrc } from "../../../utils/ecommerce";
import DynamicButton from "../button/button.jsx";
import { cn } from "../../../utils/common";
import "./carousel.css";

export default function CarouselCard({
  image,
  alt = "",
  children,
  href,
  target,
  rel,
  onClick,
  active = false,
  fallbackType = "category",
  imageClassName = "",
  contentClassName = "",
  overlay = null,
  className = "",
  articleClassName = "",
  imageWidth,
  imageHeight,
  relativeImage = false,
}) {
  const cardImage = image || getImageFallbackSrc(alt, fallbackType);

  const content = (
    <article
      className={cn(
        "carousel-card",
        active && "carousel-card-active",
        articleClassName,
      )}
    >
      {cardImage && (
        <div
          className={cn(
            "carousel-card-image-wrap",
            relativeImage && "carousel-card-image-wrap-relative",
          )}
        >
          <img
            src={cardImage}
            alt={alt || "Carousel card"}
            width={imageWidth}
            height={imageHeight}
            loading="lazy"
            decoding="async"
            className={cn("carousel-card-image", imageClassName)}
            onError={(event) => applyImageFallback(event, alt, fallbackType)}
          />
          {overlay}
        </div>
      )}

      {children && (
        <div className={cn("carousel-card-content", contentClassName)}>
          {children}
        </div>
      )}
    </article>
  );

  if (href) {
    const isExternal = /^https?:\/\//i.test(href);

    if (isExternal) {
      return (
        <a
          href={href}
          target={target || "_blank"}
          rel={rel || "noopener noreferrer"}
          onClick={onClick}
          className={cn("carousel-card-link", className)}
        >
          {content}
        </a>
      );
    }

    return (
      <Link
        to={href}
        target={target === "_blank" ? "_blank" : undefined}
        rel={target === "_blank" ? rel || "noopener noreferrer" : rel}
        onClick={onClick}
        className={cn("carousel-card-link", className)}
      >
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <DynamicButton
        type="button"
        onClick={onClick}
        className={cn("carousel-card-link carousel-card-button", className)}
      >
        {content}
      </DynamicButton>
    );
  }

  return <div className={cn("carousel-card-link", className)}>{content}</div>;
}
