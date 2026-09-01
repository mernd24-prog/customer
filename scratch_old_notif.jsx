import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  Headphones,
  Package,
  Settings,
  Tag,
  Truck,
  User,
} from "lucide-react";

import Seo from "../../components/ui/Seo";
import ApiState from "../../components/ui/ApiState";
import Breadcrumbs from "../../components/ecommerce/Breadcrumbs";
import NeedHelpPanel from "../../components/ecommerce/NeedHelpPanel";
import StickySidebarLayout from "../../components/ui/layout/StickySidebarLayout";
import { fetchNotifications } from "../../features/notification/notificationSlice";
import notificationData from "../../data/notificationData";
import { SKELETON_PRESETS } from "../../components/ui/skeleton/skeletonPresets";
import { getOpaqueOrderPath } from "../../utils/routeTokens";
import { orderService } from "../../modules/orders/services/orderService";

const formatNotificationDate = (value) => {
  if (!value) return "";

  const date = new Date(value);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (date.toDateString() === now.toDateString()) {
    if (diffHours < 1) {
      return diffMinutes <= 1 ? "Just now" : `${diffMinutes} min ago`;
    }
    if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
    }
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "1 day ago";
  }

  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: now.getFullYear() !== date.getFullYear() ? "numeric" : undefined,
  });
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
      type: "shipments",
      icon: Truck,
      iconBg: "bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]",
      actionText: "Track Shipment",
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
      type: "invoices",
      icon: FileText,
      iconBg: "bg-[#E6F4EA] text-[#0D652D] border border-[#CEEAD6]",
      actionText: "View Invoice",
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
      type: "offers",
      icon: Tag,
      iconBg: "bg-[#FCE8E6] text-[#C5221F] border border-[#FAD2CF]",
      actionText: "View Offer",
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
      type: "account",
      icon: User,
      iconBg: "bg-[#F3E8FD] text-[#6B21A8] border border-[#E9D5FF]",
      actionText: "View Profile",
    };
  }
  return {
    type: "orders",
    icon: Package,
    iconBg: "bg-[#E8EAF6] text-[#3E4093] border border-[#C5CAE9]",
    actionText: "View Order",
  };
};

const getNotificationDetails = (notif, ordersMap = {}) => {
  const payload = notif.payload || {};

  const rawOrderId = payload.orderId || payload.order_id || notif.orderId;
  const orderNumber =
    payload.orderNumber || payload.order_number || notif.orderNumber;

  const orderInfo =
    (rawOrderId && ordersMap[String(rawOrderId)]) ||
    (orderNumber && ordersMap[String(orderNumber)]) ||
    {};

  const finalOrderNumber = orderNumber || orderInfo.orderNumber;
  let orderDisplayId = finalOrderNumber;
  if (!orderDisplayId && rawOrderId) {
    if (
      typeof rawOrderId === "string" &&
      rawOrderId.length > 20 &&
      !rawOrderId.startsWith("ORD-")
    ) {
      orderDisplayId = `ORD-${rawOrderId.slice(-8).toUpperCase()}`;
    } else {
      orderDisplayId = rawOrderId;
    }
  }

  let productName =
    payload.productName ||
    payload.product_name ||
    payload.productTitle ||
    payload.product_title ||
    payload.itemTitle ||
    payload.itemsSummary ||
    payload.product ||
    notif.productName ||
    notif.productTitle ||
    orderInfo.productName;

  if (
    !productName &&
    Array.isArray(payload.items) &&
    payload.items.length > 0
  ) {
    const firstItem = payload.items[0];
    const firstTitle =
      firstItem.productTitle ||
      firstItem.product_title ||
      firstItem.name ||
      firstItem.title;
    if (firstTitle) {
      productName =
        payload.items.length > 1
          ? `${firstTitle} (+${payload.items.length - 1} more)`
          : firstTitle;
    }
  }

  let itemCount = payload.itemCount || payload.itemsCount || payload.totalItems;
  if (!itemCount && Array.isArray(payload.items)) {
    itemCount = payload.items.length;
  }
  if (!itemCount && orderInfo.itemCount) {
    itemCount = orderInfo.itemCount;
  }

  const sellerName =
    payload.sellerName ||
    payload.seller_name ||
    notif.sellerName ||
    orderInfo.sellerName;
  const rawAmount =
    payload.amount ||
    payload.totalAmount ||
    payload.total_amount ||
    notif.amount ||
    orderInfo.totalAmount;
  const amount = rawAmount
    ? typeof rawAmount === "number"
      ? `₹${rawAmount.toLocaleString("en-IN")}`
      : rawAmount
    : null;

  let rawMessage = notif.template || notif.message || notif.body || "";
  if (rawOrderId && orderDisplayId && rawOrderId !== orderDisplayId) {
    rawMessage = rawMessage.replace(rawOrderId, orderDisplayId);
  }

  return {
    rawOrderId,
    orderNumber: finalOrderNumber,
    orderDisplayId,
    productName,
    itemCount,
    sellerName,
    amount,
    message: rawMessage,
  };
};

const NOTIFICATION_HELP_ITEMS = [
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
];

export function NotificationsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const notifState = useSelector((state) => state.notification);
  const notifications = Array.isArray(notifState.list) ? notifState.list : [];
  const meta = notifState.meta || {};
  const totalPages = meta.totalPages || 1;

  const [page, setPage] = useState(1);
  const [ordersMap, setOrdersMap] = useState({});
  const [activeFilter, setActiveFilter] = useState("all");
  const limit = 6;

  useEffect(() => {
    let isMounted = true;
    orderService
      .fetchMyOrders()
      .then((res) => {
        if (!isMounted) return;
        const rawOrders =
          res?.data?.data ||
          res?.data?.orders ||
          res?.data?.items ||
          res?.data ||
          (Array.isArray(res) ? res : []);
        const ordersList = Array.isArray(rawOrders) ? rawOrders : [];

        const map = {};
        ordersList.forEach((order) => {
          const id = order._id || order.id;
          const num = order.orderNumber || order.order_number;

          const items =
            order.items || order.lineItems || order.relations?.items || [];
          let pName = null;
          if (items.length > 0) {
            const firstTitle =
              items[0]?.productTitle ||
              items[0]?.product_title ||
              items[0]?.product?.title ||
              items[0]?.product?.name ||
              items[0]?.title ||
              items[0]?.name;
            if (firstTitle) {
              pName =
                items.length > 1
                  ? `${firstTitle} (+${items.length - 1} more)`
                  : firstTitle;
            }
          }

          const info = {
            orderId: id,
            orderNumber: num,
            productName: pName,
            itemCount: items.length || order.totalItems || null,
            totalAmount:
              order.totalAmount ||
              order.total_amount ||
              order.payableAmount ||
              order.grandTotal,
            sellerName:
              order.sellerName ||
              order.seller_name ||
              order.seller?.businessName ||
              order.seller?.displayName,
          };

          if (id) map[String(id)] = info;
          if (num) map[String(num)] = info;
        });

        setOrdersMap(map);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    dispatch(fetchNotifications({ params: { page: 1, limit } }));
  }, [dispatch]);

  const handleNavigate = (path) => {
    if (!path) return;
    navigate(path);
  };

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Notifications", href: "/notifications" },
  ];

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read && !n.isRead).length;
  }, [notifications]);

  const counts = useMemo(() => {
    let orders = 0;
    let shipments = 0;
    let invoices = 0;
    let offers = 0;
    let account = 0;
    let unread = 0;

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

  return (
    <>
      <Seo title="Notifications | Sam Global" />

      <main className="main-container p-0 sm:px-6 sm:py-6 lg:px-0 lg:py-8">
        {/* Breadcrumb */}
        <Breadcrumbs
          items={breadcrumbItems}
          heading={null}
          className="mb-3 text-[#2E2E2E]"
          linkClassName="text-[#2E2E2E] text-xs"
          currentClassName="text-[#CE9F2D] text-xs"
        />

        {/* Top Header Row */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-baseline gap-2.5">
            <h1 className="text-[24px] sm:text-[28px] font-bold leading-tight text-[#3E4093]">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="text-[13px] font-semibold text-[#CE9F2D]">
                You have {unreadCount} new update{unreadCount > 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-[13px] font-semibold text-[#3E4093]">
            <button
              type="button"
              className="inline-flex items-center gap-1 hover:underline text-[#3E4093]"
            >
              <Check size={14} strokeWidth={2.5} />
              <span>Mark all as read</span>
            </button>
            <span className="text-[#D9DDE8]">|</span>
            <button
              type="button"
              onClick={() => handleNavigate("/notification-preferences")}
              className="inline-flex items-center gap-1 hover:underline text-[#3E4093]"
            >
              <Settings size={14} />
              <span>Notification Settings</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: `All (${counts.all})` },
            { id: "orders", label: `Orders (${counts.orders})` },
            { id: "shipments", label: `Shipments (${counts.shipments})` },
            { id: "invoices", label: `Invoices (${counts.invoices})` },
            { id: "unread", label: `Unread (${counts.unread})` },
            { id: "offers", label: `Offers (${counts.offers})` },
            { id: "account", label: `Account (${counts.account})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all ${
                activeFilter === tab.id
                  ? "bg-[#3E4093] text-white shadow-2xs"
                  : "bg-white border border-[#D9DDE8] text-[#4E4E4E] hover:bg-[#F3F3F7] hover:text-[#2E2E2E]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Layout with Sidebar */}
        <StickySidebarLayout
          sidebarPosition="right"
          containerClass="flex flex-col xl:flex-row gap-6 lg:gap-8"
          sidebarClass="w-full xl:w-[290px]"
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
              <div>
                {/* Notifications Outer Card Container */}
                <div className="overflow-hidden rounded-2xl border border-[#D9DDE8] bg-white divide-y divide-[#EAEFF5] shadow-2xs">
                  {filteredNotifications.map((notif, index) => {
                    const isRead = notif.read || notif.isRead;
                    const typeCfg = getTypeConfig(notif);
                    const TypeIcon = typeCfg.icon;

                    const details = getNotificationDetails(notif, ordersMap);

                    const notificationItem =
                      notificationData[notif.payload?.eventName] ||
                      notificationData[notif.subject] ||
                      notificationData.default;

                    const orderId = notif.payload?.orderId;
                    const rawViewUrl = notif.payload?.viewUrl || "";

                    const actionPath = orderId
                      ? notificationItem.actionPath === "/orders/:orderId/track"
                        ? getOpaqueOrderPath(orderId, { track: true })
                        : notificationItem.actionPath === "/orders" ||
                            rawViewUrl.startsWith("/orders/")
                          ? getOpaqueOrderPath(orderId)
                          : notificationItem.actionPath
                      : notificationItem.actionPath;

                    const displayMessage =
                      details.message || notificationItem.message || "";
                    const actionText =
                      typeCfg.actionText || notificationItem.action || "View";

                    return (
                      <article
                        key={notif._id || notif.id || index}
                        className="flex items-start gap-4 py-4 px-5 sm:px-6 hover:bg-[#FAFBFD] transition-colors"
                      >
                        {/* Type Icon + Unread Indicator */}
                        <div className="relative shrink-0 mt-0.5">
                          <div
                            className={`flex h-11 w-11 items-center justify-center rounded-full ${typeCfg.iconBg}`}
                          >
                            <TypeIcon size={19} />
                          </div>
                          {!isRead && (
                            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#1597D4] ring-2 ring-white" />
                          )}
                        </div>

                        {/* Content Area */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              {/* Title */}
                              <h3 className="text-[15px] sm:text-[16px] font-bold text-[#2E2E2E] leading-tight">
                                {notif.title || notif.subject || "Notification"}
                              </h3>

                              {/* Message */}
                              <p className="mt-1 text-[13px] sm:text-[14px] text-[#4E4E4E] leading-snug break-words">
                                {displayMessage}
                              </p>

                              {/* Compact Metadata Line with Product Name retained */}
                              {(details.orderDisplayId ||
                                details.productName ||
                                details.itemCount ||
                                details.amount) && (
                                <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[13px] text-[#6E6E6E] font-medium">
                                  {details.productName && (
                                    <span
                                      className="text-[#1B1D60] font-semibold truncate max-w-[260px] sm:max-w-[420px]"
                                      title={details.productName}
                                    >
                                      {details.productName}
                                    </span>
                                  )}
                                  {(details.orderDisplayId ||
                                    details.productName) &&
                                    details.itemCount && (
                                      <span className="text-[#C0C4D0]">•</span>
                                    )}
                                  {details.itemCount && (
                                    <span>
                                      {details.itemCount}{" "}
                                      {details.itemCount === 1
                                        ? "Item"
                                        : "Items"}
                                    </span>
                                  )}
                                  {(details.orderDisplayId ||
                                    details.productName ||
                                    details.itemCount) &&
                                    details.amount && (
                                      <span className="text-[#C0C4D0]">•</span>
                                    )}
                                  {details.amount && (
                                    <span className="text-[#0D652D] font-bold">
                                      {details.amount}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Desktop Timestamp + Action Button */}
                            <div className="hidden sm:flex items-center gap-3.5 shrink-0 self-center">
                              <span className="text-[13px] text-[#6E6E6E] font-medium whitespace-nowrap">
                                {formatNotificationDate(notif.createdAt)}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleNavigate(actionPath)}
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[13px] font-semibold text-[#1B1D60] border border-[#D9DDE8] rounded-full hover:bg-[#F3F3F7] hover:border-[#B0B8C8] transition-all shadow-2xs"
                              >
                                <span>{actionText}</span>
                                <ChevronRight size={14} strokeWidth={2.5} />
                              </button>
                            </div>
                          </div>

                          {/* Mobile Action & Time */}
                          <div className="mt-2.5 flex sm:hidden items-center justify-between gap-2 border-t border-[#EAEFF5] pt-2">
                            <span className="text-[12px] text-[#6E6E6E] font-medium">
                              {formatNotificationDate(notif.createdAt)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleNavigate(actionPath)}
                              className="inline-flex items-center gap-1 px-3.5 py-1 text-[12px] font-semibold text-[#1B1D60] border border-[#D9DDE8] rounded-full hover:bg-[#F3F3F7]"
                            >
                              <span>{actionText}</span>
                              <ChevronRight size={12} strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* Load More / Show Less */}
                {totalPages > 1 && (
                  <div className="flex justify-center py-5">
                    <button
                      type="button"
                      onClick={
                        page >= totalPages ? handleShowLess : handleLoadMore
                      }
                      disabled={notifState.loading}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#D9DDE8] bg-white px-5 py-2 text-[13px] font-semibold text-[#1B1D60] shadow-2xs transition hover:bg-[#F3F3F7] disabled:opacity-50"
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
