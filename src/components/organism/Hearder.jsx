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
      <div className="w-container flex flex-wrap lg:flex-nowrap items-center justify-between gap-2 lg:gap-6 py-2 lg:py-3">
        {/* 1. LOGO */}
        <div className="flex items-center flex-shrink-0">
          <Link to="/">
            <img
              src="/image/png/logo.png"
              alt="logo"
              className="object-contain w-[90px] lg:w-[141px] h-auto lg:h-[78px]"
            />
          </Link>
        </div>

        {/* 2. SEARCH BAR */}
        <div className="relative flex-1 group order-last lg:order-none w-full lg:w-auto mt-4 lg:mt-0">
          <div
            className="p-[2px] rounded-full"
            style={{ background: borderGradient }}
          >
            <div className="bg-white rounded-full flex items-center h-[48px] lg:h-[54px] w-full pl-4 lg:pl-6 pr-1 lg:pr-1.5 border-none outline-none overflow-hidden">
              <input
                type="text"
                placeholder="Search..."
                className="w-full h-full outline-none border-none ring-0 text-gray-700 bg-transparent focus:ring-0 text-sm lg:text-base"
              />

              <div className="flex items-center gap-4 lg:gap-6 flex-shrink-0 ml-1 lg:ml-2">
                <img
                  src={icons.Mic}
                  alt="mic"
                  className="w-5 h-5 lg:w-7 lg:h-7 object-contain cursor-pointer hover:opacity-80"
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
        <div className="flex items-center lg:gap-6 flex-shrink-0">
          <div className="flex items-center gap-2 lg:gap-4">
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
            className="px-6 py-2 font-bold whitespace-nowrap transition-all duration-200"
            bgColor="linear-gradient(270deg, #A26D27 5.77%, #CE9F2D 100%)"
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
    <header className="w-full ">
      <div className="flex gap-12 justify-start lg:justify-center px-3 py-3 w-container">
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
        className="w-full border-t border-gray-400"
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
