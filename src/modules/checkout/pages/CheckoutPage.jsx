
import { useCallback } from "react";
import { MapPin, Plus } from "lucide-react";
import useCheckout from "../controllers/useCheckout";
import AppErrorBoundary from "../../../components/ui/AppErrorBoundary";
import { getPaymentProviderLabel } from "../utils/checkoutUtils";
import Seo from "../../../components/ui/Seo";
import ApiState from "../../../components/ui/ApiState";
import Breadcrumbs from "../../common/components/Breadcrumbs";
import OrderDetailLayout, {
  OrderDetailAside,
} from "../../orders/components/OrderDetailLayout";
import AddressSelection from "../components/AddressSelection";
import DiscountsSection from "../components/DiscountsSection";
import CheckoutSummary from "../components/CheckoutSummary";
import AddressEditModal from "../../common/components/address/AddressEditModal";
import GuestOtpAuthModal from "../../../components/ui/overlay/GuestOtpAuthModal";
import Loader from "../../../components/ui/Loader";
import { CHECKOUT_PAGE_SKELETON } from "../../../components/ui/skeleton/layouts";
import { PageContainer } from "../../../components/ui/layout";

export default function CheckoutPage() {
  const {
    navigate,
    currentUser,
    showGuestOtpModal,
    setShowGuestOtpModal,
    cartState,
    quoteError,
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
    excludeBlockedItem,
    isBuyNowCheckout,
    isCouponDebouncing,
    watchedWalletAmount,
    watchedCouponCode,
    quoteShippingAddress,
  } = useCheckout();

  const handleCloseGuestOtp = useCallback(() => {
    setShowGuestOtpModal(false);
    if (!currentUser) navigate("/cart");
  }, [setShowGuestOtpModal, currentUser, navigate]);

  const handleSuccessGuestOtp = useCallback(() => {
    setShowGuestOtpModal(false);
  }, [setShowGuestOtpModal]);

  const handleCloseNewAddress = useCallback(() => {
    setValue("useNewAddress", false);
  }, [setValue]);

  const isAddressAvailable = Boolean(
    !useNewAddress &&
      addresses.length > 0 &&
      selectedAddressId &&
      quoteShippingAddress
  );

  return (
    <AppErrorBoundary>
      {(checkoutActionLoading || isPostPaymentProcessing) && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--customer-cream)]">
          <Loader size="xl" />
        </div>
      )}

      <GuestOtpAuthModal
        open={showGuestOtpModal}
        onClose={handleCloseGuestOtp}
        onSuccess={handleSuccessGuestOtp}
      />

      <Seo title="Checkout | Sam Global" />

      <ApiState
        loading={cartState.loading}
        error={cartState.error}
        empty={items.length === 0}
        skeletonLayout={CHECKOUT_PAGE_SKELETON}
        skeletonContainerClass="bg-transparent"
        emptyTitle="Your Cart is Empty"
        emptyText="Add products to your cart before checking out."
      >
        <PageContainer className="mt-0 mb-0" contentClassName="min-w-0">
          <form
            onSubmit={handleSubmit(submit, handleInvalidCheckout)}
            noValidate
          >
            {errors.root?.message && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errors.root.message}
              </div>
            )}

            {deliverabilityBlockers.length > 0 && (
              <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4">
                <p className="font-semibold text-amber-900">
                  This product is no longer available. Please remove it from
                  your cart and try again later.
                </p>

                <div className="mt-3 space-y-2">
                  {deliverabilityBlockers.map((blocker) => (
                    <div
                      key={blocker.lineKey || blocker.productId}
                      className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-white px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-800">
                          {blocker.title}
                        </p>
                        <p className="text-xs text-gray-600">
                          {blocker.reason}
                        </p>
                      </div>

                      {!isBuyNowCheckout && (
                        <button
                          type="button"
                          onClick={() => excludeBlockedItem(blocker)}
                          className="shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          Exclude item
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
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
              <div className="flex min-w-0 flex-col">
                <Breadcrumbs
                
                  items={[
                    { label: "Home", href: "/" },
                    { label: "Cart", href: "/cart" },
                    { label: "Checkout" },
                  ]}
                  heading="Checkout"
                  rightContent={null}
                />

                <div className=" flex flex-col gap-4 sm:gap-5 lg:gap-6">
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

                  {addresses.length === 0 && !useNewAddress && (
                    <div className="rounded-xl border border-dashed border-[#D9B86D] bg-[#FFFDF8] px-4 py-8 text-center sm:px-6">
                      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-[#F5E9C9] text-[#1B1D60] sm:size-14">
                        <MapPin size={22} />
                      </div>

                      <h3 className="text-base font-bold leading-6 text-[#1B1D60] sm:text-[1.05rem]">
                        No addresses saved yet
                      </h3>

                      <p className="mt-2 text-sm leading-5 text-[#64708A]">
                        Please add address to continue.
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          setValue("useNewAddress", true, {
                            shouldValidate: true,
                          })
                        }
                        className="mt-5 inline-flex h-11 w-full max-w-[200px] items-center justify-center gap-2 rounded-lg border border-[#C69D2A] bg-[#C69D2A] px-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-[#b98a1f]"
                      >
                        <Plus size={24} />
                        Add Address
                      </button>
                    </div>
                  )}

                  {useNewAddress && (
                    <AddressEditModal
                      isOpen={true}
                      onClose={handleCloseNewAddress}
                      onSave={handleSaveShippingAddressOnly}
                      form={{
                        register,
                        setValue,
                        
                        formState: { errors },
                      }}
                      idPrefix="shipping"
                      loading={checkoutActionLoading}
                      countries={countries}
                      states={states}
                      cities={cities}
                      postalCodes={postalCodes}
                      dialCodes={checkoutDialCodes}
                      selectedCountry={selectedCountry}
                      selectedState={selectedState}
                      selectedCity={selectedCity}
                      selectedPostalCode={watchedPostalCode}
                      addressLabels={addressLabels}
                      title="Shipping Address"
                      submitLabel="Save Address"
                      icon={MapPin}
                    />
                  )}

                  <DiscountsSection
                    register={register}
                    errors={errors}
                    walletBalance={walletBalance}
                    setValue={setValue}
                    watchedWalletAmount={watchedWalletAmount}
                    watchedCouponCode={watchedCouponCode}
                    quoteLoading={quoteLoading}
                    isCouponDebouncing={isCouponDebouncing}
                  />
                </div>
              </div>

              <OrderDetailAside>
                <div className="lg:mt-12">
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
                    disabled={
                      Boolean(quoteError) ||
                      deliverabilityBlockers.length > 0 ||
                      !isAddressAvailable
                    }
                  />
                </div>
              </OrderDetailAside>
            </OrderDetailLayout>
          </form>
        </PageContainer>
      </ApiState>
    </AppErrorBoundary>
  );
}
