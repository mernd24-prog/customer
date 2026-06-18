import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Download, FileText, Package, RotateCcw } from "lucide-react";
import ApiState from "../../components/common/ApiState";
import Seo from "../../components/common/Seo";
import Button from "../../components/ui/Button";
import { useToastThunk } from "../../hooks/useToastThunk";
import {
  requestReturn,
  fetchMyReturns,
} from "../../features/returns/returnsSlice";
import { fetchOrderById } from "../../features/order/orderSlice";
import { returnSchema } from "../../validations/validationSchemas";
import { downloadAuthDocument } from "../../utils/downloadAuthDocument";
import { endpoints } from "../../api/endpoints";

const RETURN_REASONS = [
  { value: "defective", label: "Defective / damaged" },
  { value: "damaged_in_transit", label: "Damaged in transit" },
  { value: "wrong_item", label: "Wrong item received" },
  { value: "missing_parts", label: "Parts or accessories missing" },
  { value: "size_issue", label: "Size or fit issue" },
  { value: "quality_issue", label: "Quality issue" },
  { value: "not_as_described", label: "Not as described" },
  { value: "changed_mind", label: "Changed my mind" },
  { value: "other", label: "Other reason" },
];

const STATUS_BADGE = {
  requested: "bg-amber-100 text-amber-700",
  approved: "bg-blue-100 text-blue-700",
  reverse_pickup_scheduled: "bg-blue-100 text-blue-700",
  in_reverse_transit: "bg-blue-100 text-blue-700",
  received: "bg-violet-100 text-violet-700",
  qc_passed: "bg-violet-100 text-violet-700",
  qc_completed: "bg-violet-100 text-violet-700",
  refund_pending: "bg-amber-100 text-amber-700",
  refund_failed: "bg-red-100 text-red-700",
  partially_refunded: "bg-sky-100 text-sky-700",
  refunded: "bg-emerald-100 text-emerald-700",
  replacement_pending: "bg-amber-100 text-amber-700",
  replaced: "bg-emerald-100 text-emerald-700",
  closed: "bg-gray-100 text-gray-700",
  rejected: "bg-red-100 text-red-700",
};

const getOrderItems = (order) => {
  const items =
    order?.items ||
    order?.orderItems ||
    order?.order_items ||
    order?.lineItems ||
    order?.line_items;
  return Array.isArray(items) ? items : [];
};
const getItemProductId = (item) =>
  item?.product_id ||
  (typeof item?.productId === "object"
    ? item.productId?._id
    : item?.productId) ||
  "";
const getItemTitle = (item) =>
  item?.product_title ||
  item?.productTitle ||
  item?.title ||
  item?.name ||
  (typeof item?.productId === "object"
    ? item.productId?.title || item.productId?.name
    : null) ||
  "Product";
const getItemUnitPrice = (item) =>
  item?.unit_price ??
  item?.unitPrice ??
  item?.sale_price ??
  item?.salePrice ??
  item?.price ??
  0;
const getItemImage = (item) => {
  const images =
    item?.images ||
    (typeof item?.productId === "object" ? item.productId?.images : null);
  return Array.isArray(images) ? images[0] : images || null;
};
const getItemVariantSku = (item) => item?.variant_sku || item?.variantSku || "";
const getItemId = (item) => item?.id || item?._id || item?.orderItemId || "";

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
  const selectedItem =
    orderItems.find((item) => getItemId(item) === selectedProductId) || null;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(returnSchema),
    defaultValues: { productId: "", reason: "defective", quantity: 1 },
  });

  const watchedQty = watch("quantity");
  const estimatedRefund = selectedItem
    ? Number(getItemUnitPrice(selectedItem) || 0) * Math.max(1, Number(watchedQty) || 1)
    : 0;

  const handleItemSelect = (item) => {
    const pid = getItemProductId(item);
    setSelectedProductId(
      getItemId(item) || `${pid}:${getItemVariantSku(item)}`,
    );
    setValue("productId", pid, { shouldValidate: true });
    setValue("quantity", 1, { shouldValidate: true });
  };

  const submit = async (values) => {
    const item =
      selectedItem ||
      orderItems.find((i) => getItemProductId(i) === values.productId);
    const unitPrice = item ? getItemUnitPrice(item) : 0;
    await run(
      dispatch,
      requestReturn({
        orderId,
        items: [
          {
            orderItemId: getItemId(item),
            productId: values.productId,
            variantSku: getItemVariantSku(item),
            quantity: Number(values.quantity),
            unitPrice,
          },
        ],
        reason: values.reason,
        resolution: "refund",
        description: values.description,
      }),
      "Return request submitted",
    );
  };

  return (
    <>
      <Seo title="Request Return | Sam Global" />
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 ">
        <Link
          to="/orders"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-all duration-300 ease-in-out"
        >
          <ArrowLeft size={14} /> Back to orders
        </Link>

        <div className="overflow-hidden rounded-xl  border border-border bg-white p-4 sm:p-6 lg:p-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-ink">Request a return</h1>
            <p className="mt-1 text-sm text-muted">
              Select the item you want to return from this order.
            </p>
          </div>

          {orderLoading && !order ? (
            <div className="flex items-center justify-center py-10 text-sm text-muted">
              Loading order…
            </div>
          ) : !orderItems.length ? (
            <div className="rounded-[10px] border border-dashed border-border-strong bg-cream p-8 text-center text-sm text-muted">
              No items found for this order.
            </div>
          ) : (
            <form
              className="grid gap-5"
              onSubmit={handleSubmit(submit)}
              noValidate
            >
              {/* Hidden productId field */}
              <input type="hidden" {...register("productId")} />

              {/* Item selector */}
              <div className="grid gap-1.5">
                <span className="text-sm font-medium text-ink">
                  Select item to return
                </span>
                <div className="grid gap-3">
                  {orderItems.map((item) => {
                    const pid = getItemProductId(item);
                    const title = getItemTitle(item);
                    const img = getItemImage(item);
                    const price = getItemUnitPrice(item);
                    const lineKey =
                      getItemId(item) || `${pid}:${getItemVariantSku(item)}`;
                    const isSelected = selectedProductId === lineKey;
                    return (
                      <button
                        key={lineKey || title}
                        type="button"
                        onClick={() => handleItemSelect(item)}
                        className={`flex w-full min-w-0 items-center gap-3 rounded-lg border p-3 text-left transition-all duration-200 ${
                          isSelected
                            ? "border-gold bg-cream outline-none"
                            : "border-border bg-white hover:border-gold/40"
                        }`}
                      >
                        {img ? (
                          <img
                            src={img}
                            alt={title}
                            className="h-12 w-12 flex-shrink-0 rounded-md object-cover"
                          />
                        ) : (
                          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-cream text-muted">
                            <Package size={18} />
                          </span>
                        )}

                        <div className="min-w-0 flex-1 overflow-hidden">
                          <p
                            className="break-words text-sm font-medium text-ink sm:text-base"
                            title={title}
                          >
                            {title}
                          </p>

                          {price > 0 && (
                            <p className="mt-1 text-xs text-muted sm:text-sm">
                              ₹{Number(price).toLocaleString("en-IN")}
                            </p>
                          )}
                        </div>

                        <span
                          className={`h-4 w-4 flex-shrink-0 rounded-full border-2 ${
                            isSelected ? "border-gold bg-gold" : "border-border"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                {errors.productId && (
                  <span className="text-xs text-red-700">
                    {errors.productId.message}
                  </span>
                )}
              </div>

              {selectedItem && (
                <>
                  <div className="grid gap-1.5 ">
                    <label
                      htmlFor="quantity"
                      className="text-sm font-medium text-ink"
                    >
                      Quantity
                    </label>
                    <input
                      id="quantity"
                      type="number"
                      min="1"
                      max={selectedItem?.quantity || 99}
                      {...register("quantity", { valueAsNumber: true })}
                      className="min-h-11 rounded-[8px] border border-border-strong bg-white px-3 py-2.5 text-ink outline-none transition-all duration-300 ease-in-out  focus:outline-none"
                    />
                    {errors.quantity && (
                      <span className="text-xs text-red-700">
                        {errors.quantity.message}
                      </span>
                    )}
                  </div>

                  <label className="grid gap-1.5 text-sm font-medium text-ink">
                    <span>Reason for return</span>
                    <select
                      {...register("reason")}
                      className="min-h-11 rounded-[8px] border border-border-strong bg-white px-3 py-2.5 text-ink outline-none transition-all duration-300 ease-in-out focus:outline-none"
                    >
                      {RETURN_REASONS.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                    {errors.reason && (
                      <span className="text-xs text-red-700">
                        {errors.reason.message}
                      </span>
                    )}
                  </label>

                  <label className="grid gap-1.5 text-sm font-medium text-ink">
                    <span>Description</span>
                    <textarea
                      {...register("description")}
                      rows={4}
                      placeholder="Describe the issue in detail…"
                      className="rounded-[8px] border border-border-strong bg-white px-3 py-2.5 text-ink outline-none transition-all duration-300 ease-in-out placeholder:text-stone-400 focus:outline-none resize-none"
                    />
                    {errors.description && (
                      <span className="text-xs text-red-700">
                        {errors.description.message}
                      </span>
                    )}
                  </label>

                  {estimatedRefund > 0 && (
                    <div className="rounded-[8px] border border-emerald-200 bg-emerald-50 px-4 py-3">
                      <p className="text-xs font-semibold text-emerald-700">Estimated refund</p>
                      <p className="mt-1 text-lg font-bold text-emerald-700">
                        ₹{estimatedRefund.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="mt-0.5 text-xs text-emerald-600">
                        Final refund amount is subject to review and QC.
                      </p>
                    </div>
                  )}

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
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    dispatch(fetchMyReturns());
  }, [dispatch]);

  const handleDownload = async (apiPath, filename) => {
    setDownloadingId(apiPath);
    try {
      await downloadAuthDocument(apiPath, filename);
    } catch {
      // silent
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <>
      <Seo title="My Returns | Sam Global" />
      <div className="w-container py-8 sm:py-10">
        <h1 className="mb-6 text-2xl font-bold text-ink sm:text-3xl">
          My Returns
        </h1>

        <ApiState
          loading={state.loading && !returns.length}
          error={state.error}
          empty={!returns.length}
          emptyTitle="No returns yet"
          emptyText="Your return requests will appear here."
        >
          <div className="grid gap-3">
            {returns.map((item) => {
              const id = item._id || item.id || item.returnId;
              const status = item.status || item.refundStatus;
              const cls = STATUS_BADGE[status] || "bg-cream text-muted";
              const trackingNumber =
                item.reverseShipment?.trackingNumber ||
                item.reverseShipment?.tracking_number ||
                item.reverse_shipment?.tracking_number ||
                null;
              const refundAmount = item.refund?.amount ?? item.refundAmount ?? item.refund_amount ?? null;
              const refundStatus = item.refund?.status ?? item.refundStatus ?? null;
              const creditNoteId = item.creditNoteId || item.credit_note_id || item.refund?.creditNoteId;
              const cnPath = creditNoteId ? endpoints.tax.creditNoteDownload(creditNoteId) : null;

              return (
                <div
                  key={id}
                  className="rounded-[12px] border border-border bg-white px-5 py-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">
                        Return #{String(id || "").slice(0, 8).toUpperCase()}
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-muted">{id}</p>
                      <p className="mt-1 text-xs capitalize text-muted">
                        {item.reason?.replace(/_/g, " ")}
                      </p>
                      {trackingNumber && (
                        <p className="mt-1 text-xs text-muted">
                          Pickup tracking: {trackingNumber}
                        </p>
                      )}
                      {refundAmount !== null && (
                        <p className="mt-1 text-xs font-medium text-emerald-700">
                          Refund: ₹{Number(refundAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          {refundStatus && ` · ${String(refundStatus).replace(/_/g, " ")}`}
                        </p>
                      )}
                    </div>
                    <span
                      className={`shrink-0 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${cls}`}
                    >
                      {status?.replace(/_/g, " ")}
                    </span>
                  </div>
                  {cnPath && (
                    <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
                      <FileText size={13} className="text-muted" />
                      <span className="flex-1 text-xs text-muted">Credit note available</span>
                      <Button
                        variant="secondary"
                        size="sm"
                        loading={downloadingId === cnPath}
                        onClick={() => handleDownload(cnPath, `credit-note-${String(id).slice(0, 8)}.pdf`)}
                      >
                        <Download size={12} /> Download
                      </Button>
                    </div>
                  )}
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
