import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, RotateCcw } from "lucide-react";
import ApiState from "../../components/common/ApiState";
import Seo from "../../components/common/Seo";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import { useToastThunk } from "../../hooks/useToastThunk";
import { requestReturn, fetchMyReturns } from "../../features/returns/returnsSlice";

const returnSchema = z.object({
  productId: z.string().trim().min(1, "Product ID is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  unitPrice: z.coerce.number().min(0, "Unit price is required"),
  reason: z.enum(["defective", "not_as_described", "changed_mind", "other"]),
  description: z.string().trim().min(10, "Please provide at least 10 characters describing the issue"),
});

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
      <div className="mx-auto max-w-xl px-4 py-8 sm:py-12">
        <Link to="/orders" className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition">
          <ArrowLeft size={14} /> Back to orders
        </Link>

        <div className="rounded-lg border border-stone-200 bg-white p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-slate-950">Request a return</h1>
            <p className="mt-1 text-sm text-slate-500">Order: <span className="font-mono">{orderId}</span></p>
          </div>

          <form className="grid gap-5" onSubmit={handleSubmit(submit)} noValidate>
            <FormField
              id="productId"
              label="Product ID"
              registration={register("productId")}
              error={errors.productId}
              placeholder="Enter the product ID to return"
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

            <label className="grid gap-1.5 text-sm font-medium text-slate-800">
              <span>Reason for return</span>
              <select
                {...register("reason")}
                className="min-h-11 rounded-md border border-stone-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
              >
                {RETURN_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              {errors.reason && <span className="text-xs text-red-700">{errors.reason.message}</span>}
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-slate-800">
              <span>Description</span>
              <textarea
                {...register("description")}
                rows={4}
                placeholder="Describe the issue in detail…"
                className="rounded-md border border-stone-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition placeholder:text-stone-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10 resize-none"
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
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <h1 className="mb-6 text-2xl font-bold text-slate-950 sm:text-3xl">My Returns</h1>

        <ApiState
          loading={state.loading && !returns.length}
          error={state.error}
          empty={!returns.length}
          emptyTitle="No returns yet"
          emptyText="Your return requests will appear here."
          onRetry={() => dispatch(fetchMyReturns())}
        >
          <div className="grid gap-3">
            {returns.map((item) => {
              const id = item.id || item.returnId;
              const status = item.status || item.refundStatus;
              const cls = STATUS_BADGE[status] || "bg-stone-100 text-slate-700";
              return (
                <div key={id} className="flex items-center justify-between gap-4 rounded-lg border border-stone-200 bg-white px-5 py-4">
                  <div>
                    <p className="font-mono text-sm font-medium text-slate-900">{id}</p>
                    <p className="text-xs text-slate-500">{item.reason?.replace(/_/g, " ")}</p>
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
