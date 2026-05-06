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
    <div className="w-full bg-[#1B1D60] border-b border-[#2d3080] h-[39px] hidden lg:flex items-center text-[15px] text-white ">
      <div className="w-container flex items-center h-full">
        <div className="flex-1 flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.path}
              className=""
            >
              {link.name}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-6 h-full">
          <a href="#" className="">
            Become a Seller
          </a>
          <div className="relative group cursor-pointer flex items-center gap-1">
            <span>Watchlist</span>
            <ChevronDown size={14} />
          </div>
          <div className="relative group cursor-pointer flex items-center gap-1">
            <span>My Sam</span>
            <ChevronDown size={14} />
          </div>
          <Button
            variant="custom"
            rounded={true}
            className="px-4 py-1.5 font-bold border"
            bgColor="#FFFFFF"
            borderColor="#CE9F2D"
            textColor="#CE9F2D"
            label="Register"
          />
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
    <header className="w-full">
      <div className="w-container flex flex-wrap items-center justify-between gap-3 py-2 sm:gap-4 lg:flex-nowrap lg:gap-6 lg:py-3">
        {/* 1. LOGO */}
        <div className="flex shrink-0 items-center">
          <Link to="/">
            <img
              src="/image/png/logo.png"
              alt="logo"
              className="h-auto w-[84px] object-contain sm:w-[104px] lg:h-[78px] lg:w-[141px]"
            />
          </Link>
        </div>

        {/* 2. SEARCH BAR */}
        <div className="group order-3 mt-1 w-full flex-1 lg:order-none lg:mt-0 lg:w-auto">
          <div
            className="p-[2px] rounded-full"
            style={{ background: borderGradient }}
          >
            <div className="flex h-[44px] w-full items-center overflow-hidden rounded-full border-none bg-white pl-3 pr-1 outline-none sm:h-[48px] sm:pl-4 lg:h-[54px] lg:pl-6 lg:pr-1.5">
              <input
                type="text"
                placeholder="Search..."
                className="w-full h-full outline-none border-none ring-0 text-gray-700 bg-transparent focus:ring-0 text-sm lg:text-base"
              />

              <div className="ml-1 flex shrink-0 items-center gap-2 sm:gap-3 lg:ml-2 lg:gap-6">
                <img
                  src={icons.Mic}
                  alt="mic"
                  className="h-4 w-4 cursor-pointer object-contain hover:opacity-80 sm:h-5 sm:w-5 lg:h-7 lg:w-7"
                />

                <Button
                  variant="custom"
                  rounded={true}
                  className="w-[120px] h-[42px] font-bold flex items-center justify-center gap-2"
                  bgColor="linear-gradient(270deg, #A26D27 5.77%, #CE9F2D 100%)"
                  textColor="#FFFFFF"
                  icon={<Search size={14} color="#FFFFFF" />}
                  label="Search"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. ICONS & ACTIONS */}
        <div className="order-2 flex shrink-0 items-center gap-2 sm:gap-3 lg:gap-5">
          <div className="hidden items-center gap-2 lg:flex lg:gap-4">
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
                        ? "w-[40px] h-[29px] lg:w-[60px] lg:h-[42px]"
                        : "w-[24px] h-[24px] lg:w-[28px] lg:h-[28px]"
                    }`}
                  />
                </Link>

                {index < displayIcons.length - 1 && (
                  <div className="h-6 lg:h-8 w-[1.5px] bg-gray-200"></div>
                )}
              </React.Fragment>
            ))}
          </div>

          <Button
            variant="custom"
            rounded={true}
            className="whitespace-nowrap px-2.5 py-1.5 text-[10px] font-bold transition sm:px-3 sm:py-2 lg:px-6 lg:text-base"
            bgColor={gradientBg}
            textColor="#FFFFFF"
            label="Create Account"
          />
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
      <div className="w-container hide-scrollbar flex justify-start gap-5 overflow-x-auto px-3 py-3 sm:gap-7 lg:justify-center lg:gap-12">
        {categories?.map((item, index) => (
          <Link
            key={index}
            to={`/categories/${item.name.toLowerCase()}`}
            className="flex flex-col items-center min-w-[70px] lg:min-w-[80px] group"
          >
            <div className="mx-auto flex items-center justify-center p-1 rounded-full group-hover:bg-white transition-all">
              <ImageSkeleton src={item?.img} alt={item?.name} />
            </div>
            <span className="text-[12px] lg:text-[14px] mt-1 text-center leading-tight whitespace-nowrap">
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
    <div className="flex flex-col w-full">
      <TopHeader />
      <Navbar />
      <div
        className="w-full border-t border-gray-300"
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
