import React from "react";
import { formatRelativeTime, getTypeConfig } from "../utils/notificationUtils";

export function NotificationCard({ notif, onClick }) {
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
      className={`overflow-hidden cursor-pointer group relative flex items-start gap-3.5 p-4 sm:px-5 rounded-lg border transition-all duration-200 shadow-sm hover:shadow-md ${
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
              {count ? (
                <span className="text-[11px] font-semibold text-[#3E4093] bg-[#F3F4F9] border border-[#EAEFF5] px-2 py-0.5 rounded-full">
                  {count} {count === 1 ? "Product" : "Products"}
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
}
