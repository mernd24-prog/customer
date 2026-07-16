import { Clock3, ExternalLink, Package, Truck } from "lucide-react";

const STATUS_LABELS = { out_for_delivery: "Out For Delivery" };

const label = (value = "") =>
  STATUS_LABELS[value] || String(value || "Not available").replace(/_/g, " ");
const dateTime = (value) => value ? new Date(value).toLocaleString("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
}) : "";

export default function ShipmentTrackingPanel({
  shipments = [],
  orderDeliveryStatus = null,
}) {
  if (!shipments.length) {
    return (
      <section className="rounded-xl border border-[#CE9F2D66] bg-white p-5">
        <div className="flex items-center gap-3 text-[#1B1D60]"><Package size={22} /><h2 className="font-bold">Shipment tracking</h2></div>
        <p className="mt-3 text-sm text-[#6F7480]">The seller is preparing your order. Courier and tracking details will appear here after packing.</p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-[#1B1D60]">Shipment tracking</h2>
        <p className="mt-1 text-sm text-[#6F7480]">Each seller package may move separately.</p>
      </div>
      {shipments.map((shipment, index) => {
        const displayStatus = orderDeliveryStatus === "delivered"
          ? "delivered"
          : orderDeliveryStatus === "delivered" && shipment.status === "out_for_delivery"
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
          (left, right) => new Date(right.event_time || right.created_at || 0) - new Date(left.event_time || left.created_at || 0),
        );
        const trackingNumber = shipment.tracking_number || shipment.awb_number;

        return (
          <article key={shipment.id || trackingNumber || index} className="overflow-hidden rounded-xl border border-[#E7D9B8] bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FFF9EA] px-4 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#CE9F2D] text-white"><Package size={20} /></span>
                <div>
                  <h3 className="font-bold text-[#1B1D60]">Package {index + 1}</h3>
                  <p className="text-xs text-[#6F7480]">{shipment.seller?.displayName || shipment.seller?.businessName || "Marketplace seller"}</p>
                </div>
              </div>
              <span className="rounded-full bg-[#1B1D60] px-3 py-1 text-xs font-semibold text-white">{label(displayStatus)}</span>
            </div>

            <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-2">
              <div className="space-y-3 rounded-lg bg-[#F8F9FD] p-4 text-sm text-[#2E2E2E]">
                <div className="flex items-start gap-3"><Truck className="mt-0.5 shrink-0 text-[#3E4093]" size={18} /><div><strong>Courier</strong><p>{shipment.courier_name || "Seller delivery"}</p></div></div>
                <div className="flex items-start gap-3"><Package className="mt-0.5 shrink-0 text-[#3E4093]" size={18} /><div><strong>Tracking number</strong><p>{trackingNumber || "Will be added after dispatch"}</p></div></div>
                {shipment.tracking_url && <div className="flex items-start gap-3"><ExternalLink className="mt-0.5 shrink-0 text-[#3E4093]" size={18} /><div><strong>Courier tracking</strong><p><a className="text-[#3E4093] underline" href={shipment.tracking_url} target="_blank" rel="noreferrer">Track package</a></p></div></div>}
                {shipment.shipped_at && <div className="flex items-start gap-3"><Clock3 className="mt-0.5 shrink-0 text-[#3E4093]" size={18} /><div><strong>Shipped on</strong><p>{dateTime(shipment.shipped_at)}</p></div></div>}
                {shipment.expected_delivery_at && <div className="flex items-start gap-3"><Clock3 className="mt-0.5 shrink-0 text-[#3E4093]" size={18} /><div><strong>Expected delivery</strong><p>{dateTime(shipment.expected_delivery_at)}</p></div></div>}
              </div>

              <div className="rounded-lg border border-[#E7D9B8] p-4">
                <h4 className="font-semibold text-[#1B1D60]">Latest movement</h4>
                <div className="mt-3 space-y-3">
                  {(events.length ? events : [{ status: displayStatus, event_time: shipment.updated_at }]).map((event, eventIndex) => (
                    <div key={event.id || eventIndex} className="relative border-l-2 border-[#CE9F2D66] pl-4 last:border-transparent">
                      <span className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-[#CE9F2D]" />
                      <p className="text-sm font-semibold capitalize text-[#2E2E2E]">{label(event.status)}</p>
                      <p className="text-xs text-[#6F7480]">{[dateTime(event.event_time || event.created_at), event.location].filter(Boolean).join(" · ")}</p>
                      {event.note && <p className="mt-1 text-xs text-[#6F7480]">{event.note}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </article>
        );
      })}
    </section>
  );
}
