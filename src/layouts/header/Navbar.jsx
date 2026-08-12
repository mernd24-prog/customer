
import { Fragment, useEffect, useMemo, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Heart, ShoppingCart } from "lucide-react";

import SearchBar from "../../components/ui/SearchBar";
import {
  HeaderGoldButton,
  HeaderIconButton,
} from "../../components/dynamicComponent/button/static";
import HeaderDropdown from "./HeaderDropdown";
import MenuDropdown from "./MenuDropdown";

import { fetchMe } from "../../features/user/userSlice";
import { logout } from "../../features/auth/authSlice";
import { useWatchlistProducts } from "../../hooks/useWatchlistProducts";
import { getRole, isAdminRole } from "../../utils/roles";
import { asArray, keyOr, textOr } from "../../utils/content";
import { navbarIcons as navData } from "../../constants/image.constant";

import {
  baseAccountMenuItems,
  navbarIconLabels,
} from "./constants";
import {
  buildCategorySlug,
  getNavbarIconPath,
  getNavbarIconLabel,
  withIcons,
} from "./categoryHelpers";

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
    : profileUser?.firstName ||
      profileUser?.email?.split("@")[0] ||
      "My Sam";

  const profileAvatar =
    profileUser?.profile?.avatarUrl ||
    profileUser?.profile?.avatar ||
    "/image/png/person.png";

  const accountMenuItems = withIcons([
    ...baseAccountMenuItems.map((item) => {
      if (item.path === "/sign-out") {
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
          { label: "Admin Products", path: "/admin/products", icon: "settings" },
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

  // Fetch profile when user logs in
  useEffect(() => {
    if (currentUser) {
      dispatch(fetchMe());
    }
  }, [currentUser, dispatch]);

  // Clear Search when navigating back to homepage
  useEffect(() => {
    if (location.pathname === "/" && prevPathnameRef.current !== "/") {
      setSearchQuery("");
    }
    prevPathnameRef.current = location.pathname;
  }, [location.pathname]);

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
      <div className="flex h-auto flex-wrap items-center justify-between gap-x-2 gap-y-3 py-3 min-[375px]:gap-x-3 sm:gap-4 lg:h-[90px] lg:flex-nowrap lg:gap-5">
        {/* Logo */}
        <div className="order-1 flex min-w-0 shrink items-center gap-3 min-[375px]:gap-4 sm:gap-6 group relative">
          <Link to="/" aria-label="Sam Global Home">
            <img
              src="/image/png/logo.png"
              alt="Sam Global"
              className="h-auto w-[74px] object-contain min-[375px]:w-[86px] min-[425px]:w-[98px] sm:w-[160px] md:w-[135px] lg:w-[120px] xl:w-[130px]"
            />
          </Link>
          <span className="pointer-events-none absolute top-full z-50 mt-2 whitespace-nowrap rounded bg-[var(--customer-black)] px-2 py-1 text-xs font-semibold text-white opacity-0 shadow-lg transition-all duration-300 ease-in-out group-hover:opacity-100 group-focus-visible:opacity-100">
            Menu
          </span>
        </div>

        {/* Search */}
        <SearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSearch={handleSearch}
          enableCategoryDropdown
          enableAutocomplete
          autocompleteLimit={8}
          autocompleteMinLength={1}
          autocompleteDebounceMs={1000}
          placeholder="Search for Products, Brands and Categories..."
          showButtonLabel={false}
          className="order-3 w-full min-w-0 lg:order-2 my-2 lg:my-0 lg:w-auto lg:max-w-[720px] lg:flex-1"
        />

        {/* Actions */}
        <div className="order-2 flex items-center gap-1.5 min-[375px]:gap-2 sm:gap-3 lg:order-3 lg:gap-4">
          <div className="flex items-center gap-2 sm:gap-5">
            {/* Utility icons from CMS / constants */}
            {utilityIcons.map((item, iconIndex) => (
              <Fragment key={keyOr(item?.name, `icon-${iconIndex}`)}>
                <HeaderIconButton
                  to={getNavbarIconPath(item)}
                  aria-label={getNavbarIconLabel(item, navbarIconLabels)}
                >
                  <img
                    src={item?.img}
                    alt={getNavbarIconLabel(item, navbarIconLabels)}
                    className={`object-contain ${
                      item?.name === "IN"
                        ? "h-[22px] w-[24px]"
                        : "h-[17px] w-[17px]"
                    }`}
                  />
                  <span className="pointer-events-none absolute top-full z-50 mt-2 whitespace-nowrap rounded bg-[var(--customer-black)] px-2 py-1 text-xs font-semibold text-[#FFFFFF] opacity-0 shadow-lg transition-all duration-300 ease-in-out group-hover:opacity-100 group-focus-visible:opacity-100">
                    {getNavbarIconLabel(item, navbarIconLabels)}
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

            {/* Cart */}
            <HeaderIconButton
              to="/cart"
              className="relative h-8 w-8 overflow-visible border-[#1B1D60] bg-[#1B1D600D] text-[#1B1D60] min-[375px]:h-9 min-[375px]:w-9 md:h-10 md:w-10"
              aria-label={`Cart with ${cartItemCount} ${cartItemCount === 1 ? "item" : "items"}`}
            >
              <ShoppingCart className="h-4 w-4 fill-current md:h-5 md:w-5" />
              {cartItemsLength > 0 && (
                <span className="absolute -right-1 -top-1 flex h-[19px] min-w-[19px] items-center justify-center rounded-full border-2 border-white bg-[#CE9F2D] px-1 text-[12px] font-bold text-white shadow-sm">
                  {cartItemsLength > 99 ? "99+" : cartItemsLength}
                </span>
              )}
            </HeaderIconButton>

            {/* Watchlist */}
            <HeaderIconButton
              to="/watchlist"
              className="relative h-8 w-8 overflow-visible border border-[#1B1D6099] bg-[#1B1D600D] text-[#1B1D60] min-[375px]:h-9 min-[375px]:w-9 md:h-10 md:w-10"
              aria-label={`Watchlist with ${wishlistedProducts.length} ${wishlistedProducts.length === 1 ? "item" : "items"}`}
            >
              <Heart className="h-4 w-4 fill-current md:h-5 md:w-5" />
              {wishlistedProducts.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-[19px] min-w-[19px] items-center justify-center rounded-full border-2 border-white bg-[#CE9F2D] px-1 text-[12px] font-bold text-white shadow-sm">
                  {wishlistedProducts.length > 99
                    ? "99+"
                    : wishlistedProducts.length}
                </span>
              )}
            </HeaderIconButton>
          </div>

          {/* Account dropdown OR Login button */}
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
                    className="h-8 w-8 rounded-full object-cover min-[375px]:h-9 min-[375px]:w-9 md:h-12 md:w-12"
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
              className="h-8 w-8 overflow-hidden rounded-full bg-white p-0 min-[375px]:h-9 min-[375px]:w-9 md:h-10 md:w-10 lg:h-auto lg:w-auto lg:overflow-visible lg:rounded-none lg:border-0 lg:bg-transparent"
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
