import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchMyOrders } from "../slices/orderSlice";
import { ORDER_FILTERS } from "../../../data/orderPage";
import {
  getOrderCollection,
  getOrderId,
  getApiOrderId,
  formatOrderId,
  getOrderItems,
  getOrderStatus,
  resolveOrderItemDisplayStatus,
  getProductTitle,
  normalizeOrderSearchText,
} from "../../../utils/pages/orderUtils";

export function useOrderList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const state = useSelector((s) => s.order);
  const [activeFilter, setActiveFilter] = useState("");
  const [query, setQuery] = useState("");

  const allOrders = state.list.length
    ? state.list
    : getOrderCollection(state.current);

  const availableFilters = useMemo(() => {
    return ORDER_FILTERS;
  }, []);

  const orderItemsList = useMemo(() => {
    let term = query.trim().toLowerCase();
    const normalizedTerm = normalizeOrderSearchText(query);

    // Strip leading '#' if present since it's only a visual prefix
    if (term.startsWith("#")) {
      term = term.slice(1);
    }

    return allOrders.flatMap((order) => {
      const id = String(getOrderId(order) || "").toLowerCase();
      const apiOrderId = getApiOrderId(order);
      const orderNumber = String(apiOrderId || "").toLowerCase();
      const formattedId = String(
        formatOrderId(orderNumber || id),
      ).toLowerCase();
      const visibleOrderIdText = `order id #${apiOrderId}`.toLowerCase();
      const shipments = Array.isArray(order?.relations?.shipments)
        ? order.relations.shipments
        : [];

      return getOrderItems(order)
        .map((item) => {
          const itemStatus = resolveOrderItemDisplayStatus(
            item,
            getOrderStatus(order),
            shipments,
            [],
            order?.relations?.cancellations || order?.cancellations || [],
          );
          return { order, item, itemStatus };
        })
        .filter(({ order, item, itemStatus }) => {
          if (activeFilter) {
            const normalizedItemStatus = String(itemStatus || "").toLowerCase();
            const normalizedOrderStatus = String(
              getOrderStatus(order) || "",
            ).toLowerCase();

            if (activeFilter === "return_requested") {
              if (
                ![
                  "return_requested",
                  "return_approved",
                  "partially_returned",
                  "returned",
                  "refunded",
                ].includes(normalizedItemStatus)
              ) {
                return false;
              }
            } else if (
              normalizedItemStatus !== activeFilter &&
              normalizedOrderStatus !== activeFilter
            ) {
              return false;
            }
          }

          if (!term) return true;
          const itemText = getProductTitle(item).toLowerCase();
          const normalizedOrderText = normalizeOrderSearchText(
            [
              id,
              apiOrderId,
              formattedId,
              visibleOrderIdText,
              itemText,
              itemStatus,
            ].join(" "),
          );

          return (
            id.includes(term) ||
            orderNumber.includes(term) ||
            formattedId.includes(term) ||
            itemText.includes(term) ||
            visibleOrderIdText.includes(term) ||
            String(itemStatus || "")
              .toLowerCase()
              .includes(term) ||
            (Boolean(normalizedTerm) &&
              normalizedOrderText.includes(normalizedTerm))
          );
        });
    });
  }, [activeFilter, allOrders, query]);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  return {
    state,
    navigate,
    activeFilter,
    setActiveFilter,
    query,
    setQuery,
    availableFilters,
    orderItemsList,
  };
}
