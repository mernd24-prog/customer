import { Clock3, ExternalLink, Package, Truck } from "lucide-react";
import OrderDetailSectionCard from "./OrderDetailSectionCard";

const STATUS_LABELS = { out_for_delivery: "Out For Delivery" };

const label = (value = "") =>
  STATUS_LABELS[value] || String(value || "Not available").replace(/_/g, " ");
const dateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

export default function ShipmentTrackingPanel({
  shipments = [],
  orderDeliveryStatus = null,
}) {
  if (!shipments.length) {
    return (
      <section className="rounded-xl border border-[#CE9F2D66] bg-white p-5">
        <div className="flex items-center gap-3 text-[#1B1D60]">
          <Package size={22} />
          <h2 className="font-bold ">Shipment Tracking</h2>
        </div>
        <p className="mt-3 text-sm text-[#6F7480]">
          The seller is preparing your order. Courier and tracking details will
          appear here after packing.
        </p>
      </section>
    );
  }

  const sortedShipments = [...shipments].sort((a, b) => {
    const isReverseA = Boolean(
      a.return_id ||
      a.is_return ||
      a.type === "return" ||
      a.type === "reverse" ||
      (a.trackingEvents || []).some(
        (e) =>
          e.note?.toLowerCase()?.includes("reverse") ||
          e.note?.toLowerCase()?.includes("return") ||
          e.status?.toLowerCase()?.includes("reverse") ||
          e.status?.toLowerCase()?.includes("return")
      )
    );
    const isReverseB = Boolean(
      b.return_id ||
      b.is_return ||
      b.type === "return" ||
      b.type === "reverse" ||
      (b.trackingEvents || []).some(
        (e) =>
          e.note?.toLowerCase()?.includes("reverse") ||
          e.note?.toLowerCase()?.includes("return") ||
          e.status?.toLowerCase()?.includes("reverse") ||
          e.status?.toLowerCase()?.includes("return")
      )
    );
    if (isReverseA === isReverseB) return 0;
    return isReverseA ? 1 : -1;
  });

  return (
    <section className="space-y-4">
      <div>
        {/* <h2 className="text-xl font-bold text-[#1B1D60]">Shipment Tracking</h2>
        <p className="mt-1 text-sm text-[#6F7480]">
          Each Seller Package May Move Separately.
        </p> */}
      </div>
      {sortedShipments.map((shipment, index) => {
        const isReverse = Boolean(
          shipment.return_id ||
          shipment.is_return ||
          shipment.type === "return" ||
          shipment.type === "reverse" ||
          (shipment.trackingEvents || []).some(
            (e) =>
              e.note?.toLowerCase()?.includes("reverse") ||
              e.note?.toLowerCase()?.includes("return") ||
              e.status?.toLowerCase()?.includes("reverse") ||
              e.status?.toLowerCase()?.includes("return")
          )
        );

        const displayStatus =
          orderDeliveryStatus === "delivered"
            ? "delivered"
            : orderDeliveryStatus === "delivered" &&
                shipment.status === "out_for_delivery"
              ? "delivered"
              : shipment.status;
        const sourceEvents = [...(shipment.trackingEvents || [])];
        if (
          displayStatus === "delivered" &&
          !sourceEvents.some((event) => event.status === displayStatus)
        ) {
          sourceEvents.unshift({
            status: displayStatus,
            event_time: shipment.delivered_at || shipment.updated_at,
          });
        }
        const events = sourceEvents.sort(
          (left, right) =>
            new Date(left.event_time || left.created_at || 0) -
            new Date(right.event_time || right.created_at || 0),
        );
        const trackingNumber = shipment.tracking_number || shipment.awb_number;

        return (
          <div
            key={shipment.id || trackingNumber || index}
            className="grid gap-6 lg:grid-cols-2"
          >
            {/* Shipment Information */}
            <OrderDetailSectionCard
              title={isReverse ? "Return Pickup Information" : "Shipment Information"}

              headerClassName="!min-h-[60px] !py-4"
              titleClassName="text-lg font-bold"
              bodyClassName="p-5"
            >
              <div className="space-y-5 text-sm text-[#2E2E2E]">
                <div className="flex items-start gap-3">
                  <Truck className="mt-0.5 shrink-0 text-[#3E4093]" size={18} />
                  <div>
                    <p className="font-semibold">Courier</p>
                    <p>{shipment.courier_name || "Seller Delivery"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Package
                    className="mt-0.5 shrink-0 text-[#3E4093]"
                    size={18}
                  />
                  <div>
                    <p className="font-semibold">Tracking Number</p>
                    <p>{trackingNumber || "Will be added after dispatch"}</p>
                  </div>
                </div>

                {shipment.tracking_url && (
                  <div className="flex items-start gap-3">
                    <ExternalLink
                      className="mt-0.5 shrink-0 text-[#3E4093]"
                      size={18}
                    />
                    <div>
                      <p className="font-semibold">Courier Tracking</p>
                      <a
                        href={shipment.tracking_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#3E4093] underline"
                      >
                        Track Package
                      </a>
                    </div>
                  </div>
                )}

                {shipment.shipped_at && (
                  <div className="flex items-start gap-3">
                    <Clock3
                      className="mt-0.5 shrink-0 text-[#3E4093]"
                      size={18}
                    />
                    <div>
                      <p className="font-semibold">Shipped On</p>
                      <p>{dateTime(shipment.shipped_at)}</p>
                    </div>
                  </div>
                )}

                {shipment.expected_delivery_at && (
                  <div className="flex items-start gap-3">
                    <Clock3
                      className="mt-0.5 shrink-0 text-[#3E4093]"
                      size={18}
                    />
                    <div>
                      <p className="font-semibold">Expected Delivery</p>
                      <p>{dateTime(shipment.expected_delivery_at)}</p>
                    </div>
                  </div>
                )}
              </div>
            </OrderDetailSectionCard>

            {/* Tracking Timeline */}
            <OrderDetailSectionCard
              title={isReverse ? "Return Timeline" : "Tracking Timeline"}
              headerClassName="!min-h-[60px] !py-4"
              titleClassName="text-lg font-bold"
              bodyClassName="p-5"
            >
              <div>
                {(events.length
                  ? events
                  : [
                      {
                        status: displayStatus,
                        event_time: shipment.updated_at,
                      },
                    ]
                ).map((event, eventIndex, arr) => (
                  <div
                    key={event.id || eventIndex}
                    className="relative pb-5 pl-5 last:pb-0"
                  >
                    {eventIndex !== arr.length - 1 && (
                      <span className="absolute -left-[1px] top-[10px] h-full w-[2px] bg-[#CE9F2D66]" />
                    )}
                    <span className="absolute -left-[6px] top-1 h-3 w-3 rounded-full bg-[#CE9F2D]" />

                    <p className="text-sm font-semibold capitalize text-[#2E2E2E] ">
                      {label(event.status)}
                    </p>

                    <p className="mt-1 text-xs text-[#6F7480]">
                      {[
                        dateTime(event.event_time || event.created_at),
                        event.location,
                      ]
                        .filter(Boolean)
                        .join(" • ")}
                    </p>

                    {event.note && (
                      <p className="mt-1 text-xs text-[#6F7480]">
                        {event.note.replace(/_/g, " ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </OrderDetailSectionCard>
          </div>
        );
      })}
    </section>
  );
}
