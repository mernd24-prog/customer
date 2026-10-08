import React from "react";
import { ChevronDown } from "lucide-react";

import Seo from "../../../components/ui/Seo";
import ApiState from "../../../components/ui/ApiState";
import Breadcrumbs from "../../../modules/common/components/Breadcrumbs";
import { PageContainer } from "../../../components/ui/layout";
import { SKELETON_PRESETS } from "../../../components/ui/skeleton/skeletonPresets";

import { useNotifications } from "../controllers/useNotifications";
import { NotificationCard } from "../components/NotificationCard";
import { NotificationFilterBar } from "../components/NotificationFilterBar";

const BREADCRUMB_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Notifications", href: "/notifications" },
];

export function NotificationsPage() {
  const {
    notifications,
    filteredNotifications,
    loading,
    error,
    page,
    totalPages,
    pageSize,
    setPageSize,
    activeFilter,
    setActiveFilter,
    query,
    setQuery,
    filterOptions,
    handleLoadMore,
    handleShowLess,
    handleNotificationClick,
  } = useNotifications({ defaultPageSize: 6 });

  return (
    <>
      <Seo title="Notifications | Sam Global" />
      <PageContainer>
        <Breadcrumbs
          items={BREADCRUMB_ITEMS}
          className="mb-2 flex flex-wrap items-center gap-[10px] sm:gap-[12px] lg:gap-[15px]"
          heading={null}
        />

        <div className="flex flex-col gap-5 sm:gap-6 lg:gap-7 lg:mt-4">
          <div className="min-w-0 rounded-xl bg-white">
            <NotificationFilterBar
              query={query}
              setQuery={setQuery}
              pageSize={pageSize}
              setPageSize={setPageSize}
              filterOptions={filterOptions}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
            />

            <ApiState
              loading={loading && !notifications.length}
              error={error}
              empty={!filteredNotifications.length && !loading}
              emptyTitle="No notifications"
              emptyText={
                query || activeFilter !== "all"
                  ? "Try adjusting your search or filters."
                  : "You're all caught up! Notifications will appear here."
              }
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
                      disabled={loading}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#D9DDE8] bg-white px-5 py-2 text-[13px] font-semibold text-[#1B1D60] shadow-sm transition hover:bg-[#F3F3F7] disabled:opacity-50"
                    >
                      {loading
                        ? "Loading..."
                        : page >= totalPages
                          ? "Show Less"
                          : "Load More"}
                      {!loading && (
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
          </div>
        </div>
      </PageContainer>
    </>
  );
}

export default NotificationsPage;
