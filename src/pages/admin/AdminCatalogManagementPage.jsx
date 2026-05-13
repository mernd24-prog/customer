import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import {
  createPlatformBatch,
  createPlatformBrand,
  createPlatformCategory,
  createPlatformDimension,
  createPlatformHsnCode,
  createPlatformProductFamily,
  createPlatformProductOption,
  createPlatformProductOptionValue,
  createPlatformProductVariant,
  createPlatformWarrantyTemplate,
  deletePlatformBatch,
  deletePlatformBrand,
  deletePlatformCategory,
  deletePlatformDimension,
  deletePlatformHsnCode,
  deletePlatformProductFamily,
  deletePlatformProductOption,
  deletePlatformProductOptionValue,
  deletePlatformProductVariant,
  deletePlatformWarrantyTemplate,
  fetchPlatformBatches,
  fetchPlatformBrands,
  fetchPlatformCategories,
  fetchPlatformDimensions,
  fetchPlatformHsnCodes,
  fetchPlatformProductFamilies,
  fetchPlatformProductOptions,
  fetchPlatformProductOptionValues,
  fetchPlatformProductVariants,
  fetchPlatformWarrantyTemplates,
  updatePlatformBatch,
  updatePlatformBrand,
  updatePlatformCategory,
  updatePlatformDimension,
  updatePlatformHsnCode,
  updatePlatformProductFamily,
  updatePlatformProductOption,
  updatePlatformProductOptionValue,
  updatePlatformProductVariant,
  updatePlatformWarrantyTemplate,
} from "../../features/admin/adminSlice";
import AdminShell from "./AdminShell";

const arr = (value) => (Array.isArray(value) ? value : []);

const sections = [
  {
    key: "category",
    title: "Categories",
    fetchThunk: fetchPlatformCategories,
    createThunk: createPlatformCategory,
    updateThunk: updatePlatformCategory,
    deleteThunk: deletePlatformCategory,
    argKey: "categoryKey",
    sample: { categoryKey: "sports", title: "Sports", active: true },
    itemId: (item) => item.categoryKey || item.key,
  },
  {
    key: "brand",
    title: "Brands",
    fetchThunk: fetchPlatformBrands,
    createThunk: createPlatformBrand,
    updateThunk: updatePlatformBrand,
    deleteThunk: deletePlatformBrand,
    argKey: "brandId",
    sample: { name: "FitZone", slug: "fitzone", description: "Sports nutrition brand", active: true },
    itemId: (item) => item.id || item._id,
  },
  {
    key: "family",
    title: "Families",
    fetchThunk: fetchPlatformProductFamilies,
    createThunk: createPlatformProductFamily,
    updateThunk: updatePlatformProductFamily,
    deleteThunk: deletePlatformProductFamily,
    argKey: "familyCode",
    sample: { familyCode: "apparel", title: "Apparel", active: true },
    itemId: (item) => item.familyCode,
  },
  {
    key: "variant",
    title: "Variants",
    fetchThunk: fetchPlatformProductVariants,
    createThunk: createPlatformProductVariant,
    updateThunk: updatePlatformProductVariant,
    deleteThunk: deletePlatformProductVariant,
    argKey: "variantId",
    sample: {
      title: "XS / Black",
      productFamilyCode: "apparel",
      attributes: { size: "XS", color: "Black" },
      active: true,
    },
    itemId: (item) => item.id || item._id,
  },
  {
    key: "dimension",
    title: "Dimensions",
    fetchThunk: fetchPlatformDimensions,
    createThunk: createPlatformDimension,
    updateThunk: updatePlatformDimension,
    deleteThunk: deletePlatformDimension,
    argKey: "dimensionId",
    sample: { dimensions_value: "S / M / L", active: true },
    itemId: (item) => item.id || item._id,
  },
  {
    key: "hsn",
    title: "HSN / Tax",
    fetchThunk: fetchPlatformHsnCodes,
    createThunk: createPlatformHsnCode,
    updateThunk: updatePlatformHsnCode,
    deleteThunk: deletePlatformHsnCode,
    argKey: "hsnCode",
    sample: { hsnCode: "6109", description: "T-shirts", gstRate: 12, active: true },
    itemId: (item) => item.hsnCode || item.code,
  },
  {
    key: "warranty",
    title: "Warranty Templates",
    fetchThunk: fetchPlatformWarrantyTemplates,
    createThunk: createPlatformWarrantyTemplate,
    updateThunk: updatePlatformWarrantyTemplate,
    deleteThunk: deletePlatformWarrantyTemplate,
    argKey: "templateId",
    sample: { name: "Standard 1 Year", durationMonths: 12, terms: "Manufacturing defects only", active: true },
    itemId: (item) => item.id || item._id,
  },
  {
    key: "batch",
    title: "Batches",
    fetchThunk: fetchPlatformBatches,
    createThunk: createPlatformBatch,
    updateThunk: updatePlatformBatch,
    deleteThunk: deletePlatformBatch,
    argKey: "batchId",
    sample: { batchCode: "BT-2026-001", batchNumber: "2026-001", active: true },
    itemId: (item) => item.id || item._id,
  },
  {
    key: "option",
    title: "Product Options",
    fetchThunk: fetchPlatformProductOptions,
    createThunk: createPlatformProductOption,
    updateThunk: updatePlatformProductOption,
    deleteThunk: deletePlatformProductOption,
    argKey: "optionId",
    sample: { name: "Size", slug: "size", displayType: "dropdown", active: true },
    itemId: (item) => item.id || item._id,
  },
  {
    key: "value",
    title: "Product Option Values",
    fetchThunk: fetchPlatformProductOptionValues,
    createThunk: createPlatformProductOptionValue,
    updateThunk: updatePlatformProductOptionValue,
    deleteThunk: deletePlatformProductOptionValue,
    argKey: "optionValueId",
    sample: {
      optionId: "OPTION_UUID",
      value: "XS",
      label: "Extra Small",
      sortOrder: 0,
      active: true,
    },
    itemId: (item) => item.id || item._id,
  },
];

export default function AdminCatalogManagementPage() {
  const dispatch = useDispatch();
  const [activeKey, setActiveKey] = useState(sections[0].key);
  const active = useMemo(
    () => sections.find((s) => s.key === activeKey) || sections[0],
    [activeKey],
  );
  const [payload, setPayload] = useState(JSON.stringify(sections[0].sample, null, 2));
  const [editingId, setEditingId] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setEditingId("");
    setPayload(JSON.stringify(active.sample, null, 2));
  }, [active]);

  const loadItems = useCallback(async () => {
    const response = await dispatch(active.fetchThunk({ params: { limit: 100 } })).unwrap();
    const data = response?.data || response || {};
    setItems(arr(data.items || data.results || data));
  }, [active, dispatch]);

  useEffect(() => {
    setLoading(true);
    setError("");
    loadItems()
      .catch((err) =>
        setError(String(err?.message || err || `Failed to load ${active.title}`)),
      )
      .finally(() => setLoading(false));
  }, [active, loadItems]);

  const onCreateOrUpdate = async () => {
    setError("");
    try {
      const parsed = JSON.parse(payload);
      if (editingId) {
        await dispatch(
          active.updateThunk({ [active.argKey]: editingId, data: parsed }),
        ).unwrap();
        setEditingId("");
      } else {
        await dispatch(active.createThunk({ data: parsed })).unwrap();
      }
      await loadItems();
    } catch (err) {
      setError(String(err?.message || err || "Invalid JSON or mutation failed"));
    }
  };

  const onDelete = async (item) => {
    setError("");
    const id = active.itemId(item);
    if (!id) {
      setError("Cannot delete: missing id/key in selected item.");
      return;
    }
    try {
      await dispatch(active.deleteThunk({ [active.argKey]: id })).unwrap();
      if (editingId === id) {
        setEditingId("");
        setPayload(JSON.stringify(active.sample, null, 2));
      }
      await loadItems();
    } catch (err) {
      setError(String(err?.message || err || "Delete failed"));
    }
  };

  return (
    <AdminShell title="Catalog Masters">
      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-semibold">Recommended Product Setup Flow</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Create `Categories` with `attributeSchema` (this is your attributes source).</li>
          <li>Create `Brands` and `Families` (family defines base attributes + variant axes).</li>
          <li>Create `Options` and `Option Values`, then create `Variants`.</li>
          <li>Create `Dimensions`, `HSN/Tax`, `Warranty Templates`, and `Batches`.</li>
          <li>Finally create Products in `/admin/products` using these master keys.</li>
        </ol>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {sections.map((section) => (
          <button
            key={section.key}
            type="button"
            onClick={() => setActiveKey(section.key)}
            className={`rounded px-3 py-1.5 text-sm ${
              section.key === active.key
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-800"
            }`}
          >
            {section.title}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="mb-2 text-sm font-semibold text-slate-700">
            {editingId ? `Edit ${active.title} (${editingId})` : `Create ${active.title}`}{" "}
            (JSON)
          </p>
          <textarea
            className="h-72 w-full rounded border p-2 font-mono text-xs"
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              className="rounded bg-slate-900 px-3 py-2 text-white"
              onClick={onCreateOrUpdate}
            >
              {editingId ? "Update" : "Create"}
            </button>
            {editingId && (
              <button
                type="button"
                className="rounded bg-slate-200 px-3 py-2 text-slate-900"
                onClick={() => {
                  setEditingId("");
                  setPayload(JSON.stringify(active.sample, null, 2));
                }}
              >
                Cancel Edit
              </button>
            )}
          </div>
          {error && <p className="mt-2 text-sm text-rose-700">{error}</p>}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="mb-2 text-sm font-semibold text-slate-700">
            {active.title} List
          </p>
          <div className="max-h-[60vh] overflow-auto">
            {items.map((item, index) => {
              const id = active.itemId(item);
              return (
                <div key={id || index} className="mb-2 rounded border p-2">
                  <pre className="overflow-auto text-xs">
                    {JSON.stringify(item, null, 2)}
                  </pre>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      className="rounded bg-slate-200 px-2 py-1 text-xs text-slate-900"
                      onClick={() => {
                        if (!id) {
                          setError(
                            "Cannot edit: missing id/key in selected item.",
                          );
                          return;
                        }
                        setEditingId(id);
                        setPayload(JSON.stringify(item, null, 2));
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="rounded bg-rose-600 px-2 py-1 text-xs text-white"
                      onClick={() => onDelete(item)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {loading && <p className="mt-2 text-sm text-slate-600">Loading...</p>}
        </div>
      </div>
    </AdminShell>
  );
}
