import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown, Heart, UserRound } from "lucide-react";

import ApiState from "../../../components/ui/ApiState";
import Seo from "../../../components/ui/Seo";
import { PageContainer } from "../../../components/ui/layout";
import { fetchMe } from "../../../features/user/userSlice";

import ProfileTab from "./ProfileTab";
import AddressTab from "./AddressTab";
import SecurityTab from "./SecurityTab";

const MENU_ITEMS = [
  {
    id: "profile",
    label: "My Profile",
    description: "View and edit your personal details.",
    icon: UserRound,
    path: "/account/profile",
  },
  {
    id: "addresses",
    label: "Saved Addresses",
    description: "Manage your delivery addresses.",
    icon: "/image/png/location.png",
    path: "/account/addresses",
  },
  {
    id: "orders",
    label: "My Orders",
    description: "Track and manage your orders.",
    icon: "/image/png/order.png",
    path: "/orders",
  },
  {
    id: "wishlist",
    label: "Wishlist",
    description: "View and manage your saved items.",
    icon: Heart,
    iconColor: "text-[#e23b3b] fill-[#e23b3b]",
    path: "/wishlist",
  },
  {
    id: "security",
    label: "Security",
    description: "Manage your password and account security.",
    icon: "/image/png/security.png",
    path: "/account/security",
  },
];

function AccountMenuItem({
  item,
  variant = "desktop",
  onClick,
  active = false,
}) {
  const isMobile = variant === "mobile";

  return (
    <Link
      to={item.path}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`group flex w-full min-w-0 items-start gap-3.5 !rounded-none border-b border-[#04258626] transition-colors last:border-b-0 ${
        isMobile
          ? `p-3 ${active ? "bg-[#FFF9E9]" : "bg-white hover:bg-[#FFF9E9]"}`
          : `p-5 sm:p-6 ${active ? "bg-[#FFF9E9]" : "bg-white hover:bg-[#FFF9E9]"}`
      }`}
    >
      <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#FFC82E] text-[#1B1D60] sm:size-11">
        {typeof item.icon === "string" ? (
          <img
            loading="lazy"
            width="20"
            height="20"
            src={item.icon}
            alt=""
            className="size-4.5 object-contain sm:size-5"
          />
        ) : (
          (() => {
            const Icon = item.icon;

            return (
              <Icon
                className={`size-4.5 sm:size-5 ${
                  item.iconColor || "text-[#1B1D60]"
                }`}
              />
            );
          })()
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={`block text-sm sm:text-base font-semibold transition-colors ${
            active
              ? "text-[#1B1D60]"
              : "text-[#2E2E2E] group-hover:text-[#1B1D60]"
          }`}
        >
          {item.label}
        </span>

        <span
          style={{ fontWeight: 400 }}
          className="mt-0.5 block text-xs leading-5 !font-normal text-[#4E4E4E] sm:text-sm"
        >
          {item.description}
        </span>
      </span>
    </Link>
  );
}

function AccountMobileMenu({
  items,
  activeMenuItem,
  isOpen,
  onToggle,
  onClose,
}) {
  return (
    <div className="min-w-0 lg:hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-label="Toggle account navigation"
        className="flex w-full min-w-0 items-center justify-between rounded-lg border border-gold bg-white px-4 py-3 text-left font-semibold text-[#171A3A] shadow-2xs"
      >
        <span className="min-w-0 truncate text-sm sm:text-base font-semibold">
          {activeMenuItem?.label || "Account Menu"}
        </span>

        <ChevronDown
          className={`size-5 shrink-0 text-[#1B1D60] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <nav
          aria-label="Mobile account navigation"
          className="mt-2 flex w-full min-w-0 flex-col items-start overflow-hidden rounded-sm border border-gold bg-white shadow-sm"
        >
          {items.map((item) => (
            <AccountMenuItem
              key={item.id}
              item={item}
              variant="mobile"
              onClick={onClose}
              active={item.id === activeMenuItem?.id}
            />
          ))}
        </nav>
      )}
    </div>
  );
}

function AccountDesktopMenu({ items, activeMenuItem }) {
  return (
    <nav
      aria-label="Account navigation"
      className="hidden w-full min-w-0 flex-col items-start gap-0 space-y-0 overflow-hidden rounded-lg border border-gold bg-white shadow-2xs lg:flex"
    >
      {items.map((item) => (
        <AccountMenuItem
          key={item.id}
          item={item}
          variant="desktop"
          active={item.id === activeMenuItem?.id}
        />
      ))}
    </nav>
  );
}

function AccountSidebar({
  activeMenuItem,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) {
  return (
    <aside className="relative z-0 w-full min-w-0 lg:w-[320px] xl:w-[330px] lg:shrink-0">
      <div className="min-w-0">
        <AccountMobileMenu
          items={MENU_ITEMS}
          activeMenuItem={activeMenuItem}
          isOpen={isMobileMenuOpen}
          onToggle={() => setIsMobileMenuOpen((open) => !open)}   
          onClose={() => setIsMobileMenuOpen(false)}
        />

        <AccountDesktopMenu
          items={MENU_ITEMS}
          activeMenuItem={activeMenuItem}
        />
      </div>
    </aside>
  );
}

function AccountTabContent({ tab, user }) {
  const safeTab = ["profile", "addresses", "security"].includes(tab)
    ? tab
    : "profile";

  return (
    <div className="mx-auto w-full min-w-0">
      {safeTab === "profile" && <ProfileTab user={user} />}

      {safeTab === "addresses" && <AddressTab user={user} />}

      {safeTab === "security" && <SecurityTab />}
    </div>
  );
}

export default function AccountPage({ tab = "profile" }) {
  const dispatch = useDispatch();

  const userState = useSelector((state) => state.user);
  const user = userState.current;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      dispatch(fetchMe());
    }
  }, [dispatch, user]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [tab]);

  const activeMenuItem = MENU_ITEMS.find((item) => item.id === tab);

  const pageTitle = activeMenuItem?.label || "My Account";

  return (
    <>
      <Seo title={`Account — ${pageTitle} | Sam Global`} />

      <PageContainer
        className="mt-0 mb-0 bg-white"
        contentClassName="mx-auto grid w-full min-w-0 grid-cols-1 items-start gap-4 px-3 sm:gap-5 sm:px-5 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[330px_minmax(0,1fr)] lg:gap-6 lg:px-8"
      >
        <AccountSidebar
          activeMenuItem={activeMenuItem}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        <main className="relative z-0 w-full min-w-0 rounded-md border border-gold/70 bg-white p-3 sm:p-5 lg:p-6 shadow-2xs">
          <ApiState
            loading={userState.loading && !user}
            error={userState.error}
            empty={false}
          >
            <AccountTabContent tab={tab} user={user} />
          </ApiState>
        </main>
      </PageContainer>
    </>
  );
}
