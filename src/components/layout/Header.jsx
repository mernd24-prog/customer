import { Fragment, useCallback, useEffect, useMemo, useState, useRef } from "react";
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
import { useProductActions } from "../../hooks/useProductActions";
import { useWatchlistProducts } from "../../hooks/useWatchlistProducts";
import { logout } from "../../features/auth/authSlice";
import { fetchCategories } from "../../features/catalog/catalogSlice";
import { getRole, isAdminRole } from "../../utils/roles";
import { asArray, hrefOr, keyOr, textOr } from "../../utils/content";
import CategoryMegaMenu from "../ecommerce/CategoryMegaMenu";
import { getCmsPayload, useCmsRecord } from "../../hooks/useCmsRecord";

const buildCategorySlug = (name = "category") =>
  String(name).trim().toLowerCase().replace(/\s+/g, "-");

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

const DEFAULT_TOP_NAV_LINKS = [
  { name: "Deals", path: "/deals" },
  { name: "Brand Outlet", path: "/brand-outlet" },
  { name: "Gift Card", path: "/gift-cards" },
  { name: "Help & Contact", path: "/help-contact" },
];

const DEFAULT_SELL_DROPDOWN = {
  title: "Start selling in a snap",
  description: "Turn your pre-loved items into extra cash.",
  features: [
    { icon: "camera", text: "Listing is easy and faster than ever in the app" },
    { icon: "lock", text: "Seller protections and secure payments" },
    { icon: "truck", text: "Easy shipping and local pickup" },
  ],
  buttons: [
    { label: "List an item", path: "/seller/status" },
    { label: "Download the app", path: "/mobile-app" },
  ],
};

const DEFAULT_FASHION_MENU = { leftSections: [], promo: null };


function getCategoryKey(item = {}) {
  return keyOr(
    item?.categoryKey,
    keyOr(item?.key, buildCategorySlug(textOr(item?.title, item?.name))),
  );
}


function normalizeCategoryNode(item = {}, parentKey = null) {
  const categoryKey = getCategoryKey(item);
  const title = textOr(item?.title, textOr(item?.name, "Category"));

  return {
    ...item,
    categoryKey,
    key: keyOr(item?.key, categoryKey),
    title,
    name: textOr(item?.name, title),
    parentKey: item?.parentKey ?? parentKey,
    imageUrl: item?.imageUrl || item?.img || item?.image || item?.iconUrl || "",
    image: item?.image || item?.imageUrl || item?.img || item?.iconUrl || "",
    slug: keyOr(item?.slug, categoryKey),
    children: [],
  };
}

function buildCategoryTree(list = []) {
  const items = Array.isArray(list) ? list : [list].filter(Boolean);
  const byKey = new Map();
  const sortByOrder = (a, b) => Number(a?.sortOrder ?? 0) - Number(b?.sortOrder ?? 0);

  const visit = (item, parentKey = null) => {
    if (!item || typeof item !== "object") return;
    const node = normalizeCategoryNode(item, item?.parentKey ?? parentKey);
    if (!node.categoryKey) return;

    byKey.set(node.categoryKey, {
      ...byKey.get(node.categoryKey),
      ...node,
      children: [],
    });

    asArray(item?.children).forEach((child) => visit(child, node.categoryKey));
  };

  items.forEach((item) => visit(item, item?.parentKey ?? null));

  byKey.forEach((node) => {
    if (node?.parentKey && byKey.has(node.parentKey)) {
      byKey.get(node.parentKey).children.push(node);
    }
  });

  byKey.forEach((node) => {
    node.children.sort(sortByOrder);
  });

  return Array.from(byKey.values())
    .filter((node) => !node?.parentKey || !byKey.has(node.parentKey) || Number(node?.level ?? 0) === 0)
    .sort(sortByOrder);
}

function getCategoryListFromResponse(data) {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.list)) return data.list;
  if (Array.isArray(data?.categories)) return data.categories;
  if (data?.category && typeof data.category === "object") return [data.category];
  if (data?.data) return getCategoryListFromResponse(data.data);
  return [data];
}

function withIcons(items) {
  return asArray(items).map((item) => {
    const Icon = dropdownIconMap[item.icon];
    return { ...item, icon: Icon ? <Icon size={18} /> : null };
  });
}

export const TopHeader = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((s) => s.auth.current);
  const currentRole = getRole(currentUser);

  const { page: dealsPage } = useCmsRecord("deals");
  const { page: brandOutletPage } = useCmsRecord("brand-outlet");
  const { page: giftCardsPage } = useCmsRecord("gift-cards");
  const { page: helpContactPage } = useCmsRecord("help-contact");
  const { page: headerSellPage } = useCmsRecord("header-sell-dropdown");

  const sellDropdownCms = getCmsPayload(headerSellPage, DEFAULT_SELL_DROPDOWN);
  const topLinks = [
    { name: dealsPage?.title || "Deals", path: "/deals" },
    { name: brandOutletPage?.title || "Brand Outlet", path: "/brand-outlet" },
    { name: giftCardsPage?.title || "Gift Card", path: "/gift-cards" },
    { name: helpContactPage?.title || "Help & Contact", path: "/help-contact" },
  ];

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
          ...DEFAULT_SELL_DROPDOWN,
          ...sellDropdownCms,
          features: withIcons(sellDropdownCms?.features || DEFAULT_SELL_DROPDOWN.features),
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
          {asArray(topLinks.length ? topLinks : DEFAULT_TOP_NAV_LINKS).map((link, index) => (
            <Link
              key={keyOr(link?.name, keyOr(link?.path, `top-link-${index}`))}
              to={hrefOr(link?.path)}
              className="text-white transition-opacity hover:opacity-70"
            >
              {textOr(link?.name, "Link")}
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
            {asArray(displayIcons).map((item, iconIndex) => (
              <Fragment key={keyOr(item?.name, `icon-${iconIndex}`)}>
                <Link
                  to={hrefOr(item?.path)}
                  className="group flex flex-col items-center px-1 transition-opacity hover:opacity-80 lg:px-4"
                  aria-label={textOr(item?.name, "navigation")}
                >
                  <img
                    src={item?.img}
                    alt={textOr(item?.name, "Navigation icon")}
                    className={`object-contain ${
                      item?.name === "IN"
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
  const dispatch = useDispatch();
  const [catalogCategories, setCatalogCategories] = useState([]);
  const { page: megaMenuPage } = useCmsRecord("header-mega-menu");
  const megaMenuData = getCmsPayload(megaMenuPage, DEFAULT_FASHION_MENU);
  const [activeMenu, setActiveMenu] = useState(null);
  const timeoutRef = useRef(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    dispatch(fetchCategories({ tree: true, active: true, maxDepth: 3 }))
      .then((action) => {
        const data = action?.payload?.data;
        const list = getCategoryListFromResponse(data);
        if (list.length) setCatalogCategories(list);
      })
      .catch(() => {});
  }, [dispatch]);

  const handleMouseEnter = (item) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(item);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 200);
  };

  const catalogTree = useMemo(() => buildCategoryTree(catalogCategories), [catalogCategories]);

  const categories = useMemo(() => {
    const headerCategories = getCategoryListFromResponse(headerData);
    if (headerCategories.length) return buildCategoryTree(headerCategories);
    if (!catalogTree.length) return [];

    return catalogTree.slice(0, 14).map((cat) => ({
      ...cat,
      name: textOr(cat?.name, textOr(cat?.title, "Category")),
      img: cat?.imageUrl || cat?.image || cat?.img,
      slug: keyOr(cat?.slug, getCategoryKey(cat)),
      categoryKey: getCategoryKey(cat),
      children: asArray(cat?.children),
    }));
  }, [catalogTree, headerData]);

  if (!categories.length) return null;

  return (
    <header className="w-full relative">
      <div className="w-container  hide-scrollbar  flex justify-start gap-7 overflow-x-auto px-3 py-3 sm:gap-8 lg:justify-center lg:gap-6">
        {asArray(categories).map((item, index) => (
          <div
            key={keyOr(item?.name, `category-${index}`)}
            className="relative"
            onMouseEnter={() => handleMouseEnter(item)}
            onMouseLeave={handleMouseLeave}
          >
            <Link
              to={`/categories/${keyOr(
                item?.slug,
                buildCategorySlug(textOr(item?.name, "category")),
              )}`}
              className="group flex min-w-[70px] flex-col items-center lg:min-w-[80px]"
            >
              <div className="mx-auto flex items-center justify-center rounded-full p-1 transition-all group-hover:bg-gray-100">
                {item?.img ? (
                  <ImageSkeleton
                    src={item?.img}
                    alt={textOr(item?.name, "Category")}
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-slate-400">
                    <ShoppingBag size={18} />
                  </div>
                )}
              </div>

              <span className="mt-1 line-clamp-1 w-full max-w-[80px] text-center text-[12px] leading-tight text-black lg:max-w-[100px] lg:text-[14px]">
                {textOr(item?.name, "Category")}
              </span>
            </Link>
          </div>
        ))}
      </div>
      {activeMenu && (
        <div
          className="absolute left-0 top-full z-50 w-full"
          onMouseEnter={() => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
          }}
          onMouseLeave={handleMouseLeave}
        >
          <CategoryMegaMenu data={megaMenuData} activeCategory={activeMenu} />
        </div>
      )}
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
