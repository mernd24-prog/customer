import { endpoints } from "../api/endpoints";
import { makeThunk } from "./createApiSlice";

const q = (arg) => arg?.params || arg;
const body = (arg) => arg?.data || arg;

export const authThunks = {
  registerUser: makeThunk("auth/registerUser", { method: "post", url: endpoints.auth.register, data: body }),
  registerUserWithOtp: makeThunk("auth/registerUserWithOtp", { method: "post", url: endpoints.auth.registerOtp, data: body }),
  verifyRegistration: makeThunk("auth/verifyRegistration", { method: "post", url: endpoints.auth.verifyRegistration, data: body }),
  loginUser: makeThunk("auth/loginUser", { method: "post", url: endpoints.auth.login, data: body }),
  socialLogin: makeThunk("auth/socialLogin", { method: "post", url: endpoints.auth.social, data: body }),
  refreshSession: makeThunk("auth/refreshSession", { method: "post", url: endpoints.auth.refresh, data: body }),
  sendOtp: makeThunk("auth/sendOtp", { method: "post", url: endpoints.auth.sendOtp, data: body }),
  verifyOtp: makeThunk("auth/verifyOtp", { method: "post", url: endpoints.auth.verifyOtp, data: body }),
  resendOtp: makeThunk("auth/resendOtp", { method: "post", url: endpoints.auth.resendOtp, data: body }),
  forgotPassword: makeThunk("auth/forgotPassword", { method: "post", url: endpoints.auth.forgotPassword, data: body }),
  resetPassword: makeThunk("auth/resetPassword", { method: "post", url: endpoints.auth.resetPassword, data: body }),
  changePassword: makeThunk("auth/changePassword", { method: "post", url: endpoints.auth.changePassword, data: body }),
  checkAuthStatus: makeThunk("auth/checkAuthStatus", { url: endpoints.auth.status })
};

export const userThunks = {
  fetchMe: makeThunk("user/fetchMe", { url: endpoints.users.me }),
  updateMe: makeThunk("user/updateMe", { method: "patch", url: endpoints.users.me, data: body }),
  addAddress: makeThunk("user/addAddress", { method: "post", url: endpoints.users.addresses, data: body }),
  updateAddress: makeThunk("user/updateAddress", { method: "patch", url: ({ addressId }) => endpoints.users.address(addressId), data: body }),
  deleteAddress: makeThunk("user/deleteAddress", { method: "delete", url: ({ addressId }) => endpoints.users.address(addressId) }),
  submitUserKyc: makeThunk("user/submitUserKyc", { method: "post", url: endpoints.users.kyc, data: body }),
  uploadKycDocuments: makeThunk("user/uploadKycDocuments", { method: "post", url: endpoints.users.kycDocuments, data: body })
};

export const catalogThunks = {
  fetchCategories: makeThunk("catalog/fetchCategories", { url: endpoints.platform.categories, params: (q) => ({ tree: true, active: true, ...q }), cache: true, cacheTtl: 300000 }),
  fetchCategoryByKey: makeThunk("catalog/fetchCategoryByKey", { url: ({ categoryKey }) => endpoints.platform.category(categoryKey) }),
  fetchCategoryAttributes: makeThunk("catalog/fetchCategoryAttributes", { url: ({ categoryKey }) => endpoints.platform.categoryAttributes(categoryKey) }),
  fetchFamilies: makeThunk("catalog/fetchFamilies", { url: endpoints.platform.families, params: q }),
  fetchFamilyByCode: makeThunk("catalog/fetchFamilyByCode", { url: ({ familyCode }) => endpoints.platform.family(familyCode) }),
  fetchVariants: makeThunk("catalog/fetchVariants", { url: endpoints.platform.variants, params: q }),
  fetchVariantById: makeThunk("catalog/fetchVariantById", { url: ({ variantId }) => endpoints.platform.variant(variantId) }),
  fetchHsnCodes: makeThunk("catalog/fetchHsnCodes", { url: endpoints.platform.hsnCodes, params: q }),
  fetchGeographies: makeThunk("catalog/fetchGeographies", { url: endpoints.platform.geographies, params: q }),
  fetchBrands: makeThunk("catalog/fetchBrands", { url: endpoints.platform.brands, params: q, cache: true, cacheTtl: 300000 }),
  fetchBrandById: makeThunk("catalog/fetchBrandById", { url: ({ brandId }) => endpoints.platform.brand(brandId) })
};

export const searchThunks = {
  searchCatalog: makeThunk("search/searchCatalog", { url: endpoints.search.main, params: q, cache: true, cacheTtl: 120000 }),
  searchAutocomplete: makeThunk("search/searchAutocomplete", { url: endpoints.search.autocomplete, params: q, cache: true, cacheTtl: 120000 })
};

export const productThunks = {
  fetchProducts: makeThunk("product/fetchProducts", { url: endpoints.products.list, params: q }),
  fetchSellerProducts: makeThunk("product/fetchSellerProducts", { url: endpoints.products.sellerMe, params: q }),
  fetchProductById: makeThunk("product/fetchProductById", { url: ({ productId }) => endpoints.products.detail(productId) }),
  createProduct: makeThunk("product/createProduct", { method: "post", url: endpoints.products.create, data: body }),
  updateProduct: makeThunk("product/updateProduct", { method: "patch", url: ({ productId }) => endpoints.products.detail(productId), data: body }),
  deleteProduct: makeThunk("product/deleteProduct", { method: "delete", url: ({ productId }) => endpoints.products.detail(productId) })
};

export const cartThunks = {
  fetchCart: makeThunk("cart/fetchCart", { url: endpoints.carts.me }),
  updateCart: makeThunk("cart/updateCart", { method: "put", url: endpoints.carts.me, data: body })
};

export const orderThunks = {
  quoteOrder: makeThunk("order/quoteOrder", { method: "post", url: endpoints.orders.quote, data: body }),
  createOrder: makeThunk("order/createOrder", { method: "post", url: endpoints.orders.create, data: body }),
  fetchMyOrders: makeThunk("order/fetchMyOrders", { url: endpoints.orders.me }),
  fetchSellerOrders: makeThunk("order/fetchSellerOrders", { url: endpoints.orders.sellerMe }),
  fetchOrderById: makeThunk("order/fetchOrderById", { url: ({ orderId }) => endpoints.orders.detail(orderId) }),
  cancelOrder: makeThunk("order/cancelOrder", { method: "post", url: ({ orderId }) => endpoints.orders.cancel(orderId), data: body }),
  updateOrderStatus: makeThunk("order/updateOrderStatus", { method: "patch", url: ({ orderId }) => endpoints.orders.status(orderId), data: body })
};

export const paymentThunks = {
  fetchPayments: makeThunk("payment/fetchPayments", { url: endpoints.payments.me }),
  fetchPaymentOptions: makeThunk("payment/fetchPaymentOptions", { url: endpoints.payments.options, params: q }),
  initiatePayment: makeThunk("payment/initiatePayment", { method: "post", url: endpoints.payments.initiate, data: body }),
  verifyPayment: makeThunk("payment/verifyPayment", { method: "post", url: endpoints.payments.verify, data: body })
};

export const deliveryThunks = {
  checkServiceability: makeThunk("delivery/checkServiceability", { url: endpoints.delivery.serviceability, params: q }),
  fetchEwayBillByOrder: makeThunk("delivery/fetchEwayBillByOrder", { url: ({ orderId }) => endpoints.delivery.ewayBillByOrder(orderId) }),
  createEwayBill: makeThunk("delivery/createEwayBill", { method: "post", url: ({ orderId }) => endpoints.delivery.ewayBillByOrder(orderId), data: body }),
  updateEwayBillStatus: makeThunk("delivery/updateEwayBillStatus", { method: "patch", url: ({ ewayBillId }) => endpoints.delivery.ewayBillStatus(ewayBillId), data: body })
};

export const returnsThunks = {
  requestReturn: makeThunk("returns/requestReturn", { method: "post", url: endpoints.returns.create, data: body }),
  fetchMyReturns: makeThunk("returns/fetchMyReturns", { url: endpoints.returns.mine }),
  fetchReturnByOrder: makeThunk("returns/fetchReturnByOrder", { url: ({ orderId }) => endpoints.returns.byOrder(orderId) })
};

export const cmsThunks = {
  fetchCmsPages: makeThunk("cms/fetchCmsPages", { url: endpoints.platform.cms, params: q }),
  fetchCmsPageBySlug: makeThunk("cms/fetchCmsPageBySlug", { url: ({ slug }) => endpoints.platform.cmsPage(slug) })
};

export const simpleThunks = {
  wallet: { fetchWallet: makeThunk("wallet/fetchWallet", { url: endpoints.wallets.me }) },
  meta: {
    fetchHealth: makeThunk("meta/fetchHealth", { url: endpoints.health }),
    fetchMetaRoutes: makeThunk("meta/fetchMetaRoutes", { url: endpoints.meta.routes })
  },
  dynamicPricing: {
    fetchDynamicPrice: makeThunk("dynamicPricing/fetchDynamicPrice", { url: endpoints.dynamicPricing.price, params: q }),
    adjustDynamicPrice: makeThunk("dynamicPricing/adjustDynamicPrice", { method: "post", url: endpoints.dynamicPricing.adjust, data: body })
  },
  analytics: {
    fetchAnalytics: makeThunk("analytics/fetchAnalytics", { url: endpoints.analytics.overview, params: q }),
    trackAnalyticsEvent: makeThunk("analytics/trackAnalyticsEvent", { method: "post", url: endpoints.analytics.events, data: body })
  }
};

export const globalThunks = {
  fetchCountries: makeThunk("global/fetchCountries", { url: endpoints.global.countries, params: q }),
  fetchStates: makeThunk("global/fetchStates", { url: endpoints.global.states, params: q }),
  fetchCities: makeThunk("global/fetchCities", { url: endpoints.global.cities, params: q }),
  fetchZipCodes: makeThunk("global/fetchZipCodes", { url: endpoints.global.zipCodes, params: q })
};

export const subscriptionThunks = {
  fetchSubscriptionPlans: makeThunk("subscription/fetchSubscriptionPlans", { url: endpoints.subscriptions.plans }),
  purchaseSubscription: makeThunk("subscription/purchaseSubscription", { method: "post", url: endpoints.subscriptions.purchase, data: body }),
  fetchMySubscriptions: makeThunk("subscription/fetchMySubscriptions", { url: endpoints.subscriptions.me }),
  pauseSubscription: makeThunk("subscription/pauseSubscription", { method: "put", url: ({ subscriptionId }) => endpoints.subscriptions.pause(subscriptionId) }),
  resumeSubscription: makeThunk("subscription/resumeSubscription", { method: "put", url: ({ subscriptionId }) => endpoints.subscriptions.resume(subscriptionId) }),
  cancelSubscription: makeThunk("subscription/cancelSubscription", { method: "put", url: ({ subscriptionId }) => endpoints.subscriptions.cancel(subscriptionId) }),
  createAdminSubscriptionPlan: makeThunk("subscription/createAdminSubscriptionPlan", { method: "post", url: endpoints.subscriptions.adminPlans, data: body }),
  fetchAdminSubscriptionPlans: makeThunk("subscription/fetchAdminSubscriptionPlans", { url: endpoints.subscriptions.adminPlans, params: q }),
  updateAdminSubscriptionPlan: makeThunk("subscription/updateAdminSubscriptionPlan", { method: "patch", url: ({ planId }) => endpoints.subscriptions.adminPlan(planId), data: body }),
  deleteAdminSubscriptionPlan: makeThunk("subscription/deleteAdminSubscriptionPlan", { method: "delete", url: ({ planId }) => endpoints.subscriptions.adminPlan(planId) })
};

export const notificationThunks = {
  fetchNotifications: makeThunk("notification/fetchNotifications", { url: endpoints.notifications.me }),
  createNotification: makeThunk("notification/createNotification", { method: "post", url: endpoints.notifications.create, data: body }),
  fetchNotificationPreferences: makeThunk("notification/fetchNotificationPreferences", { url: endpoints.notifications.preferences }),
  updateNotificationPreferences: makeThunk("notification/updateNotificationPreferences", { method: "put", url: endpoints.notifications.preferences, data: body })
};

export const loyaltyThunks = {
  fetchLoyaltyProfile: makeThunk("loyalty/fetchLoyaltyProfile", { url: endpoints.loyalty.profile }),
  fetchLoyaltyBenefits: makeThunk("loyalty/fetchLoyaltyBenefits", { url: endpoints.loyalty.benefits }),
  addLoyaltyPoints: makeThunk("loyalty/addLoyaltyPoints", { method: "post", url: endpoints.loyalty.points, data: body }),
  fetchLoyaltyHistory: makeThunk("loyalty/fetchLoyaltyHistory", { url: endpoints.loyalty.history, params: q }),
  redeemLoyaltyPoints: makeThunk("loyalty/redeemLoyaltyPoints", { method: "post", url: endpoints.loyalty.redeem, data: body })
};

export const warrantyThunks = {
  fetchProductWarranty: makeThunk("warranty/fetchProductWarranty", { url: ({ productId }) => endpoints.warranty.product(productId) }),
  registerWarranty: makeThunk("warranty/registerWarranty", { method: "post", url: endpoints.warranty.register, data: body }),
  fetchWarrantyById: makeThunk("warranty/fetchWarrantyById", { url: ({ warrantyId }) => endpoints.warranty.detail(warrantyId) }),
  fetchOrderWarranties: makeThunk("warranty/fetchOrderWarranties", { url: ({ orderId }) => endpoints.warranty.byOrder(orderId) }),
  fetchCustomerWarranties: makeThunk("warranty/fetchCustomerWarranties", { url: ({ customerId }) => endpoints.warranty.byCustomer(customerId) }),
  claimWarranty: makeThunk("warranty/claimWarranty", { method: "post", url: ({ warrantyId }) => endpoints.warranty.claims(warrantyId), data: body })
};

export const recommendationThunks = {
  fetchRecommendations: makeThunk("recommendation/fetchRecommendations", { url: endpoints.recommendations.list, params: q }),
  trackRecommendationInteraction: makeThunk("recommendation/trackRecommendationInteraction", { method: "post", url: ({ productId }) => endpoints.recommendations.interact(productId), data: body }),
  fetchTrendingProducts: makeThunk("recommendation/fetchTrendingProducts", { url: endpoints.recommendations.trending, params: q })
};

export const sellerThunks = {
  submitSellerKyc: makeThunk("seller/submitSellerKyc", { method: "post", url: endpoints.sellers.onboardingKyc, data: body }),
  updateSellerOnboardingProfile: makeThunk("seller/updateSellerOnboardingProfile", { method: "patch", url: endpoints.sellers.onboardingProfile, data: body }),
  fetchSellerWebStatus: makeThunk("seller/fetchSellerWebStatus", { url: endpoints.sellers.webStatus }),
  fetchSellerWebTracking: makeThunk("seller/fetchSellerWebTracking", { url: endpoints.sellers.webTracking, params: q }),
  fetchSellerWebTrackingOrder: makeThunk("seller/fetchSellerWebTrackingOrder", { url: ({ orderId }) => endpoints.sellers.webTrackingOrder(orderId) }),
  fetchSellerProfile: makeThunk("seller/fetchSellerProfile", { url: endpoints.sellers.profile }),
  updateSellerProfile: makeThunk("seller/updateSellerProfile", { method: "patch", url: endpoints.sellers.profile, data: body }),
  updateSellerBusinessAddress: makeThunk("seller/updateSellerBusinessAddress", { method: "patch", url: endpoints.sellers.businessAddress, data: body }),
  updateSellerPickupAddress: makeThunk("seller/updateSellerPickupAddress", { method: "patch", url: endpoints.sellers.pickupAddress, data: body }),
  updateSellerBankDetails: makeThunk("seller/updateSellerBankDetails", { method: "patch", url: endpoints.sellers.bankDetails, data: body }),
  updateSellerMoreInfo: makeThunk("seller/updateSellerMoreInfo", { method: "patch", url: endpoints.sellers.moreInfo, data: body }),
  updateSellerSettings: makeThunk("seller/updateSellerSettings", { method: "patch", url: endpoints.sellers.settings, data: body }),
  fetchSellerDashboard: makeThunk("seller/fetchSellerDashboard", { url: endpoints.sellers.dashboard, params: q }),
  createSellerSubAdmin: makeThunk("seller/createSellerSubAdmin", { method: "post", url: endpoints.sellers.subAdmins, data: body }),
  fetchSellerSubAdmins: makeThunk("seller/fetchSellerSubAdmins", { url: endpoints.sellers.subAdmins }),
  updateSellerSubAdminModules: makeThunk("seller/updateSellerSubAdminModules", { method: "patch", url: ({ userId }) => endpoints.sellers.subAdminModules(userId), data: body })
};

export const sellerCommissionThunks = {
  fetchMyCommissions: makeThunk("sellerCommission/fetchMyCommissions", { url: endpoints.sellerCommissions.myCommissions }),
  fetchMyPayouts: makeThunk("sellerCommission/fetchMyPayouts", { url: endpoints.sellerCommissions.myPayouts }),
  calculateCommission: makeThunk("sellerCommission/calculateCommission", { method: "post", url: ({ orderId }) => endpoints.sellerCommissions.calculate(orderId) }),
  processPayouts: makeThunk("sellerCommission/processPayouts", { method: "post", url: endpoints.sellerCommissions.processPayouts, data: body }),
  fetchSettlements: makeThunk("sellerCommission/fetchSettlements", { url: endpoints.sellerCommissions.settlements, params: q })
};

export const pricingThunks = {
  fetchCoupons: makeThunk("pricing/fetchCoupons", { url: endpoints.pricing.coupons, params: q }),
  createCoupon: makeThunk("pricing/createCoupon", { method: "post", url: endpoints.pricing.coupons, data: body }),
  fetchCouponById: makeThunk("pricing/fetchCouponById", { url: ({ couponId }) => endpoints.pricing.coupon(couponId) }),
  updateCoupon: makeThunk("pricing/updateCoupon", { method: "patch", url: ({ couponId }) => endpoints.pricing.coupon(couponId), data: body }),
  deleteCoupon: makeThunk("pricing/deleteCoupon", { method: "delete", url: ({ couponId }) => endpoints.pricing.coupon(couponId) })
};

export const taxThunks = {
  createInvoice: makeThunk("tax/createInvoice", { method: "post", url: ({ orderId }) => endpoints.tax.invoice(orderId), data: body }),
  fetchOrderInvoice: makeThunk("tax/fetchOrderInvoice", { url: ({ orderId }) => endpoints.tax.invoice(orderId) }),
  fetchTaxReports: makeThunk("tax/fetchTaxReports", { url: endpoints.tax.reports, params: q })
};

export const fraudThunks = {
  reviewFraud: makeThunk("fraud/reviewFraud", { method: "post", url: ({ fraudId }) => endpoints.fraud.review(fraudId), data: body })
};

export const rbacThunks = {
  fetchPermissionSetupModules: makeThunk("rbac/fetchPermissionSetupModules", { url: endpoints.rbac.permissionManagementModules, params: q }),
  fetchRbacModules: makeThunk("rbac/fetchRbacModules", { url: endpoints.rbac.modules, params: q }),
  createRbacModule: makeThunk("rbac/createRbacModule", { method: "post", url: endpoints.rbac.modules, data: body }),
  updateRbacModule: makeThunk("rbac/updateRbacModule", { method: "patch", url: ({ moduleId }) => endpoints.rbac.module(moduleId), data: body }),
  deleteRbacModule: makeThunk("rbac/deleteRbacModule", { method: "delete", url: ({ moduleId }) => endpoints.rbac.module(moduleId) }),
  fetchPermissions: makeThunk("rbac/fetchPermissions", { url: endpoints.rbac.permissions, params: q }),
  createPermission: makeThunk("rbac/createPermission", { method: "post", url: endpoints.rbac.permissions, data: body }),
  updatePermission: makeThunk("rbac/updatePermission", { method: "patch", url: ({ permissionId }) => endpoints.rbac.permission(permissionId), data: body }),
  deletePermission: makeThunk("rbac/deletePermission", { method: "delete", url: ({ permissionId }) => endpoints.rbac.permission(permissionId) }),
  fetchRoles: makeThunk("rbac/fetchRoles", { url: endpoints.rbac.roles, params: q }),
  createRole: makeThunk("rbac/createRole", { method: "post", url: endpoints.rbac.roles, data: body }),
  updateRole: makeThunk("rbac/updateRole", { method: "patch", url: ({ roleId }) => endpoints.rbac.role(roleId), data: body }),
  deleteRole: makeThunk("rbac/deleteRole", { method: "delete", url: ({ roleId }) => endpoints.rbac.role(roleId) }),
  fetchRolePermissions: makeThunk("rbac/fetchRolePermissions", { url: ({ roleId }) => endpoints.rbac.rolePermissions(roleId) }),
  addRolePermission: makeThunk("rbac/addRolePermission", { method: "post", url: ({ roleId }) => endpoints.rbac.rolePermissions(roleId), data: body }),
  removeRolePermission: makeThunk("rbac/removeRolePermission", { method: "delete", url: ({ roleId }) => endpoints.rbac.rolePermissions(roleId), data: body }),
  bulkRolePermissions: makeThunk("rbac/bulkRolePermissions", { method: "post", url: ({ roleId }) => endpoints.rbac.rolePermissionsBulk(roleId), data: body }),
  fetchUserPermissions: makeThunk("rbac/fetchUserPermissions", { url: ({ userId }) => endpoints.rbac.userPermissions(userId) }),
  fetchUserEffectivePermissions: makeThunk("rbac/fetchUserEffectivePermissions", { url: ({ userId }) => endpoints.rbac.userEffectivePermissions(userId) }),
  checkUserPermission: makeThunk("rbac/checkUserPermission", { url: ({ userId }) => endpoints.rbac.userPermissionCheck(userId), params: q }),
  addUserPermission: makeThunk("rbac/addUserPermission", { method: "post", url: ({ userId }) => endpoints.rbac.userPermissions(userId), data: body }),
  removeUserPermission: makeThunk("rbac/removeUserPermission", { method: "delete", url: ({ userId }) => endpoints.rbac.userPermissions(userId), data: body }),
  bulkUserPermissions: makeThunk("rbac/bulkUserPermissions", { method: "post", url: ({ userId }) => endpoints.rbac.userPermissionsBulk(userId), data: body }),
  fetchUserRoles: makeThunk("rbac/fetchUserRoles", { url: ({ userId }) => endpoints.rbac.userRoles(userId) }),
  checkUserRole: makeThunk("rbac/checkUserRole", { url: ({ userId }) => endpoints.rbac.userRoleCheck(userId), params: q }),
  addUserRole: makeThunk("rbac/addUserRole", { method: "post", url: ({ userId }) => endpoints.rbac.userRoles(userId), data: body }),
  removeUserRole: makeThunk("rbac/removeUserRole", { method: "delete", url: ({ userId }) => endpoints.rbac.userRoles(userId), data: body }),
  bulkUserRoles: makeThunk("rbac/bulkUserRoles", { method: "post", url: ({ userId }) => endpoints.rbac.userRolesBulk(userId), data: body })
};

export const adminThunks = {
  fetchAdminAccessModules: makeThunk("admin/fetchAdminAccessModules", { url: endpoints.admin.accessModules, params: q }),
  createAdmin: makeThunk("admin/createAdmin", { method: "post", url: endpoints.admin.admins, data: body }),
  fetchAdmins: makeThunk("admin/fetchAdmins", { url: endpoints.admin.admins, params: q }),
  createSubAdmin: makeThunk("admin/createSubAdmin", { method: "post", url: endpoints.admin.subAdmins, data: body }),
  fetchSubAdmins: makeThunk("admin/fetchSubAdmins", { url: endpoints.admin.subAdmins, params: q }),
  updateSubAdminModules: makeThunk("admin/updateSubAdminModules", { method: "patch", url: ({ userId }) => endpoints.admin.subAdminModules(userId), data: body }),
  fetchAdminDashboardOverview: makeThunk("admin/fetchAdminDashboardOverview", { url: endpoints.admin.dashboardOverview }),
  fetchAdminUsers: makeThunk("admin/fetchAdminUsers", { url: endpoints.admin.users, params: q }),
  fetchAdminUser: makeThunk("admin/fetchAdminUser", { url: ({ userId }) => endpoints.admin.user(userId) }),
  updateAdminUser: makeThunk("admin/updateAdminUser", { method: "patch", url: ({ userId }) => endpoints.admin.user(userId), data: body }),
  deleteAdminUser: makeThunk("admin/deleteAdminUser", { method: "delete", url: ({ userId }) => endpoints.admin.user(userId), data: body }),
  fetchAdminVendors: makeThunk("admin/fetchAdminVendors", { url: endpoints.admin.vendors, params: q }),
  updateVendorStatus: makeThunk("admin/updateVendorStatus", { method: "patch", url: ({ sellerId }) => endpoints.admin.vendorStatus(sellerId), data: body }),
  fetchProductModerationQueue: makeThunk("admin/fetchProductModerationQueue", { url: endpoints.admin.productsModerationQueue, params: q }),
  fetchAdminProducts: makeThunk("admin/fetchAdminProducts", { url: endpoints.admin.products, params: q }),
  fetchAdminProduct: makeThunk("admin/fetchAdminProduct", { url: ({ productId }) => endpoints.admin.product(productId) }),
  createAdminProduct: makeThunk("admin/createAdminProduct", { method: "post", url: endpoints.admin.products, data: body }),
  updateAdminProduct: makeThunk("admin/updateAdminProduct", { method: "patch", url: ({ productId }) => endpoints.admin.product(productId), data: body }),
  deleteAdminProduct: makeThunk("admin/deleteAdminProduct", { method: "delete", url: ({ productId }) => endpoints.admin.product(productId) }),
  moderateProduct: makeThunk("admin/moderateProduct", { method: "patch", url: ({ productId }) => endpoints.admin.moderateProduct(productId), data: body }),
  fetchAdminOrders: makeThunk("admin/fetchAdminOrders", { url: endpoints.admin.orders, params: q }),
  fetchAdminPayments: makeThunk("admin/fetchAdminPayments", { url: endpoints.admin.payments, params: q }),
  createPayout: makeThunk("admin/createPayout", { method: "post", url: endpoints.admin.payouts, data: body }),
  fetchPayouts: makeThunk("admin/fetchPayouts", { url: endpoints.admin.payouts, params: q }),
  fetchAdminTaxReports: makeThunk("admin/fetchAdminTaxReports", { url: endpoints.admin.taxReports, params: q }),
  createAdminTaxInvoice: makeThunk("admin/createAdminTaxInvoice", { method: "post", url: ({ orderId }) => endpoints.admin.taxInvoice(orderId) }),
  createApiKey: makeThunk("admin/createApiKey", { method: "post", url: endpoints.admin.apiKeys, data: body }),
  fetchApiKeys: makeThunk("admin/fetchApiKeys", { url: endpoints.admin.apiKeys, params: q }),
  createWebhook: makeThunk("admin/createWebhook", { method: "post", url: endpoints.admin.webhooks, data: body }),
  fetchWebhooks: makeThunk("admin/fetchWebhooks", { url: endpoints.admin.webhooks, params: q }),
  upsertFeatureFlag: makeThunk("admin/upsertFeatureFlag", { method: "put", url: endpoints.admin.featureFlags, data: body }),
  fetchFeatureFlags: makeThunk("admin/fetchFeatureFlags", { url: endpoints.admin.featureFlags, params: q }),
  fetchRealtimeAnalytics: makeThunk("admin/fetchRealtimeAnalytics", { url: endpoints.admin.realtimeAnalytics, params: q }),
  fetchReturnsAnalytics: makeThunk("admin/fetchReturnsAnalytics", { url: endpoints.admin.returnsAnalytics, params: q }),
  fetchChargebacks: makeThunk("admin/fetchChargebacks", { url: endpoints.admin.chargebacks, params: q }),
  fetchSystemHealth: makeThunk("admin/fetchSystemHealth", { url: endpoints.admin.systemHealth }),
  fetchSystemQueues: makeThunk("admin/fetchSystemQueues", { url: endpoints.admin.systemQueues }),
  pauseQueue: makeThunk("admin/pauseQueue", { method: "post", url: ({ queueName }) => endpoints.admin.pauseQueue(queueName) }),
  resumeQueue: makeThunk("admin/resumeQueue", { method: "post", url: ({ queueName }) => endpoints.admin.resumeQueue(queueName) }),
  fetchDeadLetter: makeThunk("admin/fetchDeadLetter", { url: endpoints.admin.deadLetter, params: q }),
  retryDeadLetter: makeThunk("admin/retryDeadLetter", { method: "post", url: ({ eventId }) => endpoints.admin.retryDeadLetter(eventId), data: body }),
  discardDeadLetter: makeThunk("admin/discardDeadLetter", { method: "post", url: ({ eventId }) => endpoints.admin.discardDeadLetter(eventId), data: body }),
  createPlatformCategory: makeThunk("admin/createPlatformCategory", { method: "post", url: endpoints.admin.platformCategories, data: body }),
  fetchPlatformCategories: makeThunk("admin/fetchPlatformCategories", { url: endpoints.admin.platformCategories, params: q }),
  updatePlatformCategory: makeThunk("admin/updatePlatformCategory", { method: "patch", url: ({ categoryKey }) => endpoints.admin.platformCategory(categoryKey), data: body }),
  deletePlatformCategory: makeThunk("admin/deletePlatformCategory", { method: "delete", url: ({ categoryKey }) => endpoints.admin.platformCategory(categoryKey) }),
  createPlatformProductFamily: makeThunk("admin/createPlatformProductFamily", { method: "post", url: endpoints.admin.platformProductFamilies, data: body }),
  fetchPlatformProductFamilies: makeThunk("admin/fetchPlatformProductFamilies", { url: endpoints.admin.platformProductFamilies, params: q }),
  fetchPlatformProductFamily: makeThunk("admin/fetchPlatformProductFamily", { url: ({ familyCode }) => endpoints.admin.platformProductFamily(familyCode) }),
  updatePlatformProductFamily: makeThunk("admin/updatePlatformProductFamily", { method: "patch", url: ({ familyCode }) => endpoints.admin.platformProductFamily(familyCode), data: body }),
  deletePlatformProductFamily: makeThunk("admin/deletePlatformProductFamily", { method: "delete", url: ({ familyCode }) => endpoints.admin.platformProductFamily(familyCode) }),
  createPlatformProductVariant: makeThunk("admin/createPlatformProductVariant", { method: "post", url: endpoints.admin.platformProductVariants, data: body }),
  fetchPlatformProductVariants: makeThunk("admin/fetchPlatformProductVariants", { url: endpoints.admin.platformProductVariants, params: q }),
  fetchPlatformProductVariant: makeThunk("admin/fetchPlatformProductVariant", { url: ({ variantId }) => endpoints.admin.platformProductVariant(variantId) }),
  updatePlatformProductVariant: makeThunk("admin/updatePlatformProductVariant", { method: "patch", url: ({ variantId }) => endpoints.admin.platformProductVariant(variantId), data: body }),
  deletePlatformProductVariant: makeThunk("admin/deletePlatformProductVariant", { method: "delete", url: ({ variantId }) => endpoints.admin.platformProductVariant(variantId) }),
  createPlatformHsnCode: makeThunk("admin/createPlatformHsnCode", { method: "post", url: endpoints.admin.platformHsnCodes, data: body }),
  fetchPlatformHsnCodes: makeThunk("admin/fetchPlatformHsnCodes", { url: endpoints.admin.platformHsnCodes, params: q }),
  fetchPlatformHsnCode: makeThunk("admin/fetchPlatformHsnCode", { url: ({ hsnCode }) => endpoints.admin.platformHsnCode(hsnCode) }),
  updatePlatformHsnCode: makeThunk("admin/updatePlatformHsnCode", { method: "patch", url: ({ hsnCode }) => endpoints.admin.platformHsnCode(hsnCode), data: body }),
  deletePlatformHsnCode: makeThunk("admin/deletePlatformHsnCode", { method: "delete", url: ({ hsnCode }) => endpoints.admin.platformHsnCode(hsnCode) }),
  fetchPlatformCategoryAttributes: makeThunk("admin/fetchPlatformCategoryAttributes", { url: ({ categoryKey }) => endpoints.admin.platformCategoryAttributes(categoryKey) }),
  fetchPlatformCatalogPrefill: makeThunk("admin/fetchPlatformCatalogPrefill", { url: endpoints.admin.platformCatalogPrefill, params: q }),
  createPlatformProductOption: makeThunk("admin/createPlatformProductOption", { method: "post", url: endpoints.admin.platformProductOptions, data: body }),
  fetchPlatformProductOptions: makeThunk("admin/fetchPlatformProductOptions", { url: endpoints.admin.platformProductOptions, params: q }),
  updatePlatformProductOption: makeThunk("admin/updatePlatformProductOption", { method: "patch", url: ({ optionId }) => endpoints.admin.platformProductOption(optionId), data: body }),
  deletePlatformProductOption: makeThunk("admin/deletePlatformProductOption", { method: "delete", url: ({ optionId }) => endpoints.admin.platformProductOption(optionId) }),
  createPlatformProductOptionValue: makeThunk("admin/createPlatformProductOptionValue", { method: "post", url: endpoints.admin.platformProductOptionValues, data: body }),
  fetchPlatformProductOptionValues: makeThunk("admin/fetchPlatformProductOptionValues", { url: endpoints.admin.platformProductOptionValues, params: q }),
  updatePlatformProductOptionValue: makeThunk("admin/updatePlatformProductOptionValue", { method: "patch", url: ({ optionValueId }) => endpoints.admin.platformProductOptionValue(optionValueId), data: body }),
  deletePlatformProductOptionValue: makeThunk("admin/deletePlatformProductOptionValue", { method: "delete", url: ({ optionValueId }) => endpoints.admin.platformProductOptionValue(optionValueId) }),
  createPlatformGeography: makeThunk("admin/createPlatformGeography", { method: "post", url: endpoints.admin.platformGeography, data: body }),
  fetchPlatformGeography: makeThunk("admin/fetchPlatformGeography", { url: endpoints.admin.platformGeography, params: q }),
  fetchPlatformGeographyDetail: makeThunk("admin/fetchPlatformGeographyDetail", { url: ({ countryCode }) => endpoints.admin.platformGeographyDetail(countryCode) }),
  updatePlatformGeography: makeThunk("admin/updatePlatformGeography", { method: "patch", url: ({ countryCode }) => endpoints.admin.platformGeographyDetail(countryCode), data: body }),
  deletePlatformGeography: makeThunk("admin/deletePlatformGeography", { method: "delete", url: ({ countryCode }) => endpoints.admin.platformGeographyDetail(countryCode) }),
  createPlatformContentPage: makeThunk("admin/createPlatformContentPage", { method: "post", url: endpoints.admin.platformContentPages, data: body }),
  fetchPlatformContentPages: makeThunk("admin/fetchPlatformContentPages", { url: endpoints.admin.platformContentPages, params: q }),
  updatePlatformContentPage: makeThunk("admin/updatePlatformContentPage", { method: "patch", url: ({ slug }) => endpoints.admin.platformContentPage(slug), data: body }),
  deletePlatformContentPage: makeThunk("admin/deletePlatformContentPage", { method: "delete", url: ({ slug }) => endpoints.admin.platformContentPage(slug) }),
  createPlatformBrand: makeThunk("admin/createPlatformBrand", { method: "post", url: endpoints.admin.platformBrands, data: body }),
  fetchPlatformBrands: makeThunk("admin/fetchPlatformBrands", { url: endpoints.admin.platformBrands, params: q }),
  updatePlatformBrand: makeThunk("admin/updatePlatformBrand", { method: "patch", url: ({ brandId }) => endpoints.admin.platformBrand(brandId), data: body }),
  deletePlatformBrand: makeThunk("admin/deletePlatformBrand", { method: "delete", url: ({ brandId }) => endpoints.admin.platformBrand(brandId) }),
  createPlatformWarrantyTemplate: makeThunk("admin/createPlatformWarrantyTemplate", { method: "post", url: endpoints.admin.platformWarrantyTemplates, data: body }),
  fetchPlatformWarrantyTemplates: makeThunk("admin/fetchPlatformWarrantyTemplates", { url: endpoints.admin.platformWarrantyTemplates, params: q }),
  updatePlatformWarrantyTemplate: makeThunk("admin/updatePlatformWarrantyTemplate", { method: "patch", url: ({ templateId }) => endpoints.admin.platformWarrantyTemplate(templateId), data: body }),
  deletePlatformWarrantyTemplate: makeThunk("admin/deletePlatformWarrantyTemplate", { method: "delete", url: ({ templateId }) => endpoints.admin.platformWarrantyTemplate(templateId) }),
  createPlatformDimension: makeThunk("admin/createPlatformDimension", { method: "post", url: endpoints.admin.platformDimensions, data: body }),
  fetchPlatformDimensions: makeThunk("admin/fetchPlatformDimensions", { url: endpoints.admin.platformDimensions, params: q }),
  updatePlatformDimension: makeThunk("admin/updatePlatformDimension", { method: "patch", url: ({ dimensionId }) => endpoints.admin.platformDimension(dimensionId), data: body }),
  deletePlatformDimension: makeThunk("admin/deletePlatformDimension", { method: "delete", url: ({ dimensionId }) => endpoints.admin.platformDimension(dimensionId) }),
  createPlatformBatch: makeThunk("admin/createPlatformBatch", { method: "post", url: endpoints.admin.platformBatches, data: body }),
  fetchPlatformBatches: makeThunk("admin/fetchPlatformBatches", { url: endpoints.admin.platformBatches, params: q }),
  updatePlatformBatch: makeThunk("admin/updatePlatformBatch", { method: "patch", url: ({ batchId }) => endpoints.admin.platformBatch(batchId), data: body }),
  deletePlatformBatch: makeThunk("admin/deletePlatformBatch", { method: "delete", url: ({ batchId }) => endpoints.admin.platformBatch(batchId) }),
  createAdminPlatformSubscriptionPlan: makeThunk("admin/createAdminPlatformSubscriptionPlan", { method: "post", url: endpoints.admin.subscriptionPlans, data: body }),
  fetchAdminPlatformSubscriptionPlans: makeThunk("admin/fetchAdminPlatformSubscriptionPlans", { url: endpoints.admin.subscriptionPlans, params: q }),
  fetchAdminPlatformSubscriptionPlan: makeThunk("admin/fetchAdminPlatformSubscriptionPlan", { url: ({ planId }) => endpoints.admin.subscriptionPlan(planId) }),
  updateAdminPlatformSubscriptionPlan: makeThunk("admin/updateAdminPlatformSubscriptionPlan", { method: "patch", url: ({ planId }) => endpoints.admin.subscriptionPlan(planId), data: body }),
  deleteAdminPlatformSubscriptionPlan: makeThunk("admin/deleteAdminPlatformSubscriptionPlan", { method: "delete", url: ({ planId }) => endpoints.admin.subscriptionPlan(planId) }),
  fetchAdminPlatformSubscriptions: makeThunk("admin/fetchAdminPlatformSubscriptions", { url: endpoints.admin.subscriptions, params: q }),
  updateAdminPlatformSubscriptionStatus: makeThunk("admin/updateAdminPlatformSubscriptionStatus", { method: "patch", url: ({ subscriptionId }) => endpoints.admin.subscriptionStatus(subscriptionId), data: body }),
  createAdminFeeConfig: makeThunk("admin/createAdminFeeConfig", { method: "post", url: endpoints.admin.feeConfig, data: body }),
  fetchAdminFeeConfigs: makeThunk("admin/fetchAdminFeeConfigs", { url: endpoints.admin.feeConfig, params: q }),
  fetchAdminFeeConfig: makeThunk("admin/fetchAdminFeeConfig", { url: ({ configId }) => endpoints.admin.feeConfigDetail(configId) }),
  updateAdminFeeConfig: makeThunk("admin/updateAdminFeeConfig", { method: "patch", url: ({ configId }) => endpoints.admin.feeConfigDetail(configId), data: body }),
  deleteAdminFeeConfig: makeThunk("admin/deleteAdminFeeConfig", { method: "delete", url: ({ configId }) => endpoints.admin.feeConfigDetail(configId) }),
  reviewUserKyc: makeThunk("admin/reviewUserKyc", { method: "patch", url: ({ userId }) => endpoints.users.reviewKyc(userId), data: body }),
  reviewSellerKyc: makeThunk("admin/reviewSellerKyc", { method: "patch", url: ({ sellerId }) => endpoints.sellers.reviewKyc(sellerId), data: body }),
  approveReturn: makeThunk("admin/approveReturn", { method: "post", url: ({ returnId }) => endpoints.returns.approve(returnId), data: body }),
  refundReturn: makeThunk("admin/refundReturn", { method: "post", url: ({ returnId }) => endpoints.returns.refund(returnId) }),
  reviewProduct: makeThunk("admin/reviewProduct", { method: "patch", url: ({ productId }) => endpoints.products.review(productId), data: body }),
  updateWarrantyClaimStatus: makeThunk("admin/updateWarrantyClaimStatus", { method: "patch", url: ({ warrantyId, claimId }) => endpoints.warranty.claimStatus(warrantyId, claimId), data: body })
};
