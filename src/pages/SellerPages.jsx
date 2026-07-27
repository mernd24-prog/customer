import { Link, useParams } from "react-router-dom";
import ApiState from "../components/common/ApiState";
import Seo from "../components/common/Seo";
import StatusTimeline from "../components/common/display/StatusTimeline";
import {
  fetchSellerWebStatus,
  fetchSellerWebTracking,
  fetchSellerWebTrackingOrder,
} from "../features/seller/sellerSlice";
import { useFetchThunk as useFetch } from "../hooks/useFetchThunk";
export { useFetch };
import { formatMoney } from "../utils/ecommerce";

export function SellerStatusPage() {
  const state = useFetch(fetchSellerWebStatus, undefined, (s) => s.seller);
  const status = state.current;
  return (
    <section>
      <Seo title="Seller Status ||| Sam Global" />
      <h1>Seller Status</h1>
      <ApiState
        loading={state.loading}
        error={state.error}
        empty={!status}
      >
        <div className="split">
          <div className="border border-[#e4ddcf] rounded-xl bg-[#ffffff] p-10">
            <h2>{status?.profile?.displayName || status?.email}</h2>
            <p>
              Account: <strong>{status?.accountStatus}</strong>
            </p>
            <p>
              Kyc:{" "}
              <strong>
                {status?.kyc?.status || status?.onboarding?.kycStatus}
              </strong>
            </p>
            <p>Mode: Read-only Status and Tracking.</p>
          </div>
          <div className="border border-[#e4ddcf] rounded-xl bg-[#ffffff] p-10">
            <h2>Onboarding Checklist</h2>
            {Object.entries(status?.onboarding?.checklist || {}).map(
              ([key, done]) => (
                <div className="list-row" key={key}>
                  <span>{key.replace(/([A-Z])/g, " $1")}</span>
                  <strong>{done ? "Done" : "Pending"}</strong>
                </div>
              ),
            )}
            <h3>Next Steps</h3>
            {(status?.onboarding?.nextSteps || []).map((step) => (
              <p key={step}>{step}</p>
            ))}
          </div>
        </div>
        <div className="state-box">
          Seller actions are available only in the dedicated seller admin border border-[#e4ddcf] rounded-xl bg-[#ffffff] p-10.
          This web app intentionally hides product, profile, bank, sub-admin,
          payout and order status actions.
        </div>
      </ApiState>
    </section>
  );
}

export function SellerTrackingPage() {
  const state = useFetch(
    fetchSellerWebTracking,
    { limit: 20, offset: 0 },
    (s) => s.seller,
  );
  const orders = state.current?.orders || state.list || [];
  return (
    <section>
      <Seo title="Seller Tracking ||| Sam Global" />
      <h1>Seller Tracking</h1>
      <ApiState
        loading={state.loading}
        error={state.error}
        empty={!orders.length}
      >
        <div className="border border-[#e4ddcf] rounded-xl bg-[#ffffff] p-10">
          <h2>Summary</h2>
          <pre className="json">
            {JSON.stringify(state.current?.summary || {}, null, 2)}
          </pre>
        </div>
        <div className="list">
          {orders.map((order) => (
            <Link
              className="list-row"
              key={order.orderId}
              to={`/seller/tracking/${order.orderId}`}
            >
              <span>{order.orderId}</span>
              <strong>{order.orderStatus}</strong>
              <span>{order.delivery?.status}</span>
            </Link>
          ))}
        </div>
      </ApiState>
    </section>
  );
}

export function SellerTrackingDetailPage() {
  const { orderId } = useParams();
  const state = useFetch(
    fetchSellerWebTrackingOrder,
    { orderId },
    (s) => s.seller,
  );
  const order = state.current;
  return (
    <section>
      <Seo title={`Seller order ${orderId}`} />
      <h1>Tracking Detail</h1>
      <ApiState
        loading={state.loading}
        error={state.error}
        empty={!order}
      >
        <div className="border border-[#e4ddcf] rounded-xl bg-[#ffffff] p-10">
          <h2>{order?.orderId || orderId}</h2>
          <StatusTimeline status={order?.orderStatus} />
          <p>
            {formatMoney(
              order?.amounts?.sellerOrderTotal || order?.amounts?.payableAmount,
              order?.currency,
            )}
          </p>
          <pre className="json">
            {JSON.stringify(order?.delivery || {}, null, 2)}
          </pre>
        </div>
      </ApiState>
    </section>
  );
}
