import { configureStore } from "@reduxjs/toolkit";
import auth from "../modules/auth/slices/authSlice";
import search from "../features/search/searchSlice";
import user from "../features/user/userSlice";
import catalog from "../features/catalog/catalogSlice";
import product from "../modules/products/slices/productSlice";
import cart from "../modules/cart/slices/cartSlice";
import cartUi from "../modules/cart/slices/cartUiSlice";
import checkout from "../features/checkout/checkoutSlice";
import order from "../modules/orders/slices/orderSlice";
import payment from "../features/payment/paymentSlice";
import delivery from "../features/delivery/deliverySlice";
import returns from "../modules/returns/slices/returnsSlice";
import wallet from "../features/wallet/walletSlice";
import subscription from "../features/subscription/subscriptionSlice";
import notification from "../features/notification/notificationSlice";
import loyalty from "../features/loyalty/loyaltySlice";
import warranty from "../features/warranty/warrantySlice";
import recommendation from "../features/recommendation/recommendationSlice";
import analytics from "../features/analytics/analyticsSlice";
import cms from "../features/cms/cmsSlice";
import meta from "../features/meta/metaSlice";
import global from "../features/global/globalSlice";
import seller from "../features/seller/sellerSlice";
import sellerCommission from "../features/sellerCommission/sellerCommissionSlice";
import pricing from "../features/pricing/pricingSlice";
import dynamicPricing from "../features/dynamicPricing/dynamicPricingSlice";
import admin from "../features/admin/adminSlice";
import rbac from "../features/rbac/rbacSlice";
import tax from "../features/tax/taxSlice";
import fraud from "../features/fraud/fraudSlice";
import review from "../features/review/reviewSlice";
import relatedProducts from "../modules/products/slices/relatedProductsSlice";
import support from "../modules/support/slices/supportSlice";

export const store = configureStore({
  reducer: {
    auth,
    search,
    user,
    catalog,
    product,
    cart,
    cartUi,
    checkout,
    order,
    payment,
    delivery,
    returns,
    wallet,
    subscription,
    notification,
    loyalty,
    warranty,
    recommendation,
    analytics,
    cms,
    meta,
    global,
    seller,
    sellerCommission,
    pricing,
    dynamicPricing,
    admin,
    rbac,
    tax,
    fraud,
    review,
    relatedProducts,
    support,
  }
});
