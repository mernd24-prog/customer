import { createApiSlice } from "../createApiSlice";
import { adminThunks } from "../domainThunks";
export { adminThunks };
export const {
  // Access
  fetchAdminAccessModules, createAdmin, fetchAdmins,
  createSubAdmin, fetchSubAdmins, updateSubAdminModules,
  // Dashboard
  fetchAdminDashboardOverview,
  // Users
  fetchAdminUsers, fetchAdminUser, updateAdminUser, deleteAdminUser,
  // Vendors
  fetchAdminVendors, updateVendorStatus,
  // Products
  fetchProductModerationQueue, fetchAdminProducts, fetchAdminProduct,
  createAdminProduct, updateAdminProduct, deleteAdminProduct,
  moderateProduct, reviewProduct,
  // Orders & Payments
  fetchAdminOrders, fetchAdminPayments, createPayout, fetchPayouts,
  // Tax
  fetchAdminTaxReports, createAdminTaxInvoice,
  // Platform settings
  createApiKey, fetchApiKeys,
  createWebhook, fetchWebhooks,
  upsertFeatureFlag, fetchFeatureFlags,
  // Analytics & monitoring
  fetchRealtimeAnalytics, fetchReturnsAnalytics, fetchChargebacks,
  fetchSystemHealth, fetchSystemQueues,
  pauseQueue, resumeQueue,
  fetchDeadLetter, retryDeadLetter, discardDeadLetter,
  // Categories
  createPlatformCategory, fetchPlatformCategories, updatePlatformCategory, deletePlatformCategory,
  fetchPlatformCategoryAttributes, fetchPlatformCatalogPrefill,
  // Product families
  createPlatformProductFamily, fetchPlatformProductFamilies, fetchPlatformProductFamily,
  updatePlatformProductFamily, deletePlatformProductFamily,
  // Product variants
  createPlatformProductVariant, fetchPlatformProductVariants, fetchPlatformProductVariant,
  updatePlatformProductVariant, deletePlatformProductVariant,
  // HSN codes
  createPlatformHsnCode, fetchPlatformHsnCodes, fetchPlatformHsnCode,
  updatePlatformHsnCode, deletePlatformHsnCode,
  // Product options
  createPlatformProductOption, fetchPlatformProductOptions,
  updatePlatformProductOption, deletePlatformProductOption,
  createPlatformProductOptionValue, fetchPlatformProductOptionValues,
  updatePlatformProductOptionValue, deletePlatformProductOptionValue,
  // Geography
  createPlatformGeography, fetchPlatformGeography, fetchPlatformGeographyDetail,
  updatePlatformGeography, deletePlatformGeography,
  // Content pages
  createPlatformContentPage, fetchPlatformContentPages,
  updatePlatformContentPage, deletePlatformContentPage,
  // Brands
  createPlatformBrand, fetchPlatformBrands, updatePlatformBrand, deletePlatformBrand,
  // Warranty templates
  createPlatformWarrantyTemplate, fetchPlatformWarrantyTemplates,
  updatePlatformWarrantyTemplate, deletePlatformWarrantyTemplate,
  // Dimensions
  createPlatformDimension, fetchPlatformDimensions,
  updatePlatformDimension, deletePlatformDimension,
  // Batches
  createPlatformBatch, fetchPlatformBatches, updatePlatformBatch, deletePlatformBatch,
  // Subscription plans (admin/platform path)
  createAdminPlatformSubscriptionPlan, fetchAdminPlatformSubscriptionPlans,
  fetchAdminPlatformSubscriptionPlan, updateAdminPlatformSubscriptionPlan,
  deleteAdminPlatformSubscriptionPlan, fetchAdminPlatformSubscriptions,
  updateAdminPlatformSubscriptionStatus,
  // Fee config
  createAdminFeeConfig, fetchAdminFeeConfigs, fetchAdminFeeConfig,
  updateAdminFeeConfig, deleteAdminFeeConfig,
  // KYC
  reviewUserKyc, reviewSellerKyc,
  // Returns
  approveReturn, refundReturn,
  // Warranty claims
  updateWarrantyClaimStatus,
} = adminThunks;
export default createApiSlice({ name: "admin", thunks: adminThunks }).reducer;
