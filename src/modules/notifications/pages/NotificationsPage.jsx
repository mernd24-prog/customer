import React from "react";

import Seo from "../../../components/ui/Seo";
import ApiState from "../../../components/ui/ApiState";
import Breadcrumbs from "../../../modules/common/components/Breadcrumbs";
import { PageContainer } from "../../../components/ui/layout";
import { SKELETON_PRESETS } from "../../../components/ui/skeleton/skeletonPresets";

import { useNotifications } from "../controllers/useNotifications";
import { NotificationCard } from "../components/NotificationCard";
import { NotificationFilterBar } from "../components/NotificationFilterBar";
import { LoadMoreButton } from "../../../components/ui/button";
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
          heading={null}
        />

        <div className="flex flex-col gap-5 sm:gap-6 lg:gap-7 lg:mt-4">
          <div className="min-w-0 rounded-lg bg-white ">
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
                    <LoadMoreButton
                      onClick={
                        page >= totalPages ? handleShowLess : handleLoadMore
                      }
                      loading={loading}
                      disabled={loading}
                      isExpanded={page >= totalPages}
                      label={page >= totalPages ? "Show Less" : "Load More"}
                    />
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
