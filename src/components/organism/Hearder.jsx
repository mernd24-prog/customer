import React from "react";
import Button from "../Button/Button";
import ImageSkeleton from "../ui/Image";
import { Link } from "react-router-dom";
import { ChevronDown, Search } from "lucide-react";
import {
  header as categoryData,
  navbarIcons as navData,
  icons,
} from "../../constant/image.constant";

export const TopHeader = () => {
  const navLinks = [
    { name: "Deals", path: "#" },
    { name: "Brand Outlet", path: "#" },
    { name: "Gift Card", path: "#" },
    { name: "Help & Contact", path: "#" },
  ];
  return (
    <div className="w-full bg-[#1B1D60] border-b border-[#2d3080] h-[34px] hidden lg:flex items-center text-[11px] text-white">
      <div className="w-container flex items-center h-full">
        <div className="flex-1 flex items-center gap-5">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.path}
              className="hover:text-[#BF9B53] transition-colors"
            >
              {link.name}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-5 h-full">
          <a
            href="#"
            className="hover:text-[#BF9B53] transition-colors text-[10px] uppercase font-medium tracking-tight"
          >
            Become a Seller
          </a>
          <div className="h-4 w-[1px] bg-white/20 mx-1"></div>
          <div className="relative group cursor-pointer flex items-center gap-1 hover:text-[#BF9B53] transition-colors">
            <span>Watchlist</span>
            <ChevronDown size={12} />
          </div>
          <div className="relative group cursor-pointer flex items-center gap-1 hover:text-[#BF9B53] transition-colors">
            <span>My Sam</span>
            <ChevronDown size={12} />
          </div>
          <Button
            variant="custom"
            className="!w-[80px] !h-[24px] !min-h-0 !text-[11px] !px-0 flex items-center justify-center font-medium ml-2"
            bgColor="white"
            borderColor="#CE9F2D"
            textColor="#CE9F2D"
            rounded={true}
          >
            Register
          </Button>
        </div>
      </div>
    </div>
  );
};

export const Navbar = ({ icons: propIcons }) => {
  const displayIcons = propIcons || navData;
  const gradientBg = "linear-gradient(270deg, #A26D27 5.77%, #CE9F2D 100%)";
  const borderGradient = "linear-gradient(90deg, #A26D27 0%, #CE9F2D 100%)";

  return (
    <header className="w-full bg-white">
      <div className="w-container flex flex-wrap lg:flex-nowrap items-center justify-between gap-2 lg:gap-4 py-2">
        {/* 1. LOGO */}
        <div className="flex items-center flex-shrink-0">
          <Link to="/">
            <img
              src="/image/png/logo.png"
              alt="logo"
              className="object-contain w-[90px] lg:w-[130px] h-auto"
            />
          </Link>
        </div>

        {/* 2. SEARCH BAR */}
        <div className="relative flex-1 group order-last lg:order-none w-full lg:w-auto mt-2 lg:mt-0">
          <div
            className="p-[1px] rounded-full"
            style={{ background: borderGradient }}
          >
            <div className="flex items-center h-[44px] lg:h-[50px] bg-white rounded-full px-4 overflow-hidden">
              <input
                type="text"
                placeholder="Search for anything..."
                className="flex-1 h-full bg-transparent border-none outline-none text-[13px] lg:text-sm text-gray-700 placeholder:text-gray-400"
              />

              <div className="flex items-center gap-3 lg:gap-4 flex-shrink-0 ml-2">
                <img
                  src={icons.Mic}
                  alt="mic"
                  className="w-5 h-5 lg:w-6 lg:h-6 object-contain cursor-pointer hover:opacity-80"
                />

                <div className="h-6 w-[1px] bg-gray-200 hidden lg:block"></div>

                <Button
                  variant="custom"
                  rounded={true}
                  className="w-[80px] lg:w-[120px] h-[34px] lg:h-[40px] text-[11px] lg:text-sm font-bold flex items-center justify-center gap-2"
                  bgColor={gradientBg}
                  textColor="#FFFFFF"
                  icon={<Search size={14} color="#FFFFFF" strokeWidth={2} />}
                >
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. ICONS & ACTIONS */}
        <div className="flex items-center lg:gap-5 flex-shrink-0">
          <div className="flex items-center gap-1 lg:gap-2">
            {displayIcons.map((item, index) => (
              <React.Fragment key={index}>
                <Link
                  to={item.path || "#"}
                  className="flex flex-col items-center cursor-pointer hover:opacity-80 px-1 lg:px-4 group"
                >
                  <img
                    src={item.img}
                    alt={item.name}
                    className={`object-contain ${
                      item.name === "IN"
                        ? "w-[35px] h-[25px] lg:w-[55px] lg:h-[40px]"
                        : "w-[22px] h-[22px] lg:w-[28px] lg:h-[28px]"
                    }`}
                  />
                </Link>

                {index < displayIcons.length - 1 && (
                  <div className="h-6 lg:h-8 w-[1px] bg-gray-200"></div>
                )}
              </React.Fragment>
            ))}
          </div>

          <Button
            variant="custom"
            rounded={true}
            className="px-4 lg:px-6 py-2 transition font-bold whitespace-nowrap text-[11px] lg:text-[15px] shadow-sm ml-2"
            bgColor={gradientBg}
            textColor="#FFFFFF"
          >
            Create Account
          </Button>
        </div>
      </div>
    </header>
  );
};

export const CategoryBar = ({ headerData }) => {
  const categories =
    headerData ||
    Object.entries(categoryData).map(([name, img]) => ({ name, img }));
  return (
    <header className="w-full">
      <div className="flex gap-8 lg:gap-14 justify-start lg:justify-center px-3 py-2 w-container">
        {categories?.map((item, index) => (
          <Link
            key={index}
            to={`/categories/${item.name.toLowerCase()}`}
            className="flex flex-col items-center min-w-[65px] lg:min-w-[75px] group shrink-0"
          >
            <div className="mx-auto flex items-center justify-center p-1 rounded-full group-hover:bg-gray-50 transition-all">
              <ImageSkeleton
                src={item?.img}
                alt={item?.name}
                className="w-8 h-8 lg:w-10 lg:h-10"
              />
            </div>
            
            <span className="text-[11px] lg:text-[13px] mt-1 text-center leading-tight whitespace-nowrap font-medium text-gray-700 ">
              {item?.name}
            </span>
          </Link>
        ))}
      </div>
    </header>
  );
};

export const Header = () => {
  return (
    <div className="flex flex-col w-full sticky top-0 z-[100] bg-white shadow-sm mb-4">
      <TopHeader />
      <Navbar />
      <div
        className="w-full border-t border-gray-100"
        style={{
          maxWidth: "1648px",
          margin: "0 auto",
          opacity: 1,
          borderWidth: "1px",
        }}
      ></div>
      <CategoryBar />
    </div>
  );
};

export default Header;
