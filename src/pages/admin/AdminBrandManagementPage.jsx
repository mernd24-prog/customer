import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createPlatformBrand,
  deletePlatformBrand,
  fetchPlatformBrands,
  updatePlatformBrand,
} from "../../features/admin/adminSlice";
import AdminShell from "./AdminShell";

const initialForm = { id: "", name: "", slug: "", description: "", logoUrl: "" };

export default function AdminBrandManagementPage() {
  const dispatch = useDispatch();
  const adminState = useSelector((s) => s.admin);
  const [form, setForm] = useState(initialForm);
  const brands = useMemo(() => adminState.list || [], [adminState.list]);

  useEffect(() => {
    dispatch(fetchPlatformBrands({ params: { limit: 100 } }));
  }, [dispatch]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      slug: form.slug || undefined,
      description: form.description || undefined,
      logoUrl: form.logoUrl || undefined,
    };
    if (form.id) {
      await dispatch(updatePlatformBrand({ brandId: form.id, data: payload })).unwrap();
    } else {
      await dispatch(createPlatformBrand({ data: payload })).unwrap();
    }
    setForm(initialForm);
    dispatch(fetchPlatformBrands({ params: { limit: 100 } }));
  };

  return (
    <AdminShell title="Brand Management">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <form onSubmit={onSubmit} className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="mb-3 text-sm font-semibold text-slate-700">{form.id ? "Update Brand" : "Create Brand"}</p>
          <div className="grid gap-2">
            <input className="rounded border p-2" placeholder="Brand Name" value={form.name} onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))} required />
            <input className="rounded border p-2" placeholder="Slug" value={form.slug} onChange={(e) => setForm((v) => ({ ...v, slug: e.target.value }))} />
            <textarea className="rounded border p-2" placeholder="Description" value={form.description} onChange={(e) => setForm((v) => ({ ...v, description: e.target.value }))} />
            <input className="rounded border p-2" placeholder="Logo URL" value={form.logoUrl} onChange={(e) => setForm((v) => ({ ...v, logoUrl: e.target.value }))} />
            <div className="flex gap-2">
              <button className="rounded bg-slate-900 px-3 py-2 text-white" type="submit">
                {form.id ? "Update" : "Create"}
              </button>
              {form.id && (
                <button className="rounded bg-slate-200 px-3 py-2" type="button" onClick={() => setForm(initialForm)}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="mb-2 text-sm font-semibold text-slate-700">Brand List</p>
          <div className="max-h-[60vh] overflow-auto">
            {brands.map((brand) => (
              <div key={brand._id || brand.id} className="mb-2 flex items-center justify-between rounded border p-3">
                <div>
                  <p className="font-medium">{brand.name}</p>
                  <p className="text-xs text-slate-600">{brand.slug}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="rounded bg-slate-200 px-2 py-1 text-xs" onClick={() => setForm({ id: brand._id || brand.id, name: brand.name || "", slug: brand.slug || "", description: brand.description || "", logoUrl: brand.logoUrl || "" })}>
                    Edit
                  </button>
                  <button type="button" className="rounded bg-rose-600 px-2 py-1 text-xs text-white" onClick={async () => {
                    await dispatch(deletePlatformBrand({ brandId: brand._id || brand.id })).unwrap();
                    dispatch(fetchPlatformBrands({ params: { limit: 100 } }));
                  }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          {adminState.error && <p className="mt-2 text-sm text-rose-700">{String(adminState.error)}</p>}
        </div>
      </div>
    </AdminShell>
  );
}
