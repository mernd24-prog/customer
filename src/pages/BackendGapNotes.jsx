import Seo from "../components/common/Seo";

export function BackendGapNotes() {
  return (
    <>
      <Seo title="API Notes | Sam Global" />
      <div className="w-container py-8">
        <h1 className="mb-4  text-2xl font-bold text-ink">
          API Integration Notes
        </h1>
        <div className="rounded-[12px] border border-border bg-white p-6">
          <p className=" text-sm text-muted">
            Wishlist uses{" "}
            <code className="rounded bg-cream px-1.5 py-0.5 text-gold-dark">
              cart.wishlist
            </code>
            . Coupon validation flows through the order&apos;s{" "}
            <code className="rounded bg-cream px-1.5 py-0.5 text-gold-dark">
              couponCode
            </code>{" "}
            field. File uploads, invoice download, referral routes, product
            reviews, public autocomplete, product compare, live carrier
            tracking, and marketing banner APIs are backend-only features not
            yet exposed.
          </p>
        </div>
      </div>
    </>
  );
}
