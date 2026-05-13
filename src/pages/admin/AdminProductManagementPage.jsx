import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createAdminProduct,
  deleteAdminProduct,
  fetchAdminProducts,
  fetchPlatformCatalogPrefill,
  updateAdminProduct,
} from "../../features/admin/adminSlice";
import AdminShell from "./AdminShell";

const emptyForm = {
  _id: "",
  title: "",
  description: "",
  price: "",
  mrp: "",
  stock: "",
  category: "",
  brand: "",
  hsnCode: "",
  status: "draft",
  images: "",
};

const getId = (item) => item?._id || item?.id;

export default function AdminProductManagementPage() {
  const dispatch = useDispatch();
  const adminState = useSelector((s) => s.admin);
  const [form, setForm] = useState(emptyForm);
  const [query, setQuery] = useState("");

  const products = useMemo(() => adminState.list || [], [adminState.list]);
  const prefill = adminState.current?.prefill || adminState.current || {};

  const categories = prefill.categories || [];
  const brands = prefill.brands || [];
  const hsnCodes = prefill.hsnCodes || [];

  useEffect(() => {
    dispatch(fetchAdminProducts({ params: { limit: 50 } }));
    dispatch(fetchPlatformCatalogPrefill({ params: { include: "categories,brands,hsnCodes" } }));
  }, [dispatch]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      mrp: Number(form.mrp),
      stock: Number(form.stock),
      category: form.category,
      brand: form.brand || undefined,
      hsnCode: form.hsnCode || undefined,
      status: form.status,
      images: form.images
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    };

    if (form._id) {
      await dispatch(updateAdminProduct({ productId: form._id, data: payload })).unwrap();
    } else {
      await dispatch(createAdminProduct({ data: payload })).unwrap();
    }
    setForm(emptyForm);
    dispatch(fetchAdminProducts({ params: { limit: 50 } }));
  };

  const onEdit = (product) => {
    setForm({
      _id: getId(product),
      title: product.title || "",
      description: product.description || "",
      price: product.price ?? "",
      mrp: product.mrp ?? "",
      stock: product.stock ?? "",
      category: product.category || "",
      brand: product.brand || "",
      hsnCode: product.hsnCode || "",
      status: product.status || "draft",
      images: (product.images || []).join("\n"),
    });
  };

  const onDelete = async (productId) => {
    await dispatch(deleteAdminProduct({ productId })).unwrap();
    dispatch(fetchAdminProducts({ params: { limit: 50 } }));
  };

  const filtered = products.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <AdminShell title="Product Management">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
        <form onSubmit={onSubmit} className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="mb-3 text-sm font-semibold text-slate-700">
            {form._id ? "Update Product" : "Create Product"}
          </p>
          <div className="grid gap-2">
            <input className="rounded border p-2" placeholder="Title" value={form.title} onChange={(e) => setForm((v) => ({ ...v, title: e.target.value }))} required />
            <textarea className="rounded border p-2" placeholder="Description" value={form.description} onChange={(e) => setForm((v) => ({ ...v, description: e.target.value }))} required />
            <div className="grid grid-cols-3 gap-2">
              <input className="rounded border p-2" placeholder="Price" type="number" value={form.price} onChange={(e) => setForm((v) => ({ ...v, price: e.target.value }))} required />
              <input className="rounded border p-2" placeholder="MRP" type="number" value={form.mrp} onChange={(e) => setForm((v) => ({ ...v, mrp: e.target.value }))} required />
              <input className="rounded border p-2" placeholder="Stock" type="number" value={form.stock} onChange={(e) => setForm((v) => ({ ...v, stock: e.target.value }))} required />
            </div>
            <select className="rounded border p-2" value={form.category} onChange={(e) => setForm((v) => ({ ...v, category: e.target.value }))} required>
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.categoryKey || c.key} value={c.categoryKey || c.key}>
                  {c.title || c.name || c.categoryKey}
                </option>
              ))}
            </select>
            <select className="rounded border p-2" value={form.brand} onChange={(e) => setForm((v) => ({ ...v, brand: e.target.value }))}>
              <option value="">Select Brand</option>
              {brands.map((b) => (
                <option key={b._id || b.id} value={b.name || b.slug}>
                  {b.name || b.slug}
                </option>
              ))}
            </select>
            <select className="rounded border p-2" value={form.hsnCode} onChange={(e) => setForm((v) => ({ ...v, hsnCode: e.target.value }))}>
              <option value="">Select HSN</option>
              {hsnCodes.map((h) => (
                <option key={h.hsnCode || h.code} value={h.hsnCode || h.code}>
                  {(h.hsnCode || h.code) + (h.description ? ` - ${h.description}` : "")}
                </option>
              ))}
            </select>
            <select className="rounded border p-2" value={form.status} onChange={(e) => setForm((v) => ({ ...v, status: e.target.value }))}>
              <option value="draft">draft</option>
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </select>
            <textarea className="rounded border p-2" placeholder="Images (one URL per line)" value={form.images} onChange={(e) => setForm((v) => ({ ...v, images: e.target.value }))} />
            <div className="flex gap-2">
              <button className="rounded bg-slate-900 px-3 py-2 text-white" type="submit">
                {form._id ? "Update" : "Create"}
              </button>
              {form._id && (
                <button className="rounded bg-slate-200 px-3 py-2" type="button" onClick={() => setForm(emptyForm)}>
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
        </form>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-700">Products</p>
            <input className="rounded border p-2 text-sm" placeholder="Search products" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="max-h-[60vh] overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-slate-50">
                <tr>
                  <th className="p-2">Title</th>
                  <th className="p-2">Category</th>
                  <th className="p-2">Price</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={getId(product)} className="border-t">
                    <td className="p-2">{product.title}</td>
                    <td className="p-2">{product.category}</td>
                    <td className="p-2">{product.price}</td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <button className="rounded bg-slate-200 px-2 py-1" type="button" onClick={() => onEdit(product)}>Edit</button>
                        <button className="rounded bg-rose-600 px-2 py-1 text-white" type="button" onClick={() => onDelete(getId(product))}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {adminState.error && <p className="mt-2 text-sm text-rose-700">{String(adminState.error)}</p>}
        </div>
      </div>
    </AdminShell>
  );
}
