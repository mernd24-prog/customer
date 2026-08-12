import useCheckout from "./hooks/useCheckout";
import { getPaymentProviderLabel } from "./utils/checkoutUtils";
import Seo from "../../components/common/Seo";
import ApiState from "../../components/common/ApiState";
import Breadcrumbs from "../../components/ecommerce/Breadcrumbs";
import OrderDetailLayout, {
  OrderDetailAside,
} from "../orders/components/OrderDetailLayout";
import ShippingAddressForm from "./components/ShippingAddressForm";
import AddressSelection from "./components/AddressSelection";
import DiscountsSection from "./components/DiscountsSection";
import CheckoutSummary from "./components/CheckoutSummary";
import BaseModal from "../../components/common/overlay/BaseModal";
import GuestOtpAuthModal from "../../components/common/overlay/GuestOtpAuthModal";
import { CHECKOUT_PAGE_SKELETON } from "../../components/common/skeleton/layouts";
import { WarningIcon, CloseIcon } from "../../components/icons";

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
    watchedPostalCode
  } = useCheckout();

  return (
    <>
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
            rightContent={
              quoteError && !isQuoteErrorDismissed && (
                <div className="flex w-full sm:max-w-[500px] md:max-w-[600px] rounded-lg border border-red-200 border-l-4 border-l-red-500 bg-[#FFF8F8] px-3 py-2.5 text-sm leading-tight text-red-700 text-left lg:max-w-[700px] lg:ml-auto relative shadow-[0_2px_10px_rgba(255,0,0,0.05)]">
                  <div className="flex items-start gap-2.5 pr-6">
                    <div className="mt-0.5 shrink-0 rounded-full border border-red-200 bg-white p-0.5 text-red-500">
                      <WarningIcon size={16} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-[14px] text-[#D12E2E]">Delivery Unavailable</span>
                      <div className="font-medium text-[#4A4A4A] text-[12px] leading-snug">
                        {typeof quoteError === "string" && quoteError.trim() !== ""
                          ? quoteError
                          : "We're unable to deliver to the selected address. Please try another address or update your pincode."}
                      </div>
                    </div>
                  </div>
                  <button type="button" onClick={() => setIsQuoteErrorDismissed(true)} className="absolute right-2 top-2 p-1 text-red-400 hover:text-red-600 transition-colors">
                    <CloseIcon size={16} />
                  </button>
                </div>
              )
            }
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
