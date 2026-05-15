import { Fragment, useCallback, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Camera,
  Heart,
  Lock,
  LogOut,
  Settings,
  ShoppingBag,
  Truck,
  User,
} from "lucide-react";

import BrandButton from "../ui/BrandButton";
import ImageSkeleton from "../ui/Image";
import SearchBar from "../ui/SearchBar";
import HeaderDropdown from "./header/HeaderDropdown";
import MenuDropdown from "./header/MenuDropdown";
import SellDropdown from "./header/SellDropdown";
import WatchlistDropdown from "./header/WatchlistDropdown";
import { icons, navbarIcons as navData } from "../../constant/image.constant";
import { sellDropdownData, topNavLinks } from "../../data/header";
import { useProductActions } from "../../hooks/useProductActions";
import { useWatchlistProducts } from "../../hooks/useWatchlistProducts";
import { logout } from "../../features/auth/authSlice";
import { getRole, isAdminRole } from "../../utils/roles";

const buildCategorySlug = (name) => name.toLowerCase().replace(/\s+/g, "-");

const dropdownIconMap = {
  camera: Camera,
  lock: Lock,
  logOut: LogOut,
  settings: Settings,
  shoppingBag: ShoppingBag,
  truck: Truck,
  user: User,
};

const baseAccountMenuItems = [
  { label: "My Profile", path: "/account/profile", icon: "user" },
  { label: "My Orders", path: "/orders", icon: "shoppingBag" },
  { label: "Wallet", path: "/wallet", icon: "lock" },
  { label: "Notifications", path: "/notifications", icon: "settings" },
  { label: "Settings", path: "/notification-preferences", icon: "settings" },
];

function withIcons(items) {
  return items.map((item) => {
    const Icon = dropdownIconMap[item.icon];
    return { ...item, icon: Icon ? <Icon size={18} /> : null };
  });
}

export const TopHeader = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((s) => s.auth.current);
  const currentRole = getRole(currentUser);

  const { removeFromWishlist } = useProductActions();
  const {
    products: wishlistedProducts,
    hideFallbackProduct,
    isUsingFallback,
  } = useWatchlistProducts();

  const handleRemoveWatchlist = useCallback(
    (product) => {
      if (isUsingFallback) {
        hideFallbackProduct(product);
        return;
      }
      removeFromWishlist(product);
    },
    [hideFallbackProduct, isUsingFallback, removeFromWishlist],
  );

  const dropdowns = useMemo(
    () => [
      {
        type: "sell",
        label: "Sell",
        path: "/seller/status",
        data: {
          ...sellDropdownData,
          features: withIcons(sellDropdownData.features),
        },
      },
      {
        type: "watchlist",
        label: `Watchlist (${wishlistedProducts.length})`,
        path: "/watchlist",
        icon: <Heart size={16} />,
        title: "My Watchlist",
        items: wishlistedProducts,
        onRemove: handleRemoveWatchlist,
      },
      ...(currentUser
        ? [
          {
            type: "menu",
            label:
              currentUser.firstName ||
              currentUser.email?.split("@")[0] ||
              "My Sam",
            path: "/account/profile",
            icon: <User size={16} />,
            title: "My Account",
            items: withIcons([
              ...baseAccountMenuItems,
              ...(isAdminRole(currentRole)
                ? [
                  {
                    label: "Admin Products",
                    path: "/admin/products",
                    icon: "settings",
                  },
                  {
                    label: "Admin Catalog",
                    path: "/admin/catalog",
                    icon: "settings",
                  },
                  {
                    label: "Admin Brands",
                    path: "/admin/brands",
                    icon: "settings",
                  },
                  {
                    label: "Admin RBAC",
                    path: "/admin/rbac",
                    icon: "settings",
                  },
                ]
                : []),
            ]),
          },
        ]
        : []),
    ],
    [handleRemoveWatchlist, wishlistedProducts, currentUser, currentRole],
  );

  const renderDropdown = (dropdown) => {
    switch (dropdown.type) {
      case "sell":
        return <SellDropdown data={dropdown.data} />;
      case "watchlist":
        return (
          <WatchlistDropdown
            title={dropdown.title}
            items={dropdown.items}
            onRemove={dropdown.onRemove}
          />
        );
      case "menu":
        return <MenuDropdown title={dropdown.title} items={dropdown.items} />;
      default:
        return null;
    }
  };

  return (
    <div className="hidden h-[39px] w-full items-center justify-center bg-blue text-[14px] font-medium text-white lg:flex">
      <div className="w-container flex h-full items-center">
        <div className="flex flex-1 items-center gap-14 text-white">
          {topNavLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-white transition-opacity hover:opacity-70"
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex h-full items-center gap-6">
          {dropdowns.map((dropdown) => (
            <HeaderDropdown
              key={dropdown.type}
              label={dropdown.label}
              icon={dropdown.icon}
              path={dropdown.path}
            >
              {renderDropdown(dropdown)}
            </HeaderDropdown>
          ))}

          {currentUser ? (
            <button
              type="button"
              onClick={() => dispatch(logout())}
              className="flex items-center gap-1.5 rounded border border-white/40 px-3 py-0.5 text-sm font-semibold text-white hover:bg-white/10 transition"
            >
              <LogOut size={14} /> Sign Out
            </button>
          ) : (
            <BrandButton
              variant="gradient"
              rounded
              className="min-h-[18px] px-3"
              size="md"
              label="Register"
              onClick={() => navigate("/register")}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export const Navbar = ({ icons: propIcons }) => {
  const navigate = useNavigate();
  const currentUser = useSelector((s) => s.auth.current);
  const displayIcons = propIcons || navData;
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (nextQuery = searchQuery) => {
    const trimmedQuery = nextQuery.trim();
    if (trimmedQuery) navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
  };

  return (
    <header className="w-full">
      <div className="w-container flex flex-wrap items-center justify-between gap-3 py-2 sm:gap-4 lg:flex-nowrap lg:gap-6 lg:py-3">
        <div className="flex shrink-0 items-center">
          <Link to="/" aria-label="Sam Global home">
            <img
              src="/image/png/logo.png"
              alt="Sam Global"
              className="h-auto w-[84px] object-contain sm:w-[104px] lg:h-[78px] lg:w-[141px]"
            />
          </Link>
        </div>

        <SearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSearch={handleSearch}
          placeholder="Search products..."
          micIcon={icons.Mic}
        />

        <div className="order-2 flex shrink-0 items-center gap-2 sm:gap-3 lg:gap-5">
          <div className="hidden items-center gap-2 lg:flex lg:gap-4">
            {displayIcons.map((item, iconIndex) => (
              <Fragment key={item.name}>
                <Link
                  to={item.path || "#"}
                  className="group flex flex-col items-center px-1 transition-opacity hover:opacity-80 lg:px-4"
                  aria-label={item.name}
                >
                  <img
                    src={item.img}
                    alt=""
                    className={`object-contain ${item.name === "IN"
                      ? "h-[42px] w-[60px]"
                      : "h-[28px] w-[28px]"
                      }`}
                  />
                </Link>
                {iconIndex < displayIcons.length - 1 && (
                  <div className="h-8 w-[1.5px] bg-gray-200" />
                )}
              </Fragment>
            ))}
          </div>

          {currentUser ? (
            <Link
              to="/account/profile"
              className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-200 transition"
            >
              <User size={16} />
              {currentUser.firstName || "Account"}
            </Link>
          ) : (
            <BrandButton
              variant="gradient"
              rounded
              label="Create Account"
              size="md"
              className="h-[48px] whitespace-nowrap px-6 font-medium"
              onClick={() => navigate("/register")}
            />
          )}
        </div>
      </div>
    </header>
  );
};

export const CategoryBar = ({ headerData }) => {
  const catalogList = useSelector((s) => s.catalog.list);
  const catalogCategories = Array.isArray(catalogList) ? catalogList : [];

  const categories = headerData
    ? headerData
    : catalogCategories.length > 0
      ? catalogCategories.slice(0, 14).map((cat) => ({
        name: cat.title || cat.name,
        img: cat.imageUrl || cat.image,
        slug:
          cat.categoryKey ||
          cat.key ||
          buildCategorySlug(cat.title || cat.name),
      }))
      : [];

  if (!categories.length) return null;

  return (
    <header className="w-full">
      <div className="w-container  hide-scrollbar  flex justify-start gap-7 overflow-x-auto px-3 py-3 sm:gap-8 lg:justify-center lg:gap-6">
        {categories.map((item) => (
          <Link
            key={item.name}
            to={`/categories/${item.slug || buildCategorySlug(item.name)}`}
            className="group flex min-w-[70px]  flex-col items-center lg:min-w-[80px]"
          >
            <div className="mx-auto  flex items-center justify-center rounded-full p-1 transition-all group-hover:bg-gray-100">
              {item.img ? (
                <ImageSkeleton src={item.img} alt={item.name} />
              ) : (
                <div className="h-10 w-10  rounded-full bg-stone-100 flex items-center justify-center text-slate-400">
                  <ShoppingBag size={18} />
                </div>
              )}
            </div>
            <span className="mt-1 line-clamp-1   w-full max-w-[80px] text-center text-[12px] leading-tight text-black lg:max-w-[100px] lg:text-[14px]">
              {item.name}
            </span>
          </Link>
        ))}
      </div>
    </header>
  );
};

export const Header = () => {
  const location = useLocation();
  const hideCategoryBar = location.pathname === "/watchlist";

  return (
    <div className="flex w-full flex-col">
      <TopHeader />
      <Navbar />
      <div className="mx-auto w-full max-w-[1648px] border-t border-gray-300" />
      {!hideCategoryBar && <CategoryBar />}
    </div>
  );
};

export default Header;
