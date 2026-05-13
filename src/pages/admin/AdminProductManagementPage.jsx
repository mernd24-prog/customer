import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import {
  createAdminProduct,
  deleteAdminProduct,
  fetchAdminProducts,
  fetchPlatformBatches,
  fetchPlatformCatalogPrefill,
  fetchPlatformDimensions,
  fetchPlatformProductFamilies,
  fetchPlatformProductOptions,
  fetchPlatformProductOptionValues,
  fetchPlatformWarrantyTemplates,
  updateAdminProduct,
} from "../../features/admin/adminSlice";
import AdminShell from "./AdminShell";

const arr = (value) => (Array.isArray(value) ? value : []);
const idOf = (item) => item?._id || item?.id;

const emptyForm = {
  id: "",
  title: "",
  description: "",
  price: "",
  mrp: "",
  stock: "",
  category: "",
  brand: "",
  hsnCode: "",
  productFamilyCode: "",
  batchCode: "",
  status: "draft",
  attributesJson: "{}",
  optionsJson: "[]",
  variantsJson: "[]",
  dimensionsJson: "{\"unit\":\"cm\"}",
  warrantyJson: "{}",
  images: "",
};

export default function AdminProductManagementPage() {
  const dispatch = useDispatch();
  const [form, setForm] = useState(emptyForm);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [hsnCodes, setHsnCodes] = useState([]);
  const [families, setFamilies] = useState([]);
  const [options, setOptions] = useState([]);
  const [optionValues, setOptionValues] = useState([]);
  const [dimensions, setDimensions] = useState([]);
  const [warrantyTemplates, setWarrantyTemplates] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const unpackList = (payload) => {
    const data = payload?.data || payload || {};
    return arr(data.items || data.results || data.products || data);
  };

  const loadProducts = useCallback(async () => {
    const payload = await dispatch(fetchAdminProducts({ params: { limit: 100 } })).unwrap();
    setProducts(unpackList(payload));
  }, [dispatch]);

  const loadMasters = useCallback(async () => {
    const prefill = await dispatch(
      fetchPlatformCatalogPrefill({
        params: { include: "categories,brands,hsnCodes" },
      }),
    ).unwrap();
    const prefillData = prefill?.data?.prefill || prefill?.data || prefill || {};
    setCategories(arr(prefillData.categories));
    setBrands(arr(prefillData.brands));
    setHsnCodes(arr(prefillData.hsnCodes));

    const [fams, opts, vals, dims, warranties, batchRows] = await Promise.all([
      dispatch(fetchPlatformProductFamilies({ params: { limit: 200 } })).unwrap(),
      dispatch(fetchPlatformProductOptions({ params: { limit: 200 } })).unwrap(),
      dispatch(fetchPlatformProductOptionValues({ params: { limit: 500 } })).unwrap(),
      dispatch(fetchPlatformDimensions({ params: { limit: 200 } })).unwrap(),
      dispatch(fetchPlatformWarrantyTemplates({ params: { limit: 200 } })).unwrap(),
      dispatch(fetchPlatformBatches({ params: { limit: 200 } })).unwrap(),
    ]);

    setFamilies(unpackList(fams));
    setOptions(unpackList(opts));
    setOptionValues(unpackList(vals));
    setDimensions(unpackList(dims));
    setWarrantyTemplates(unpackList(warranties));
    setBatches(unpackList(batchRows));
  }, [dispatch]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      await Promise.all([loadProducts(), loadMasters()]);
    } catch (err) {
      setError(String(err?.message || err || "Failed to load product management"));
    } finally {
      setLoading(false);
    }
  }, [loadMasters, loadProducts]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        mrp: Number(form.mrp),
        stock: Number(form.stock),
        category: form.category,
        brand: form.brand || undefined,
        hsnCode: form.hsnCode || undefined,
        productFamilyCode: form.productFamilyCode || undefined,
        status: form.status,
        attributes: JSON.parse(form.attributesJson || "{}"),
        options: JSON.parse(form.optionsJson || "[]"),
        variants: JSON.parse(form.variantsJson || "[]"),
        dimensions: JSON.parse(form.dimensionsJson || "{}"),
        warranty: JSON.parse(form.warrantyJson || "{}"),
        metadata: { batchCode: form.batchCode || undefined },
        images: form.images
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
      };

      if (form.id) {
        await dispatch(updateAdminProduct({ productId: form.id, data: payload })).unwrap();
      } else {
        await dispatch(createAdminProduct({ data: payload })).unwrap();
      }
      setForm(emptyForm);
      await loadProducts();
    } catch (err) {
      setError(String(err?.message || err || "Failed to save product"));
    }
  };

  const onDelete = async (productId) => {
    setError("");
    try {
      await dispatch(deleteAdminProduct({ productId })).unwrap();
      await loadProducts();
    } catch (err) {
      setError(String(err?.message || err || "Failed to delete product"));
    }
  };

  const filtered = useMemo(
    () =>
      products.filter((item) =>
        JSON.stringify(item || {}).toLowerCase().includes(query.toLowerCase()),
      ),
    [products, query],
  );

  return (
    <AdminShell title="Product Management">
      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-semibold">Clear Product Flow</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Choose Category (attributes come from category `attributeSchema`).</li>
          <li>Choose Brand + Family + HSN + Batch.</li>
          <li>Set Attributes JSON, then Options JSON, then Variants JSON.</li>
          <li>Set Dimensions + Warranty JSON and finally save product.</li>
        </ol>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1.3fr]">
        <form onSubmit={onSubmit} className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="mb-3 text-sm font-semibold text-slate-700">
            {form.id ? "Update Product" : "Create Product"}
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
                  {c.title || c.name || c.categoryKey || c.key}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-2">
              <select className="rounded border p-2" value={form.brand} onChange={(e) => setForm((v) => ({ ...v, brand: e.target.value }))}>
                <option value="">Select Brand</option>
                {brands.map((b) => (
                  <option key={b._id || b.id} value={b.name || b.slug}>
                    {b.name || b.slug}
                  </option>
                ))}
              </select>
              <select className="rounded border p-2" value={form.productFamilyCode} onChange={(e) => setForm((v) => ({ ...v, productFamilyCode: e.target.value }))}>
                <option value="">Select Family</option>
                {families.map((f) => (
                  <option key={f.familyCode || f._id || f.id} value={f.familyCode}>
                    {f.familyCode} {f.title ? `- ${f.title}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select className="rounded border p-2" value={form.hsnCode} onChange={(e) => setForm((v) => ({ ...v, hsnCode: e.target.value }))}>
                <option value="">Select HSN</option>
                {hsnCodes.map((h) => (
                  <option key={h.hsnCode || h.code} value={h.hsnCode || h.code}>
                    {(h.hsnCode || h.code) + (h.description ? ` - ${h.description}` : "")}
                  </option>
                ))}
              </select>
              <select className="rounded border p-2" value={form.batchCode} onChange={(e) => setForm((v) => ({ ...v, batchCode: e.target.value }))}>
                <option value="">Select Batch</option>
                {batches.map((b) => (
                  <option key={b.batchCode || b._id || b.id} value={b.batchCode || b.batchNumber}>
                    {b.batchCode || b.batchNumber}
                  </option>
                ))}
              </select>
            </div>

            <select className="rounded border p-2" value={form.status} onChange={(e) => setForm((v) => ({ ...v, status: e.target.value }))}>
              <option value="draft">draft</option>
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </select>

            <textarea className="rounded border p-2 font-mono text-xs" rows={4} placeholder="attributes JSON" value={form.attributesJson} onChange={(e) => setForm((v) => ({ ...v, attributesJson: e.target.value }))} />
            <textarea className="rounded border p-2 font-mono text-xs" rows={4} placeholder="options JSON" value={form.optionsJson} onChange={(e) => setForm((v) => ({ ...v, optionsJson: e.target.value }))} />
            <textarea className="rounded border p-2 font-mono text-xs" rows={5} placeholder="variants JSON" value={form.variantsJson} onChange={(e) => setForm((v) => ({ ...v, variantsJson: e.target.value }))} />
            <textarea className="rounded border p-2 font-mono text-xs" rows={3} placeholder="dimensions JSON" value={form.dimensionsJson} onChange={(e) => setForm((v) => ({ ...v, dimensionsJson: e.target.value }))} />
            <textarea className="rounded border p-2 font-mono text-xs" rows={3} placeholder="warranty JSON" value={form.warrantyJson} onChange={(e) => setForm((v) => ({ ...v, warrantyJson: e.target.value }))} />
            <textarea className="rounded border p-2" placeholder="Images (one URL per line)" value={form.images} onChange={(e) => setForm((v) => ({ ...v, images: e.target.value }))} />

            <div className="flex gap-2">
              <button className="rounded bg-slate-900 px-3 py-2 text-white" type="submit">
                {form.id ? "Update" : "Create"}
              </button>
              {form.id && (
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
                  <tr key={idOf(product)} className="border-t">
                    <td className="p-2">{product.title}</td>
                    <td className="p-2">{product.category}</td>
                    <td className="p-2">{product.price}</td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <button
                          className="rounded bg-slate-200 px-2 py-1"
                          type="button"
                          onClick={() =>
                            setForm({
                              id: idOf(product),
                              title: product.title || "",
                              description: product.description || "",
                              price: product.price ?? "",
                              mrp: product.mrp ?? "",
                              stock: product.stock ?? "",
                              category: product.category || "",
                              brand: product.brand || "",
                              hsnCode: product.hsnCode || "",
                              productFamilyCode: product.productFamilyCode || "",
                              batchCode: product.metadata?.batchCode || "",
                              status: product.status || "draft",
                              attributesJson: JSON.stringify(product.attributes || {}, null, 2),
                              optionsJson: JSON.stringify(product.options || [], null, 2),
                              variantsJson: JSON.stringify(product.variants || [], null, 2),
                              dimensionsJson: JSON.stringify(product.dimensions || { unit: "cm" }, null, 2),
                              warrantyJson: JSON.stringify(product.warranty || {}, null, 2),
                              images: arr(product.images).join("\n"),
                            })
                          }
                        >
                          Edit
                        </button>
                        <button className="rounded bg-rose-600 px-2 py-1 text-white" type="button" onClick={() => onDelete(idOf(product))}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {loading && <p className="mt-2 text-sm text-slate-600">Loading...</p>}
          {error && <p className="mt-2 text-sm text-rose-700">{error}</p>}
        </div>
      </div>

      <details className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
        <summary className="cursor-pointer text-sm font-semibold text-slate-700">
          Master Data Snapshot (Options / OptionValues / Dimensions / Warranty)
        </summary>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <pre className="max-h-52 overflow-auto rounded bg-slate-50 p-2 text-xs">{JSON.stringify(options.slice(0, 20), null, 2)}</pre>
          <pre className="max-h-52 overflow-auto rounded bg-slate-50 p-2 text-xs">{JSON.stringify(optionValues.slice(0, 20), null, 2)}</pre>
          <pre className="max-h-52 overflow-auto rounded bg-slate-50 p-2 text-xs">{JSON.stringify(dimensions.slice(0, 20), null, 2)}</pre>
          <pre className="max-h-52 overflow-auto rounded bg-slate-50 p-2 text-xs">{JSON.stringify(warrantyTemplates.slice(0, 20), null, 2)}</pre>
        </div>
      </details>
    </AdminShell>
  );
}
