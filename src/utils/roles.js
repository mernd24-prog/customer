export const SELLER_ROLES = ["seller", "seller-sub-admin"];
export const ADMIN_ROLES = ["admin", "sub-admin", "super-admin"];

export function getRole(user) {
  return user?.role || user?.user?.role || user?.account?.role;
}

export function isSellerRole(role) {
  return SELLER_ROLES.includes(role);
}

export function isAdminRole(role) {
  return ADMIN_ROLES.includes(role);
}
