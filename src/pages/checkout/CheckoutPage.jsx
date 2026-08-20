import useCheckout from "./hooks/useCheckout";
import { getPaymentProviderLabel } from "../../utils/pages/checkoutUtils";
import Seo from "../../components/ui/Seo";
import ApiState from "../../components/ui/ApiState";
import Breadcrumbs from "../../components/ecommerce/Breadcrumbs";
import OrderDetailLayout, {
  OrderDetailAside,
} from "../orders/components/OrderDetailLayout";
import ShippingAddressForm from "./components/ShippingAddressForm";
import AddressSelection from "./components/AddressSelection";
import DiscountsSection from "./components/DiscountsSection";
import CheckoutSummary from "./components/CheckoutSummary";
import BaseModal from "../../components/ui/overlay/BaseModal";
import GuestOtpAuthModal from "../../components/ui/overlay/GuestOtpAuthModal";
import Loader from "../../components/ui/Loader";
import { CHECKOUT_PAGE_SKELETON } from "../../components/ui/skeleton/layouts";
import { WarningIcon, CloseIcon } from "../../components/ui/icons";

export default function CheckoutPage() {
  const {
    navigate,
    currentUser,
    showGuestOtpModal,
    setShowGuestOtpModal,
    cartState,
    quoteError,
    isQuoteErrorDismissed,
    setIsQuoteErrorDismissed,
    isPostPaymentProcessing,
    items,
    subtotal,
    shipping,
    total,
    paymentProvider,
    setPaymentProvider,
    paymentOptions,
    addresses,
    addressLabels,
    walletBalance,
    countries,
    states,
    cities,
    postalCodes,
    newAddressFormRef,
    register,
    handleSubmit,
    setValue,
    errors,
    useNewAddress,
    selectedAddressId,
    handleInvalidCheckout,
    handleAddNewAddress,
    checkoutActionLoading,
    handleSaveShippingAddressOnly,
    submit,
    quoteData,
    quoteLoading,
    checkoutDialCodes,
    selectedCountry,
    selectedState,
    selectedCity,
    watchedPostalCode,
    deliverabilityBlockers,
    deliveryCheckLoading,
    excludeBlockedItem,
    isBuyNowCheckout,
  } = useCheckout();

  return (
    <>
      {isPostPaymentProcessing && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--customer-cream)]">
          <Loader size="xl" />
        </div>
      )}
      <GuestOtpAuthModal
        open={showGuestOtpModal}
        onClose={() => {
          setShowGuestOtpModal(false);
          if (!currentUser) {
            navigate("/cart");
          }
        }}
        onSuccess={() => setShowGuestOtpModal(false)}
      />
      <Seo title="Checkout | Sam Global" />

      <div className="mx-auto max-w-[850px] lg:max-w-none py-6 sm:py-8">
        <div className="mb-6 lg:mb-2">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Cart", href: "/cart" },
              { label: "Checkout" },
            ]}
            heading="Checkout"
            rightContent={null}
          />
        </div>
        <ApiState
          loading={cartState.loading}
          error={cartState.error}
          empty={items.length === 0}
          skeletonLayout={CHECKOUT_PAGE_SKELETON}
          skeletonContainerClass="bg-transparent"
          emptyTitle="Your Cart is Empty"
          emptyText="Add products to your cart before checking out."
        >
          <form
            onSubmit={handleSubmit(submit, handleInvalidCheckout)}
            noValidate
          >
            {errors.root?.message ? (
              <div className="mb-4 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errors.root.message}
              </div>
            ) : null}
            {deliverabilityBlockers.length > 0 && (
              <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4">
                <p className="font-semibold text-amber-900">Some items cannot be delivered to this address</p>
                <p className="mt-1 text-xs text-amber-700">Exclude them here and continue checkout without going back to your cart.</p>
                <div className="mt-3 space-y-2">
                  {deliverabilityBlockers.map((blocker) => (
                    <div key={blocker.lineKey || blocker.productId} className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-white px-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-800">{blocker.title}</p>
                        <p className="text-xs text-gray-600">{blocker.reason}</p>
                      </div>
                      {!isBuyNowCheckout && (
                        <button type="button" onClick={() => excludeBlockedItem(blocker)} className="shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">
                          Exclude item
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {deliveryCheckLoading && (
              <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-sm text-blue-700">Checking every item for this delivery address…</div>
            )}
            <input
              type="hidden"
              value={String(useNewAddress)}
              {...register("useNewAddress")}
            />
            <input
              type="hidden"
              value={selectedAddressId || ""}
              {...register("selectedAddressId")}
            />
            <OrderDetailLayout>
              {/* Left column: shipping + payment */}
              <div className="flex flex-col gap-6">
                {/* Saved addresses */}
                {addresses.length > 0 && (
                  <AddressSelection
                    addresses={addresses}
                    selectedAddressId={selectedAddressId}
                    useNewAddress={useNewAddress}
                    setValue={setValue}
                    errors={errors}
                    countries={countries}
                    onAddNewAddress={handleAddNewAddress}
                    quoteError={quoteError}
                  />
                )}

                {/* New address form */}
                {(useNewAddress || addresses.length === 0) &&
                  (addresses.length > 0 ? (
                    <BaseModal onClose={() => setValue("useNewAddress", false)}>
                      <div className="w-full bg-surface p-4 sm:p-5 rounded-[10px] max-h-[75vh] overflow-y-auto [scrollbar-color:#CE9F2D33_transparent] [scrollbar-width:thin]">
                        <ShippingAddressForm
                          register={register}
                          errors={errors}
                          checkoutDialCodes={checkoutDialCodes}
                          countries={countries}
                          selectedCountry={selectedCountry}
                          states={states}
                          selectedState={selectedState}
                          cities={cities}
                          selectedCity={selectedCity}
                          watchedPostalCode={watchedPostalCode}
                          setValue={setValue}
                          postalCodes={postalCodes}
                          showSavedAddressFields={true}
                          addressLabels={addressLabels}
                          loading={checkoutActionLoading}
                          onCancel={() => setValue("useNewAddress", false)}
                          onSave={handleSaveShippingAddressOnly}
                        />
                      </div>
                    </BaseModal>
                  ) : (
                    <div ref={newAddressFormRef} className="scroll-mt-24">
                      <ShippingAddressForm
                        register={register}
                        errors={errors}
                        checkoutDialCodes={checkoutDialCodes}
                        countries={countries}
                        selectedCountry={selectedCountry}
                        states={states}
                        selectedState={selectedState}
                        cities={cities}
                        selectedCity={selectedCity}
                        watchedPostalCode={watchedPostalCode}
                        setValue={setValue}
                        postalCodes={postalCodes}
                        showSavedAddressFields={true}
                        addressLabels={addressLabels}
                        loading={checkoutActionLoading}
                        onCancel={() => setValue("useNewAddress", false)}
                        onSave={handleSaveShippingAddressOnly}
                      />
                    </div>
                  ))}

                {/* Coupons & wallet */}
                <DiscountsSection
                  register={register}
                  errors={errors}
                  walletBalance={walletBalance}
                />
              </div>

              {/* Right column: order summary */}
              <OrderDetailAside>
                <CheckoutSummary
                  items={items}
                  subtotal={subtotal}
                  shipping={shipping}
                  total={total}
                  quote={quoteData}
                  quoteLoading={quoteLoading}
                  quoteError={quoteError}
                  loading={checkoutActionLoading}
                  paymentOptions={paymentOptions}
                  selectedPaymentProvider={paymentProvider}
                  onPaymentProviderChange={setPaymentProvider}
                  getPaymentProviderLabel={getPaymentProviderLabel}
                />
              </OrderDetailAside>
            </OrderDetailLayout>
          </form>
        </ApiState>
      </div>
    </>
  );
}
