import { createApiSlice } from "../createApiSlice";
import { rbacThunks } from "../domainThunks";
export const { fetchPermissionSetupModules, fetchRbacModules, createRbacModule, updateRbacModule, deleteRbacModule, fetchPermissions, createPermission, updatePermission, deletePermission, fetchRoles, createRole, updateRole, deleteRole, fetchRolePermissions, addRolePermission, removeRolePermission, bulkRolePermissions, fetchUserPermissions, fetchUserEffectivePermissions, checkUserPermission, addUserPermission, removeUserPermission, bulkUserPermissions, fetchUserRoles, checkUserRole, addUserRole, removeUserRole, bulkUserRoles } = rbacThunks;
export default createApiSlice({ name: "rbac", thunks: rbacThunks }).reducer;
