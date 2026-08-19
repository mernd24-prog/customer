import { Fragment, useEffect, useMemo, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Bell,
  Camera,
  Heart,
  Lock,
  LogOut,
  Settings,
  ShoppingCart,
  ShoppingBag,
  Store,
  Truck,
  User,
  LifeBuoy,
  RefreshCcw,
} from "lucide-react";

import moreImage from "/image/png/MoreImage.png";
import ImageSkeleton from "../components/ui/Image";
import SearchBar from "../components/ui/SearchBar";
import {
  CategoryMoreButton,
  HeaderGoldButton,
  HeaderIconButton,
} from "../components/ui/button/static";
import HeaderDropdown from "./header/HeaderDropdown";
import MenuDropdown from "./header/MenuDropdown";
import { TopHeader } from "./header/TopHeader";
//import { CategoryMegaMenu } from "../components/ecommerce";
import { navbarIcons as navData } from "../constants/image.constant";
import { useWatchlistProducts } from "../hooks/useWatchlistProducts";
import { logout } from "../features/auth/authSlice";
import { fetchMe } from "../features/user/userSlice";
import { getRole, isAdminRole } from "../utils/roles";
import { asArray, hrefOr, keyOr, textOr } from "../utils/content";
import { fetchProducts } from "../features/product/productSlice";

const buildCategorySlug = (name = "category") =>
  String(name).trim().toLowerCase().replace(/\s+/g, "-");

import {
  dropdownIconMap,
  navbarIconLabels,
  baseAccountMenuItems,
  CATEGORY_MENU_OPEN_DELAY_MS,
  CATEGORY_MENU_CLOSE_DELAY_MS,
  HEADER_HEIGHT_VAR,
} from "../constants/header.constant";

const getNavbarIconPath = (item = {}) => {
  if (item.name === "IN") return "/account/addresses";
  return hrefOr(item.path);
};

const getNavbarIconLabel = (item = {}) =>
  item.tooltip ||
  navbarIconLabels[item.name] ||
  textOr(item.name, "Navigation");

function getHeaderHeight() {
  if (typeof window === "undefined") return 0;

  // Prefer reading inline style to avoid forced layout from getComputedStyle
  let value = document.documentElement.style.getPropertyValue(HEADER_HEIGHT_VAR);
  
  if (!value) {
    value = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue(HEADER_HEIGHT_VAR);
  }

  return Number.parseFloat(value) || 0;
}

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

export const Navbar = ({ icons: propIcons }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const prevPathnameRef = useRef(location.pathname);
  const currentUser = useSelector((s) => s.auth.current);
  const profileUser = useSelector((s) => s.user.current) || currentUser;
  const currentRole = getRole(currentUser);
  const cartItems = useSelector((s) => s.cart.current?.items) || [];
  const { products: wishlistedProducts } = useWatchlistProducts();
  const displayIcons = propIcons || navData;
  const utilityIcons = asArray(displayIcons).filter(
    (item) => !["IN", "Word", "Account", "Cart"].includes(item?.name),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const accountLabel = profileUser?.profile?.firstName
    ? `${profileUser.profile.firstName} ${profileUser.profile.lastName || ""}`.trim()
    : profileUser?.firstName || profileUser?.email?.split("@")[0] || "My Sam";
  const profileAvatar =
    profileUser?.profile?.avatarUrl ||
    profileUser?.profile?.avatar ||
    "/image/png/person.png";
  const accountMenuItems = withIcons([
    ...baseAccountMenuItems.map((item) => {
      if (item.path === "/sign-out" || item.label === "Sign Out") {
        return {
          ...item,
          path: undefined,
          action: () => {
            dispatch(logout());
            navigate("/", { replace: true });
          },
        };
      }
      return item;
    }),
    ...(isAdminRole(currentRole)
      ? [
          {
            label: "Admin Products",
            path: "/admin/products",
            icon: "settings",
          },
          { label: "Admin Catalog", path: "/admin/catalog", icon: "settings" },
          { label: "Admin Brands", path: "/admin/brands", icon: "settings" },
          { label: "Admin RBAC", path: "/admin/rbac", icon: "settings" },
        ]
      : []),
  ]);
  const cartItemCount = cartItems.reduce(
    (total, item) => total + Math.max(1, Number(item?.quantity) || 1),
    0,
  );
  const cartState = useSelector((s) => s.cart);
  const cart = cartState.current || {};
  const cartItemsLength = useMemo(() => cart.items?.length || 0, [cart.items]);

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchMe());
    }
  }, [currentUser, dispatch]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const q = urlParams.get("q") || "";
    if (location.pathname === "/search") {
      setSearchQuery(q);
    } else if (location.pathname === "/" && prevPathnameRef.current !== "/") {
      setSearchQuery("");
    }
    prevPathnameRef.current = location.pathname;
  }, [location.pathname, location.search]);

  const handleSearch = (nextQuery = searchQuery, category = null) => {
    const trimmedQuery = nextQuery.trim();
    const categoryKey = category
      ? category.categoryKey ||
        category.key ||
        category.slug ||
        buildCategorySlug(textOr(category?.title, category?.name))
      : "";

    if (!trimmedQuery && categoryKey) {
      navigate(`/categories/${encodeURIComponent(categoryKey)}`);
      return;
    }

    let url = `/search?q=${encodeURIComponent(trimmedQuery)}`;
    if (category) {
      const catKey =
        category.categoryKey ||
        category.key ||
        category.slug ||
        category.categoryId ||
        category.id ||
        category._id;
      const catName = category.title || category.name || category.label;
      if (catKey) url += `&category=${encodeURIComponent(catKey)}`;
      if (catName) url += `&categoryName=${encodeURIComponent(catName)}`;
    }
    if (trimmedQuery || category) {
      navigate(url);
    }
  };

  return (
    <header className="customer-container w-full">
      <div className="flex h-auto flex-wrap items-center justify-between gap-x-2 gap-y-3 py-3 min-[375px]:gap-x-3 sm:gap-4  lg:h-[90px] lg:flex-nowrap lg:gap-5">
        <div className="order-1  flex min-w-0 shrink items-center gap-3 min-[375px]:gap-4 sm:gap-6">
          <Link to="/" aria-label="Sam Global Home">
            <picture>
              <source srcSet="/image/png/logo-small.avif 1x, /image/png/logo.avif 2x" type="image/avif" />
              <source srcSet="/image/png/logo-small.webp 1x, /image/png/logo.webp 2x" type="image/webp" />
              <img
                src="/image/png/logo-small.webp"
                alt="Sam Global"
                width="130"
                height="72"
                fetchpriority="high"
                className="h-auto w-[74px] object-contain min-[375px]:w-[86px] min-[425px]:w-[98px] sm:w-[160px] md:w-[135px] lg:w-[120px] xl:w-[130px]"
              />
            </picture>
          </Link>

          <span className="pointer-events-none absolute top-full z-50 mt-2 whitespace-nowrap rounded bg-[var(--customer-black)] px-2 py-1 text-xs font-semibold text-white opacity-0 shadow-lg transition-all duration-300 ease-in-out group-hover:opacity-100 group-focus-visible:opacity-100">
            Menu
          </span>
          {/* </HeaderIconButton> */}
        </div>
        <SearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSearch={handleSearch}
          enableCategoryDropdown
          enableAutocomplete
          autocompleteLimit={8}
          autocompleteMinLength={1}
          autocompleteDebounceMs={300}
          placeholder="Search for Products, Brands and Categories..."
          showButtonLabel={false}
          className="order-3 w-full min-w-0 lg:order-2 my-2 lg:my-0 lg:flex-1"
        />

        {/* Actions */}
        <div className="order-2 flex  items-center gap-1.5 min-[375px]:gap-2 sm:gap-3 lg:order-3 lg:gap-4">
          <div className="flex items-center gap-2 sm:gap-5">
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

                  <span className=" pointer-events-none    absolute top-full z-50 mt-2 whitespace-nowrap rounded bg-[var(--customer-black)] px-2 py-1 text-xs font-semibold text-[#FFFFFF] opacity-0 shadow-lg transition-all duration-300 ease-in-out group-hover:opacity-100 group-focus-visible:opacity-100">
                    {getNavbarIconLabel(item)}
                  </span>
                </HeaderIconButton>

                {iconIndex < utilityIcons.length - 1 && (
                  <div className="hidden  h-6 w-px bg-[var(--customer-border)]  lg:block" />
                )}
              </Fragment>
            ))}

            {utilityIcons.length > 0 && (
              <div className="hidden h-6 w-px bg-[var(--customer-border)]  lg:block" />
            )}
            <HeaderIconButton
              to="/cart"
              className={`relative h-8 w-8 overflow-visible bg-[#1B1D600D] text-[#1B1D60]  min-[375px]:h-9 min-[375px]:w-9 md:h-10 md:w-10 transition-all ${
                location.pathname === "/cart"
                  ? "border border-[#1B1D6099]"
                  : "border border-transparent"
              }`}
              aria-label={`Cart with ${cartItemCount} ${cartItemCount === 1 ? "item" : "items"}`}
            >
              <ShoppingCart className="h-4 w-4 fill-current md:h-5 md:w-5" />

              {cartItemCount > 0 && (
                <span className="absolute  -right-1 -top-1 flex h-[19px] min-w-[19px] items-center justify-center rounded-full border-2 border-white bg-[#CE9F2D] px-1  text-[12px] font-bold  text-white shadow-sm">
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </span>
              )}
            </HeaderIconButton>
            <HeaderIconButton
              to="/watchlist"
              className={`relative h-8 w-8 overflow-visible bg-[#1B1D600D] text-[#1B1D60] min-[375px]:h-9 min-[375px]:w-9 md:h-10 md:w-10 transition-all ${
                location.pathname === "/watchlist"
                  ? "border border-[#1B1D6099]"
                  : "border border-transparent"
              }`}
              aria-label={`Watchlist with ${wishlistedProducts.length} ${wishlistedProducts.length === 1 ? "item" : "items"}`}
            >
              <Heart className="h-4 w-4 fill-current md:h-5 md:w-5 " />
              {wishlistedProducts.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-[19px] min-w-[19px] items-center justify-center rounded-full border-2 border-white bg-[#CE9F2D] px-1 text-[12px] font-bold text-white shadow-sm">
                  {wishlistedProducts.length > 99
                    ? "99+"
                    : wishlistedProducts.length}
                </span>
              )}
            </HeaderIconButton>
          </div>

          {currentUser ? (
            <HeaderDropdown
              label={accountLabel}
              ariaLabel="Open account menu"
              iconOnly
              showChevron
              icon={
                <div className="flex items-center gap-2.5">
                  <img
                    src={profileAvatar}
                    alt=""
                    className="h-8 w-8 rounded-full object-cover min-[375px]:h-9 min-[375px]:w-9 md:h-10 md:w-10"
                    onError={(event) => {
                      event.currentTarget.src = "/image/png/person.png";
                    }}
                  />
                  <span className="hidden min-w-0 flex-col text-left leading-tight lg:flex">
                    <span className="max-w-[130px] truncate text-[16px] font-bold text-[#2E2E2E]">
                      {accountLabel}
                    </span>
                    <span className="max-w-[160px] truncate text-[15px] font-medium text-[#2E2E2E]">
                      {profileUser?.email || ""}
                    </span>
                  </span>
                </div>
              }
              path="/account/profile"
              className="h-8 w-8 overflow-hidden rounded-full  bg-white p-0  min-[375px]:h-9 min-[375px]:w-9 md:h-10 md:w-10 lg:h-auto lg:w-auto lg:overflow-visible lg:rounded-none lg:border-0 lg:bg-transparent"
              chevronClassName="hidden !text-[#1B1D60] lg:block lg:self-top"
            >
              <MenuDropdown title="My Account" items={accountMenuItems} />
            </HeaderDropdown>
          ) : (
            <HeaderGoldButton
              className="flex h-[34px] min-w-[96px] items-center justify-center rounded-[4px] px-2.5 font-sans text-[18px] font-semibold leading-none text-[#03014D] whitespace-nowrap min-[375px]:h-[36px] min-[375px]:min-w-[108px] min-[375px]:px-3 min-[375px]:text-[16px] min-[425px]:h-[38px] min-[425px]:min-w-[118px] min-[425px]:text-[13px] sm:h-[41px] sm:min-w-[142px] sm:px-5 sm:text-[14px] lg:text-[16px]"
              onClick={() => navigate("/login")}
            >
              Login
            </HeaderGoldButton>
          )}
        </div>
      </div>
    </header>
  );
};

export const CategoryBar = ({ headerData, compact = false }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const globalCategories = useSelector(
    (state) => state.catalog.globalCategories,
  );

  const [categoriesList, setCategoriesList] = useState([]);

  useEffect(() => {
    const list = getCategoryListFromResponse(globalCategories);
    const actualCategories = list.filter(
      (item) => item && (item.categoryKey || item.parentKey),
    );
    setCategoriesList(actualCategories);
  }, [globalCategories]);

  const catalogCategories = useMemo(() => categoriesList, [categoriesList]);
  const [activeMenu, setActiveMenu] = useState(null);
  const [isPinned, setIsPinned] = useState(false);
  const categoryBarRef = useRef(null);
  const isPinnedRef = useRef(false);
  const openTimeoutRef = useRef(null);
  const closeTimeoutRef = useRef(null);

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

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!categoryBarRef.current) return;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          const headerOffset = getHeaderHeight();
          const { bottom } = categoryBarRef.current.getBoundingClientRect();
          const nextPinned = isPinnedRef.current
            ? bottom <= headerOffset + 16
            : bottom <= headerOffset - 8;

          if (nextPinned !== isPinnedRef.current) {
            isPinnedRef.current = nextPinned;
            setIsPinned(nextPinned);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const catalogTree = useMemo(
    () => buildCategoryTree(catalogCategories),
    [catalogCategories],
  );

  const categories = useMemo(() => {
    let result = [];
    const headerCategories = getCategoryListFromResponse(headerData);
    if (headerCategories.length) {
      result = buildCategoryTree(headerCategories);
    } else if (catalogTree.length) {
      const fullTree = buildCategoryTree(globalCategories) || [];
      const findInTree = (nodes, key) => {
        if (!Array.isArray(nodes)) return null;
        for (const n of nodes) {
          if (n.categoryKey === key) return n;
          if (n.children && n.children.length > 0) {
            const found = findInTree(n.children, key);
            if (found) return found;
          }
        }
        return null;
      };

      result = catalogTree.map((cat) => {
        const globalNode = findInTree(fullTree, cat.categoryKey);
        const catChildren =
          Array.isArray(globalNode?.children) && globalNode.children.length > 0
            ? globalNode.children
            : asArray(cat?.children);

        return {
          ...cat,
          name: textOr(cat?.name, textOr(cat?.title, "Category")),
          img: cat?.imageUrl || cat?.image || cat?.img,
          slug: keyOr(cat?.slug, getCategoryKey(cat)),
          categoryKey: getCategoryKey(cat),
          children: catChildren,
        };
      });
    }

    return result;
  }, [catalogTree, headerData, globalCategories]);

  const visibleCategories = useMemo(
    () => asArray(categories).slice(0, 8),
    [categories],
  );

  if (!categories.length) return null;

  /* ── Compact mode: text-only bar for non-homepage pages ──────────── */
  if (compact) {
    return (
      <nav
        ref={categoryBarRef}
        aria-label="Category Navigation"
        style={{ top: `var(${HEADER_HEIGHT_VAR}, 0px)` }}
        className="fixed left-0 z-40 w-full bg-white border-b border-[var(--customer-border)]"
      >
        <div className="customer-container mx-auto w-full relative">
          <div className="w-full overflow-x-auto hide-scrollbar">
            <div className="mx-auto flex h-[44px] w-max items-center gap-5 whitespace-nowrap px-4 sm:gap-7 sm:px-6 lg:h-[46px]">
              {visibleCategories.map((item, index) => {
                const categoryHref = `/categories/${item?.categoryKey || keyOr(item?.slug, buildCategorySlug(textOr(item?.name, "category")))}`;
                const isActive =
                  activeMenu?.categoryKey === item?.categoryKey ||
                  location.pathname === categoryHref ||
                  location.pathname.startsWith(categoryHref + "/");

                return (
                  <Link
                    key={keyOr(item?.name, `compact-category-${index}`)}
                    to={categoryHref}
                    onMouseEnter={() => handleCategoryMouseEnter(item)}
                    onMouseLeave={handleCategoryMouseLeave}
                    className={`relative flex h-full shrink-0 items-center text-[13px] font-semibold transition-all duration-200 ease-in-out hover:text-[#03014D] sm:text-[14px] ${
                      isActive ? "text-[#03014D]" : "text-[#2E2E2E]"
                    }`}
                  >
                    <span className="max-w-[250px] xl:max-w-none truncate">
                      {textOr(item?.name, "Category")}
                    </span>
                    <span
                      className={`absolute bottom-0 left-0 h-[3px] rounded-md bg-[#CE9F2D] transition-all duration-300 ${
                        isActive ? "w-full opacity-100" : "w-0 opacity-0"
                      }`}
                    />
                  </Link>
                );
              })}
              {categories.length > 10 && (
                <Link
                  to="/categories"
                  className={`relative flex h-full shrink-0 items-center text-[13px] font-semibold transition-all duration-200 ease-in-out hover:text-[#03014D] sm:text-[14px] ${
                    location.pathname === "/categories"
                      ? "text-[#03014D]"
                      : "text-[#2E2E2E]"
                  }`}
                >
                  More
                  <span
                    className={`absolute bottom-0 left-0 h-[3px] rounded-full bg-[#CE9F2D] transition-all duration-300 ${
                      location.pathname === "/categories"
                        ? "w-full opacity-100"
                        : "w-0 opacity-0"
                    }`}
                  />
                </Link>
              )}
            </div>
          </div>
        </div>
        {/* {activeMenu && (
          <div
            id="compact-category-mega-menu "
            className="absolute left-0 top-full z-[9999] w-full"
            onMouseEnter={keepCategoryMenuOpen}
            onMouseLeave={handleCategoryMouseLeave}
          >
            <CategoryMegaMenu data={megaMenuData} activeCategory={activeMenu} />
          </div>
        )} */}
      </nav>
    );
  }

  /* ── Full mode: visual header with icons (homepage) ─────────────── */
  return (
    <header
      ref={categoryBarRef}
      className="relative left-1/2 right-1/2  -ml-[50vw] -mr-[50vw] w-screen h-[130px] sm:h-[150px] lg:h-[167px] flex items-center"
    >
      {/* Split Background Images */}
      <div
        className="absolute inset-y-0 left-0 w-1/2 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: "url('/image/webp/cat1.webp')" }}
      />
      <div
        className="absolute inset-y-0 right-0 w-1/2 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: "url('/image/webp/cat.webp')" }}
      />

      {/* Golden Overlay */}
      <div className="absolute inset-0 bg-[#CE9F2D33]  z-10  " />

      <div className="customer-container mx-auto w-full relative z-20">
        <div className="w-full overflow-x-auto hide-scrollbar">
          <div className="mx-auto flex w-max gap-4 py-3 sm:gap-5 lg:gap-5">
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
                    className="group flex min-w-[80px] sm:min-w-[100px] lg:min-w-[140px]  flex-col items-center rounded-md outline-none transition-all duration-300 ease-in-out focus-visible:ring-2 focus-visible:ring-[var(--customer-gold)]/40 focus-visible:ring-offset-2"
                  >
                    <div className="mx-auto flex h-[50px]  w-[50px] sm:h-[65px] sm:w-[65px]  lg:h-[75px] lg:w-[75px] items-center justify-center overflow-hidden rounded-full bg-[#FBCC39] p-1.5 sm:p-2 shadow-sm transition-transform duration-300 ease-in-out  group-hover:-translate-y-0.5  will-change-transform ">
                      {item?.iconUrl ? (
                        <ImageSkeleton
                          src={item?.iconUrl}
                          alt={textOr(item?.name, "Category")}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-[#f6efde] text-[var(--customer-navy)]">
                          <ShoppingBag className="w-5 h-5  sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                        </div>
                      )}
                    </div>

                    <span className="mt-1  lg:mt-2 line-clamp-1 w-full max-w-[80px] sm:max-w-[100px] lg:max-w-[140px] text-center   text-small  text-[#2E2E2E]">
                      {textOr(item?.name, "Category")}
                    </span>
                  </Link>
                </div>
              );
            })}
            {categories.length > 10 && (
              <CategoryMoreButton
                to="/categories"
                active={location.pathname === "/categories"}
                icon={moreImage}
              />
            )}
          </div>
        </div>
      </div>
      {/* {activeMenu && !isPinned && (
        <div
          id="category-mega-menu"
          className="absolute left-0 top-full z-[9999] w-full"
          onMouseEnter={keepCategoryMenuOpen}
          onMouseLeave={handleCategoryMouseLeave}
        >
          <CategoryMegaMenu data={megaMenuData} activeCategory={activeMenu} />
        </div>
      )} */}
      <nav
        aria-label="Sticky Category Navigation"
        style={{ top: `var(${HEADER_HEIGHT_VAR}, 0px)` }}
        className={`fixed left-0 z-40 w-full bg-white shadow-[0_8px_18px_rgba(17,24,39,0.08)] transition-all duration-300 ease-in-out !block ${
          isPinned
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-full opacity-0"
        }`}
      >
        <div className="customer-container mx-auto w-full relative">
          <div className="w-full overflow-x-auto hide-scrollbar">
            <div className="mx-auto flex h-[44px] w-max items-center gap-5 whitespace-nowrap px-4 sm:gap-7 sm:px-6 lg:h-[46px]">
              {visibleCategories.map((item, index) => {
                const categoryHref = `/categories/${item?.categoryKey || keyOr(item?.slug, buildCategorySlug(textOr(item?.name, "category")))}`;
                const isActive =
                  activeMenu?.categoryKey === item?.categoryKey ||
                  location.pathname === categoryHref ||
                  location.pathname.startsWith(categoryHref + "/");

                return (
                  <Link
                    key={keyOr(item?.name, `sticky-category-${index}`)}
                    to={categoryHref}
                    onMouseEnter={() => handleCategoryMouseEnter(item)}
                    onMouseLeave={handleCategoryMouseLeave}
                    className={`relative flex h-full shrink-0 items-center text-[13px] font-semibold transition-all duration-200 ease-in-out hover:text-[#03014D] sm:text-[14px] ${
                      isActive ? "text-[#03014D]" : "text-[#2E2E2E]"
                    }`}
                  >
                    <span className="max-w-[250px] xl:max-w-none truncate">
                      {textOr(item?.name, "Category")}
                    </span>
                    <span
                      className={`absolute bottom-0 left-0 h-[3px] rounded-full bg-[#CE9F2D] transition-all duration-300 ${
                        isActive ? "w-full opacity-100" : "w-0 opacity-0"
                      }`}
                    />
                  </Link>
                );
              })}
              {categories.length > 10 && (
                <Link
                  to="/categories"
                  className={`relative flex h-full shrink-0 items-center text-[13px] font-semibold transition-all duration-200 ease-in-out hover:text-[#03014D] sm:text-[14px] ${
                    location.pathname === "/categories"
                      ? "text-[#03014D]"
                      : "text-[#2E2E2E]"
                  }`}
                >
                  More
                  <span
                    className={`absolute bottom-0 left-0 h-[3px] rounded-full bg-[#CE9F2D] transition-all duration-300 ${
                      location.pathname === "/categories"
                        ? "w-full opacity-100"
                        : "w-0 opacity-0"
                    }`}
                  />
                </Link>
              )}
            </div>
          </div>
        </div>
        {/* {activeMenu && isPinned && (
          <div
            id="sticky-category-mega-menu"
            className="absolute left-0 top-full z-[9999] w-full"
            onMouseEnter={keepCategoryMenuOpen}
            onMouseLeave={handleCategoryMouseLeave}
          >
            <CategoryMegaMenu data={megaMenuData} activeCategory={activeMenu} />
          </div>
        )} */}
      </nav>
    </header>
  );
};

export const Header = () => {
  const headerRef = useRef(null);
  const dispatch = useDispatch();

  const discoveryNavigationLoaded = useSelector((state) =>
    Boolean(state.catalog.discoveryNavigationLoaded),
  );
  const discoveryNavigationLoading = useSelector((state) =>
    Boolean(state.catalog.discoveryNavigationLoading),
  );

  useEffect(() => {
    if (discoveryNavigationLoaded || discoveryNavigationLoading)
      return undefined;
    const fallbackTimer = window.setTimeout(() => {
      dispatch(fetchProducts({ page: 1, limit: 1 })).catch(() => {});
    }, 250);
    return () => window.clearTimeout(fallbackTimer);
  }, [dispatch, discoveryNavigationLoaded, discoveryNavigationLoading]);

  useEffect(() => {
    const updateHeaderHeight = () => {
      const height = headerRef.current?.offsetHeight || 0;
      const currentHeight = Number.parseFloat(document.documentElement.style.getPropertyValue(HEADER_HEIGHT_VAR));
      if (height !== currentHeight) {
        document.documentElement.style.setProperty(
          HEADER_HEIGHT_VAR,
          `${height}px`,
        );
      }
    };  

    updateHeaderHeight();

    if (!headerRef.current) return undefined;

    const observer = new ResizeObserver(updateHeaderHeight);
    observer.observe(headerRef.current);
    window.addEventListener("resize", updateHeaderHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeaderHeight);
      document.documentElement.style.removeProperty(HEADER_HEIGHT_VAR);
    };
  }, []);

  return (
    <div
      className="fixed left-0 top-0 z-50 w-full bg-white shadow-[0_2px_10px_rgba(17,24,39,0.08)]"
      ref={headerRef}
    >
      <TopHeader />
      <Navbar />
    </div>
  );
};

export default Header;
