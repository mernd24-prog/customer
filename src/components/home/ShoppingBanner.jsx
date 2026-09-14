import { Link } from "react-router-dom";
import defaultBannerImage from "/image/png/bannerDeals.png";

export default function ShoppingMadeEasyBanner({ className = "" }) {
  return (
    <Link
      to="/deals"
      className={`group my-8 md:my-12 flex w-full aspect-[16/9] sm:aspect-[2/1] md:aspect-[2.5/1] lg:aspect-[3/1] items-center overflow-hidden rounded-xl cursor-pointer block ${className}`}
      style={{
        backgroundImage: `url("${defaultBannerImage}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="flex h-full w-full items-center justify-end pr-4 sm:pr-8 md:pr-12 lg:pr-20 xl:pr-32">
        <div className="flex flex-col items-center select-none max-w-[250px] sm:max-w-[350px] md:max-w-[450px]">
          <div className="flex items-center" style={{ fontFamily: "'Anton', 'Oswald', Impact, sans-serif" }}>
            <span
              className="flex items-center text-[62px] sm:text-[78px] md:text-[94px] lg:text-[104px] xl:text-[118px] leading-none font-black text-[#FFDF00] tracking-[-0.01em]"
              style={{
                WebkitTextStroke: "1.2px #6B4226",
              }}
            >
              50-80
            </span>
            <div className="flex flex-col justify-end ml-1.5 sm:ml-2 md:ml-3 self-stretch pb-1 sm:pb-1.5 md:pb-2">
              <span
                className="text-[36px] sm:text-[45px] md:text-[54px] lg:text-[62px] xl:text-[72px] leading-none font-black text-[#FFDF00] tracking-[-0.01em] -mb-1"
                style={{
                  WebkitTextStroke: "1px #6B4226",
                }}
              >
                %
              </span>
              <span
                className="text-[20px] sm:text-[25px] md:text-[30px] lg:text-[34px] xl:text-[40px] leading-none font-black text-[#FFDF00] tracking-[-0.01em]"
                style={{
                  WebkitTextStroke: "0.9px #6B4226",
                }}
              >
                OFF
              </span>
            </div>
          </div>
          <h2
            className="text-white text-[18px] sm:text-[22px] md:text-[26px] lg:text-[30px] xl:text-[34px] font-extrabold mt-2.5 md:mt-3.5 text-center leading-[1.18] tracking-tight transition-transform duration-300 group-hover:scale-[1.02]"
            style={{
              fontFamily: "'Poppins', 'Montserrat', 'Inter', system-ui, -apple-system, sans-serif",
              textShadow: "0 2px 8px rgba(0, 0, 0, 0.45), 0 1px 2px rgba(0, 0, 0, 0.6)",
            }}
          >
            Irresistible Brands,
            <br />
            Best Prices
          </h2>
        </div>
      </div>
    </Link>
  );
}
