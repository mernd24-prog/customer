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

      <div className="w-container py-8 sm:py-10">
        <h1 className="mb-6 font-montserrat text-2xl font-bold text-ink sm:text-3xl">
          My Account
        </h1>

        {/* Tab navigation */}
        <div className="mb-6 flex gap-1 overflow-x-auto rounded-[10px] border border-border bg-cream p-1">
          {TABS.map(({ id, label, icon: Icon, path }) => (
            <Link
              key={id}
              to={path}
              className={`flex min-w-max items-center gap-2 rounded-[8px] px-4 py-2 font-montserrat text-sm font-medium transition-all duration-300 ease-in-out ${
                tab === id
                  ? "bg-white text-gold shadow-sm"
                  : "text-muted hover:text-ink"
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </div>

        {/* Tab content */}
        <div className="rounded-[12px] border border-border bg-white p-6 sm:p-8">
          <ApiState
            loading={userState.loading && !user}
            error={userState.error}
            empty={false}
            onRetry={() => dispatch(fetchMe())}
          >
            {tab === "profile" && <ProfileTab user={user} />}
            {tab === "addresses" && <AddressTab user={user} />}
            {tab === "security" && <SecurityTab />}
            {tab === "kyc" && <KycTab user={user} />}
          </ApiState>
        </div>
      </div>
    </>
  );
}
