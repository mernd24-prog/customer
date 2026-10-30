import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LogOut } from "lucide-react";

import { HeaderGoldButton } from "../../components/ui/button/static";
import ConfirmModal from "../../components/ui/overlay/ConfirmModal";

import { logout } from "../../modules/auth/slices/authSlice";
import { notify } from "../../utils/notify";
import { asArray, hrefOr, keyOr, textOr } from "../../utils/content";

import { DEFAULT_TOP_NAV_LINKS } from "../../constants/header.constant";

export const TopHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useSelector((s) => s.auth.current);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    setShowLogoutModal(false);

    notify.success("Logged out successfully");
    navigate("/", { replace: true });
  };

  return (
    <>
      <div className="hidden h-[40px] w-full items-center justify-center bg-[var(--customer-black)] text-base font-medium text-[#FFFFFF] lg:flex">
        <div className="customer-container flex h-full items-center justify-between">
          <div className="flex flex-1 items-center gap-8 text-[#FFFFFF]">
            {asArray(DEFAULT_TOP_NAV_LINKS).map((link, index) => {
              const path = hrefOr(link?.path);
              const isActive =
                location.pathname === path ||
                (path !== "/" && location.pathname.startsWith(`${path}/`));

              return (
                <Link
                  key={keyOr(link?.name, keyOr(link?.path, `top-link-${index}`))}
                  to={path}
                  aria-current={isActive ? "page" : undefined}
                  className="text-[#FFFFFF] transition-colors duration-300 ease-in-out hover:text-[#CE9F2D] aria-[current=page]:!text-[#CE9F2D]"
                >
                  {textOr(link?.name, "Link")}
                </Link>
              );
            })}
          </div>

          <div className="flex h-full items-center gap-[20px]">
            <Link
              to="/become-a-seller"
              aria-current={
                location.pathname === "/become-a-seller" ? "page" : undefined
              }
              className="text-[#FFFFFF] text-base font-medium transition-all duration-300 ease-in-out hover:text-[#CE9F2D] aria-[current=page]:!text-[#CE9F2D]"
            >
              Become a Seller
            </Link>

            <Link
              to="/support"
              aria-current={
                location.pathname === "/support" ||
                location.pathname.startsWith("/support/")
                  ? "page"
                  : undefined
              }
              title="Help & Support"
              aria-label="Help & Support"
              className="flex items-center justify-center rounded-full text-[#FFFFFF] transition-colors hover:bg-[#CE9F2D]/20 aria-[current=page]:bg-[#CE9F2D]/20"
            >
              <img
                src="/image/svg/customer-support.svg"
                alt="Help & Support"
                className="h-6 w-6 object-contain brightness-0 invert"
              />
            </Link>

            {currentUser ? (
              <HeaderGoldButton
                leftIcon={<LogOut size={14} />}
                className="
                  inline-flex items-center justify-center gap-2
                  h-[30px] lg:h-[32px]
                  min-w-[90px] lg:min-w-[100px]
                  rounded-[5px]
                  px-3
                  py-0
                  text-xs lg:text-sm
                  font-semibold
                  leading-none
                  whitespace-nowrap
                  transition-all duration-300 ease-in-out
                  hover:bg-gray-50
                  hover:shadow-md
                "
                onClick={() => setShowLogoutModal(true)}
              >
                Sign Out
              </HeaderGoldButton>
            ) : null}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={showLogoutModal}
        title="Sign Out"
        description="Are you sure you want to sign out of your account?"
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
        maxWidth="max-w-md"
        confirmClassName="bg-[#DC2626] text-white hover:bg-[#B91C1C]"
      />
    </>
  );
};
