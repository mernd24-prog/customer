import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { KeyRound, MapPin, Shield, User } from "lucide-react";
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

  useEffect(() => {
    if (!user) {
      dispatch(fetchMe());
    }
  }, [dispatch, user]);

  return (
    <>
      <Seo
        title={`Account — ${tab.charAt(0).toUpperCase() + tab.slice(1)} | Sam Global`}
      />
      <div className="flex flex-col gap-5 py-6 sm:py-8 lg:flex-row lg:gap-6 lg:py-10">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-[30%]">
          <div className="flex w-full gap-2 overflow-x-auto overflow-y-hidden whitespace-nowrap rounded-[12px] p-2 lg:sticky lg:top-24 lg:ml-auto lg:w-full lg:flex-col lg:overflow-visible lg:whitespace-normal lg:p-3 2xl:w-[85%]">
            {TABS.map(({ id, label, icon: Icon, path }) => {
              const isActive = tab === id;

              return (
                <Link
                  key={id}
                  to={path}
                  className={`flex h-[46px] min-w-[132px] shrink-0 items-center justify-center gap-2 rounded-[8px] border px-3 text-sm font-medium !transition-none sm:h-[50px] sm:min-w-[150px] sm:px-4 md:text-base lg:h-[54px] lg:w-full lg:min-w-0 lg:justify-start xl:text-lg ${
                    isActive
                      ? "border-[#1B1D60] bg-[#1B1D60] text-white"
                      : "border-transparent bg-transparent text-[#1B1D60] hover:bg-[#F2F4FA]"
                  }`}
                >
                  <Icon
                    className={`size-4 shrink-0 !transition-none xl:size-5 ${
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

        {/* Tab content */}
        <div className="w-full flex-1 lg:w-[70%]">
          <div className="min-h-[560px] w-full rounded-[12px] border border-[#CE9F2D66] bg-[#F7F8FC] p-4 shadow-sm sm:min-h-[620px] sm:p-6 lg:min-h-[720px] lg:p-8 2xl:w-[85%]">
            <ApiState
              loading={userState.loading && !user}
              error={userState.error}
              empty={false}
            >
              {tab === "profile" && <ProfileTab user={user} />}
              {tab === "addresses" && <AddressTab user={user} />}
              {tab === "security" && <SecurityTab />}
              {tab === "kyc" && <KycTab user={user} />}
            </ApiState>
          </div>
        </div>
      </div>
    </>
  );
}
