export const API_PREFIX = "/api/v1";

export const endpoints = {
  health: "/health",
  meta: {
    routes: `${API_PREFIX}/meta/routes`
  },
  auth: {
    register: `${API_PREFIX}/auth/register`,
    registerOtp: `${API_PREFIX}/auth/register-otp`,
    verifyRegistration: `${API_PREFIX}/auth/verify-registration`,
    login: `${API_PREFIX}/auth/login`,
    social: `${API_PREFIX}/auth/social`,
    refresh: `${API_PREFIX}/auth/refresh`,
    sendOtp: `${API_PREFIX}/auth/send-otp`,
    verifyOtp: `${API_PREFIX}/auth/verify-otp`,
    resendOtp: `${API_PREFIX}/auth/resend-otp`,
    forgotPassword: `${API_PREFIX}/auth/forgot-password`,
    resetPassword: `${API_PREFIX}/auth/reset-password`,
    changePassword: `${API_PREFIX}/auth/change-password`,
    status: `${API_PREFIX}/auth/status`
  },
  users: {
    me: `${API_PREFIX}/users/me`,
    addresses: `${API_PREFIX}/users/me/addresses`,
    address: (addressId) => `${API_PREFIX}/users/me/addresses/${addressId}`,
    kyc: `${API_PREFIX}/users/me/kyc`,
    reviewKyc: (userId) => `${API_PREFIX}/users/${userId}/kyc/review`
  },
  products: {
    list: `${API_PREFIX}/products`,
    search: `${API_PREFIX}/products/search`,
    sellerMe: `${API_PREFIX}/products/seller/me`,
    detail: (productId) => `${API_PREFIX}/products/${productId}`,
    create: `${API_PREFIX}/products`,
    review: (productId) => `${API_PREFIX}/products/${productId}/review`
  },
  carts: {
    me: `${API_PREFIX}/carts/me`
  },
  orders: {
    me: `${API_PREFIX}/orders/me`,
    sellerMe: `${API_PREFIX}/orders/seller/me`,
    create: `${API_PREFIX}/orders`,
    detail: (orderId) => `${API_PREFIX}/orders/${orderId}`,
    cancel: (orderId) => `${API_PREFIX}/orders/${orderId}/cancel`,
    status: (orderId) => `${API_PREFIX}/orders/${orderId}/status`
  },
  payments: {
    razorpayWebhook: `${API_PREFIX}/payments/webhooks/razorpay`,
    me: `${API_PREFIX}/payments/me`,
    initiate: `${API_PREFIX}/payments/initiate`,
    verify: `${API_PREFIX}/payments/verify`
  },
  delivery: {
    serviceability: `${API_PREFIX}/delivery/serviceability`,
    ewayBillByOrder: (orderId) => `${API_PREFIX}/delivery/orders/${orderId}/eway-bill`,
    ewayBillStatus: (ewayBillId) => `${API_PREFIX}/delivery/eway-bills/${ewayBillId}/status`
  },
  returns: {
    create: `${API_PREFIX}/returns`,
    mine: `${API_PREFIX}/returns/my-returns`,
    byOrder: (orderId) => `${API_PREFIX}/returns/order/${orderId}`,
    approve: (returnId) => `${API_PREFIX}/returns/${returnId}/approve`,
    refund: (returnId) => `${API_PREFIX}/returns/${returnId}/refund`
  },
  platform: {
    categories: `${API_PREFIX}/platform/categories`,
    category: (categoryKey) => `${API_PREFIX}/platform/categories/${categoryKey}`,
    families: `${API_PREFIX}/platform/families`,
    family: (familyCode) => `${API_PREFIX}/platform/families/${familyCode}`,
    variants: `${API_PREFIX}/platform/variants`,
    variant: (variantId) => `${API_PREFIX}/platform/variants/${variantId}`,
    hsnCodes: `${API_PREFIX}/platform/hsn-codes`,
    hsnCode: (hsnCode) => `${API_PREFIX}/platform/hsn-codes/${hsnCode}`,
    geographies: `${API_PREFIX}/platform/geographies`,
    geography: (countryCode) => `${API_PREFIX}/platform/geographies/${countryCode}`,
    cms: `${API_PREFIX}/platform/cms`,
    cmsPage: (slug) => `${API_PREFIX}/platform/cms/${slug}`
  },
  pricing: {
    coupons: `${API_PREFIX}/pricing/coupons`,
    coupon: (couponId) => `${API_PREFIX}/pricing/coupons/${couponId}`
  },
  dynamicPricing: {
    price: `${API_PREFIX}/dynamic-pricing/price`,
    adjust: `${API_PREFIX}/dynamic-pricing/adjust`
  },
  wallets: {
    me: `${API_PREFIX}/wallets/me`
  },
  subscriptions: {
    plans: `${API_PREFIX}/subscriptions/plans`,
    purchase: `${API_PREFIX}/subscriptions/purchase`,
    me: `${API_PREFIX}/subscriptions/me`,
    pause: (subscriptionId) => `${API_PREFIX}/subscriptions/${subscriptionId}/pause`,
    resume: (subscriptionId) => `${API_PREFIX}/subscriptions/${subscriptionId}/resume`,
    cancel: (subscriptionId) => `${API_PREFIX}/subscriptions/${subscriptionId}/cancel`,
    adminPlans: `${API_PREFIX}/subscriptions/admin/plans`,
    adminPlan: (planId) => `${API_PREFIX}/subscriptions/admin/plans/${planId}`,
    adminSubscriptions: `${API_PREFIX}/subscriptions/admin/subscriptions`,
    adminSubscriptionStatus: (subscriptionId) => `${API_PREFIX}/subscriptions/admin/subscriptions/${subscriptionId}/status`,
    adminPlatformFeeConfig: `${API_PREFIX}/subscriptions/admin/platform-fee-config`,
    adminPlatformFeeConfigDetail: (configId) => `${API_PREFIX}/subscriptions/admin/platform-fee-config/${configId}`
  },
  notifications: {
    me: `${API_PREFIX}/notifications/me`,
    create: `${API_PREFIX}/notifications`,
    preferences: `${API_PREFIX}/notifications/preferences`
  },
  analytics: {
    overview: `${API_PREFIX}/analytics`,
    events: `${API_PREFIX}/analytics/events`
  },
  warranty: {
    product: (productId) => `${API_PREFIX}/warranty/products/${productId}/warranty`,
    register: `${API_PREFIX}/warranty/register`,
    detail: (warrantyId) => `${API_PREFIX}/warranty/${warrantyId}`,
    byOrder: (orderId) => `${API_PREFIX}/warranty/orders/${orderId}`,
    byCustomer: (customerId) => `${API_PREFIX}/warranty/customers/${customerId}`,
    claims: (warrantyId) => `${API_PREFIX}/warranty/${warrantyId}/claims`,
    claimStatus: (warrantyId, claimId) => `${API_PREFIX}/warranty/${warrantyId}/claims/${claimId}/status`
  },
  loyalty: {
    profile: `${API_PREFIX}/loyalty/profile`,
    benefits: `${API_PREFIX}/loyalty/benefits`,
    points: `${API_PREFIX}/loyalty/points`,
    history: `${API_PREFIX}/loyalty/history`,
    redeem: `${API_PREFIX}/loyalty/redeem`
  },
  recommendations: {
    list: `${API_PREFIX}/recommendations`,
    interact: (productId) => `${API_PREFIX}/recommendations/${productId}/interact`,
    trending: `${API_PREFIX}/recommendations/trending`
  },
  sellers: {
    onboardingKyc: `${API_PREFIX}/sellers/onboarding/kyc`,
    onboardingProfile: `${API_PREFIX}/sellers/onboarding/profile`,
    reviewKyc: (sellerId) => `${API_PREFIX}/sellers/${sellerId}/kyc/review`,
    webStatus: `${API_PREFIX}/sellers/me/status`,
    webTracking: `${API_PREFIX}/sellers/me/tracking`,
    webTrackingOrder: (orderId) => `${API_PREFIX}/sellers/me/tracking/${orderId}`,
    profile: `${API_PREFIX}/sellers/me/profile`,
    businessAddress: `${API_PREFIX}/sellers/me/business-address`,
    pickupAddress: `${API_PREFIX}/sellers/me/pickup-address`,
    bankDetails: `${API_PREFIX}/sellers/me/bank-details`,
    moreInfo: `${API_PREFIX}/sellers/me/more-info`,
    settings: `${API_PREFIX}/sellers/me/settings`,
    dashboard: `${API_PREFIX}/sellers/me/dashboard`,
    subAdmins: `${API_PREFIX}/sellers/me/sub-admins`,
    subAdminModules: (userId) => `${API_PREFIX}/sellers/me/sub-admins/${userId}/modules`
  },
  sellerCommissions: {
    myCommissions: `${API_PREFIX}/sellers/commissions/my-commissions`,
    myPayouts: `${API_PREFIX}/sellers/commissions/my-payouts`,
    calculate: (orderId) => `${API_PREFIX}/sellers/commissions/calculate/${orderId}`,
    processPayouts: `${API_PREFIX}/sellers/commissions/process-payouts`,
    settlements: `${API_PREFIX}/sellers/commissions/settlements`
  },
  tax: {
    invoice: (orderId) => `${API_PREFIX}/tax/orders/${orderId}/invoice`,
    reports: `${API_PREFIX}/tax/reports`
  },
  fraud: {
    review: (fraudId) => `${API_PREFIX}/fraud/${fraudId}/review`
  },
  rbac: {
    permissionManagementModules: `${API_PREFIX}/rbac/permission-management/modules`,
    modules: `${API_PREFIX}/rbac/modules`,
    module: (moduleId) => `${API_PREFIX}/rbac/modules/${moduleId}`,
    permissions: `${API_PREFIX}/rbac/permissions`,
    permission: (permissionId) => `${API_PREFIX}/rbac/permissions/${permissionId}`,
    roles: `${API_PREFIX}/rbac/roles`,
    role: (roleId) => `${API_PREFIX}/rbac/roles/${roleId}`,
    rolePermissions: (roleId) => `${API_PREFIX}/rbac/roles/${roleId}/permissions`,
    rolePermissionsBulk: (roleId) => `${API_PREFIX}/rbac/roles/${roleId}/permissions/bulk`,
    userPermissions: (userId) => `${API_PREFIX}/rbac/users/${userId}/permissions`,
    userEffectivePermissions: (userId) => `${API_PREFIX}/rbac/users/${userId}/permissions/effective`,
    userPermissionCheck: (userId) => `${API_PREFIX}/rbac/users/${userId}/permissions/check`,
    userPermissionsBulk: (userId) => `${API_PREFIX}/rbac/users/${userId}/permissions/bulk`,
    userRoles: (userId) => `${API_PREFIX}/rbac/users/${userId}/roles`,
    userRoleCheck: (userId) => `${API_PREFIX}/rbac/users/${userId}/roles/check`,
    userRolesBulk: (userId) => `${API_PREFIX}/rbac/users/${userId}/roles/bulk`
  },
  admin: {
    accessModules: `${API_PREFIX}/admin/access/modules`,
    admins: `${API_PREFIX}/admin/access/admins`,
    subAdmins: `${API_PREFIX}/admin/access/sub-admins`,
    subAdminModules: (userId) => `${API_PREFIX}/admin/access/sub-admins/${userId}/modules`,
    dashboardOverview: `${API_PREFIX}/admin/dashboard/overview`,
    users: `${API_PREFIX}/admin/users`,
    user: (userId) => `${API_PREFIX}/admin/users/${userId}`,
    vendors: `${API_PREFIX}/admin/vendors`,
    vendorStatus: (sellerId) => `${API_PREFIX}/admin/vendors/${sellerId}/status`,
    productsModerationQueue: `${API_PREFIX}/admin/products/moderation-queue`,
    moderateProduct: (productId) => `${API_PREFIX}/admin/products/${productId}/moderate`,
    orders: `${API_PREFIX}/admin/orders`,
    payments: `${API_PREFIX}/admin/payments`,
    payouts: `${API_PREFIX}/admin/payouts`,
    taxReports: `${API_PREFIX}/admin/tax/reports`,
    taxInvoice: (orderId) => `${API_PREFIX}/admin/tax/orders/${orderId}/invoice`,
    apiKeys: `${API_PREFIX}/admin/platform/api-keys`,
    webhooks: `${API_PREFIX}/admin/platform/webhooks`,
    featureFlags: `${API_PREFIX}/admin/platform/feature-flags`,
    realtimeAnalytics: `${API_PREFIX}/admin/analytics/realtime`,
    returnsAnalytics: `${API_PREFIX}/admin/returns/analytics`,
    chargebacks: `${API_PREFIX}/admin/chargebacks`,
    systemHealth: `${API_PREFIX}/admin/system/health`,
    systemQueues: `${API_PREFIX}/admin/system/queues`,
    pauseQueue: (queueName) => `${API_PREFIX}/admin/system/queues/${queueName}/pause`,
    resumeQueue: (queueName) => `${API_PREFIX}/admin/system/queues/${queueName}/resume`,
    deadLetter: `${API_PREFIX}/admin/system/dead-letter`,
    retryDeadLetter: (eventId) => `${API_PREFIX}/admin/system/dead-letter/${eventId}/retry`,
    discardDeadLetter: (eventId) => `${API_PREFIX}/admin/system/dead-letter/${eventId}/discard`,
    subscriptionPlans: `${API_PREFIX}/admin/platform/subscription-plans`,
    subscriptionPlan: (planId) => `${API_PREFIX}/admin/platform/subscription-plans/${planId}`,
    subscriptions: `${API_PREFIX}/admin/platform/subscriptions`,
    subscriptionStatus: (subscriptionId) => `${API_PREFIX}/admin/platform/subscriptions/${subscriptionId}/status`,
    feeConfig: `${API_PREFIX}/admin/platform/fee-config`,
    feeConfigDetail: (configId) => `${API_PREFIX}/admin/platform/fee-config/${configId}`,
    platformCategories: `${API_PREFIX}/admin/platform/categories`,
    platformCategory: (categoryKey) => `${API_PREFIX}/admin/platform/categories/${categoryKey}`,
    platformProductFamilies: `${API_PREFIX}/admin/platform/product-families`,
    platformProductFamily: (familyCode) => `${API_PREFIX}/admin/platform/product-families/${familyCode}`,
    platformProductVariants: `${API_PREFIX}/admin/platform/product-variants`,
    platformProductVariant: (variantId) => `${API_PREFIX}/admin/platform/product-variants/${variantId}`,
    platformHsnCodes: `${API_PREFIX}/admin/platform/hsn-codes`,
    platformHsnCode: (hsnCode) => `${API_PREFIX}/admin/platform/hsn-codes/${hsnCode}`,
    platformGeography: `${API_PREFIX}/admin/platform/geography`,
    platformGeographyDetail: (countryCode) => `${API_PREFIX}/admin/platform/geography/${countryCode}`,
    platformContentPages: `${API_PREFIX}/admin/platform/content-pages`,
    platformContentPage: (slug) => `${API_PREFIX}/admin/platform/content-pages/${slug}`
  }
};
