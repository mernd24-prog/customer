import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  addRolePermission,
  createPermission,
  createRole,
  deletePermission,
  deleteRole,
  fetchPermissionSetupModules,
  fetchPermissions,
  fetchRoles,
  removeRolePermission,
  updatePermission,
  updateRole,
} from "../../features/rbac/rbacSlice";
import AdminShell from "./AdminShell";

const arr = (value) => (Array.isArray(value) ? value : []);
const idOf = (item) => item?.id || item?._id;

const permissionFormInitial = {
  id: "",
  moduleId: "",
  name: "",
  slug: "",
  description: "",
  action: "view",
};

const roleFormInitial = {
  id: "",
  name: "",
  slug: "",
  description: "",
};

export default function AdminRbacManagementPage() {
  const dispatch = useDispatch();
  const [permissionForm, setPermissionForm] = useState(permissionFormInitial);
  const [roleForm, setRoleForm] = useState(roleFormInitial);
  const [roleId, setRoleId] = useState("");
  const [permissionId, setPermissionId] = useState("");
  const [modules, setModules] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadModules = useCallback(async () => {
    const payload = await dispatch(
      fetchPermissionSetupModules({ params: { active: true } }),
    ).unwrap();
    const data = payload?.data || payload || {};
    setModules(arr(data.modules || data.items || data));
  }, [dispatch]);

  const loadPermissions = useCallback(async () => {
    const payload = await dispatch(fetchPermissions({ params: { limit: 500 } })).unwrap();
    const data = payload?.data || payload || {};
    setPermissions(arr(data.items || data.permissions || data));
  }, [dispatch]);

  const loadRoles = useCallback(async () => {
    const payload = await dispatch(fetchRoles({ params: { limit: 200 } })).unwrap();
    const data = payload?.data || payload || {};
    setRoles(arr(data.items || data.roles || data));
  }, [dispatch]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      await Promise.all([loadModules(), loadPermissions(), loadRoles()]);
    } catch (err) {
      setError(String(err?.message || err || "Failed to load RBAC data"));
    } finally {
      setLoading(false);
    }
  }, [loadModules, loadPermissions, loadRoles]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const reloadAfterMutation = async () => {
    await Promise.all([loadPermissions(), loadRoles()]);
  };

  return (
    <AdminShell title="RBAC Management">
      <div className="grid gap-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <form
            className="rounded-lg border border-slate-200 bg-white p-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              try {
                const payload = {
                  moduleId: permissionForm.moduleId,
                  name: permissionForm.name.trim(),
                  slug: permissionForm.slug.trim(),
                  description: permissionForm.description.trim() || undefined,
                  action: permissionForm.action,
                };
                if (permissionForm.id) {
                  await dispatch(
                    updatePermission({
                      permissionId: permissionForm.id,
                      data: payload,
                    }),
                  ).unwrap();
                } else {
                  await dispatch(createPermission({ data: payload })).unwrap();
                }
                setPermissionForm(permissionFormInitial);
                await loadPermissions();
              } catch (err) {
                setError(
                  String(
                    err?.message || err || "Failed to create/update permission",
                  ),
                );
              }
            }}
          >
            <p className="mb-2 text-sm font-semibold text-slate-700">
              {permissionForm.id ? "Edit Permission" : "Create Permission"}
            </p>
            <div className="grid gap-2">
              <select
                className="rounded border p-2"
                value={permissionForm.moduleId}
                onChange={(e) =>
                  setPermissionForm((v) => ({ ...v, moduleId: e.target.value }))
                }
                required
              >
                <option value="">Select Module</option>
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <input
                className="rounded border p-2"
                placeholder="Permission Name"
                value={permissionForm.name}
                onChange={(e) =>
                  setPermissionForm((v) => ({ ...v, name: e.target.value }))
                }
                required
              />
              <input
                className="rounded border p-2"
                placeholder="Slug (module:action)"
                value={permissionForm.slug}
                onChange={(e) =>
                  setPermissionForm((v) => ({ ...v, slug: e.target.value }))
                }
                required
              />
              <select
                className="rounded border p-2"
                value={permissionForm.action}
                onChange={(e) =>
                  setPermissionForm((v) => ({ ...v, action: e.target.value }))
                }
              >
                {[
                  "view",
                  "add",
                  "edit",
                  "update",
                  "action",
                  "delete",
                  "status",
                  "approval",
                ].map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              <textarea
                className="rounded border p-2"
                placeholder="Description"
                value={permissionForm.description}
                onChange={(e) =>
                  setPermissionForm((v) => ({
                    ...v,
                    description: e.target.value,
                  }))
                }
              />
              <div className="flex gap-2">
                <button className="rounded bg-slate-900 px-3 py-2 text-white" type="submit">
                  {permissionForm.id ? "Update Permission" : "Create Permission"}
                </button>
                {permissionForm.id && (
                  <button
                    type="button"
                    className="rounded bg-slate-200 px-3 py-2 text-slate-900"
                    onClick={() => setPermissionForm(permissionFormInitial)}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>
          </form>

          <form
            className="rounded-lg border border-slate-200 bg-white p-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              try {
                const payload = {
                  name: roleForm.name.trim(),
                  slug: roleForm.slug.trim(),
                  description: roleForm.description.trim() || undefined,
                };
                if (roleForm.id) {
                  await dispatch(
                    updateRole({
                      roleId: roleForm.id,
                      data: payload,
                    }),
                  ).unwrap();
                } else {
                  await dispatch(createRole({ data: payload })).unwrap();
                }
                setRoleForm(roleFormInitial);
                await loadRoles();
              } catch (err) {
                setError(String(err?.message || err || "Failed to create/update role"));
              }
            }}
          >
            <p className="mb-2 text-sm font-semibold text-slate-700">
              {roleForm.id ? "Edit Role" : "Create Role"}
            </p>
            <div className="grid gap-2">
              <input className="rounded border p-2" placeholder="Role Name" value={roleForm.name} onChange={(e) => setRoleForm((v) => ({ ...v, name: e.target.value }))} required />
              <input className="rounded border p-2" placeholder="Slug" value={roleForm.slug} onChange={(e) => setRoleForm((v) => ({ ...v, slug: e.target.value }))} required />
              <textarea className="rounded border p-2" placeholder="Description" value={roleForm.description} onChange={(e) => setRoleForm((v) => ({ ...v, description: e.target.value }))} />
              <div className="flex gap-2">
                <button className="rounded bg-slate-900 px-3 py-2 text-white" type="submit">
                  {roleForm.id ? "Update Role" : "Create Role"}
                </button>
                {roleForm.id && (
                  <button type="button" className="rounded bg-slate-200 px-3 py-2 text-slate-900" onClick={() => setRoleForm(roleFormInitial)}>
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="mb-2 text-sm font-semibold text-slate-700">Role-Permission Assignment</p>
          <div className="grid gap-2 lg:grid-cols-[1fr_1fr_auto_auto]">
            <select className="rounded border p-2" value={roleId} onChange={(e) => setRoleId(e.target.value)}>
              <option value="">Select Role</option>
              {roles.map((r) => (
                <option key={idOf(r)} value={idOf(r)}>
                  {r.name}
                </option>
              ))}
            </select>
            <select className="rounded border p-2" value={permissionId} onChange={(e) => setPermissionId(e.target.value)}>
              <option value="">Select Permission</option>
              {permissions.map((p) => (
                <option key={idOf(p)} value={idOf(p)}>
                  {p.slug || p.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="rounded bg-slate-900 px-3 py-2 text-white"
              onClick={async () => {
                if (!roleId || !permissionId) return;
                setError("");
                try {
                  await dispatch(addRolePermission({ roleId, data: { permissionId } })).unwrap();
                  await reloadAfterMutation();
                } catch (err) {
                  setError(String(err?.message || err || "Failed to assign permission"));
                }
              }}
            >
              Assign
            </button>
            <button
              type="button"
              className="rounded bg-rose-600 px-3 py-2 text-white"
              onClick={async () => {
                if (!roleId || !permissionId) return;
                setError("");
                try {
                  await dispatch(removeRolePermission({ roleId, data: { permissionId } })).unwrap();
                  await reloadAfterMutation();
                } catch (err) {
                  setError(String(err?.message || err || "Failed to remove permission"));
                }
              }}
            >
              Remove
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="mb-2 text-sm font-semibold text-slate-700">Permissions</p>
            <div className="max-h-96 overflow-auto">
              {permissions.map((p) => (
                <div key={idOf(p)} className="mb-2 flex items-center justify-between rounded border p-2">
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-slate-600">{p.slug}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="rounded bg-slate-200 px-2 py-1 text-xs text-slate-900"
                      onClick={() =>
                        setPermissionForm({
                          id: idOf(p),
                          moduleId: p.moduleId || "",
                          name: p.name || "",
                          slug: p.slug || "",
                          description: p.description || "",
                          action: p.action || "view",
                        })
                      }
                    >
                      Edit
                    </button>
                    <button
                      className="rounded bg-rose-600 px-2 py-1 text-xs text-white"
                      onClick={async () => {
                        setError("");
                        try {
                          await dispatch(deletePermission({ permissionId: idOf(p) })).unwrap();
                          if (permissionForm.id === idOf(p)) {
                            setPermissionForm(permissionFormInitial);
                          }
                          await loadPermissions();
                        } catch (err) {
                          setError(String(err?.message || err || "Failed to delete permission"));
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="mb-2 text-sm font-semibold text-slate-700">Roles</p>
            <div className="max-h-96 overflow-auto">
              {roles.map((r) => (
                <div key={idOf(r)} className="mb-2 flex items-center justify-between rounded border p-2">
                  <div>
                    <p className="text-sm font-medium">{r.name}</p>
                    <p className="text-xs text-slate-600">{r.slug}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="rounded bg-slate-200 px-2 py-1 text-xs text-slate-900"
                      onClick={() =>
                        setRoleForm({
                          id: idOf(r),
                          name: r.name || "",
                          slug: r.slug || "",
                          description: r.description || "",
                        })
                      }
                    >
                      Edit
                    </button>
                    <button
                      className="rounded bg-rose-600 px-2 py-1 text-xs text-white"
                      onClick={async () => {
                        setError("");
                        try {
                          await dispatch(deleteRole({ roleId: idOf(r) })).unwrap();
                          if (roleForm.id === idOf(r)) {
                            setRoleForm(roleFormInitial);
                          }
                          await loadRoles();
                        } catch (err) {
                          setError(String(err?.message || err || "Failed to delete role"));
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {loading && <p className="text-sm text-slate-600">Loading...</p>}
        {error && <p className="text-sm text-rose-700">{error}</p>}
      </div>
    </AdminShell>
  );
}
