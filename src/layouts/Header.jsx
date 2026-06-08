import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Bell,
  Camera,
  Heart,
  Lock,
  LogOut,
  Settings,
  ShoppingBag,
  Truck,
  User,
  LifeBuoy,
} from "lucide-react";
import moreImage from "/image/png/MoreImage.png";

import ImageSkeleton from "../components/ui/Image";
import SearchBar from "../components/ui/SearchBar";
import {
  CategoryMoreButton,
  HeaderGoldButton,
  HeaderIconButton,
  OutlineSmallButton,
} from "../components/dynamicComponent/button/static";
import HeaderDropdown from "./header/HeaderDropdown";
import MenuDropdown from "./header/MenuDropdown";
import SellDropdown from "./header/SellDropdown";
import WatchlistDropdown from "./header/WatchlistDropdown";
import { icons, navbarIcons as navData } from "../constants/image.constant";
import { useProductActions } from "../hooks/useProductActions";
import { useWatchlistProducts } from "../hooks/useWatchlistProducts";
import { logout } from "../features/auth/authSlice";
import { getRole, isAdminRole } from "../utils/roles";
import { asArray, hrefOr, keyOr, textOr } from "../utils/content";
import CategoryMegaMenu from "../components/ecommerce/CategoryMegaMenu";
import { getCmsPayload, useCmsRecord } from "../hooks/useCmsRecord";

const buildCategorySlug = (name = "category") =>
  String(name).trim().toLowerCase().replace(/\s+/g, "-");

const dropdownIconMap = {
  bell: Bell,
  camera: Camera,
  lock: Lock,
  logOut: LogOut,
  settings: Settings,
  shoppingBag: ShoppingBag,
  truck: Truck,
  user: User,
};

const navbarIconLabels = {
  IN: "Deliver to address",
  Word: "Language and region",
  Account: "Account",
  Cart: "Cart",
};

const getNavbarIconPath = (item = {}) => {
  if (item.name === "IN") return "/account/addresses";
  return hrefOr(item.path);
};

const getNavbarIconLabel = (item = {}) =>
  item.tooltip ||
  navbarIconLabels[item.name] ||
  textOr(item.name, "Navigation");

const baseAccountMenuItems = [
  { label: "My Profile", path: "/account/profile", icon: "user" },
  { label: "My Orders", path: "/orders", icon: "shoppingBag" },
  { label: "Wallet", path: "/wallet", icon: "lock" },
  { label: "Notifications", path: "/notifications", icon: "bell" },
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
const CATEGORY_MENU_OPEN_DELAY_MS = 350;
const CATEGORY_MENU_CLOSE_DELAY_MS = 160;

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
  const sortByOrder = (a, b) =>
    Number(a?.sortOrder ?? 0) - Number(b?.sortOrder ?? 0);

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
    .filter(
      (node) =>
        !node?.parentKey ||
        !byKey.has(node.parentKey) ||
        Number(node?.level ?? 0) === 0,
    )
    .sort(sortByOrder);
}

function getCategoryListFromResponse(data) {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.list)) return data.list;
  if (Array.isArray(data?.categories)) return data.categories;
  if (data?.category && typeof data.category === "object")
    return [data.category];
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
  const filteredTopLinks = topLinks.filter(
    (link) =>
      link.name !== "Help & Contact" && link.name !== helpContactPage?.title,
  );

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
          features: withIcons(
            sellDropdownCms?.features || DEFAULT_SELL_DROPDOWN.features,
          ),
        },
      },
      {
        type: "watchlist",
        label: `Watchlist (${wishlistedProducts.length})`,
        path: "/watchlist",
        icon: <Heart size={16} className="text-[#CE9F2D] shrink-0" />,
        title: "My Watchlist",
        items: wishlistedProducts,
        onRemove: handleRemoveWatchlist,
      },
      ...(currentUser
        ? [
            {
              type: "menu",
              label: currentUser.profile?.firstName
                ? `${currentUser.profile.firstName} ${currentUser.profile.lastName || ""}`.trim()
                : currentUser.firstName ||
                  currentUser.email?.split("@")[0] ||
                  "My Sam",
              path: "/account/profile",
              icon: <User size={16} className="text-[#CE9F2D] shrink-0" />,
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
    [
      currentRole,
      currentUser,
      sellDropdownCms,
      wishlistedProducts,
      handleRemoveWatchlist,
    ],
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
    <div className="hidden h-[60px] w-full items-center justify-center bg-[var(--customer-black)] text-[14px] font-medium text-[#FFFFFF] lg:flex">
      <div className="customer-container flex h-full items-center justify-between">
        <div className="flex flex-1 items-center gap-8 text-[#FFFFFF]">
          {asArray(
            filteredTopLinks.length
              ? filteredTopLinks
              : DEFAULT_TOP_NAV_LINKS.filter(
                  (l) => l.name !== "Help & Contact",
                ),
          ).map((link, index) => (
            <Link
              key={keyOr(link?.name, keyOr(link?.path, `top-link-${index}`))}
              to={hrefOr(link?.path)}
              className="text-white/85 transition-all duration-300 ease-in-out hover:text-white"
            >
              {textOr(link?.name, "Link")}
            </Link>
          ))}
        </div>

        <div className="flex h-full items-center gap-[20px]">
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

          {/* Help & Contact */}
          <Link
            to="/help-contact"
            className="flex items-center gap-2 text-white/85 transition-all duration-300 ease-in-out hover:text-white"
          >
            <LifeBuoy size={16} className="text-[#CE9F2D] shrink-0" />
            <span>Help & Contact</span>
          </Link>

          {currentUser ? (
            <HeaderGoldButton
              leftIcon={<LogOut size={14} />}
              className="
    inline-flex items-center justify-center gap-2
    h-[36px] sm:h-[38px] lg:h-[41px]
    min-w-[105px] sm:min-w-[115px] lg:min-w-[121px]
    rounded-[5px]
    px-3 sm:px-4
    py-0
    text-[13px] sm:text-[14px]
    font-semibold
    leading-none
    whitespace-nowrap
    transition-all duration-300 ease-in-out
    hover:bg-gray-50
    hover:shadow-md
  "
              onClick={() => dispatch(logout())}
            >
              Sign Out
            </HeaderGoldButton>
          ) : (
            <HeaderGoldButton
              className="hidden lg:inline-flex items-center justify-center whitespace-nowrap rounded-[5px] h-[41px] min-w-[153px] px-4 font-sans text-[16px] font-semibold leading-[100%] tracking-[0%] text-[#03014D]"
              onClick={() => navigate("/seller/status")}
            >
              Become a Seller
            </HeaderGoldButton>
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
  const utilityIcons = asArray(displayIcons).filter(
    (item) => !["IN", "Word", "Account", "Cart"].includes(item?.name),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const accountLabel = currentUser?.profile?.firstName
    ? `${currentUser.profile.firstName} ${currentUser.profile.lastName || ""}`.trim()
    : currentUser?.firstName || "Account";

  const handleSearch = (nextQuery = searchQuery, category = null) => {
    const trimmedQuery = nextQuery.trim();
    let url = `/search?q=${encodeURIComponent(trimmedQuery)}`;
    if (category) {
      const catKey =
        category.id ||
        category._id ||
        category.categoryId ||
        category.categoryKey ||
        category.key ||
        category.slug;
      const catName = category.title || category.name || category.label;
      if (catKey) url += `&categoryId=${encodeURIComponent(catKey)}`;
      if (catName) url += `&categoryName=${encodeURIComponent(catName)}`;
    }
    if (trimmedQuery || category) {
      navigate(url);
    }
  };

  return (
    <header className="customer-container w-full">
      <div className="flex flex-wrap items-center justify-between gap-3 py-3 sm:gap-4 lg:flex-nowrap lg:gap-5 h-auto lg:h-[90px]">
        <div className="flex shrink-0 items-center gap-6 order-1">
          <Link to="/" aria-label="Sam Global home">
            <img
              src="/image/png/logo.png"
              alt="Sam Global"
              className="h-[50px] w-[50px] object-contain sm:w-[92px] lg:h-[58px] lg:w-[140px]"
            />
          </Link>
          <div className="hidden h-10 w-px bg-[var(--customer-border)] lg:block" />
          <HeaderIconButton
            className="hidden lg:flex h-[40px] w-[40px] border-0 bg-transparent hover:border-0 hover:bg-transparent p-0"
            aria-label="Menu"
          >
            {/* <img
              src="/image/png/list.png"
              alt="Menu"
              className="h-[40px] w-[40px] object-contain"
            /> */}
            <span className="pointer-events-none absolute top-full z-50 mt-2 whitespace-nowrap rounded bg-[var(--customer-black)] px-2 py-1 text-xs font-semibold text-white opacity-0 shadow-lg transition-all duration-300 ease-in-out group-hover:opacity-100 group-focus-visible:opacity-100">
              Menu
            </span>
          </HeaderIconButton>
        </div>
        <SearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSearch={handleSearch}
          enableCategoryDropdown
          enableAutocomplete
          autocompleteLimit={8}
          placeholder="Search for products, brands and categories..."
          micIcon={icons.Mic}
          showButtonLabel={false}
          className="order-3 w-full lg:order-2 lg:w-auto lg:max-w-[720px] lg:flex-1"
        />

        <div className="order-2 lg:order-3 flex shrink-0 items-center gap-3 lg:gap-4">
          <div className="hidden items-center gap-5 lg:flex">
            {utilityIcons.map((item, iconIndex) => (
              <Fragment key={keyOr(item?.name, `icon-${iconIndex}`)}>
                <HeaderIconButton
                  to={getNavbarIconPath(item)}
                  aria-label={getNavbarIconLabel(item)}
                >
                  <img
                    src={item?.img}
                    alt={getNavbarIconLabel(item)}
                    className={`object-contain ${
                      item?.name === "IN"
                        ? "h-[22px] w-[24px]"
                        : "h-[17px] w-[17px]"
                    }`}
                  />
                  <span className="pointer-events-none absolute top-full z-50 mt-2 whitespace-nowrap rounded bg-[var(--customer-black)] px-2 py-1 text-xs font-semibold text-white opacity-0 shadow-lg transition-all duration-300 ease-in-out group-hover:opacity-100 group-focus-visible:opacity-100">
                    {getNavbarIconLabel(item)}
                  </span>
                </HeaderIconButton>
                {iconIndex < utilityIcons.length - 1 && (
                  <div className="hidden h-6 w-px bg-[var(--customer-border)] lg:block" />
                )}
              </Fragment>
            ))}
            {utilityIcons.length > 0 && (
              <div className="hidden h-6 w-px bg-[var(--customer-border)] lg:block" />
            )}
            <HeaderIconButton
              to="/cart"
              className="h-[40px] w-[40px] border-0 bg-transparent hover:border-0 hover:bg-transparent"
              aria-label="Cart"
            >
              <img
                src="/image/png/cart.png"
                alt="Cart"
                className="h-[40px] w-[40px] object-contain"
              />
              <span className="pointer-events-none absolute top-full z-50 mt-2 whitespace-nowrap rounded bg-[var(--customer-black)] px-2 py-1 text-xs font-semibold text-white opacity-0 shadow-lg transition-all duration-300 ease-in-out group-hover:opacity-100 group-focus-visible:opacity-100">
                Cart
              </span>
            </HeaderIconButton>
          </div>

          {currentUser ? (
            <Link
              to="/account/profile"
              className="
  inline-flex items-center justify-center
  h-[42px] sm:h-[45px]
  min-w-[124px]
  gap-2
  rounded-[4px]
  border border-[#1B1D60]
  bg-white
  px-4 sm:px-6
  text-[14px] sm:text-[16px]
  font-semibold
  text-[#1B1D60]
  whitespace-nowrap
  transition-all duration-300 ease-in-out
  hover:border-[#CE9F2D]
  hover:bg-[#CE9F2D1A]
"
            >
              <User size={16} className="shrink-0" />
              <span className="truncate">{accountLabel}</span>
            </Link>
          ) : (
            <HeaderGoldButton
              className="
    flex items-center justify-center
    whitespace-nowrap
    rounded-[4px]
    h-[41px]
    min-w-[142px]
    px-5
    font-sans
    text-[16px]
    font-semibold
    leading-[100%]
    tracking-[0%]
  "
              onClick={() => navigate("/register")}
            >
              Create Account
            </HeaderGoldButton>
          )}
        </div>
      </div>
    </header>
  );
};

export const CategoryBar = ({ headerData }) => {
  const location = useLocation();
  const catalogCategoryList = useSelector((state) => state.catalog.list || []);
  const catalogCategories = useMemo(
    () => getCategoryListFromResponse(catalogCategoryList),
    [catalogCategoryList],
  );
  const { page: megaMenuPage } = useCmsRecord("header-mega-menu");
  const megaMenuData = getCmsPayload(megaMenuPage, DEFAULT_FASHION_MENU);
  const [activeMenu, setActiveMenu] = useState(null);
  const categoryBarRef = useRef(null);
  const openTimeoutRef = useRef(null);
  const closeTimeoutRef = useRef(null);

  useEffect(() => {
    setActiveMenu(null);
  }, [location.pathname]);

  useEffect(() => {
    if (!activeMenu) return undefined;

    const handleDocumentPointerDown = (event) => {
      if (!categoryBarRef.current?.contains(event.target)) {
        setActiveMenu(null);
      }
    };

    const handleDocumentKeyDown = (event) => {
      if (event.key === "Escape") {
        setActiveMenu(null);
      }
    };

    document.addEventListener("pointerdown", handleDocumentPointerDown);
    document.addEventListener("keydown", handleDocumentKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handleDocumentPointerDown);
      document.removeEventListener("keydown", handleDocumentKeyDown);
    };
  }, [activeMenu]);

  useEffect(() => {
    return () => {
      if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const handleCategoryMouseEnter = (item) => {
    if (window.innerWidth < 1024) return;

    if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);

    openTimeoutRef.current = setTimeout(() => {
      setActiveMenu(item);
    }, CATEGORY_MENU_OPEN_DELAY_MS);
  };

  const handleCategoryMouseLeave = () => {
    if (window.innerWidth < 1024) return;

    if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);

    closeTimeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, CATEGORY_MENU_CLOSE_DELAY_MS);
  };

  const keepCategoryMenuOpen = () => {
    if (window.innerWidth < 1024) return;
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
  };

  const catalogTree = useMemo(
    () => buildCategoryTree(catalogCategories),
    [catalogCategories],
  );

  const categories = useMemo(() => {
    const headerCategories = getCategoryListFromResponse(headerData);
    if (headerCategories.length) return buildCategoryTree(headerCategories);
    if (!catalogTree.length) return [];

    return catalogTree.map((cat) => ({
      ...cat,
      name: textOr(cat?.name, textOr(cat?.title, "Category")),
      img: cat?.imageUrl || cat?.image || cat?.img,
      slug: keyOr(cat?.slug, getCategoryKey(cat)),
      categoryKey: getCategoryKey(cat),
      children: asArray(cat?.children),
    }));
  }, [catalogTree, headerData]);
  // Show up to 12 root categories in the bar; overflow accessible via "More" button
  const visibleCategories = useMemo(
    () => asArray(categories).slice(0, 10),
    [categories],
  );

  if (!categories.length) return null;

  return (
    <header
      ref={categoryBarRef}
      className="relative left-1/2 right-1/2  -ml-[50vw] -mr-[50vw] w-screen h-[130px] sm:h-[150px] lg:h-[220px] flex items-center"
    >
      {/* Split Background Images */}
      <div
        className="absolute inset-y-0 left-0 w-1/2 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: "url('/image/jpg/cat1.png')" }}
      />
      <div
        className="absolute inset-y-0 right-0 w-1/2 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: "url('/image/jpg/cat.jpg')" }}
      />

      {/* Golden Overlay */}
      <div className="absolute inset-0 bg-[#CE9F2D33]  z-10  " />

      <div className="w-full relative z-20">
        <div className="customer-container hide-scrollbar flex justify-start gap-4 overflow-x-auto px-2 py-3 sm:gap-5  lg:justify-center lg:gap-5">
          {visibleCategories.map((item, index) => {
            // Always use categoryKey first — it's the canonical route key from the DB
            const categoryHref = `/categories/${item?.categoryKey || keyOr(item?.slug, buildCategorySlug(textOr(item?.name, "category")))}`;
            const isActive =
              activeMenu?.categoryKey === item?.categoryKey ||
              location.pathname === categoryHref ||
              location.pathname.startsWith(categoryHref + "/");

            return (
              <div
                key={keyOr(item?.name, `category-${index}`)}
                className="relative"
                onMouseEnter={() => handleCategoryMouseEnter(item)}
                onMouseLeave={handleCategoryMouseLeave}
              >
                <Link
                  to={categoryHref}
                  aria-expanded={isActive}
                  aria-controls="category-mega-menu"
                  className="group flex min-w-[80px] sm:min-w-[100px] lg:min-w-[140px] flex-col items-center rounded-md outline-none transition-all duration-300 ease-in-out focus-visible:ring-2 focus-visible:ring-[var(--customer-gold)]/40 focus-visible:ring-offset-2"
                >
                  <div className="mx-auto  flex h-[50px] w-[50px] sm:h-[65px] sm:w-[65px]  lg:h-[90px] lg:w-[90px] items-center justify-center overflow-hidden rounded-full bg-[#FBCC39] p-1.5 sm:p-2 shadow-sm transition-all duration-300 ease-in-out group-hover:-translate-y-0.5">
                    {item?.img ? (
                      <ImageSkeleton
                        src={item?.img}
                        alt={textOr(item?.name, "Category")}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-[#f6efde] text-[var(--customer-navy)]">
                        <ShoppingBag className="w-5 h-5 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                      </div>
                    )}
                  </div>

                  <span
                    className={`mt-1 lg:mt-2 line-clamp-1 w-full max-w-[80px] sm:max-w-[100px] lg:max-w-[140px] text-center text-[11px] sm:text-[13px] lg:text-[20px] ${isActive ? "font-bold" : "font-medium"} leading-none tracking-[0.2px] text-[#2E2E2E]`}
                  >
                    {textOr(item?.name, "Category")}
                  </span>
                </Link>
              </div>
            );
          })}
          <CategoryMoreButton
            to="/categories"
            active={location.pathname === "/categories"}
            icon={moreImage}
          />
        </div>
        {/* {activeMenu && (
          <div
            id="category-mega-menu"
            className="absolute left-0 top-[calc(100%-2px)] z-[9999] w-full"
            onMouseEnter={keepCategoryMenuOpen}
            onMouseLeave={handleCategoryMouseLeave}
          >
            <CategoryMegaMenu data={megaMenuData} activeCategory={activeMenu} />
          </div>
        )} */}
      </div>
    </header>
  );
};

export const Header = () => {
  return (
    <div className="relative z-50 w-full bg-white shadow-[0_2px_10px_rgba(17,24,39,0.08)]">
      <TopHeader />
      <Navbar />
    </div>
  );
};

export default Header;
