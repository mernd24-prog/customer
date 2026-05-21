import React from "react";
import { Link } from "react-router-dom";
import { FaRegHeart, FaShoppingCart } from "react-icons/fa";

import { cn } from "../../../lib/utils";

import SkeletonBox from "../../common/skeleton/SkeletonBox";
import Rating from "../../ecommerce/Rating";
import { PriceButton } from "../button/static";

const variants = {
  default: "bg-white shadow-sm hover:shadow-md",
  gray: "bg-[#F7F7F7]",
  bordered: "bg-white border border-[#D4A33B]",
};

const hovers = {
  none: "",
  lift: "hover:-translate-y-1 hover:shadow-lg",
  scale: "hover:scale-[1.02]",
  shadow: "hover:shadow-xl",
};

const Image = ({
  src,
  alt,
  aspect = "aspect-[4/5]",
  radius = "rounded-2xl",
}) => {
  if (!src) return null;

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={cn(
        "w-full object-cover transition-transform duration-500 group-hover:scale-105",
        aspect,
        radius,
      )}
    />
  );
};

const IconButton = ({ children, className, onClick }) => (
  <button
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick?.();
    }}
    className={className}
  >
    {children}
  </button>
);

const Wrapper = ({ to, href, children, ...props }) => {
  if (to) {
    return (
      <Link to={to} {...props}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  }

  return <div {...props}>{children}</div>;
};

const layouts = {
  product: ({
    images,
    title,
    rating,
    price,
    originalPrice,
    showWishlist,
    showAddToCart,
    onWishlist,
    onAddToCart,
  }) => (
    <>
      <div className="relative overflow-hidden rounded-2xl">
        <Image src={images?.[0]?.src} alt={title} radius="rounded-none" />

        {showWishlist && (
          <IconButton
            onClick={onWishlist}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-md opacity-0 group-hover:opacity-100 transition-all hover:text-red-500"
          >
            <FaRegHeart size={14} />
          </IconButton>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <Rating value={rating} />

        <h3 className="text-sm text-gray-700 line-clamp-2">{title}</h3>

        <div className="flex items-center justify-between mt-2">
          <PriceButton currentPrice={price} originalPrice={originalPrice} />

          {showAddToCart && (
            <IconButton
              onClick={onAddToCart}
              className="p-2 rounded-full bg-black text-white hover:bg-gray-800"
            >
              <FaShoppingCart size={14} />
            </IconButton>
          )}
        </div>
      </div>
    </>
  ),

  "two-grid": ({ images, title, subtitle, badge }) => (
    <>
      <div className="flex items-center gap-2 mb-2">
        {badge && (
          <span className="bg-[#D4A33B] text-white px-3 py-1 text-xs rounded-r-xl">
            {badge}
          </span>
        )}

        <h3 className="text-sm font-medium line-clamp-2">{title}</h3>
      </div>

      {subtitle && <p className="text-xs text-gray-400 mb-4">{subtitle}</p>}

      <div className="grid grid-cols-2 gap-4">
        {images?.slice(0, 2)?.map((img, i) => (
          <div key={i} className="space-y-3">
            <Image src={img?.src} alt={title} />

            <PriceButton
              currentPrice={img?.price}
              originalPrice={img?.originalPrice}
            />
          </div>
        ))}
      </div>
    </>
  ),

  "four-grid": ({ images, title }) => (
    <>
      <h3 className="text-sm font-medium mb-4">{title}</h3>

      <div className="grid grid-cols-2 gap-2">
        {images?.slice(0, 4)?.map((img, i) => (
          <Image
            key={i}
            src={img?.src}
            alt={title}
            aspect="aspect-square"
            radius="rounded-xl"
          />
        ))}
      </div>
    </>
  ),

  "category-centered": ({ images, category }) => (
    <>
      <Image
        src={images?.[0]?.src}
        alt={category}
        aspect="aspect-square"
        radius="rounded-xl "
      />

      <h3 className="mt-4 text-center text-sm font-medium">{category}</h3>
    </>
  ),
};

export default function GlobalCard({
  layout = "product",
  variant = "default",
  hoverEffect = "lift",
  isLoading = false,
  customWidth,
  customHeight,
  customBg,
  customRadius = "rounded-2xl",
  className,
  to,
  href,
  ...data
}) {
  const Layout = layouts[layout];

  const classes = cn(
    "group relative flex flex-col overflow-hidden p-4 transition-all duration-300",
    variants[variant],
    hovers[hoverEffect],
    customRadius,
    className,
  );

  const styles = {
    width: customWidth,
    height: customHeight,
    backgroundColor: customBg,
  };

  if (isLoading) {
    return (
      <div className={classes} style={styles}>
        <SkeletonBox
          width="100%"
          height="260px"
          rounded="rounded-2xl"
          className="mb-4"
        />

        <SkeletonBox width="60%" height="14px" className="mb-2" />

        <SkeletonBox width="100%" height="14px" className="mb-4" />

        <SkeletonBox width="120px" height="36px" rounded="rounded-full" />
      </div>
    );
  }

  return (
    <Wrapper to={to} href={href} className={classes} style={styles}>
      {Layout ? <Layout {...data} /> : null}
    </Wrapper>
  );
}
