import { createApiSlice } from "../createApiSlice";
import { rbacThunks } from "../domainThunks";
export const { fetchPermissionSetupModules, fetchRbacModules, createRbacModule, updateRbacModule, deleteRbacModule, fetchPermissions, createPermission, updatePermission, fetchRoles, createRole, updateRole, fetchRolePermissions, addRolePermission, removeRolePermission, bulkRolePermissions, fetchUserPermissions, fetchUserEffectivePermissions, checkUserPermission, addUserPermission, removeUserPermission, bulkUserPermissions, fetchUserRoles, checkUserRole, addUserRole, removeUserRole, bulkUserRoles } = rbacThunks;
export default createApiSlice({ name: "rbac", thunks: rbacThunks }).reducer;
