import { Fragment, useState } from "react";
import BrandButton from "../ui/BrandButton";
import ImageSkeleton from "../ui/Image";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, Search } from "lucide-react";
import {
  header as categoryData,
  navbarIcons as navData,
  icons,
} from "../../constant/image.constant";
import SearchBar from "../ui/SearchBar";

const topNavLinks = [
  { name: "Deals", path: "#" },
  { name: "Brand Outlet", path: "#" },
  { name: "Gift Card", path: "#" },
  { name: "Help & Contact", path: "#" },
];

const watchlistItems = [
  "Saved Products",
  "Recently Viewed",
  "Favourite Brands",
];

const accountItems = ["My Profile", "My Orders", "Settings", "Logout"];

const buildCategorySlug = (name) => name.toLowerCase().replace(/\s+/g, "-");

const HeaderDropdown = ({ label, items }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative flex h-full items-center gap-1"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex items-center gap-1"
      >
        <span>{label}</span>
        <ChevronDown size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 flex min-w-[220px] flex-col rounded-xl border border-gray-200 bg-white py-3 shadow-xl">
          {items.map((item) => (
            <button
              key={item}
              type="button"
              className="cursor-pointer px-4 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const TopHeader = () => {
  const navigate = useNavigate();

  return (
    <div className=" text-[#FFFFFF] w-full  bg-[#1B1D60]  h-[39px] hidden lg:flex items-center justify-center text-[14px] leading-[24px] font-medium text-center font-['Montserrat']">
      <div className="w-container flex items-center h-full">
        <div className="flex-1 flex items-center gap-14">
          {topNavLinks.map((link) => (
            <a key={link.name} href={link.path} className="">
              {link.name}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-6 h-full">
          <a href="#" className="">
            Become a Seller
          </a>
          <HeaderDropdown label="Watchlist" items={watchlistItems} />
          <HeaderDropdown label="My Sam" items={accountItems} />
          <BrandButton
            variant="custom"
            rounded={true}
            className="min-h-[26px] border px-3 font-bold"
            bgColor="#FFFFFF"
            borderColor="#CE9F2D"
            textColor="#CE9F2D"
            label="Register"
            onClick={() => navigate("/register")}
          />
        </div>
      </div>
    </div>
  );
};

export const Navbar = ({ icons: propIcons }) => {
  const displayIcons = propIcons || navData;
  const borderGradient = "linear-gradient(90deg, #A26D27 0%, #CE9F2D 100%)";
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/products/search?q=${searchQuery}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

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
        {/* <div className="group order-3 mt-1 w-full flex-1 lg:order-none lg:mt-0 lg:w-auto">
          <div
            className="p-[2px] rounded-full"
            style={{ background: borderGradient }}
          >
            <div className="flex h-[44px] w-full items-center overflow-hidden rounded-full border-none bg-white pl-3 pr-1 outline-none sm:h-[48px] sm:pl-4 lg:h-[54px] lg:pl-6 lg:pr-1.5">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Barbour Beadnell wax jacket in black"
                className="w-full h-full outline-none border-none ring-0 text-gray-700 bg-transparent focus:ring-0 text-sm lg:text-base"
              />

              <div className="ml-1 flex shrink-0 items-center gap-2 sm:gap-3 lg:ml-2 lg:gap-6">
                <img
                  src={icons.Mic}
                  alt="mic"
                  className="h-4 w-4 cursor-pointer object-contain hover:opacity-80 sm:h-5 sm:w-5 lg:h-7 lg:w-7"
                />

                <BrandButton
                  variant="gradient"
                  rounded={true}
                  icon={<Search size={18} />}
                  label="Search"
                  size="md"
                  className="px-4 2xl:px-6  font-medium "
                  onClick={handleSearch}
                />
              </div>
            </div>
          </div>
        </div> */}

        <SearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onSearch={handleSearch}
          placeholder="Barbour Beadnell wax jacket in black"
          micIcon={icons.Mic}
        />

        {/* 3. ICONS & ACTIONS */}
        <div className="order-2 flex shrink-0 items-center gap-2 sm:gap-3 lg:gap-5">
          <div className="hidden items-center gap-2 lg:flex lg:gap-4">
            {displayIcons.map((item, iconIndex) => (
              <Fragment key={item.name}>
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

                {iconIndex < displayIcons.length - 1 && (
                  <div className="h-6 lg:h-8 w-[1.5px] bg-gray-200"></div>
                )}
              </Fragment>
            ))}
          </div>
          <BrandButton
            variant="gradient"
            rounded={true}
            label="Create Account"
            size="md"
            className="h-[40px] lg:h-[48px] px-6 font-medium whitespace-nowrap"
            onClick={() => navigate("/register")}
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
      <div className="w-container hide-scrollbar flex justify-start gap-7 overflow-x-auto px-3 py-3 sm:gap-8 lg:justify-center lg:gap-10 ">
        {categories?.map((item) => (
          <Link
            key={item.name}
            to={`/categories/${buildCategorySlug(item.name)}`}
            className="flex flex-col items-center min-w-[70px] lg:min-w-[80px] group"
          >
            <div className="mx-auto flex items-center justify-center p-1 rounded-full group-hover:bg-white transition-all">
              <ImageSkeleton src={item?.img} alt={item?.name} />
            </div>
            <span className="text-[12px] lg:text-[14px] mt-1 text-center leading-tight whitespace-nowrap font-montserrat">
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
