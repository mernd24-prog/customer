import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LogOut } from "lucide-react";

import { HeaderGoldButton } from "../../components/ui/button/static";

import { logout } from "../../modules/auth/slices/authSlice";
import { notify } from "../../utils/notify";
import { asArray, hrefOr, keyOr, textOr } from "../../utils/content";

import { DEFAULT_TOP_NAV_LINKS } from "../../constants/header.constant";

export const TopHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((s) => s.auth.current);

  return (
    <div className="hidden h-[40px] w-full items-center justify-center bg-[var(--customer-black)] text-[14px] font-medium text-[#FFFFFF] lg:flex">
      <div className="customer-container flex h-full items-center justify-between">
        <div className="flex flex-1 items-center gap-8 text-[#FFFFFF]">
          {asArray(DEFAULT_TOP_NAV_LINKS).map((link, index) => (
            <Link
              key={keyOr(link?.name, keyOr(link?.path, `top-link-${index}`))}
              to={hrefOr(link?.path)}
              className="text-[#FFFFFF] transition-all duration-300 ease-in-out hover:text-[#FFFFFF]"
            >
              {textOr(link?.name, "Link")}
            </Link>
          ))}
        </div>

        <div className="flex h-full items-center gap-[20px]">
          <Link
            to="/become-a-seller"
            className="text-[#FFFFFF] text-[14px] font-medium transition-all duration-300 ease-in-out hover:text-gray-300"
          >
            Become a Seller
          </Link>

          <Link
            to="/support"
            title="Help & Support"
            aria-label="Help & Support"
            className="flex items-center justify-center text-[#FFFFFF] transition-all duration-300 ease-in-out hover:opacity-80"
          >
            <img
              src="/image/png/help&support.png"
              alt="Help & Support"
              className="h-5 w-5 object-contain brightness-0 invert"
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
                text-[12px] lg:text-[13px]
                font-semibold
                leading-none
                whitespace-nowrap
                transition-all duration-300 ease-in-out
                hover:bg-gray-50
                hover:shadow-md
              "
              onClick={() => {
                dispatch(logout());
                notify.success("Logged out successfully");
                navigate("/", { replace: true });
              }}
            >
              Sign Out
            </HeaderGoldButton>
          ) : null}
        </div>
      </div>
    </div>
  );
};