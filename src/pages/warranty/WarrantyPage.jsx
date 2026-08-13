import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { ShieldCheck } from "lucide-react";

import Seo from "../../components/ui/Seo";
import ApiState from "../../components/ui/ApiState";
import BrandButton from "../../components/ui/buttons/Button";
import { useToastThunk } from "../../hooks/useToastThunk";
import {
  fetchWarrantyById,
  fetchOrderWarranties,
  registerWarranty,
  claimWarranty,
} from "../../features/warranty/warrantySlice";

export function WarrantyPage({ detail = false }) {
  const { warrantyId } = useParams();
  const dispatch = useDispatch();
  const state = useSelector((s) => s.warranty);
  const run = useToastThunk();
  const lookupForm = useForm();
  const registerForm = useForm();

  useEffect(() => {
    if (detail) dispatch(fetchWarrantyById({ warrantyId }));
  }, [detail, dispatch, warrantyId]);

  const warranty = state.current;
  const warranties = Array.isArray(state.list) ? state.list : [];

  return (
    <>
      <Seo
        title={
          detail ? "Warranty Details | Sam Global" : "My Warranties | Sam Global"
        }
      />
      <div className="w-container py-8">
        <h1 className="mb-6  text-2xl font-bold text-ink">
          {detail ? "Warranty Details" : "My Warranties"}
        </h1>

        {!detail && (
          <form
            className="mb-6 rounded-[12px] border border-border bg-white p-5"
            onSubmit={lookupForm.handleSubmit((v) => {
              dispatch(fetchOrderWarranties({ orderId: v.orderId }));
              lookupForm.reset();
            })}
          >
            <h2 className="mb-3  text-sm font-semibold text-ink">
              Look Up by Order Id
            </h2>
            <div className="flex gap-3">
              <input
                placeholder="Enter Order ID"
                {...lookupForm.register("orderId", { required: true })}
                className="flex-1 rounded-[8px] border border-border-strong px-3 py-2.5  text-sm outline-none focus:border-gold"
              />
              <BrandButton
                variant="secondary"
                rounded
                type="submit"
                label="Search"
                className="h-11 px-5 text-sm"
              />
            </div>
          </form>
        )}

        <ApiState
          loading={state.loading}
          error={state.error}
          empty={!warranty && !warranties.length && !state.loading}
          emptyTitle="No warranties found"
          emptyText="Your registered warranties will appear here."
        >
          {(warranty || warranties.length > 0) && (
            <div className="rounded-[12px] border border-border bg-white">
              {warranty && (
                <div className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-soft">
                      <ShieldCheck size={18} className="text-gold" />
                    </div>
                    <div>
                      <p className=" text-sm font-semibold text-ink">
                        {warranty.type || "Product Warranty"}
                      </p>
                      <p className=" text-xs text-gray">
                        Id: {warranty.id || warrantyId}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-2 text-sm">
                    {warranty.period && (
                      <div className="flex gap-2">
                        <span className="text-muted">Period:</span>
                        <span className="font-medium text-ink">
                          {warranty.period}
                        </span>
                      </div>
                    )}
                    {warranty.expiresAt && (
                      <div className="flex gap-2">
                        <span className="text-muted">Expires:</span>
                        <span className="font-medium text-ink">
                          {new Date(warranty.expiresAt).toLocaleDateString(
                            "en-IN",
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                  {detail && (
                    <div className="mt-5">
                      <BrandButton
                        variant="secondary"
                        rounded
                        label="File a Claim"
                        className="h-10 px-6 text-sm"
                        onClick={() =>
                          run(
                            dispatch,
                            claimWarranty({
                              warrantyId,
                              reason: "Issue reported",
                              description: "Customer warranty claim",
                            }),
                            "Claim submitted",
                          )
                        }
                      />
                    </div>
                  )}
                </div>
              )}
              {warranties.map((w, i) => (
                <div
                  key={w.id || i}
                  className="flex items-center justify-between border-t border-border px-5 py-4 first:border-t-0"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={16} className="text-gold" />
                    <div>
                      <p className=" text-sm font-medium text-ink">
                        {w.type || "Warranty"}
                      </p>
                      <p className=" text-xs text-gray">{w.period}</p>
                    </div>
                  </div>
                  <Link to={`/warranty/${w.id}`}>
                    <BrandButton
                      variant="secondary"
                      rounded
                      size="sm"
                      label="View"
                      className="h-8 px-3 text-xs"
                    />
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Register warranty form */}
          <form
            className="mt-6 rounded-[12px] border border-border bg-white p-5"
            onSubmit={registerForm.handleSubmit((v) =>
              run(
                dispatch,
                registerWarranty({
                  orderId: v.orderId,
                  productId: v.productId,
                  variantId: v.variantId || undefined,
                }),
                "Warranty registered",
              ),
            )}
          >
            <h2 className="mb-4  text-sm font-semibold text-ink">
              Register a Warranty
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <input
                placeholder="Order ID"
                {...registerForm.register("orderId", { required: true })}
                className="rounded-[8px] border border-border-strong px-3 py-2.5  text-sm outline-none focus:border-gold"
              />
              <input
                placeholder="Product ID"
                {...registerForm.register("productId", { required: true })}
                className="rounded-[8px] border border-border-strong px-3 py-2.5  text-sm outline-none focus:border-gold"
              />
              <input
                placeholder="Variant Id (Optional)"
                {...registerForm.register("variantId")}
                className="rounded-[8px] border border-border-strong px-3 py-2.5  text-sm outline-none focus:border-gold"
              />
            </div>
            <div className="mt-4">
              <BrandButton
                variant="primary"
                rounded
                type="submit"
                label="Register Warranty"
                className="h-10 px-6 text-sm"
              />
            </div>
          </form>
        </ApiState>
      </div>
    </>
  );
}
