import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown, Pencil, Heart } from "lucide-react";
import { CgMail } from "react-icons/cg";
import { MdOutlineLocalPhone } from "react-icons/md";

import ApiState from "../../../components/ui/ApiState";
import Seo from "../../../components/ui/Seo";
import { fetchMe } from "../../../features/user/userSlice";

import ProfileTab from "./ProfileTab";
import AddressTab from "./AddressTab";
import SecurityTab from "./SecurityTab";

const fallbackAvatar = "/image/png/person.png";

const UPLOAD_URL =
  "http://192.168.16.42:4000/api/v1/file-uploader/upload";

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
    icon: Heart,
    iconColor: "text-[#e23b3b] fill-[#e23b3b]",
    path: "/wishlist",
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

const getUploadedFileUrl = (result) =>
  result?.url ||
  result?.fileUrl ||
  result?.file?.url ||
  result?.data?.url ||
  result?.data?.fileUrl ||
  result?.data?.file?.url ||
  result?.data?.data?.url ||
  result?.data?.data?.fileUrl ||
  "";

function AccountProfileCard({
  user,
  name,
  avatar,
  avatarError,
  fileInputRef,
  onAvatarChange,
  showEditButton = true,
  isAvatarUploading = false,
}) {
  return (
    <div
      className="
        min-w-0
        w-full
        rounded-[20px]
        border
        border-gold
        bg-[#FFFDF8]
        p-4
        sm:p-6
        2xl:p-8
      "
    >
      <div
        className="
          grid
          min-w-0
          w-full
          grid-cols-[48px_minmax(0,1fr)]
          items-start
          gap-3
          sm:flex
          sm:items-center
          sm:gap-4
        "
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onAvatarChange}
          className="hidden"
          disabled={isAvatarUploading}
        />

        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();

            if (!isAvatarUploading) {
              fileInputRef.current?.click();
            }
          }}
          className="
            group
            relative
            shrink-0
            rounded-full
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-[#1B1D60]/40
          "
          aria-label="Change Profile Image"
          disabled={isAvatarUploading}
        >
          <img
            loading="lazy"
            width="400"
            height="400"
            src={avatar}
            alt="Profile Avatar"
            className="
              size-12
              rounded-full
              border-2
              border-[#1B1D60]
              object-cover
              md:size-[60px]
              lg:size-[80px]
            "
            onError={(event) => {
              event.currentTarget.src = fallbackAvatar;
            }}
          />

          <span
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
              rounded-full
              bg-black/40
              opacity-0
              transition-opacity
              group-hover:opacity-100
            "
          >
            {isAvatarUploading ? (
              <span className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Pencil className="size-5 text-white" />
            )}
          </span>
        </button>

        <div className="min-w-0 flex-1">
          <div className="min-w-0 truncate text-h3 font-bold text-[#3E4093]">
            {name}
          </div>

          <div className="mt-2 grid min-w-0 gap-1.5">
            <div
              className="
                flex
                min-w-0
                max-w-full
                items-start
                gap-1.5
                text-sm
                font-medium
                text-[#2E2E2E]
                sm:gap-2
                sm:text-[18px]
                2xl:text-[20px]
              "
            >
              <CgMail
                className="
                  mt-0.5
                  h-4
                  w-4
                  shrink-0
                  text-[#2E2E2E]
                  sm:h-[18px]
                  sm:w-[18px]
                "
                aria-hidden="true"
              />

              <span className="min-w-0 flex-1 break-all leading-5">
                {user?.email || "—"}
              </span>
            </div>

            <div
              className="
                flex
                min-w-0
                max-w-full
                items-start
                gap-1.5
                py-1
                text-small
                font-medium
                text-[#2E2E2E]
                sm:gap-2
              "
            >
              <MdOutlineLocalPhone
                className="
                  mt-0.5
                  h-4
                  w-4
                  shrink-0
                  text-[#2E2E2E]
                  sm:h-[18px]
                  sm:w-[18px]
                "
                aria-hidden="true"
              />

              <span className="min-w-0 flex-1 break-words leading-5">
                {user?.phone || "—"}
              </span>
            </div>
          </div>
        </div>

        {showEditButton && (
          <Link
            to="/account/profile"
            className="
              col-span-2
              inline-flex
              min-w-0
              shrink-0
              items-center
              justify-center
              gap-2
              rounded-full
              border
              border-[#343B91]
              bg-[#F3F1F0]
              px-3
              py-2
              text-sm
              font-semibold
              text-[#1B1D60]
              hover:!bg-[#F3F1F0]
              hover:!text-[#1B1D60]
              sm:col-auto
              sm:mb-auto
              sm:ml-auto
              sm:px-4
            "
          >
            <Pencil className="my-auto size-3 shrink-0" />
            <span className="whitespace-nowrap">Edit Profile</span>
          </Link>
        )}
      </div>

      {isAvatarUploading && (
        <p className="mt-2 text-xs font-medium text-[#3E4093]">
          Uploading profile image...
        </p>
      )}

      {avatarError && (
        <p className="mt-2 text-xs font-medium text-red-500">
          {avatarError}
        </p>
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
          ? "flex w-full min-w-0 items-start gap-3 border-b border-[#04258626] p-2 text-[#2E2E2E] hover:!bg-transparent hover:!text-[#2E2E2E] last:border-b-0 lg:p-4"
          : "flex w-full min-w-0 items-center gap-3 border-b border-[#04258626] px-3 py-3 text-[#2E2E2E] hover:!bg-transparent hover:!text-[#2E2E2E] last:border-b-0 sm:gap-4 sm:px-4 sm:py-4"
      }
    >
      <span
        className={
          isMobile
            ? "flex size-9 shrink-0 items-center justify-center rounded-full bg-[#FFC82E] lg:size-12"
            : "flex size-9 shrink-0 items-center justify-center rounded-full bg-[#FFC82E] text-[#1B1D60] xl:size-[50px] lg:size-12"
        }
      >
        {typeof item.icon === "string" ? (
          <img
            loading="lazy"
            width="400"
            height="400"
            src={item.icon}
            alt={isMobile ? "" : item.label}
            className={
              isMobile
                ? "size-4 object-contain"
                : "size-4 object-contain sm:size-5"
            }
          />
        ) : (
          (() => {
            const Icon = item.icon;

            return (
              <Icon
                className={`${
                  isMobile ? "size-4" : "size-4 sm:size-5"
                } ${item.iconColor || "text-[#1B1D60] fill-current"}`}
              />
            );
          })()
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={
            isMobile
              ? "block text-sm font-semibold"
              : "block text-sm font-semibold text-[#2E2E2E] sm:text-xl"
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
    <div className="relative z-40 min-w-0 xl:hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="
          flex
          w-full
          min-w-0
          items-center
          justify-between
          rounded-[14px]
          border
          border-gold
          bg-white
          px-4
          py-3
          text-left
          font-semibold
          text-[#2E2E2E]
        "
      >
        <span className="min-w-0 truncate">
          {activeMenuItem?.label || "Account menu"}
        </span>

        <ChevronDown
          className={`size-5 shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <nav className="absolute left-0 top-[calc(100%+6px)] z-50 flex w-full min-w-0 flex-col items-start overflow-hidden rounded-[14px] border border-gold bg-white shadow-lg">
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
    <nav className="hidden w-full min-w-0 flex-col items-start rounded-[20px] border border-gold py-4 xl:flex">
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
  tab,
  isAvatarUploading,
}) {
  return (
    <aside className="relative z-30 min-w-0 space-y-5 lg:sticky lg:top-24 lg:self-start">
      <AccountProfileCard
        user={user}
        name={name}
        avatar={avatar}
        avatarError={avatarError}
        fileInputRef={fileInputRef}
        onAvatarChange={onAvatarChange}
        showEditButton={tab !== "profile"}
        isAvatarUploading={isAvatarUploading}
      />

      <div className="min-w-0">
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

function AccountTabContent({
  tab,
  user,
  avatarFile,
  avatarUrl,
}) {
  return (
    <div className="min-w-0 animate-[fadeIn_180ms_ease-out]">
      {tab === "profile" && (
        <ProfileTab
          user={user}
          avatarFile={avatarFile}
          avatarUrl={avatarUrl}
        />
      )}

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
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(fallbackAvatar);
  const [avatarError, setAvatarError] = useState("");
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      dispatch(fetchMe());
    }
  }, [dispatch, user]);

  useEffect(() => {
    const existingAvatar =
      user?.profile?.avatarUrl || user?.profile?.avatar || "";

    setAvatarPreview(normalizeAvatarPreview(existingAvatar));
    setAvatarUrl(existingAvatar || "");
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

  const handleAvatarChange = async (event) => {
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

    // Show local preview immediately.
    const previewUrl = globalThis.URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    try {
      setIsAvatarUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(UPLOAD_URL, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            "Failed to upload profile image.",
        );
      }

      console.log("Profile image upload response:", result);

      const uploadedUrl = getUploadedFileUrl(result);

      if (!uploadedUrl) {
        throw new Error(
          "Image uploaded, but the server did not return the uploaded image URL.",
        );
      }

      // Keep the uploaded URL for the profile update request.
      setAvatarUrl(uploadedUrl);

      // The file is already uploaded, so ProfileTab must not upload it again.
      setAvatarFile(null);

      // Replace blob preview with the uploaded URL.
      setAvatarPreview(normalizeAvatarPreview(uploadedUrl));
    } catch (error) {
      console.error("Profile image upload failed:", error);

      setAvatarError(
        error?.message || "Failed to upload profile image.",
      );

      setAvatarFile(null);
      setAvatarUrl("");

      // Restore previous profile image if upload fails.
      setAvatarPreview(
        normalizeAvatarPreview(
          user?.profile?.avatarUrl || user?.profile?.avatar,
        ),
      );
    } finally {
      setIsAvatarUploading(false);
    }
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

      <div
        className="
          grid
          min-w-0
          gap-5
          py-4
          sm:py-8
          lg:gap-5
          lg:py-10
          xl:grid-cols-[minmax(280px,0.72fr)_minmax(0,1fr)]
        "
      >
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
          tab={tab}
          isAvatarUploading={isAvatarUploading}
        />

        <div className="relative z-0 min-w-0 w-full">
          <div
            className="
              min-h-fit
              w-full
              min-w-0
              rounded-[14px]
              border
              border-gold
              bg-[#F8F9FF]
              p-3
              shadow-sm
              sm:p-6
              lg:p-7
            "
          >
            <ApiState
              loading={userState.loading && !user}
              error={userState.error}
              empty={false}
            >
              <AccountTabContent
                tab={tab}
                user={user}
                avatarFile={avatarFile}
                avatarUrl={avatarUrl}
              />
            </ApiState>
          </div>
        </div>
      </div>
    </>
  );
}
