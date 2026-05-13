import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
} from "../../features/rbac/rbacSlice";
import AdminShell from "./AdminShell";

const permissionFormInitial = {
  moduleId: "",
  name: "",
  slug: "",
  description: "",
  action: "view",
};

const roleFormInitial = {
  name: "",
  slug: "",
  description: "",
};

export default function AdminRbacManagementPage() {
  const dispatch = useDispatch();
  const rbacState = useSelector((s) => s.rbac);
  const [permissionForm, setPermissionForm] = useState(permissionFormInitial);
  const [roleForm, setRoleForm] = useState(roleFormInitial);
  const [roleId, setRoleId] = useState("");
  const [permissionId, setPermissionId] = useState("");

  const permissions = useMemo(() => rbacState.list || [], [rbacState.list]);
  const modules = useMemo(() => rbacState.current?.modules || [], [rbacState.current]);
  const roles = useMemo(
    () => (Array.isArray(rbacState.current?.items) ? rbacState.current.items : rbacState.list || []),
    [rbacState.current, rbacState.list],
  );

  useEffect(() => {
    dispatch(fetchPermissions({ params: { limit: 200 } }));
    dispatch(fetchRoles({ params: { limit: 100 } }));
    dispatch(fetchPermissionSetupModules({ params: { active: true } }));
  }, [dispatch]);

  return (
    <AdminShell title="RBAC Management">
      <div className="grid gap-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <form
            className="rounded-lg border border-slate-200 bg-white p-4"
            onSubmit={async (e) => {
              e.preventDefault();
              await dispatch(createPermission({ data: permissionForm })).unwrap();
              setPermissionForm(permissionFormInitial);
              dispatch(fetchPermissions({ params: { limit: 200 } }));
            }}
          >
            <p className="mb-2 text-sm font-semibold text-slate-700">Create Permission</p>
            <div className="grid gap-2">
              <select className="rounded border p-2" value={permissionForm.moduleId} onChange={(e) => setPermissionForm((v) => ({ ...v, moduleId: e.target.value }))} required>
                <option value="">Select Module</option>
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              <input className="rounded border p-2" placeholder="Permission Name" value={permissionForm.name} onChange={(e) => setPermissionForm((v) => ({ ...v, name: e.target.value }))} required />
              <input className="rounded border p-2" placeholder="Slug (module:action)" value={permissionForm.slug} onChange={(e) => setPermissionForm((v) => ({ ...v, slug: e.target.value }))} required />
              <select className="rounded border p-2" value={permissionForm.action} onChange={(e) => setPermissionForm((v) => ({ ...v, action: e.target.value }))}>
                {["view", "add", "edit", "update", "action", "delete", "status", "approval"].map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              <textarea className="rounded border p-2" placeholder="Description" value={permissionForm.description} onChange={(e) => setPermissionForm((v) => ({ ...v, description: e.target.value }))} />
              <button className="rounded bg-slate-900 px-3 py-2 text-white" type="submit">Create Permission</button>
            </div>
          </form>

          <form
            className="rounded-lg border border-slate-200 bg-white p-4"
            onSubmit={async (e) => {
              e.preventDefault();
              await dispatch(createRole({ data: roleForm })).unwrap();
              setRoleForm(roleFormInitial);
              dispatch(fetchRoles({ params: { limit: 100 } }));
            }}
          >
            <p className="mb-2 text-sm font-semibold text-slate-700">Create Role</p>
            <div className="grid gap-2">
              <input className="rounded border p-2" placeholder="Role Name" value={roleForm.name} onChange={(e) => setRoleForm((v) => ({ ...v, name: e.target.value }))} required />
              <input className="rounded border p-2" placeholder="Slug" value={roleForm.slug} onChange={(e) => setRoleForm((v) => ({ ...v, slug: e.target.value }))} required />
              <textarea className="rounded border p-2" placeholder="Description" value={roleForm.description} onChange={(e) => setRoleForm((v) => ({ ...v, description: e.target.value }))} />
              <button className="rounded bg-slate-900 px-3 py-2 text-white" type="submit">Create Role</button>
            </div>
          </form>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="mb-2 text-sm font-semibold text-slate-700">Role-Permission Assignment</p>
          <div className="grid gap-2 lg:grid-cols-[1fr_1fr_auto_auto]">
            <select className="rounded border p-2" value={roleId} onChange={(e) => setRoleId(e.target.value)}>
              <option value="">Select Role</option>
              {roles.map((r) => (
                <option key={r.id || r._id} value={r.id || r._id}>{r.name}</option>
              ))}
            </select>
            <select className="rounded border p-2" value={permissionId} onChange={(e) => setPermissionId(e.target.value)}>
              <option value="">Select Permission</option>
              {permissions.map((p) => (
                <option key={p.id || p._id} value={p.id || p._id}>{p.slug || p.name}</option>
              ))}
            </select>
            <button type="button" className="rounded bg-slate-900 px-3 py-2 text-white" onClick={() => roleId && permissionId && dispatch(addRolePermission({ roleId, data: { permissionId } }))}>
              Assign
            </button>
            <button type="button" className="rounded bg-rose-600 px-3 py-2 text-white" onClick={() => roleId && permissionId && dispatch(removeRolePermission({ roleId, data: { permissionId } }))}>
              Remove
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="mb-2 text-sm font-semibold text-slate-700">Permissions</p>
            <div className="max-h-96 overflow-auto">
              {permissions.map((p) => (
                <div key={p.id || p._id} className="mb-2 flex items-center justify-between rounded border p-2">
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-slate-600">{p.slug}</p>
                  </div>
                  <button className="rounded bg-rose-600 px-2 py-1 text-xs text-white" onClick={() => dispatch(deletePermission({ permissionId: p.id || p._id }))}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="mb-2 text-sm font-semibold text-slate-700">Roles</p>
            <div className="max-h-96 overflow-auto">
              {roles.map((r) => (
                <div key={r.id || r._id} className="mb-2 flex items-center justify-between rounded border p-2">
                  <div>
                    <p className="text-sm font-medium">{r.name}</p>
                    <p className="text-xs text-slate-600">{r.slug}</p>
                  </div>
                  <button className="rounded bg-rose-600 px-2 py-1 text-xs text-white" onClick={() => dispatch(deleteRole({ roleId: r.id || r._id }))}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        {rbacState.error && <p className="text-sm text-rose-700">{String(rbacState.error)}</p>}
      </div>
    </AdminShell>
  );
}
