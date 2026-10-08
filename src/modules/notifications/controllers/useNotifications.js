import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchNotifications,
  markAsRead,
} from "../slices/notificationSlice";
import {
  getTypeConfig,
  getNotificationFilterIcon,
} from "../utils/notificationUtils";
import { getOpaqueOrderPath } from "../../../utils/routeTokens";
import { orderService } from "../../orders/services/orderService";
import notificationData from "../../../data/notificationData";

export function useNotifications({ defaultPageSize = 6 } = {}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const notifState = useSelector((state) => state.notification);
  const notifications = Array.isArray(notifState.list) ? notifState.list : [];
  const meta = notifState.meta || {};
  const totalPages = meta.totalPages || 1;
  const loading = notifState.loading;
  const error = notifState.error;

  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [pageSize, setPageSize] = useState(defaultPageSize);

  useEffect(() => {
    setPage(1);
    dispatch(fetchNotifications({ params: { page: 1, limit: pageSize } }));
  }, [dispatch, pageSize]);

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

  const filterOptions = useMemo(
    () => [
      {
        label: `All (${counts.all})`,
        value: "all",
        icon: getNotificationFilterIcon("all"),
      },
      {
        label: `Unread (${counts.unread})`,
        value: "unread",
        icon: getNotificationFilterIcon("unread"),
      },
      {
        label: `Orders (${counts.orders})`,
        value: "orders",
        icon: getNotificationFilterIcon("orders"),
      },
      {
        label: `Shipments (${counts.shipments})`,
        value: "shipments",
        icon: getNotificationFilterIcon("shipments"),
      },
      {
        label: `Invoices (${counts.invoices})`,
        value: "invoices",
        icon: getNotificationFilterIcon("invoices"),
      },
      {
        label: `Offers (${counts.offers})`,
        value: "offers",
        icon: getNotificationFilterIcon("offers"),
      },
      {
        label: `Account (${counts.account})`,
        value: "account",
        icon: getNotificationFilterIcon("account"),
      },
    ],
    [counts],
  );

  const filteredNotifications = useMemo(() => {
    let result = notifications;

    if (activeFilter === "unread") {
      result = result.filter((n) => !n.read && !n.isRead);
    } else if (activeFilter !== "all") {
      result = result.filter((n) => getTypeConfig(n).type === activeFilter);
    }

    const search = query.trim().toLowerCase();

    if (search) {
      result = result.filter((n) => {
        const title = n.title || n.subject || "";
        const message = n.template || n.message || n.body || "";
        const type = getTypeConfig(n).type || "";

        return `${title} ${message} ${type}`.toLowerCase().includes(search);
      });
    }

    return result;
  }, [notifications, activeFilter, query]);

  const handleLoadMore = useCallback(() => {
    if (loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    dispatch(
      fetchNotifications({ params: { page: nextPage, limit: pageSize } }),
    );
  }, [dispatch, loading, page, pageSize]);

  const handleShowLess = useCallback(() => {
    if (loading) return;
    setPage(1);
    dispatch(fetchNotifications({ params: { page: 1, limit: pageSize } }));
  }, [dispatch, loading, pageSize]);

  const handleNotificationClick = useCallback(async (notif) => {
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
    }
  }, [dispatch, navigate]);

  return {
    notifications,
    filteredNotifications,
    loading,
    error,
    meta,
    page,
    totalPages,
    pageSize,
    setPageSize,
    activeFilter,
    setActiveFilter,
    query,
    setQuery,
    unreadCount,
    counts,
    filterOptions,
    handleLoadMore,
    handleShowLess,
    handleNotificationClick,
  };
}
