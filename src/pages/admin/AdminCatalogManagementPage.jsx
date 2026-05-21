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
  deletePlatformBatch,
  deletePlatformBrand,
  deletePlatformCategory,
  deletePlatformDimension,
  deletePlatformHsnCode,
  deletePlatformProductFamily,
  deletePlatformProductOption,
  deletePlatformProductOptionValue,
  fetchPlatformBatches,
  fetchPlatformBrands,
  fetchPlatformCategories,
  fetchPlatformDimensions,
  fetchPlatformHsnCodes,
  fetchPlatformProductFamilies,
  fetchPlatformProductOptions,
  fetchPlatformProductOptionValues,
  fetchPlatformWarrantyTemplates,
  createPlatformWarrantyTemplate,
  updatePlatformBatch,
  updatePlatformBrand,
  updatePlatformCategory,
  updatePlatformDimension,
  updatePlatformHsnCode,
  updatePlatformProductFamily,
  updatePlatformProductOption,
  updatePlatformProductOptionValue,
  updatePlatformWarrantyTemplate,
  deletePlatformWarrantyTemplate,
} from "../../features/admin/adminSlice";
import AdminShell from "./AdminShell";

const arr = (value) => (Array.isArray(value) ? value : []);
const idOf = (item) => item?.id || item?._id;
const slugify = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const unpackList = (payload) => {
  const data = payload?.data || payload || {};
  return arr(data.items || data.results || data.products || data);
};

const defaultForms = {
  category: {
    categoryKey: "",
    title: "",
    parentKey: "",
    level: 0,
    categoryAttributes: [],
    active: true,
    sortOrder: 0,
    imageUrl: "",
  },
  brand: { name: "", slug: "", description: "", logo: "", imageUrl: "", active: true, sortOrder: 0 },
  family: { familyCode: "", sellerId: "platform", title: "", category: "", variantAxes: [], active: true },
  dimension: { dimensions_value: "", active: true },
  hsn: { code: "", description: "", gstRate: 18, cessRate: 0, taxType: "gst", category: "", active: true },
  warranty: { period: "", durationMonths: "", terms: "", active: true },
  batch: { batchCode: "", manufactureDate: "", expiryDate: "", active: true },
  option: { name: "", slug: "", displayType: "button", description: "", active: true },
  value: { optionId: "", name: "", valueCode: "", colorHex: "", imageUrl: "", sortOrder: 0, active: true },
};

const sections = [
  { key: "category", title: "Categories", fetchThunk: fetchPlatformCategories, createThunk: createPlatformCategory, updateThunk: updatePlatformCategory, deleteThunk: deletePlatformCategory, argKey: "categoryKey", itemId: (item) => item.categoryKey || item.key },
  { key: "brand", title: "Brands", fetchThunk: fetchPlatformBrands, createThunk: createPlatformBrand, updateThunk: updatePlatformBrand, deleteThunk: deletePlatformBrand, argKey: "brandId", itemId: idOf },
  { key: "family", title: "Families", fetchThunk: fetchPlatformProductFamilies, createThunk: createPlatformProductFamily, updateThunk: updatePlatformProductFamily, deleteThunk: deletePlatformProductFamily, argKey: "familyCode", itemId: (item) => item.familyCode },
  { key: "dimension", title: "Dimensions", fetchThunk: fetchPlatformDimensions, createThunk: createPlatformDimension, updateThunk: updatePlatformDimension, deleteThunk: deletePlatformDimension, argKey: "dimensionId", itemId: idOf },
  { key: "hsn", title: "HSN / Tax", fetchThunk: fetchPlatformHsnCodes, createThunk: createPlatformHsnCode, updateThunk: updatePlatformHsnCode, deleteThunk: deletePlatformHsnCode, argKey: "hsnCode", itemId: (item) => item.hsnCode || item.code },
  { key: "warranty", title: "Warranty", fetchThunk: fetchPlatformWarrantyTemplates, createThunk: createPlatformWarrantyTemplate, updateThunk: updatePlatformWarrantyTemplate, deleteThunk: deletePlatformWarrantyTemplate, argKey: "templateId", itemId: idOf },
  { key: "batch", title: "Batches", fetchThunk: fetchPlatformBatches, createThunk: createPlatformBatch, updateThunk: updatePlatformBatch, deleteThunk: deletePlatformBatch, argKey: "batchId", itemId: idOf },
  { key: "option", title: "Attributes", fetchThunk: fetchPlatformProductOptions, createThunk: createPlatformProductOption, updateThunk: updatePlatformProductOption, deleteThunk: deletePlatformProductOption, argKey: "optionId", itemId: idOf },
  { key: "value", title: "Attribute Values", fetchThunk: fetchPlatformProductOptionValues, createThunk: createPlatformProductOptionValue, updateThunk: updatePlatformProductOptionValue, deleteThunk: deletePlatformProductOptionValue, argKey: "optionValueId", itemId: idOf },
];

function attributeKey(option = {}) {
  return String(option.slug || option.name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function optionValuesFor(optionId, optionValues = []) {
  return optionValues
    .filter((value) => String(value.optionId || value.option_id || "") === String(optionId || ""))
    .map((value) => value.name)
    .filter(Boolean);
}

function buildCategoryAttribute(option, optionValues = [], existing = {}) {
  const optionId = idOf(option);
  const values = optionValuesFor(optionId, optionValues);
  return {
    key: existing.key || attributeKey(option),
    label: existing.label || option.name,
    type: existing.type || (values.length ? "select" : "text"),
    required: existing.required === true,
    options: existing.options || values,
    unit: existing.unit || "",
    isVariantAttribute: existing.isVariantAttribute === true,
    isFilterable: existing.isFilterable ?? values.length > 0,
    isSearchable: existing.isSearchable ?? true,
    platformOptionId: existing.platformOptionId || optionId,
  };
}

function buildPayload(key, form) {
  if (key === "category") {
    return {
      categoryKey: form.categoryKey || slugify(form.title),
      title: form.title,
      parentKey: form.parentKey || "",
      level: Number(form.level) || 0,
      attributeSchema: arr(form.categoryAttributes).map((attribute) => ({
        ...attribute,
        options: arr(attribute.options),
      })),
      active: form.active,
      sortOrder: Number(form.sortOrder) || 0,
      imageUrl: form.imageUrl || "",
    };
  }
  if (key === "brand") {
    return { ...form, slug: form.slug || slugify(form.name), sortOrder: Number(form.sortOrder) || 0 };
  }
  if (key === "family") {
    return {
      familyCode: form.familyCode || slugify(form.title),
      sellerId: form.sellerId || "platform",
      title: form.title,
      category: form.category,
      variantAxes: arr(form.variantAxes),
      status: form.active ? "active" : "inactive",
    };
  }
  if (key === "hsn") return { ...form, gstRate: Number(form.gstRate) || 0, cessRate: Number(form.cessRate) || 0 };
  if (key === "warranty") {
    return {
      period: form.period,
      active: form.active,
      metadata: {
        durationMonths: form.durationMonths ? Number(form.durationMonths) : undefined,
        terms: form.terms || undefined,
      },
    };
  }
  if (key === "batch") {
    return {
      batchCode: form.batchCode,
      manufactureDate: Number(form.manufactureDate),
      expiryDate: Number(form.expiryDate),
      active: form.active,
    };
  }
  if (key === "option") return { ...form, slug: form.slug || slugify(form.name).replace(/-/g, "_") };
  if (key === "value") return { ...form, sortOrder: Number(form.sortOrder) || 0 };
  return form;
}

function formFromItem(key, item) {
  if (!item) return defaultForms[key];
  if (key === "category") {
    return {
      ...defaultForms.category,
      ...item,
      categoryAttributes: arr(item.attributeSchema),
    };
  }
  if (key === "family") {
    return {
      ...defaultForms.family,
      ...item,
      active: item.status !== "inactive",
      variantAxes: arr(item.variantAxes),
    };
  }
  if (key === "warranty") {
    return {
      ...defaultForms.warranty,
      period: item.period || "",
      durationMonths: item.metadata?.durationMonths || "",
      terms: item.metadata?.terms || "",
      active: item.active !== false,
    };
  }
  return { ...defaultForms[key], ...item, active: item.active !== false };
}

export default function AdminCatalogManagementPage() {
  const dispatch = useDispatch();
  const [activeKey, setActiveKey] = useState("category");
  const active = useMemo(() => sections.find((section) => section.key === activeKey) || sections[0], [activeKey]);
  const [form, setForm] = useState(defaultForms.category);
  const [editingId, setEditingId] = useState("");
  const [items, setItems] = useState([]);
  const [masters, setMasters] = useState({ categories: [], options: [], optionValues: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const setField = (name, value) => setForm((current) => ({ ...current, [name]: value }));

  const loadItems = useCallback(async () => {
    const response = await dispatch(active.fetchThunk({ params: { limit: 200 } })).unwrap();
    setItems(unpackList(response));
  }, [active, dispatch]);

  const loadMasters = useCallback(async () => {
    const [categories, options, optionValues] = await Promise.all([
      dispatch(fetchPlatformCategories({ params: { limit: 500 } })).unwrap(),
      dispatch(fetchPlatformProductOptions({ params: { limit: 500 } })).unwrap(),
      dispatch(fetchPlatformProductOptionValues({ params: { limit: 1000 } })).unwrap(),
    ]);
    setMasters({ categories: unpackList(categories), options: unpackList(options), optionValues: unpackList(optionValues) });
  }, [dispatch]);

  const selectedAttributeKeys = useMemo(
    () => new Set(arr(form.categoryAttributes).map((attribute) => attribute.key)),
    [form.categoryAttributes],
  );

  const toggleCategoryAttribute = (option) => {
    const key = attributeKey(option);
    const exists = selectedAttributeKeys.has(key);
    setForm((current) => ({
      ...current,
      categoryAttributes: exists
        ? arr(current.categoryAttributes).filter((attribute) => attribute.key !== key)
        : [
            ...arr(current.categoryAttributes),
            buildCategoryAttribute(option, masters.optionValues),
          ],
    }));
  };

  const updateCategoryAttribute = (key, patch) => {
    setForm((current) => ({
      ...current,
      categoryAttributes: arr(current.categoryAttributes).map((attribute) =>
        attribute.key === key ? { ...attribute, ...patch } : attribute,
      ),
    }));
  };

  const toggleFamilyAxis = (option) => {
    const axis = attributeKey(option);
    setForm((current) => {
      const currentAxes = arr(current.variantAxes);
      return {
        ...current,
        variantAxes: currentAxes.includes(axis)
          ? currentAxes.filter((item) => item !== axis)
          : [...currentAxes, axis],
      };
    });
  };

  useEffect(() => {
    setEditingId("");
    setForm(defaultForms[active.key]);
  }, [active.key]);

  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.all([loadItems(), loadMasters()])
      .catch((err) => setError(String(err?.message || err || `Failed to load ${active.title}`)))
      .finally(() => setLoading(false));
  }, [active, loadItems, loadMasters]);

  const onSave = async () => {
    setError("");
    try {
      const payload = buildPayload(active.key, form);
      if (active.key === "category") {
        payload.attributeSchema = arr(payload.attributeSchema).map((attribute) => {
          const option = masters.options.find((item) => attributeKey(item) === attribute.key);
          const values = option ? optionValuesFor(idOf(option), masters.optionValues) : [];
          return {
            ...attribute,
            options: values.length ? values : arr(attribute.options),
          };
        });
      }
      if (editingId) {
        await dispatch(active.updateThunk({ [active.argKey]: editingId, data: payload })).unwrap();
      } else {
        await dispatch(active.createThunk({ data: payload })).unwrap();
      }
      setEditingId("");
      setForm(defaultForms[active.key]);
      await Promise.all([loadItems(), loadMasters()]);
    } catch (err) {
      setError(String(err?.message || err || "Save failed"));
    }
  };

  const onDelete = async (item) => {
    const id = active.itemId(item);
    if (!id) {
      setError("Cannot delete: missing id/key.");
      return;
    }
    setError("");
    try {
      await dispatch(active.deleteThunk({ [active.argKey]: id })).unwrap();
      if (editingId === id) {
        setEditingId("");
        setForm(defaultForms[active.key]);
      }
      await Promise.all([loadItems(), loadMasters()]);
    } catch (err) {
      setError(String(err?.message || err || "Delete failed"));
    }
  };

  const renderFields = () => {
    if (active.key === "category") {
      return (
        <>
          <input className="rounded border p-2" placeholder="Category title" value={form.title} onChange={(e) => setForm((v) => ({ ...v, title: e.target.value, categoryKey: v.categoryKey || slugify(e.target.value) }))} />
          <input className="rounded border p-2" placeholder="Category key" value={form.categoryKey} onChange={(e) => setField("categoryKey", e.target.value)} />
          <select className="rounded border p-2" value={form.parentKey} onChange={(e) => setField("parentKey", e.target.value)}>
            <option value="">No parent</option>
            {masters.categories.filter((item) => item.categoryKey !== form.categoryKey).map((item) => (
              <option key={item.categoryKey} value={item.categoryKey}>{item.title}</option>
            ))}
          </select>
          <div className="rounded border border-slate-200 p-3">
            <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Category Attributes</p>
            <div className="grid gap-2">
              {masters.options.map((option) => {
                const key = attributeKey(option);
                const selected = arr(form.categoryAttributes).find((attribute) => attribute.key === key);
                const valueNames = optionValuesFor(idOf(option), masters.optionValues);
                return (
                  <div key={idOf(option)} className="rounded border border-slate-100 p-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <input type="checkbox" checked={Boolean(selected)} onChange={() => toggleCategoryAttribute(option)} />
                      {option.name}
                      <span className="text-xs font-normal text-slate-500">{valueNames.length ? `${valueNames.length} values` : "free input"}</span>
                    </label>
                    {selected && (
                      <div className="mt-2 grid gap-2 sm:grid-cols-4">
                        <select className="rounded border p-2 text-sm" value={selected.type} onChange={(e) => updateCategoryAttribute(key, { type: e.target.value })}>
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="select">Select</option>
                          <option value="multi_select">Multi select</option>
                          <option value="boolean">Boolean</option>
                          <option value="date">Date</option>
                        </select>
                        <label className="flex items-center gap-2 text-xs text-slate-600">
                          <input type="checkbox" checked={selected.required === true} onChange={(e) => updateCategoryAttribute(key, { required: e.target.checked })} />
                          Required
                        </label>
                        <label className="flex items-center gap-2 text-xs text-slate-600">
                          <input type="checkbox" checked={selected.isFilterable === true} onChange={(e) => updateCategoryAttribute(key, { isFilterable: e.target.checked })} />
                          Filterable
                        </label>
                        <label className="flex items-center gap-2 text-xs text-slate-600">
                          <input type="checkbox" checked={selected.isVariantAttribute === true} onChange={(e) => updateCategoryAttribute(key, { isVariantAttribute: e.target.checked })} />
                          Variant axis
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
              {!masters.options.length && (
                <p className="text-xs text-slate-500">Create attributes in the Attributes tab first.</p>
              )}
            </div>
          </div>
          <input className="rounded border p-2" placeholder="Image URL" value={form.imageUrl} onChange={(e) => setField("imageUrl", e.target.value)} />
        </>
      );
    }
    if (active.key === "brand") {
      return (
        <>
          <input className="rounded border p-2" placeholder="Brand name" value={form.name} onChange={(e) => setForm((v) => ({ ...v, name: e.target.value, slug: v.slug || slugify(e.target.value) }))} />
          <input className="rounded border p-2" placeholder="Slug" value={form.slug} onChange={(e) => setField("slug", e.target.value)} />
          <textarea className="rounded border p-2" placeholder="Description" value={form.description} onChange={(e) => setField("description", e.target.value)} />
          <input className="rounded border p-2" placeholder="Logo URL" value={form.logo} onChange={(e) => setField("logo", e.target.value)} />
          <input className="rounded border p-2" placeholder="Image URL" value={form.imageUrl} onChange={(e) => setField("imageUrl", e.target.value)} />
        </>
      );
    }
    if (active.key === "family") {
      return (
        <>
          <input className="rounded border p-2" placeholder="Family title" value={form.title} onChange={(e) => setForm((v) => ({ ...v, title: e.target.value, familyCode: v.familyCode || slugify(e.target.value) }))} />
          <input className="rounded border p-2" placeholder="Family code" value={form.familyCode} onChange={(e) => setField("familyCode", e.target.value)} />
          <select className="rounded border p-2" value={form.category} onChange={(e) => setField("category", e.target.value)}>
            <option value="">Select category</option>
            {masters.categories.map((item) => <option key={item.categoryKey} value={item.categoryKey}>{item.title}</option>)}
          </select>
          <input className="rounded border p-2" placeholder="Seller ID (platform by default)" value={form.sellerId} onChange={(e) => setField("sellerId", e.target.value)} />
          <div className="rounded border border-slate-200 p-3">
            <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Variant Axes</p>
            <div className="flex flex-wrap gap-2">
              {masters.options.map((option) => {
                const axis = attributeKey(option);
                const active = arr(form.variantAxes).includes(axis);
                return (
                  <button
                    key={idOf(option)}
                    type="button"
                    onClick={() => toggleFamilyAxis(option)}
                    className={`rounded border px-2 py-1 text-xs font-semibold ${active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700"}`}
                  >
                    {option.name}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      );
    }
    if (active.key === "dimension") return <input className="rounded border p-2" placeholder="Dimension value" value={form.dimensions_value} onChange={(e) => setField("dimensions_value", e.target.value)} />;
    if (active.key === "hsn") {
      return (
        <>
          <input className="rounded border p-2" placeholder="HSN code" value={form.code} onChange={(e) => setField("code", e.target.value)} />
          <input className="rounded border p-2" placeholder="Description" value={form.description} onChange={(e) => setField("description", e.target.value)} />
          <input className="rounded border p-2" type="number" placeholder="GST rate" value={form.gstRate} onChange={(e) => setField("gstRate", e.target.value)} />
          <select className="rounded border p-2" value={form.category} onChange={(e) => setField("category", e.target.value)}>
            <option value="">Any category</option>
            {masters.categories.map((item) => <option key={item.categoryKey} value={item.categoryKey}>{item.title}</option>)}
          </select>
        </>
      );
    }
    if (active.key === "warranty") {
      return (
        <>
          <input className="rounded border p-2" placeholder="Period, e.g. 12 months" value={form.period} onChange={(e) => setField("period", e.target.value)} />
          <input className="rounded border p-2" type="number" placeholder="Duration months" value={form.durationMonths} onChange={(e) => setField("durationMonths", e.target.value)} />
          <textarea className="rounded border p-2" placeholder="Terms" value={form.terms} onChange={(e) => setField("terms", e.target.value)} />
        </>
      );
    }
    if (active.key === "batch") {
      return (
        <>
          <input className="rounded border p-2" placeholder="Batch code" value={form.batchCode} onChange={(e) => setField("batchCode", e.target.value)} />
          <input className="rounded border p-2" type="number" placeholder="Manufacture date timestamp" value={form.manufactureDate} onChange={(e) => setField("manufactureDate", e.target.value)} />
          <input className="rounded border p-2" type="number" placeholder="Expiry date timestamp" value={form.expiryDate} onChange={(e) => setField("expiryDate", e.target.value)} />
        </>
      );
    }
    if (active.key === "option") {
      return (
        <>
          <input className="rounded border p-2" placeholder="Option name, e.g. Color" value={form.name} onChange={(e) => setForm((v) => ({ ...v, name: e.target.value, slug: v.slug || slugify(e.target.value).replace(/-/g, "_") }))} />
          <input className="rounded border p-2" placeholder="Slug" value={form.slug} onChange={(e) => setField("slug", e.target.value)} />
          <select className="rounded border p-2" value={form.displayType} onChange={(e) => setField("displayType", e.target.value)}>
            <option value="button">Button</option>
            <option value="dropdown">Dropdown</option>
            <option value="color_swatch">Color swatch</option>
            <option value="radio">Radio</option>
            <option value="thumbnail">Thumbnail</option>
          </select>
          <textarea className="rounded border p-2" placeholder="Description" value={form.description} onChange={(e) => setField("description", e.target.value)} />
        </>
      );
    }
    return (
      <>
        <select className="rounded border p-2" value={form.optionId} onChange={(e) => setField("optionId", e.target.value)}>
          <option value="">Select product option</option>
          {masters.options.map((item) => <option key={idOf(item)} value={idOf(item)}>{item.name}</option>)}
        </select>
        <input className="rounded border p-2" placeholder="Value name, e.g. Black" value={form.name} onChange={(e) => setForm((v) => ({ ...v, name: e.target.value, valueCode: v.valueCode || slugify(e.target.value).replace(/-/g, "_") }))} />
        <input className="rounded border p-2" placeholder="Value code" value={form.valueCode} onChange={(e) => setField("valueCode", e.target.value)} />
        <input className="rounded border p-2" placeholder="Color hex (#111111)" value={form.colorHex} onChange={(e) => setField("colorHex", e.target.value)} />
        <input className="rounded border p-2" placeholder="Image URL" value={form.imageUrl} onChange={(e) => setField("imageUrl", e.target.value)} />
      </>
    );
  };

  return (
    <AdminShell title="Catalog Masters">
      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-semibold">Single Attribute Flow</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Create attributes once in the Attributes tab.</li>
          <li>Add selectable values in Attribute Values.</li>
          <li>Select those attributes inside Categories and Families.</li>
          <li>Create products from Product Management using the same attributes.</li>
        </ol>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {sections.map((section) => (
          <button
            key={section.key}
            type="button"
            onClick={() => setActiveKey(section.key)}
            className={`rounded px-3 py-1.5 text-sm ${section.key === active.key ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-800"}`}
          >
            {section.title}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="mb-3 text-sm font-semibold text-slate-700">
            {editingId ? `Edit ${active.title}` : `Create ${active.title}`}
          </p>
          <div className="grid gap-2">
            {renderFields()}
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.active !== false} onChange={(e) => setField("active", e.target.checked)} />
              Active
            </label>
            <div className="flex gap-2">
              <button type="button" className="rounded bg-slate-900 px-3 py-2 text-white" onClick={onSave}>
                {editingId ? "Update" : "Create"}
              </button>
              {editingId && (
                <button type="button" className="rounded bg-slate-200 px-3 py-2 text-slate-900" onClick={() => { setEditingId(""); setForm(defaultForms[active.key]); }}>
                  Cancel
                </button>
              )}
            </div>
          </div>
          {error && <p className="mt-2 text-sm text-rose-700">{error}</p>}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="mb-2 text-sm font-semibold text-slate-700">{active.title}</p>
          <div className="max-h-[60vh] overflow-auto">
            {items.map((item, index) => {
              const id = active.itemId(item);
              const title = item.title || item.name || item.period || item.batchCode || item.code || item.dimensions_value || id;
              return (
                <div key={id || index} className="mb-2 rounded border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{title}</p>
                      <p className="mt-1 text-xs text-slate-500">{id}</p>
                    </div>
                    <span className={`rounded px-2 py-0.5 text-xs ${item.active === false || item.status === "inactive" ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
                      {item.status || (item.active === false ? "inactive" : "active")}
                    </span>
                  </div>
                  <pre className="mt-2 max-h-28 overflow-auto rounded bg-slate-50 p-2 text-xs">{JSON.stringify(item, null, 2)}</pre>
                  <div className="mt-2 flex gap-2">
                    <button type="button" className="rounded bg-slate-200 px-2 py-1 text-xs text-slate-900" onClick={() => { setEditingId(id); setForm(formFromItem(active.key, item)); }}>
                      Edit
                    </button>
                    <button type="button" className="rounded bg-rose-600 px-2 py-1 text-xs text-white" onClick={() => onDelete(item)}>
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
