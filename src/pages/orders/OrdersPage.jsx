import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Package, RefreshCw, RotateCcw, XCircle } from "lucide-react";
import ApiState from "../../components/common/ApiState";
import Seo from "../../components/common/Seo";
import Button from "../../components/ui/Button";
import StatusTimeline from "../../components/common/StatusTimeline";
import { useToastThunk } from "../../hooks/useToastThunk";
import { fetchMyOrders, fetchOrderById, cancelOrder } from "../../features/order/orderSlice";
import { formatMoney } from "../../utils/ecommerce";

const STATUS_BADGE = {
  pending_payment: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  packed: "bg-indigo-100 text-indigo-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-emerald-100 text-emerald-700",
  fulfilled: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

function OrderStatusBadge({ status }) {
  const cls = STATUS_BADGE[status] || "bg-[#FAF6EE] text-[#787878]";
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${cls}`}>
      {(status || "unknown").replace(/_/g, " ")}
    </span>
  );
}

// ─── Order Detail ──────────────────────────────────────────────────────────────

function OrderDetail({ orderId, track }) {
  const dispatch = useDispatch();
  const run = useToastThunk();
  const state = useSelector((s) => s.order);
  const order = state.current;

  useEffect(() => {
    dispatch(fetchOrderById({ orderId }));
  }, [dispatch, orderId]);

  return (
    <>
      <Seo title={`Order ${orderId} | Sam Global`} />
      <div className="w-container py-8 sm:py-10">
        <Link to="/orders" className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#787878] hover:text-[#2E2E2E] transition">
          <ArrowLeft size={14} /> Back to orders
        </Link>

        <ApiState
          loading={state.loading && !order}
          error={state.error}
          empty={!order}
          onRetry={() => dispatch(fetchOrderById({ orderId }))}
        >
          <div className="rounded-[12px] border border-[#e7dfd1] bg-white">
            {/* Header */}
            <div className="border-b border-[#e7dfd1] px-6 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-[#787878]">Order ID</p>
                  <p className="font-mono text-sm font-medium text-[#2E2E2E]">{orderId}</p>
                </div>
                <OrderStatusBadge status={order?.status || order?.orderStatus} />
              </div>
            </div>

            {/* Timeline */}
            {track && (
              <div className="border-b border-[#e7dfd1] px-6 py-5">
                <h2 className="mb-4 text-sm font-semibold text-[#2E2E2E]">Order tracking</h2>
                <StatusTimeline status={order?.status || order?.orderStatus} />
              </div>
            )}

            {/* Items */}
            {(order?.items || []).length > 0 && (
              <div className="border-b border-[#e7dfd1] px-6 py-5">
                <h2 className="mb-3 text-sm font-semibold text-[#2E2E2E]">Items</h2>
                <div className="grid gap-3">
                  {(order.items || []).map((item, i) => (
                    <div key={item.productId || i} className="flex items-center justify-between gap-4 rounded-[8px] border border-[#e7dfd1] bg-[#FAF6EE] px-4 py-3">
                      <div className="text-sm">
                        <p className="font-medium text-[#2E2E2E]">{item.title || "Product"}</p>
                        <p className="text-[#787878]">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-[#2E2E2E]">
                        {formatMoney((item.unitPrice || item.price || 0) * item.quantity, order?.currency || "INR")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amounts */}
            {order?.amounts && (
              <div className="border-b border-[#e7dfd1] px-6 py-5">
                <h2 className="mb-3 text-sm font-semibold text-[#2E2E2E]">Payment</h2>
                <div className="grid gap-2 text-sm">
                  {order.amounts.subtotal !== undefined && (
                    <div className="flex justify-between text-[#787878]">
                      <span>Subtotal</span>
                      <span>{formatMoney(order.amounts.subtotal, order.currency)}</span>
                    </div>
                  )}
                  {order.amounts.discount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount</span>
                      <span>−{formatMoney(order.amounts.discount, order.currency)}</span>
                    </div>
                  )}
                  {order.amounts.shippingFee !== undefined && (
                    <div className="flex justify-between text-[#787878]">
                      <span>Shipping</span>
                      <span>{formatMoney(order.amounts.shippingFee, order.currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-[#e7dfd1] pt-2 font-semibold text-[#2E2E2E]">
                    <span>Total</span>
                    <span>{formatMoney(order.amounts.payableAmount || order.totalAmount, order.currency || "INR")}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 px-6 py-4">
              {!["delivered", "fulfilled", "cancelled"].includes(order?.status) && (
                <Button
                  variant="secondary"
                  onClick={() =>
                    run(dispatch, cancelOrder({ orderId, reason: "Requested by customer" }), "Order cancelled")
                  }
                >
                  <XCircle size={15} /> Cancel order
                </Button>
              )}
              {["delivered", "fulfilled"].includes(order?.status) && (
                <Link to={`/returns/request/${orderId}`}>
                  <Button variant="secondary">
                    <RotateCcw size={15} /> Request return
                  </Button>
                </Link>
              )}
              <Link to={`/orders/${orderId}/track`}>
                <Button variant="secondary">
                  <Package size={15} /> Track order
                </Button>
              </Link>
            </div>
          </div>
        </ApiState>
      </div>
    </>
  );
}

// ─── Order List ────────────────────────────────────────────────────────────────

function OrderList() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.order);
  const orders = Array.isArray(state.list) ? state.list : state.current?.orders || [];

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  return (
    <>
      <Seo title="My Orders | Sam Global" />
      <div className="w-container py-8 sm:py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-montserrat text-2xl font-bold text-[#2E2E2E] sm:text-3xl">My Orders</h1>
        </div>

        <ApiState
          loading={state.loading && !orders.length}
          error={state.error}
          empty={!orders.length}
          emptyTitle="No orders yet"
          emptyText="Once you place an order, it will appear here."
          onRetry={() => dispatch(fetchMyOrders())}
        >
          <div className="grid gap-3">
            {orders.map((order) => {
              const id = order.id || order.orderId;
              return (
                <Link
                  key={id}
                  to={`/orders/${id}`}
                  className="flex items-center justify-between gap-4 rounded-[12px] border border-[#e7dfd1] bg-white px-5 py-4 hover:border-[#CE9F2D] transition"
                >
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm">
                      <Package size={14} className="shrink-0 text-[#A6A6A6]" />
                      <span className="font-mono text-[#787878] truncate">{id}</span>
                    </p>
                    <p className="mt-1 text-xs text-[#787878]">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <OrderStatusBadge status={order.status || order.orderStatus} />
                    <span className="text-sm font-semibold text-[#2E2E2E]">
                      {formatMoney(order.amounts?.payableAmount || order.totalAmount, order.currency || "INR")}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </ApiState>
      </div>
    </>
  );
}

export default function OrdersPage({ detail = false, track = false }) {
  const { orderId } = useParams();
  if (detail || track) return <OrderDetail orderId={orderId} track={track} />;
  return <OrderList />;
}
