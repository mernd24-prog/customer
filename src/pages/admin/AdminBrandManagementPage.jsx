import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  createPlatformBrand,
  deletePlatformBrand,
  fetchPlatformBrands,
  updatePlatformBrand,
} from "../../features/admin/adminSlice";
import AdminShell from "./AdminShell";

const initialForm = { id: "", name: "", slug: "", description: "", logoUrl: "" };
const arr = (value) => (Array.isArray(value) ? value : []);

export default function AdminBrandManagementPage() {
  const dispatch = useDispatch();
  const [form, setForm] = useState(initialForm);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadBrands = useCallback(async () => {
    const payload = await dispatch(fetchPlatformBrands({ params: { limit: 100 } })).unwrap();
    const data = payload?.data || payload || {};
    setBrands(arr(data.items || data.brands || data));
  }, [dispatch]);

  useEffect(() => {
    setLoading(true);
    setError("");
    loadBrands()
      .catch((err) => setError(String(err?.message || err || "Failed to load brands")))
      .finally(() => setLoading(false));
  }, [loadBrands]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      description: form.description.trim() || undefined,
      logoUrl: form.logoUrl.trim() || undefined,
    };
    try {
      if (form.id) {
        await dispatch(updatePlatformBrand({ brandId: form.id, data: payload })).unwrap();
      } else {
        await dispatch(createPlatformBrand({ data: payload })).unwrap();
      }
      setForm(initialForm);
      await loadBrands();
    } catch (err) {
      setError(String(err?.message || err || "Failed to save brand"));
    }
  };

  const onDelete = async (brandId) => {
    setError("");
    try {
      await dispatch(deletePlatformBrand({ brandId })).unwrap();
      await loadBrands();
    } catch (err) {
      setError(String(err?.message || err || "Failed to delete brand"));
    }
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
              <button className="rounded bg-slate-900 px-3 py-2 text-white" type="submit">{form.id ? "Update" : "Create"}</button>
              {form.id && <button className="rounded bg-slate-200 px-3 py-2" type="button" onClick={() => setForm(initialForm)}>Cancel</button>}
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
                  <button
                    type="button"
                    className="rounded bg-slate-200 px-2 py-1 text-xs"
                    onClick={() =>
                      setForm({
                        id: brand._id || brand.id,
                        name: brand.name || "",
                        slug: brand.slug || "",
                        description: brand.description || "",
                        logoUrl: brand.logoUrl || "",
                      })
                    }
                  >
                    Edit
                  </button>
                  <button type="button" className="rounded bg-rose-600 px-2 py-1 text-xs text-white" onClick={() => onDelete(brand._id || brand.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          {loading && <p className="mt-2 text-sm text-slate-600">Loading...</p>}
          {error && <p className="mt-2 text-sm text-rose-700">{error}</p>}
        </div>
      </div>
    </AdminShell>
  );
}
