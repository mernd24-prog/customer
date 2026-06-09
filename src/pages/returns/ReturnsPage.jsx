import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, RotateCcw } from "lucide-react";
import ApiState from "../../components/common/ApiState";
import Seo from "../../components/common/Seo";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import { useToastThunk } from "../../hooks/useToastThunk";
import { requestReturn, fetchMyReturns } from "../../features/returns/returnsSlice";
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

function ReturnRequestPage({ orderId }) {
  const dispatch = useDispatch();
  const run = useToastThunk();
  const { loading } = useSelector((s) => s.returns);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(returnSchema), defaultValues: { reason: "defective", quantity: 1 } });

  const submit = async (values) => {
    await run(
      dispatch,
      requestReturn({
        orderId,
        items: [{ productId: values.productId, quantity: values.quantity, unitPrice: values.unitPrice }],
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
            <p className="mt-1 text-sm text-muted">Order reference available in your order details.</p>
          </div>

          <form className="grid gap-5" onSubmit={handleSubmit(submit)} noValidate>
            <FormField
              id="productId"
              label="Product"
              registration={register("productId")}
              error={errors.productId}
              placeholder="Enter product name or code"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                id="quantity"
                label="Quantity"
                type="number"
                registration={register("quantity")}
                error={errors.quantity}
                min="1"
              />
              <FormField
                id="unitPrice"
                label="Unit price (₹)"
                type="number"
                registration={register("unitPrice")}
                error={errors.unitPrice}
                min="0"
                step="0.01"
              />
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
          </form>
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
