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
    dispatch(fetchMe());
  }, [dispatch]);

  return (
    <>
      <Seo
        title={`Account — ${tab.charAt(0).toUpperCase() + tab.slice(1)} | Sam Global`}
      />

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-6 py-8 sm:py-10">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-[30%] shrink-0">
          <div className="sticky top-24 2xl:w-[85%] ml-auto flex flex-row lg:flex-col justify-between xl:gap-2 overflow-x-auto lg:overflow-x-visible rounded-[12px] p-3 hide-scrollbar">
            {TABS.map(({ id, label, icon: Icon, path }) => (
              <Link
                key={id}
                to={path}
                className={`flex  min-w-max  lg:min-w-0 items-center gap-1 sm:gap-3 rounded-[8px] px-4 py-2 sm:py-4 text-xl font-medium transition-all duration-300 ease-in-out ${
                  tab === id ? "bg-[#1B1D60] text-white shadow-md" : ""
                }`}
              >
                <Icon
                  className={`size-4 xl:size-6 transition-colors duration-300 ease-in-out ${tab === id ? "text-white" : "text-[#2564EB]"}`}
                />
                <span className="tracking-wide text-base xl:text-xl">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="w-full lg:w-[60%] flex-1">
          <div
            key={tab}
            className="w-full 2xl:w-[85%] border border-[#CE9F2D66] bg-[#F7F8FC] p-4 sm:p-8 rounded-[12px] shadow-sm animate-fade-in-up"
          >
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
