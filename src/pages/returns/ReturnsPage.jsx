import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Package, RotateCcw } from "lucide-react";
import ApiState from "../../components/common/ApiState";
import Seo from "../../components/common/Seo";
import Button from "../../components/ui/Button";
import { useToastThunk } from "../../hooks/useToastThunk";
import { requestReturn, fetchMyReturns } from "../../features/returns/returnsSlice";
import { fetchOrderById } from "../../features/order/orderSlice";
import { returnSchema } from "../../validations/validationSchemas";


const RETURN_REASONS = [
  { value: "defective", label: "Defective / damaged" },
  { value: "not_as_described", label: "Not as described" },
  { value: "changed_mind", label: "Changed my mind" },
  { value: "other", label: "Other reason" },
];

const STATUS_BADGE = {
  requested: "bg-amber-100 text-amber-700",
  approved: "bg-blue-100 text-blue-700",
  refunded: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

const getOrderItems = (order) => {
  const items = order?.items || order?.orderItems || order?.order_items || order?.lineItems || order?.line_items;
  return Array.isArray(items) ? items : [];
};
const getItemProductId = (item) =>
  item?.product_id || (typeof item?.productId === "object" ? item.productId?._id : item?.productId) || "";
const getItemTitle = (item) =>
  item?.product_title || item?.productTitle || item?.title || item?.name ||
  (typeof item?.productId === "object" ? (item.productId?.title || item.productId?.name) : null) || "Product";
const getItemUnitPrice = (item) =>
  item?.unit_price ?? item?.unitPrice ?? item?.sale_price ?? item?.salePrice ?? item?.price ?? 0;
const getItemImage = (item) => {
  const images = item?.images || (typeof item?.productId === "object" ? item.productId?.images : null);
  return Array.isArray(images) ? images[0] : images || null;
};

function ReturnRequestPage({ orderId }) {
  const dispatch = useDispatch();
  const run = useToastThunk();
  const { loading } = useSelector((s) => s.returns);
  const { current: order, loading: orderLoading } = useSelector((s) => s.order);
  const [selectedProductId, setSelectedProductId] = useState(null);

  useEffect(() => {
    if (orderId) dispatch(fetchOrderById({ orderId }));
  }, [dispatch, orderId]);

  const orderItems = getOrderItems(order);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(returnSchema),
    defaultValues: { productId: "", reason: "defective", quantity: 1 },
  });

  const watchedProductId = watch("productId");
  const selectedItem = orderItems.find((item) => getItemProductId(item) === watchedProductId) || null;

  const handleItemSelect = (item) => {
    const pid = getItemProductId(item);
    setSelectedProductId(pid);
    setValue("productId", pid, { shouldValidate: true });
    setValue("quantity", 1, { shouldValidate: true });
  };

  const submit = async (values) => {
    const item = orderItems.find((i) => getItemProductId(i) === values.productId);
    const unitPrice = item ? getItemUnitPrice(item) : 0;
    await run(
      dispatch,
      requestReturn({
        orderId,
        items: [{ productId: values.productId, quantity: Number(values.quantity), unitPrice }],
        reason: values.reason,
        description: values.description,
      }),
      "Return request submitted",
    );
  };

  return (
    <>
      <Seo title="Request Return | Sam Global" />
      <div className="w-container max-w-xl py-8 sm:py-10">
        <Link to="/orders" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-all duration-300 ease-in-out">
          <ArrowLeft size={14} /> Back to orders
        </Link>

        <div className="rounded-[12px] border border-border bg-white p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-ink">Request a return</h1>
            <p className="mt-1 text-sm text-muted">Select the item you want to return from this order.</p>
          </div>

          {orderLoading && !order ? (
            <div className="flex items-center justify-center py-10 text-sm text-muted">Loading order…</div>
          ) : !orderItems.length ? (
            <div className="rounded-[10px] border border-dashed border-border-strong bg-cream p-8 text-center text-sm text-muted">
              No items found for this order.
            </div>
          ) : (
            <form className="grid gap-5" onSubmit={handleSubmit(submit)} noValidate>
              {/* Hidden productId field */}
              <input type="hidden" {...register("productId")} />

              {/* Item selector */}
              <div className="grid gap-1.5">
                <span className="text-sm font-medium text-ink">Select item to return</span>
                <div className="grid gap-2">
                  {orderItems.map((item) => {
                    const pid = getItemProductId(item);
                    const title = getItemTitle(item);
                    const img = getItemImage(item);
                    const price = getItemUnitPrice(item);
                    const isSelected = watchedProductId === pid;
                    return (
                      <button
                        key={pid || title}
                        type="button"
                        onClick={() => handleItemSelect(item)}
                        className={`flex items-center gap-3 rounded-[8px] border px-3 py-2.5 text-left transition-all duration-200 ${
                          isSelected
                            ? "border-gold bg-cream ring-2 ring-gold/20"
                            : "border-border bg-white hover:border-gold/40"
                        }`}
                      >
                        {img ? (
                          <img src={img} alt={title} className="h-10 w-10 flex-shrink-0 rounded-[6px] object-cover" />
                        ) : (
                          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[6px] bg-cream text-muted">
                            <Package size={18} />
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink">{title}</p>
                          {price > 0 && (
                            <p className="text-xs text-muted">₹{Number(price).toLocaleString("en-IN")}</p>
                          )}
                        </div>
                        <span className={`h-4 w-4 flex-shrink-0 rounded-full border-2 ${isSelected ? "border-gold bg-gold" : "border-border"}`} />
                      </button>
                    );
                  })}
                </div>
                {errors.productId && (
                  <span className="text-xs text-red-700">{errors.productId.message}</span>
                )}
              </div>

              {selectedItem && (
                <>
                  <div className="grid gap-1.5">
                    <label htmlFor="quantity" className="text-sm font-medium text-ink">Quantity</label>
                    <input
                      id="quantity"
                      type="number"
                      min="1"
                      max={selectedItem?.quantity || 99}
                      {...register("quantity", { valueAsNumber: true })}
                      className="min-h-11 rounded-[8px] border border-border-strong bg-white px-3 py-2.5 text-ink outline-none transition-all duration-300 ease-in-out focus:border-gold focus:ring-2 focus:ring-gold/20"
                    />
                    {errors.quantity && <span className="text-xs text-red-700">{errors.quantity.message}</span>}
                  </div>

                  <label className="grid gap-1.5 text-sm font-medium text-ink">
                    <span>Reason for return</span>
                    <select
                      {...register("reason")}
                      className="min-h-11 rounded-[8px] border border-border-strong bg-white px-3 py-2.5 text-ink outline-none transition-all duration-300 ease-in-out focus:border-gold focus:ring-2 focus:ring-gold/20"
                    >
                      {RETURN_REASONS.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                    {errors.reason && <span className="text-xs text-red-700">{errors.reason.message}</span>}
                  </label>

                  <label className="grid gap-1.5 text-sm font-medium text-ink">
                    <span>Description</span>
                    <textarea
                      {...register("description")}
                      rows={4}
                      placeholder="Describe the issue in detail…"
                      className="rounded-[8px] border border-border-strong bg-white px-3 py-2.5 text-ink outline-none transition-all duration-300 ease-in-out placeholder:text-stone-400 focus:border-gold focus:ring-2 focus:ring-gold/20 resize-none"
                    />
                    {errors.description && <span className="text-xs text-red-700">{errors.description.message}</span>}
                  </label>

                  <Button type="submit" loading={loading} className="w-full">
                    <RotateCcw size={16} /> Submit return request
                  </Button>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </>
  );
}

function ReturnsListPage() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.returns);
  const returns = Array.isArray(state.list) ? state.list : [];

  useEffect(() => {
    dispatch(fetchMyReturns());
  }, [dispatch]);

  return (
    <>
      <Seo title="My Returns | Sam Global" />
      <div className="w-container py-8 sm:py-10">
        <h1 className="mb-6 text-2xl font-bold text-ink sm:text-3xl">My Returns</h1>

        <ApiState
          loading={state.loading && !returns.length}
          error={state.error}
          empty={!returns.length}
          emptyTitle="No returns yet"
          emptyText="Your return requests will appear here."
        >
          <div className="grid gap-3">
            {returns.map((item) => {
              const id = item.id || item.returnId;
              const status = item.status || item.refundStatus;
              const cls = STATUS_BADGE[status] || "bg-cream text-muted";
              return (
                <div key={id} className="flex items-center justify-between gap-4 rounded-[12px] border border-border bg-white px-5 py-4">
                  <div>
                    <p className="font-mono text-sm font-medium text-ink">{id}</p>
                    <p className="text-xs text-muted">{item.reason?.replace(/_/g, " ")}</p>
                  </div>
                  <span className={`shrink-0 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${cls}`}>
                    {status?.replace(/_/g, " ")}
                  </span>
                </div>
              );
            })}
          </div>
        </ApiState>
      </div>
    </>
  );
}

export default function ReturnsPage({ request = false }) {
  const { orderId } = useParams();
  if (request) return <ReturnRequestPage orderId={orderId} />;
  return <ReturnsListPage />;
}
