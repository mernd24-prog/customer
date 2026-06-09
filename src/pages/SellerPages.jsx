import { Link, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
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
  const dispatch = useDispatch();
  const state = useFetch(fetchSellerWebStatus, undefined, (s) => s.seller);
  const status = state.current;
  return (
    <section>
      <Seo title="Seller status | Sam Global" />
      <h1>Seller status</h1>
      <ApiState
        loading={state.loading}
        error={state.error}
        empty={!status}
      >
        <div className="split">
          <div className="panel">
            <h2>{status?.profile?.displayName || status?.email}</h2>
            <p>
              Account: <strong>{status?.accountStatus}</strong>
            </p>
            <p>
              KYC:{" "}
              <strong>
                {status?.kyc?.status || status?.onboarding?.kycStatus}
              </strong>
            </p>
            <p>Mode: read-only status and tracking.</p>
          </div>
          <div className="panel">
            <h2>Onboarding checklist</h2>
            {Object.entries(status?.onboarding?.checklist || {}).map(
              ([key, done]) => (
                <div className="list-row" key={key}>
                  <span>{key.replace(/([A-Z])/g, " $1")}</span>
                  <strong>{done ? "Done" : "Pending"}</strong>
                </div>
              ),
            )}
            <h3>Next steps</h3>
            {(status?.onboarding?.nextSteps || []).map((step) => (
              <p key={step}>{step}</p>
            ))}
          </div>
        </div>
        <div className="state-box">
          Seller actions are available only in the dedicated seller admin panel.
          This web app intentionally hides product, profile, bank, sub-admin,
          payout, order status, and e-way bill actions.
        </div>
      </ApiState>
    </section>
  );
}

export function SellerTrackingPage() {
  const dispatch = useDispatch();
  const state = useFetch(
    fetchSellerWebTracking,
    { limit: 20, offset: 0 },
    (s) => s.seller,
  );
  const orders = state.current?.orders || state.list || [];
  return (
    <section>
      <Seo title="Seller tracking | Sam Global" />
      <h1>Seller tracking</h1>
      <ApiState
        loading={state.loading}
        error={state.error}
        empty={!orders.length}
      >
        <div className="panel">
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
  const dispatch = useDispatch();
  const state = useFetch(
    fetchSellerWebTrackingOrder,
    { orderId },
    (s) => s.seller,
  );
  const order = state.current;
  return (
    <section>
      <Seo title={`Seller order ${orderId}`} />
      <h1>Tracking detail</h1>
      <ApiState
        loading={state.loading}
        error={state.error}
        empty={!order}
      >
        <div className="panel">
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
