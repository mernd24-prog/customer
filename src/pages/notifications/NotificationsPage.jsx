import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronDown, Headphones, MoreVertical } from "lucide-react";

import Seo from "../../components/common/Seo";
import ApiState from "../../components/common/ApiState";
import Breadcrumbs from "../../components/ecommerce/Breadcrumbs";
import NeedHelpPanel from "../../components/ecommerce/NeedHelpPanel";
import StickySidebarLayout from "../../components/common/layouts/StickySidebarLayout";
import { fetchNotifications } from "../../features/notification/notificationSlice";
import notificationData from "../../data/notificationData";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const categoryOf = (notification) => {
  const eventName = String(
    notification.payload?.eventName || notification.subject || "",
  ).toLowerCase();

  if (
    ["return", "refund", "cancellation", "credit_note"].some((term) =>
      eventName.includes(term),
    )
  ) {
    return "returns";
  }

  if (
    ["order", "shipment", "delivery", "payment", "invoice"].some((term) =>
      eventName.includes(term),
    )
  ) {
    return "orders";
  }

  return "account";
};

const formatNotificationDate = (value) => {
  if (!value) return "";

  const date = new Date(value);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const time = date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (date.toDateString() === now.toDateString()) {
    if (diffHours < 1) {
      return diffMinutes <= 1 ? "Just now" : `${diffMinutes} minutes ago`;
    }

    if (diffHours < 3) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    }

    return `Today, ${time}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${time}`;
  }

  if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: now.getFullYear() !== date.getFullYear() ? "numeric" : undefined,
  });
};

// ---------------------------------------------------------------------------
// Need Help data
// ---------------------------------------------------------------------------

const NOTIFICATION_HELP_ITEMS = [
  {
    icon: Bell,
    title: "Notification Setting",
    description: "Get help with your orders",
    path: "/notification-preferences",
  },
  {
    icon: Headphones,
    title: "Contact Support",
    description: "Get help with your orders",
    path: "/support",
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function NotificationsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const notifState = useSelector((state) => state.notification);

  const notifications = Array.isArray(notifState.list) ? notifState.list : [];

  const [visibleCount, setVisibleCount] = useState(4);

  const handleNavigate = (path) => {
    if (!path) return;
    navigate(path);
  };

  const breadcrumbItems = [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Notifications",
      href: "/notifications",
    },
  ];

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  return (
    <>
      <Seo title="Notifications | Sam Global" />

      <main className="main-container p-0 sm:px-6 sm:py-6 lg:px-0 lg:py-8">
        {/* Breadcrumb */}
        <Breadcrumbs
          items={breadcrumbItems}
          heading={null}
          className="mb-4 text-[#2E2E2E]"
          linkClassName="text-[#2E2E2E]"
          currentClassName="text-[#CE9F2D]"
          separatorClassName="text-[#2E2E2E]"
        />

        {/* Heading */}
        <h1
          className="
            mb-6
            text-[26px]
            font-bold
            leading-tight
            text-[#3E4093]
            sm:text-[30px]
            lg:text-[32px]
          "
        >
          Notifications
        </h1>

        <StickySidebarLayout
          sidebarPosition="right"
          containerClass="flex flex-col xl:flex-row gap-8 lg:gap-10 xl:gap-14"
          sidebarClass="w-full xl:w-[300px]"
          mainContent={
            <ApiState
              loading={notifState.loading && !notifications.length}
              error={notifState.error}
              empty={!notifications.length && !notifState.loading}
              emptyTitle="No notifications"
              emptyText="You're all caught up! Notifications will appear here."
            >
              <div>
                {notifications.slice(0, visibleCount).map((notif, index) => {
                  const isRead = notif.read || notif.isRead;

                  const notificationItem =
                    notificationData[notif.payload?.eventName] ||
                    notificationData[notif.subject] ||
                    notificationData.default;

                  const orderId = notif.payload?.orderId;

                  const actionPath = orderId
                    ? notificationItem.actionPath === "/orders/:orderId/track"
                      ? `/orders/${orderId}/track`
                      : notificationItem.actionPath === "/orders"
                        ? `/orders/${orderId}`
                        : notificationItem.actionPath
                    : notificationItem.actionPath;

                  return (
                    <article
                      key={notif._id || notif.id || index}
                      className="
                          flex
                          gap-4
                          border-b
                          border-[#D9DDE8]
                          py-6
                          last:border-b-0

                          sm:gap-5
                          sm:py-7

                          lg:gap-6
                        "
                    >
                      {/* Icon */}
                      <div
                        className="
                            flex
                            h-[56px]
                            w-[56px]
                            shrink-0
                            items-center
                            justify-center
                            overflow-hidden
                            rounded-full
                            border
                            border-[#CE9F2D]
                            bg-white

                            sm:h-[60px]
                            sm:w-[60px]

                            lg:h-[64px]
                            lg:w-[64px]
                          "
                      >
                        <img
                          src={notificationItem.icon}
                          alt={notif.title || notif.subject || "Notification"}
                          className="
                              h-[30px]
                              w-[30px]
                              object-contain

                              sm:h-[34px]
                              sm:w-[34px]

                              lg:h-[36px]
                              lg:w-[36px]
                            "
                        />
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div
                          className="
                              flex
                              items-start
                              justify-between
                              gap-4
                              sm:gap-5
                            "
                        >
                          {/* Left Text */}
                          <div className="min-w-0 flex-1">
                            {/* Title Row */}
                            <div
                              className="
                                  flex
                                  flex-wrap
                                  items-center
                                  gap-2
                                "
                            >
                              {!isRead && (
                                <span
                                  className="
                                      h-[8px]
                                      w-[8px]
                                      shrink-0
                                      rounded-full
                                      bg-[#1597D4]

                                      sm:h-[9px]
                                      sm:w-[9px]
                                    "
                                />
                              )}

                              <h3
                                className="
                                    text-[20px]
                                    font-semibold
                                    leading-[26px]
                                    text-[#2E2E2E]
                                  "
                              >
                                {notif.title || notif.subject || "Notification"}
                              </h3>
                            </div>

                            {/* Description */}
                            <p
                              className="
                                  mt-1.5
                                  max-w-[700px]
                                  break-words
                                  text-[15px]
                                  leading-[21px]
                                  text-[#4E4E4E]

                                  sm:text-[16px]
                                  sm:leading-[23px]
                                "
                            >
                              {notif.template ||
                                notif.message ||
                                notif.body ||
                                notificationItem.message ||
                                ""}
                            </p>

                            {/* Mobile Time */}
                            <span
                              className="
                                  mt-2
                                  block
                                  text-[15px]
                                  font-medium
                                  leading-5
                                  text-[#4E4E4E]

                                  sm:hidden
                                "
                            >
                              {formatNotificationDate(notif.createdAt)}
                            </span>

                            {/* Action */}
                            {notificationItem.action && (
                              <button
                                type="button"
                                onClick={() => handleNavigate(actionPath)}
                                className="
                                    mt-2.5
                                    text-[14px]
                                    font-semibold
                                    text-[#1B1D60]
                                    hover:underline
                                  "
                              >
                                {notificationItem.action}
                              </button>
                            )}
                          </div>

                          {/* Time + Menu */}
                          <div
                            className="
                                flex
                                shrink-0
                                items-start
                                gap-3
                              "
                          >
                            <span
                              className="
                                  hidden
                                  whitespace-nowrap
                                  pt-0.5
                                  text-[14px]
                                  font-medium
                                  text-[#4E4E4E]

                                  sm:block
                                  lg:text-[15px]
                                "
                            >
                              {formatNotificationDate(notif.createdAt)}
                            </span>

                            <button
                              type="button"
                              aria-label="Notification options"
                              className="
                                  flex
                                  h-8
                                  w-8
                                  items-center
                                  justify-center
                                  rounded-full
                                  text-[#2E2E2E]
                                  transition

                                  hover:bg-[#F3F3F7]
                                "
                            >
                              <MoreVertical
                                size={21}
                                className="
                                    sm:h-[22px]
                                    sm:w-[22px]
                                  "
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}

                {/* =================================================
                    LOAD MORE / SHOW LESS
                ================================================== */}
                {notifications.length > 4 && (
                  <div className="flex justify-center py-5">
                    <button
                      type="button"
                      onClick={() => {
                        if (visibleCount >= notifications.length) {
                          setVisibleCount(4);
                        } else {
                          setVisibleCount((prev) =>
                            Math.min(prev + 4, notifications.length),
                          );
                        }
                      }}
                      className="
                        flex
                        items-center
                        gap-1.5
                        rounded-md
                        px-4
                        py-2
                        text-[13px]
                        font-semibold
                        text-[#25247B]
                        transition

                        hover:bg-[#F3F3F7]
                      "
                    >
                      {visibleCount >= notifications.length
                        ? "Show Less"
                        : "Load More"}

                      <ChevronDown
                        size={15}
                        strokeWidth={2.5}
                        className={`
                          transition-transform
                          duration-200
                          ${
                            visibleCount >= notifications.length
                              ? "rotate-180"
                              : ""
                          }
                        `}
                      />
                    </button>
                  </div>
                )}
              </div>
            </ApiState>
          }
          sidebarContent={
            <div className="min-w-0 self-start xl:h-fit">
              <NeedHelpPanel
                title="Need Help ?"
                items={NOTIFICATION_HELP_ITEMS}
                headerStyle="colored"
                sticky={false}
              />
            </div>
          }
        />
      </main>
    </>
  );
}
