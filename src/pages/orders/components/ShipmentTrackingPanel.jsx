import { Clock3, Package, Phone, ShieldCheck, Truck } from "lucide-react";

const label = (value = "") => String(value || "Not available").replace(/_/g, " ");
const dateTime = (value) => value ? new Date(value).toLocaleString("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
}) : "";

const latestOtpForShipment = (notifications = [], shipment = {}) => {
  const now = Date.now();
  return notifications.find((notification) => {
    const eventName = notification.payload?.eventName;
    const sameShipment = String(notification.payload?.shipmentId || "") === String(shipment.id || "");
    const expiresAt = new Date(notification.payload?.expiresAt || 0).getTime();
    return eventName === "shipment.delivery_otp_generated.v1" && sameShipment && expiresAt > now;
  });
};

const otpFromNotification = (notification) =>
  String(notification?.template || notification?.message || "").match(/\b\d{6}\b/)?.[0] || "";

export default function ShipmentTrackingPanel({ shipments = [], notifications = [] }) {
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
        const events = [...(shipment.trackingEvents || [])].sort(
          (left, right) => new Date(right.event_time || right.created_at || 0) - new Date(left.event_time || left.created_at || 0),
        );
        const agent = shipment.delivery_agent_snapshot || {};
        const verification = shipment.verification || {};
        const otpNotification = latestOtpForShipment(notifications, shipment);
        const otp = otpFromNotification(otpNotification);
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
              <span className="rounded-full bg-[#1B1D60] px-3 py-1 text-xs font-semibold capitalize text-white">{label(shipment.status)}</span>
            </div>

            <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-2">
              <div className="space-y-3 rounded-lg bg-[#F8F9FD] p-4 text-sm text-[#2E2E2E]">
                <div className="flex items-start gap-3"><Truck className="mt-0.5 shrink-0 text-[#3E4093]" size={18} /><div><strong>Courier</strong><p>{shipment.courier_name || "Seller delivery"}</p></div></div>
                <div className="flex items-start gap-3"><Package className="mt-0.5 shrink-0 text-[#3E4093]" size={18} /><div><strong>Tracking number</strong><p>{trackingNumber || "Will be added after dispatch"}</p></div></div>
                {shipment.expected_delivery_at && <div className="flex items-start gap-3"><Clock3 className="mt-0.5 shrink-0 text-[#3E4093]" size={18} /><div><strong>Expected delivery</strong><p>{dateTime(shipment.expected_delivery_at)}</p></div></div>}
                {agent.name && <div className="flex items-start gap-3"><Phone className="mt-0.5 shrink-0 text-[#3E4093]" size={18} /><div><strong>Delivery agent</strong><p>{agent.name}{agent.phone ? ` · ${agent.phone}` : ""}</p>{agent.vehicleNumber && <p className="text-xs text-[#6F7480]">Vehicle {agent.vehicleNumber}</p>}</div></div>}
              </div>

              <div className="rounded-lg border border-[#E7D9B8] p-4">
                <h4 className="font-semibold text-[#1B1D60]">Latest movement</h4>
                <div className="mt-3 space-y-3">
                  {(events.length ? events : [{ status: shipment.status, event_time: shipment.updated_at }]).map((event, eventIndex) => (
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

            {verification.required && !verification.verifiedAt && (
              <div className="mx-4 mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 sm:mx-6 sm:mb-6">
                <div className="flex gap-3"><ShieldCheck className="shrink-0" size={20} /><div><strong>Delivery verification required</strong><p className="mt-1">The agent must confirm delivery using {verification.methods.map(label).join(" or ") || "delivery proof"}.</p></div></div>
                {otp && <div className="mt-3 rounded-lg bg-white p-3"><p className="text-xs font-medium text-[#6F7480]">Your delivery OTP</p><p className="mt-1 text-2xl font-bold tracking-[0.35em] text-[#1B1D60]">{otp}</p><p className="mt-1 text-xs text-red-600">Share this only after you receive and check the package. It expires {dateTime(verification.otpExpiresAt)}.</p></div>}
              </div>
            )}
            {verification.verifiedAt && <div className="mx-4 mb-4 flex gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 sm:mx-6 sm:mb-6"><ShieldCheck size={19} /> Delivery verified on {dateTime(verification.verifiedAt)}</div>}
          </article>
        );
      })}
    </section>
  );
}
