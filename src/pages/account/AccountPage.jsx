import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronLeft,
  ChevronRight,
  KeyRound,
  MapPin,
  Shield,
  User,
} from "lucide-react";
import ApiState from "../../components/common/ApiState";
import Seo from "../../components/common/Seo";
import { fetchMe } from "../../features/user/userSlice";

// Import the separated tab components
import ProfileTab from "./ProfileTab";
import AddressTab from "./AddressTab";
import SecurityTab from "./SecurityTab";
import KycTab from "./Kyc";

const TABS = [
  { id: "profile", label: "Profile", icon: User, path: "/account/profile" },
  {
    id: "addresses",
    label: "Addresses",
    icon: MapPin,
    path: "/account/addresses",
  },
  {
    id: "security",
    label: "Security",
    icon: KeyRound,
    path: "/account/security",
  },
  { id: "kyc", label: "KYC", icon: Shield, path: "/account/kyc" },
];

export default function AccountPage({ tab = "profile" }) {
  const dispatch = useDispatch();
  const userState = useSelector((s) => s.user);
  const user = userState.current;
  const tabsRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    if (!user) {
      dispatch(fetchMe());
    }
  }, [dispatch, user]);

  useEffect(() => {
    const node = tabsRef.current;
    if (!node) return undefined;

    const updateScrollState = () => {
      const maxScrollLeft = node.scrollWidth - node.clientWidth;
      setCanScrollLeft(node.scrollLeft > 8);
      setCanScrollRight(maxScrollLeft - node.scrollLeft > 8);
    };

    updateScrollState();
    node.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      node.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  const scrollTabs = (direction) => {
    const node = tabsRef.current;
    if (!node) return;

    node.scrollBy({
      left: direction === "left" ? -180 : 180,
      behavior: "smooth",
    });
  };

  return (
    <>
      <Seo
        title={`Account — ${tab.charAt(0).toUpperCase() + tab.slice(1)} | Sam Global`}
      />
      <div className="flex flex-col gap-4 py-2 sm:gap-5 sm:py-8 lg:flex-row lg:gap-6 lg:py-10">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-[30%]">
          <div className="relative lg:sticky lg:top-24 lg:ml-auto lg:w-full 2xl:w-[85%]">
            <div
              className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-10 rounded-l-[12px] bg-gradient-to-r from-[#F7F8FC] to-transparent transition-opacity duration-200 lg:hidden ${
                canScrollLeft ? "opacity-100" : "opacity-0"
              }`}
            />
            <div
              className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-10 rounded-r-[12px] bg-gradient-to-l from-[#F7F8FC] to-transparent transition-opacity duration-200 lg:hidden ${
                canScrollRight ? "opacity-100" : "opacity-0"
              }`}
            />

            <button
              type="button"
              onClick={() => scrollTabs("left")}
              aria-label="Scroll account tabs left"
              className={`absolute left-1 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[#25256F] shadow-[0_6px_18px_rgba(37,37,111,0.18)] transition-all duration-200 lg:hidden ${
                canScrollLeft
                  ? "pointer-events-auto opacity-100"
                  : "pointer-events-none opacity-0"
              }`}
            >
              <ChevronLeft className="size-4" />
            </button>

            <button
              type="button"
              onClick={() => scrollTabs("right")}
              aria-label="Scroll account tabs right"
              className={`absolute right-1 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[#25256F] shadow-[0_6px_18px_rgba(37,37,111,0.18)] transition-all duration-200 lg:hidden ${
                canScrollRight
                  ? "pointer-events-auto opacity-100"
                  : "pointer-events-none opacity-0"
              }`}
            >
              <ChevronRight className="size-4" />
            </button>

            <div
              ref={tabsRef}
              className="hide-scrollbar flex w-full gap-2 overflow-x-auto overflow-y-hidden whitespace-nowrap rounded-[12px] p-1.5 sm:p-2 lg:flex-col lg:gap-3 lg:overflow-visible lg:whitespace-normal lg:p-3"
            >
              {TABS.map(({ id, label, icon: Icon, path }) => {
                const isActive = tab === id;

                return (
                  <Link
                    key={id}
                    to={path}
                    className={`relative flex h-[46px] min-w-[120px] shrink-0 items-center justify-center gap-2 rounded-[10px] border px-3 text-sm font-medium transition-colors duration-200 sm:h-[50px] sm:min-w-[138px] sm:px-4 md:text-base lg:h-[74px] lg:w-full lg:min-w-0 lg:justify-start lg:gap-4 lg:rounded-[14px] lg:px-5 xl:text-[18px] ${
                      isActive
                        ? "border-[#25256F] bg-[#25256F] text-white"
                        : "border-transparent bg-transparent text-[#2E2E2E] "
                    }`}
                  >
                    <span
                      className={`absolute bottom-0 left-1/2 h-[3px] w-[70%] -translate-x-1/2 rounded-full bg-[#25256F] transition-opacity duration-200 lg:hidden ${
                        isActive ? "opacity-100" : "opacity-0"
                      }`}
                    />

                    <span
                      className={`absolute left-0 top-1/2 hidden h-[38px] w-[4px] -translate-y-1/2 rounded-r-full bg-[#E0A91B] transition-opacity duration-200 lg:block ${
                        isActive ? "opacity-100" : "opacity-0"
                      }`}
                    />

                    <Icon
                      className={`size-4 shrink-0 transition-colors duration-200 lg:size-5 ${
                        isActive ? "text-white" : "text-[#2564EB]"
                      }`}
                    />

                    <span className="block leading-none tracking-wide">
                      {label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab content */}
        <div className="w-full flex-1 self-start lg:w-[70%]">
          <div className="min-h-[560px] w-full overflow-hidden rounded-[12px] border border-[#CE9F2D66] bg-[#F7F8FC] p-4 shadow-sm sm:min-h-[620px] sm:p-6 lg:min-h-[720px] lg:p-8 2xl:w-[85%]">
            <ApiState
              loading={userState.loading && !user}
              error={userState.error}
              empty={false}
            >
              <div className="animate-[fadeIn_180ms_ease-out]">
                {tab === "profile" && <ProfileTab user={user} />}
                {tab === "addresses" && <AddressTab user={user} />}
                {tab === "security" && <SecurityTab />}
                {tab === "kyc" && <KycTab user={user} />}
              </div>
            </ApiState>
          </div>
        </div>
      </div>
    </>
  );
}
