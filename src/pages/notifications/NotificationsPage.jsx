import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Check,
  ChevronDown,
  FileText,
  Headphones,
  Package,
  Tag,
  Truck,
  User,
} from "lucide-react";

import Seo from "../../components/ui/Seo";
import ApiState from "../../components/ui/ApiState";
import Breadcrumbs from "../../modules/common/components/Breadcrumbs";
import NeedHelpPanel from "../../modules/support/components/NeedHelpPanel";
import StickySidebarLayout from "../../components/ui/layout/StickySidebarLayout";
import CustomDropdown from "../../components/ui/CustomDropdown";
import {
  fetchNotifications,
  markAsRead,
} from "../../features/notification/notificationSlice";
import { SKELETON_PRESETS } from "../../components/ui/skeleton/skeletonPresets";
import { getOpaqueOrderPath } from "../../utils/routeTokens";
import { orderService } from "../../modules/orders/services/orderService";
import notificationData from "../../data/notificationData";

const formatRelativeTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

const getTypeConfig = (notif) => {
  const eventName = (
    notif.payload?.eventName ||
    notif.type ||
    notif.subject ||
    ""
  ).toLowerCase();
  const title = (notif.title || notif.subject || "").toLowerCase();
  const body = (
    notif.template ||
    notif.message ||
    notif.body ||
    ""
  ).toLowerCase();

  if (
    eventName.startsWith("shipment") ||
    title.includes("shipment") ||
    title.includes("deliver") ||
    title.includes("transit") ||
    title.includes("dispatch") ||
    body.includes("shipment")
  ) {
    return {
      icon: Truck,
      iconColor: "text-[#3E4093]",
      iconBg: "bg-[#3E4093]/10",
    };
  }
  if (
    eventName.startsWith("invoice") ||
    eventName.includes("payment") ||
    eventName.includes("credit_note") ||
    title.includes("invoice") ||
    title.includes("credit note") ||
    title.includes("receipt") ||
    title.includes("refund") ||
    title.includes("payment") ||
    body.includes("credit note") ||
    body.includes("invoice")
  ) {
    return {
      icon: FileText,
      iconColor: "text-[#3E4093]",
      iconBg: "bg-[#3E4093]/10",
    };
  }
  if (
    eventName.includes("offer") ||
    eventName.includes("promo") ||
    title.includes("offer") ||
    title.includes("discount") ||
    title.includes("special") ||
    title.includes("coupon")
  ) {
    return {
      icon: Tag,
      iconColor: "text-[#CE9F2D]",
      iconBg: "bg-[#CE9F2D]/10",
    };
  }
  if (
    eventName.includes("user") ||
    eventName.includes("profile") ||
    title.includes("profile") ||
    title.includes("account") ||
    title.includes("security")
  ) {
    return {
      icon: User,
      iconColor: "text-[#3E4093]",
      iconBg: "bg-[#3E4093]/10",
    };
  }
  return {
    icon: Package,
    iconColor: "text-[#3E4093]",
    iconBg: "bg-[#3E4093]/10",
  };
};

const NotificationCard = ({ notif, onClick }) => {
  const isRead = notif.read || notif.isRead;
  const typeCfg = getTypeConfig(notif);
  const TypeIcon = typeCfg.icon;

  const displayMessage = notif.template || notif.message || notif.body || "";

  const iconColorClass = typeCfg.iconColor;
  const iconBgClass = typeCfg.iconBg;

  const payload = notif.payload || {};
  let productName =
    payload.productName ||
    payload.product_name ||
    payload.productTitle ||
    payload.product_title ||
    payload.itemTitle ||
    payload.itemsSummary ||
    payload.product ||
    notif.productName ||
    notif.productTitle;

  if (
    !productName &&
    Array.isArray(payload.items) &&
    payload.items.length > 0
  ) {
    const firstItem = payload.items[0];
    productName =
      firstItem.productTitle ||
      firstItem.product_title ||
      firstItem.name ||
      firstItem.title ||
      firstItem.product?.title ||
      firstItem.product?.name;
  }
  if (!productName && payload.cancellation?.items?.length > 0) {
    productName =
      payload.cancellation.items[0].productTitle ||
      payload.cancellation.items[0].name;
  }

  const countRaw =
    payload.itemCount ||
    payload.totalItems ||
    payload.products?.length ||
    payload.items?.length;
  const count = countRaw ? parseInt(countRaw, 10) : null;

  return (
    <article
      onClick={onClick}
      className={`overflow-hidden cursor-pointer group relative flex items-start gap-3.5 p-4 sm:px-5 rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-md ${
        isRead
          ? "border-[#EAEFF5] bg-white hover:border-[#D9DDE8]"
          : "border-[#F0E6D2] bg-[#FCFAF2]"
      }`}
    >
      {/* Type Icon */}
      <div className="relative shrink-0 mt-0.5">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-full ${iconBgClass} ${iconColorClass}`}
        >
          <TypeIcon size={20} strokeWidth={2} />
        </div>
        {!isRead && (
          <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#1597D4] ring-2 ring-white" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1">
          {/* Title and Time Row */}
          <div className="flex flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
            <h3
              className={`text-[15px] sm:text-[16px] leading-tight pr-2 sm:pr-4 ${isRead ? "font-semibold text-[#2E2E2E]" : "font-bold text-[#1B1D60]"}`}
            >
              {notif.title || notif.subject || "Notification"}
            </h3>

            <div className="flex items-center gap-2 shrink-0">
              {notif.payload?.itemCount ||
              notif.payload?.totalItems ||
              notif.payload?.products?.length ? (
                <span className="text-[11px] font-semibold text-[#3E4093] bg-[#F3F4F9] border border-[#EAEFF5] px-2 py-0.5 rounded-full">
                  {notif.payload?.itemCount ||
                    notif.payload?.totalItems ||
                    notif.payload?.products?.length}{" "}
                  {parseInt(
                    notif.payload?.itemCount ||
                      notif.payload?.totalItems ||
                      notif.payload?.products?.length,
                  ) === 1
                    ? "Product"
                    : "Products"}
                </span>
              ) : null}
              <span className="text-[12px] text-[#8E8E8E] font-medium shrink-0">
                {formatRelativeTime(notif.createdAt)}
              </span>
            </div>
          </div>

          {/* Message */}
          <p
            className={`mt-0.5 text-[13px] sm:text-[14px] leading-snug break-words ${isRead ? "text-[#6E6E6E]" : "text-[#4E4E4E]"}`}
          >
            {displayMessage}
          </p>
        </div>
      </div>
    </article>
  );
};

export function NotificationsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const notifState = useSelector((state) => state.notification);
  const notifications = Array.isArray(notifState.list) ? notifState.list : [];
  const meta = notifState.meta || {};
  const totalPages = meta.totalPages || 1;

  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState("all");
  const limit = 6;

  useEffect(() => {
    dispatch(fetchNotifications({ params: { page: 1, limit } }));
  }, [dispatch]);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Notifications", href: "/notifications" },
  ];

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read && !n.isRead).length;
  }, [notifications]);

  const counts = useMemo(() => {
    let orders = 0,
      shipments = 0,
      invoices = 0,
      offers = 0,
      account = 0,
      unread = 0;

    notifications.forEach((n) => {
      const cfg = getTypeConfig(n);
      if (!n.read && !n.isRead) unread++;

      if (cfg.type === "shipments") shipments++;
      else if (cfg.type === "invoices") invoices++;
      else if (cfg.type === "offers") offers++;
      else if (cfg.type === "account") account++;
      else orders++;
    });

    return {
      all: notifications.length,
      orders,
      shipments,
      invoices,
      offers,
      account,
      unread,
    };
  }, [notifications]);

  const filterOptions = [
    { label: `All (${counts.all})`, value: "all" },
    { label: `Unread (${counts.unread})`, value: "unread" },
    { label: `Orders (${counts.orders})`, value: "orders" },
    { label: `Shipments (${counts.shipments})`, value: "shipments" },
    { label: `Invoices (${counts.invoices})`, value: "invoices" },
    { label: `Offers (${counts.offers})`, value: "offers" },
    { label: `Account (${counts.account})`, value: "account" },
  ];

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "all") return notifications;
    if (activeFilter === "unread")
      return notifications.filter((n) => !n.read && !n.isRead);
    return notifications.filter((n) => getTypeConfig(n).type === activeFilter);
  }, [notifications, activeFilter]);

  const handleLoadMore = () => {
    if (notifState.loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    dispatch(fetchNotifications({ params: { page: nextPage, limit } }));
  };

  const handleShowLess = () => {
    if (notifState.loading) return;
    setPage(1);
    dispatch(fetchNotifications({ params: { page: 1, limit } }));
  };

  const handleClearAll = () => {
    console.log("Clear All triggered");
  };

  const handleNotificationClick = async (notif) => {
    dispatch(markAsRead(notif.id || notif._id));

    if (notif.actionUrl) {
      navigate(notif.actionUrl);
      return;
    }

    if (notif.payload?.url) {
      navigate(notif.payload.url);
      return;
    }

    const notificationItem =
      notificationData[notif.payload?.eventName] ||
      notificationData[notif.subject] ||
      notificationData.default;

    const orderId = notif.payload?.orderId;

    const rawViewUrl = notif.payload?.viewUrl || "";
    let actionPath = orderId
      ? notificationItem.actionPath === "/orders/:orderId/track"
        ? getOpaqueOrderPath(orderId, { track: true })
        : notificationItem.actionPath === "/orders" ||
            rawViewUrl.startsWith("/orders/")
          ? getOpaqueOrderPath(orderId)
          : notificationItem.actionPath
      : notificationItem.actionPath;

    let targetItemId = null;
    const extractIdFromItem = (item) => {
      if (!item) return null;
      return (
        item.orderItemId ||
        item.itemId ||
        item.order_item_id ||
        item.productId ||
        item.product_id ||
        item._id ||
        item.id
      );
    };

    const searchNested = (arr) => {
      if (!Array.isArray(arr)) return null;
      for (const obj of arr) {
        const id = extractIdFromItem(obj);
        if (id) return id;
        if (Array.isArray(obj.items) && obj.items.length > 0) {
          const id2 = extractIdFromItem(obj.items[0]);
          if (id2) return id2;
        }
      }
      return null;
    };

    // 1. Plural Arrays (Nested items)
    targetItemId = targetItemId || searchNested(notif.payload?.cancellations);
    targetItemId = targetItemId || searchNested(notif.payload?.shipments);
    targetItemId = targetItemId || searchNested(notif.payload?.returns);
    targetItemId = targetItemId || searchNested(notif.payload?.returnRequests);

    // 2. Singular Objects (Nested items)
    targetItemId =
      targetItemId ||
      extractIdFromItem(notif.payload?.cancellation?.items?.[0]);
    targetItemId =
      targetItemId || extractIdFromItem(notif.payload?.shipment?.items?.[0]);
    targetItemId =
      targetItemId || extractIdFromItem(notif.payload?.return?.items?.[0]);
    targetItemId =
      targetItemId ||
      extractIdFromItem(notif.payload?.returnRequest?.items?.[0]);

    // 3. Direct Items Arrays
    targetItemId = targetItemId || extractIdFromItem(notif.payload?.items?.[0]);
    targetItemId =
      targetItemId || extractIdFromItem(notif.payload?.order?.items?.[0]);
    targetItemId =
      targetItemId || extractIdFromItem(notif.payload?.order_items?.[0]);

    // 4. Flat IDs
    targetItemId =
      targetItemId ||
      notif.payload?.orderItemId ||
      notif.payload?.itemId ||
      notif.payload?.order_item_id ||
      notif.payload?.productId ||
      notif.payload?.product_id;

    if (!targetItemId) {
      const findIdRecursively = (obj, depth = 0) => {
        if (!obj || typeof obj !== "object" || depth > 5) return null;
        if (obj.orderItemId) return obj.orderItemId;
        if (obj.itemId) return obj.itemId;
        if (obj.order_item_id) return obj.order_item_id;
        if (obj.productId) return obj.productId;
        if (obj.product_id) return obj.product_id;

        for (const key in obj) {
          if (typeof obj[key] === "object") {
            const res = findIdRecursively(obj[key], depth + 1);
            if (res) return res;
          }
        }
        return null;
      };
      targetItemId = findIdRecursively(notif.payload);
    }

    // 5. Ultimate Fallback: Fetch order and grab first item
    if (!targetItemId && orderId) {
      try {
        const res = await orderService.fetchOrderById(orderId);
        const order = res?.data?.data || res?.data || res;
        const items = order?.items || order?.orderItems || [];
        if (items.length > 0) {
          const firstItem = items[0];
          targetItemId =
            firstItem.id ||
            firstItem._id ||
            firstItem.orderItemId ||
            firstItem.productId;
        }
      } catch (error) {
        console.error(
          "Failed to fetch order details for notification fallback",
          error,
        );
      }
    }

    const isOrderCreation =
      String(notif.payload?.eventName || "").includes("order.created") ||
      String(notif.title || notif.subject || "")
        .toLowerCase()
        .includes("order confirmed") ||
      String(notif.title || notif.subject || "")
        .toLowerCase()
        .includes("order placed");

    if (orderId && targetItemId && !isOrderCreation) {
      const sep = actionPath.includes("?") ? "&" : "?";
      actionPath += `${sep}orderItemId=${targetItemId}`;
    }

    if (actionPath) {
      navigate(actionPath);
    } else if (notif.payload?.returnId) {
      navigate(`/returns/request/${notif.payload.returnId}`);
    }
  };

  return (
    <>
      <Seo title="Notifications | Sam Global" />

      <main className="main-container p-0 sm:px-6 sm:py-6 lg:px-0 lg:py-8">
        <Breadcrumbs
          items={breadcrumbItems}
          heading={null}
          className="mb-3 text-[#2E2E2E]"
          linkClassName="text-[#2E2E2E] text-xs"
          currentClassName="text-[#CE9F2D] text-xs"
        />

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#EAEFF5] pb-5">
          <div className="flex items-center gap-3">
            <h1 className="text-[24px] sm:text-[28px] font-bold leading-tight text-[#3E4093]">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="flex items-center justify-center px-2.5 py-0.5 rounded-full bg-[#3E4093] text-white text-[13px] font-bold">
                {unreadCount} New
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="w-[180px]">
              <CustomDropdown
                options={filterOptions}
                value={activeFilter}
                onChange={(val) => setActiveFilter(val)}
                className="w-full"
                buttonClassName="h-10 !rounded-lg !border-[#CE9F2D] !text-[#1B1D60] font-semibold bg-white"
              />
            </div>
          </div>
        </div>

        <StickySidebarLayout
          sidebarPosition="right"
          containerClass="flex flex-col xl:flex-row gap-6 lg:gap-8"
          sidebarClass="w-full xl:w-[320px]"
          mainContent={
            <ApiState
              loading={notifState.loading && !notifications.length}
              error={notifState.error}
              empty={!filteredNotifications.length && !notifState.loading}
              emptyTitle="No notifications"
              emptyText="You're all caught up! Notifications will appear here."
              skeletonLayout={SKELETON_PRESETS.NOTIFICATIONS_PAGE_SKELETON}
              skeletonContainerClass="bg-transparent"
            >
              <div className="flex flex-col gap-2.5">
                {filteredNotifications.map((notif, index) => (
                  <NotificationCard
                    key={notif._id || notif.id || index}
                    notif={notif}
                    onClick={() => handleNotificationClick(notif)}
                  />
                ))}

                {totalPages > 1 && (
                  <div className="flex justify-center py-4">
                    <button
                      type="button"
                      onClick={
                        page >= totalPages ? handleShowLess : handleLoadMore
                      }
                      disabled={notifState.loading}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#D9DDE8] bg-white px-5 py-2 text-[13px] font-semibold text-[#1B1D60] shadow-sm transition hover:bg-[#F3F3F7] disabled:opacity-50"
                    >
                      {notifState.loading
                        ? "Loading..."
                        : page >= totalPages
                          ? "Show Less"
                          : "Load More"}
                      {!notifState.loading && (
                        <ChevronDown
                          size={14}
                          strokeWidth={2.5}
                          className={`transition-transform duration-200 ${
                            page >= totalPages ? "rotate-180" : ""
                          }`}
                        />
                      )}
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
                items={[
                  {
                    icon: Bell,
                    title: "Notification Settings",
                    description: "Manage how you get notified",
                    path: "/notification-preferences",
                  },
                  {
                    icon: Headphones,
                    title: "Contact Support",
                    description: "Get help with your orders",
                    path: "/support",
                  },
                ]}
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
