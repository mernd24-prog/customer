import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown, Pencil } from "lucide-react";
import { CgMail } from "react-icons/cg";
import { MdOutlineLocalPhone } from "react-icons/md";

import ApiState from "../../components/common/ApiState";
import Seo from "../../components/common/Seo";
import { fetchMe } from "../../features/user/userSlice";

import ProfileTab from "./ProfileTab";
import AddressTab from "./AddressTab";
import SecurityTab from "./SecurityTab";

const fallbackAvatar = "/image/png/person.png";

const MENU_ITEMS = [
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
    icon: "/image/png/wishList.png",
    path: "/watchlist",
  },
  {
    id: "addresses",
    label: "Saved Addresses",
    description: "Manage your delivery addresses.",
    icon: "/image/png/location.png",
    path: "/account/addresses",
  },
  {
    id: "security",
    label: "Security",
    description: "Manage your password and account security.",
    icon: "/image/png/security.png",
    path: "/account/security",
  },
];

const normalizeAvatarPreview = (avatarUrl) =>
  typeof avatarUrl === "string" &&
  avatarUrl &&
  !avatarUrl.startsWith("data:image/")
    ? avatarUrl
    : fallbackAvatar;

function AccountProfileCard({
  user,
  name,
  avatar,
  avatarError,
  fileInputRef,
  onAvatarChange,
}) {
  return (
    <div className="rounded-[20px] border border-gold bg-[#FFFDF8] p-6 2xl:p-8">
      <div className="grid grid-cols-[48px_minmax(0,1fr)] items-start gap-3 sm:flex sm:items-center sm:gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onAvatarChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            fileInputRef.current?.click();
          }}
          className="group relative shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B1D60]/40"
          aria-label="Change profile image"
        >
          <img
            src={avatar}
            alt="Profile avatar"
            className="size-12 rounded-full border-2 border-[#1B1D60] object-cover md:size-[80px] lg:size-[100px] 2xl:size-[100px]"
            onError={(event) => {
              event.currentTarget.src = fallbackAvatar;
            }}
          />

          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Pencil className="size-5 text-white" />
          </span>
        </button>

        <span className="min-w-0 flex-1">
          <span className="text-lg font-bold text-[#3E4093] sm:text-[24px] 2xl:text-[30px]">
            {name}
          </span>

          <div className="mt-4">
            <span className="flex  gap-2 break-all text-sm font-medium text-[#2E2E2E] sm:justify-start sm:text-[18px] 2xl:text-[20px]">
              <CgMail /> {user?.email || "—"}
            </span>

            <span className="flex gap-2 break-all py-2 text-sm font-medium text-[#2E2E2E] sm:justify-start sm:text-[18px] 2xl:text-[20px]">
              <MdOutlineLocalPhone /> {user?.phone || ""}
            </span>
          </div>
        </span>

        <Link
          to="/account/profile"
          className="col-span-2 inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-[#343B91] bg-[#F3F1F0] px-3 py-2 text-xs font-semibold text-[#1B1D60] hover:!bg-[#F3F1F0] hover:!text-[#1B1D60] sm:col-auto sm:mb-auto sm:ml-auto sm:px-4 sm:text-sm 2xl:text-base"
        >
          <Pencil className="size-3 my-auto" />
          Edit Profile
        </Link>
      </div>

      {avatarError && (
        <p className="mt-2 text-xs font-medium text-red-500">{avatarError}</p>
      )}
    </div>
  );
}

function AccountMenuItem({ item, variant = "desktop", onClick }) {
  const isMobile = variant === "mobile";

  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={
        isMobile
          ? "flex w-full items-start gap-3 border-b border-[#04258626] lg:p-4 p-2 text-[#2E2E2E] hover:!bg-transparent hover:!text-[#2E2E2E] last:border-b-0"
          : "flex w-full items-center gap-3 border-b border-[#04258626] px-3 py-3 text-[#2E2E2E] hover:!bg-transparent hover:!text-[#2E2E2E] last:border-b-0 sm:gap-4 sm:px-4 sm:py-4"
      }
    >
      <span
        className={
          isMobile
            ? "flex lg:size-12 size-9 shrink-0 items-center justify-center rounded-full bg-[#FFC82E]"
            : "flex lg:size-12 size-9 shrink-0 items-center justify-center rounded-full bg-[#FFC82E] text-[#1B1D60] xl:size-[60px]"
        }
      >
        <img
          src={item.icon}
          alt={isMobile ? "" : item.label}
          className={
            isMobile
              ? "size-4 object-contain"
              : "size-4 object-contain sm:size-5"
          }
        />
      </span>

      <span className="min-w-0">
        <span
          className={
            isMobile
              ? "block text-base font-semibold"
              : "block text-lg font-semibold text-[#2E2E2E] sm:text-xl"
          }
        >
          {item.label}
        </span>

        <span
          className={
            isMobile
              ? "mt-0.5 block text-xs text-[#4E4E4E]"
              : "mt-0.5 block text-sm text-[#4E4E4E] sm:text-lg"
          }
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
    <div className="relative xl:hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between rounded-[14px] border border-gold bg-white px-4 py-3 text-left font-semibold text-[#2E2E2E]"
      >
        <span>{activeMenuItem?.label || "Account menu"}</span>

        <ChevronDown
          className={`size-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <nav className="absolute left-0 top-[calc(100%+6px)] z-20 flex w-full flex-col items-start overflow-hidden rounded-[14px] border border-gold bg-white shadow-lg">
          {items.map((item) => (
            <AccountMenuItem
              key={item.id}
              item={item}
              variant="mobile"
              onClick={onClose}
            />
          ))}
        </nav>
      )}
    </div>
  );
}

function AccountDesktopMenu({ items }) {
  return (
    <nav className="hidden w-full flex-col items-start rounded-[20px] border border-gold py-4 xl:flex">
      {items.map((item) => (
        <AccountMenuItem key={item.id} item={item} variant="desktop" />
      ))}
    </nav>
  );
}

function AccountSidebar({
  user,
  name,
  avatar,
  avatarError,
  fileInputRef,
  onAvatarChange,
  activeMenuItem,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) {
  return (
    <aside className="min-w-0 space-y-5 lg:sticky lg:top-24 lg:self-start">
      <AccountProfileCard
        user={user}
        name={name}
        avatar={avatar}
        avatarError={avatarError}
        fileInputRef={fileInputRef}
        onAvatarChange={onAvatarChange}
      />

      <div>
        <AccountMobileMenu
          items={MENU_ITEMS}
          activeMenuItem={activeMenuItem}
          isOpen={isMobileMenuOpen}
          onToggle={() => setIsMobileMenuOpen((open) => !open)}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        <AccountDesktopMenu items={MENU_ITEMS} />
      </div>
    </aside>
  );
}

function AccountTabContent({ tab, user, avatarFile }) {
  return (
    <div className="animate-[fadeIn_180ms_ease-out]">
      {tab === "profile" && <ProfileTab user={user} avatarFile={avatarFile} />}
      {tab === "addresses" && <AddressTab user={user} />}
      {tab === "security" && <SecurityTab />}
    </div>
  );
}

export default function AccountPage({ tab = "profile" }) {
  const dispatch = useDispatch();
  const userState = useSelector((s) => s.user);
  const user = userState.current;

  const fileInputRef = useRef(null);

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(fallbackAvatar);
  const [avatarError, setAvatarError] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      dispatch(fetchMe());
    }
  }, [dispatch, user]);

  useEffect(() => {
    setAvatarPreview(
      normalizeAvatarPreview(user?.profile?.avatarUrl || user?.profile?.avatar),
    );
    setAvatarFile(null);
    setAvatarError("");
  }, [user]);

  useEffect(
    () => () => {
      if (avatarPreview.startsWith("blob:")) {
        globalThis.URL.revokeObjectURL(avatarPreview);
      }
    },
    [avatarPreview],
  );

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarError("Please select a valid image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("Profile image must be 2 MB or smaller.");
      return;
    }

    setAvatarError("");
    setAvatarFile(file);
    setAvatarPreview(globalThis.URL.createObjectURL(file));
  };

  const profile = user?.profile || {};

  const name =
    [profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
    user?.name ||
    "Your account";

  const activeMenuItem = MENU_ITEMS.find((item) => item.id === tab);

  return (
    <>
      <Seo
        title={`Account — ${
          tab.charAt(0).toUpperCase() + tab.slice(1)
        } | Sam Global`}
      />

      <div className="grid gap-5 py-4 sm:py-8 xl:grid-cols-[minmax(280px,0.72fr)_minmax(0,1fr)] lg:gap-5 lg:py-10">
        <AccountSidebar
          user={user}
          name={name}
          avatar={avatarPreview}
          avatarError={avatarError}
          fileInputRef={fileInputRef}
          onAvatarChange={handleAvatarChange}
          activeMenuItem={activeMenuItem}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        <div className="min-w-0">
          <div className="min-h-fit w-full rounded-[14px] border border-gold bg-[#F8F9FF] p-4 shadow-sm sm:p-6 lg:p-7">
            <ApiState
              loading={userState.loading && !user}
              error={userState.error}
              empty={false}
            >
              <AccountTabContent
                tab={tab}
                user={user}
                avatarFile={avatarFile}
              />
            </ApiState>
          </div>
        </div>
      </div>
    </>
  );
}
