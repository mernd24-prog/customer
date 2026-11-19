import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Heart, UserRound } from "lucide-react";

import ApiState from "../../../components/ui/ApiState";
import Seo from "../../../components/ui/Seo";
import { PageContainer } from "../../../components/ui/layout";
import { fetchMe } from "../../../features/user/userSlice";

import ProfileTab from "./ProfileTab";
import AddressTab from "./AddressTab";
import SecurityTab from "./SecurityTab";
import { AccountSidebar } from "../components";

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
          items={MENU_ITEMS}
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
