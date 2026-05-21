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
const optionIdOf = (item) => String(item?._id || item?.id || item?.optionId || "");
const axisSlug = (name = "") =>
  String(name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const safeJson = (value, fallback) => {
  try {
    return JSON.parse(value || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
};

const buildCombinations = (axes) => {
  if (!axes.length) return [];
  return axes.reduce(
    (rows, axis) =>
      rows.flatMap((row) =>
        axis.values.map((value) => ({
          ...row,
          [axis.slug]: value,
        })),
      ),
    [{}],
  );
};

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
  dimensionPreset: "",
  dimensionLength: "",
  dimensionWidth: "",
  dimensionHeight: "",
  dimensionUnit: "cm",
  warrantyTemplateId: "",
  warrantyPeriod: "",
  warrantyPeriodUnit: "months",
  attributesJson: "{}",
  optionsJson: "[]",
  variantsJson: "[]",
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
  const [categoryAttributes, setCategoryAttributes] = useState([]);
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
    setCategoryAttributes(arr(prefillData.categoryAttributes));
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

  const selectedCategoryAttributes = useMemo(() => {
    const category = categoryAttributes.find((item) => item.categoryKey === form.category);
    return arr(category?.attributeSchema);
  }, [categoryAttributes, form.category]);

  const formAttributes = useMemo(
    () => safeJson(form.attributesJson, {}),
    [form.attributesJson],
  );
  const formOptions = useMemo(() => safeJson(form.optionsJson, []), [form.optionsJson]);
  const formVariants = useMemo(() => safeJson(form.variantsJson, []), [form.variantsJson]);

  const valuesByOptionId = useMemo(() => {
    const grouped = new Map();
    optionValues.forEach((value) => {
      const optionId = String(value.optionId || value.option_id || "");
      if (!grouped.has(optionId)) grouped.set(optionId, []);
      grouped.get(optionId).push(value);
    });
    return grouped;
  }, [optionValues]);

  const selectedFamily = useMemo(
    () => families.find((family) => family.familyCode === form.productFamilyCode),
    [families, form.productFamilyCode],
  );

  const variantAttributeOptions = useMemo(() => {
    const categoryVariantKeys = selectedCategoryAttributes
      .filter((attribute) => attribute.isVariantAttribute === true)
      .map((attribute) => attribute.platformOptionId || attribute.key);
    const familyVariantKeys = arr(selectedFamily?.variantAxes);
    const existingOptionKeys = formOptions.map((option) => option.platformOptionId || option.slug);
    const wanted = new Set([...categoryVariantKeys, ...familyVariantKeys, ...existingOptionKeys].filter(Boolean));

    if (!wanted.size) return [];

    return options.filter((option) => {
      const optionId = optionIdOf(option);
      const slug = axisSlug(option.slug || option.name);
      return wanted.has(optionId) || wanted.has(slug);
    });
  }, [formOptions, options, selectedCategoryAttributes, selectedFamily]);

  const filteredFamilies = useMemo(
    () => families.filter((family) => !form.category || family.category === form.category),
    [families, form.category],
  );

  const filteredHsnCodes = useMemo(
    () => hsnCodes.filter((item) => !item.category || !form.category || item.category === form.category),
    [form.category, hsnCodes],
  );

  const setAttributeValue = (key, value) => {
    const next = { ...formAttributes, [key]: value };
    if (value === "" || (Array.isArray(value) && value.length === 0)) delete next[key];
    setForm((current) => ({ ...current, attributesJson: JSON.stringify(next, null, 2) }));
  };

  const syncVariantBuilder = (nextOptions, existingVariants = formVariants) => {
    const normalizedOptions = nextOptions.map((option, index) => ({
      ...option,
      slug: option.slug || axisSlug(option.name),
      values: arr(option.values).filter(Boolean),
      sortOrder: option.sortOrder ?? index,
    }));
    const axes = normalizedOptions
      .map((option) => ({
        ...option,
      }))
      .filter((option) => option.name && option.values.length);
    const combinations = buildCombinations(axes);
    const oldByKey = new Map(
      arr(existingVariants).map((variant) => [
        JSON.stringify(variant.attributes || {}),
        variant,
      ]),
    );
    const generated = combinations.map((attributes, index) => {
      const key = JSON.stringify(attributes);
      const previous = oldByKey.get(key) || {};
      return {
        sku: previous.sku || `${(form.title || "SKU").replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 8) || "SKU"}-${index + 1}`,
        title: previous.title || Object.values(attributes).join(" / "),
        price: previous.price ?? Number(form.price || 0),
        mrp: previous.mrp ?? Number(form.mrp || 0),
        stock: previous.stock ?? 0,
        status: previous.status || "active",
        attributes,
        images: arr(previous.images),
        isDefault: previous.isDefault === true || (!arr(existingVariants).some((variant) => variant.isDefault) && index === 0),
        sortOrder: index,
      };
    });

    setForm((current) => ({
      ...current,
      optionsJson: JSON.stringify(normalizedOptions, null, 2),
      variantsJson: JSON.stringify(generated, null, 2),
    }));
  };

  const toggleOption = (option) => {
    const optionId = optionIdOf(option);
    const exists = formOptions.some((item) => item.platformOptionId === optionId);
    const nextOptions = exists
      ? formOptions.filter((item) => item.platformOptionId !== optionId)
      : [
          ...formOptions,
          {
            platformOptionId: optionId,
            name: option.name,
            slug: axisSlug(option.name),
            values: [],
            valueCodes: {},
            displayType: option.displayType || "button",
            required: true,
            sortOrder: formOptions.length,
          },
        ];
    syncVariantBuilder(nextOptions);
  };

  const toggleOptionValue = (option, value) => {
    const optionId = optionIdOf(option);
    const valueName = value.name;
    const nextOptions = formOptions.map((item) => {
      if (item.platformOptionId !== optionId) return item;
      const values = arr(item.values);
      const hasValue = values.includes(valueName);
      const nextValues = hasValue
        ? values.filter((itemValue) => itemValue !== valueName)
        : [...values, valueName];
      const nextCodes = { ...(item.valueCodes || {}) };
      if (value.colorHex || value.valueCode || value.imageUrl) {
        nextCodes[valueName] = value.colorHex || value.valueCode || value.imageUrl;
      }
      return { ...item, values: nextValues, valueCodes: nextCodes };
    });
    syncVariantBuilder(nextOptions);
  };

  const updateVariant = (index, field, value) => {
    const nextVariants = formVariants.map((variant, variantIndex) => {
      if (variantIndex !== index) return variant;
      if (field === "isDefault") {
        return { ...variant, isDefault: value };
      }
      return { ...variant, [field]: value };
    });

    const normalized = field === "isDefault" && value
      ? nextVariants.map((variant, variantIndex) => ({ ...variant, isDefault: variantIndex === index }))
      : nextVariants;

    setForm((current) => ({ ...current, variantsJson: JSON.stringify(normalized, null, 2) }));
  };

  const selectedWarrantyTemplate = useMemo(
    () => warrantyTemplates.find((item) => idOf(item) === form.warrantyTemplateId),
    [form.warrantyTemplateId, warrantyTemplates],
  );

  useEffect(() => {
    if (!selectedWarrantyTemplate) return;
    const duration = selectedWarrantyTemplate.metadata?.durationMonths;
    setForm((current) => ({
      ...current,
      warrantyPeriod: current.warrantyPeriod || duration || "",
      warrantyPeriodUnit: current.warrantyPeriodUnit || "months",
    }));
  }, [selectedWarrantyTemplate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const selectedOptions = safeJson(form.optionsJson, []).filter((option) => arr(option.values).length);
      const selectedVariants = safeJson(form.variantsJson, []);
      const dimensions = {
        length: form.dimensionLength === "" ? undefined : Number(form.dimensionLength),
        width: form.dimensionWidth === "" ? undefined : Number(form.dimensionWidth),
        height: form.dimensionHeight === "" ? undefined : Number(form.dimensionHeight),
        unit: form.dimensionUnit || "cm",
        preset: form.dimensionPreset || undefined,
      };
      const warranty = {
        period: form.warrantyPeriod === "" ? undefined : Number(form.warrantyPeriod),
        periodUnit: form.warrantyPeriodUnit || "months",
        type: selectedWarrantyTemplate?.period || undefined,
        terms: selectedWarrantyTemplate?.metadata?.terms || undefined,
      };
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
        attributes: safeJson(form.attributesJson, {}),
        options: selectedOptions,
        variants: selectedVariants,
        hasVariants: selectedVariants.length > 0,
        productType: selectedVariants.length > 0 ? "variable" : "simple",
        dimensions,
        warranty,
        metadata: {
          batchCode: form.batchCode || undefined,
          dimensionPreset: form.dimensionPreset || undefined,
          warrantyTemplateId: form.warrantyTemplateId || undefined,
        },
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
          <li>Select category attributes, variant attributes, and values from Attribute Management.</li>
          <li>Set dimensions and warranty, then save product.</li>
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
                {filteredFamilies.map((f) => (
                  <option key={f.familyCode || f._id || f.id} value={f.familyCode}>
                    {f.familyCode} {f.title ? `- ${f.title}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select className="rounded border p-2" value={form.hsnCode} onChange={(e) => setForm((v) => ({ ...v, hsnCode: e.target.value }))}>
                <option value="">Select HSN</option>
                {filteredHsnCodes.map((h) => (
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

            <div className="rounded border border-slate-200 p-3">
              <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Category Attributes</p>
              {selectedCategoryAttributes.length ? (
                <div className="grid gap-2">
                  {selectedCategoryAttributes.map((attr) => (
                    <label key={attr.key} className="grid gap-1 text-sm">
                      <span className="font-medium text-slate-700">
                        {attr.label || attr.key}{attr.required ? " *" : ""}
                      </span>
                      {["select", "multi_select"].includes(attr.type) ? (
                        <select
                          multiple={attr.type === "multi_select"}
                          className="rounded border p-2"
                          value={attr.type === "multi_select" ? arr(formAttributes[attr.key]) : formAttributes[attr.key] || ""}
                          onChange={(e) => {
                            const value = attr.type === "multi_select"
                              ? Array.from(e.target.selectedOptions).map((item) => item.value)
                              : e.target.value;
                            setAttributeValue(attr.key, value);
                          }}
                        >
                          {attr.type !== "multi_select" && <option value="">Select {attr.label || attr.key}</option>}
                          {arr(attr.options).map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          className="rounded border p-2"
                          type={attr.type === "number" ? "number" : attr.type === "date" ? "date" : "text"}
                          value={formAttributes[attr.key] || ""}
                          onChange={(e) => setAttributeValue(attr.key, attr.type === "number" ? Number(e.target.value) : e.target.value)}
                        />
                      )}
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">Select a category to load selectable attributes.</p>
              )}
            </div>

            <div className="rounded border border-slate-200 p-3">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase text-slate-500">Variants & Options</p>
                <span className="text-xs text-slate-500">{formVariants.length} variants</span>
              </div>
              <div className="grid gap-3">
                {(variantAttributeOptions.length ? variantAttributeOptions : []).map((option) => {
                  const optionId = optionIdOf(option);
                  const selected = formOptions.find((item) => item.platformOptionId === optionId);
                  const values = valuesByOptionId.get(optionId) || [];
                  return (
                    <div key={optionId} className="rounded border border-slate-100 p-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <input type="checkbox" checked={Boolean(selected)} onChange={() => toggleOption(option)} />
                        {option.name}
                        <span className="text-xs font-normal text-slate-500">({option.displayType || "button"})</span>
                      </label>
                      {selected && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {values.map((value) => {
                            const active = arr(selected.values).includes(value.name);
                            return (
                              <button
                                key={idOf(value)}
                                type="button"
                                onClick={() => toggleOptionValue(option, value)}
                                className={`rounded border px-2 py-1 text-xs font-semibold ${active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700"}`}
                              >
                                {value.name}
                              </button>
                            );
                          })}
                          {!values.length && <span className="text-xs text-slate-500">No values found for this option.</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
                {!variantAttributeOptions.length && (
                  <p className="rounded border border-dashed border-slate-200 p-3 text-xs text-slate-500">
                    Mark attributes as variant axes in Catalog Masters, Categories, or Families to generate variants.
                  </p>
                )}
              </div>
              {formVariants.length > 0 && (
                <div className="mt-3 max-h-52 overflow-auto rounded bg-slate-50 p-2">
                  <table className="w-full min-w-[720px] text-left text-xs">
                    <thead>
                      <tr>
                        <th className="p-1">Default</th>
                        <th className="p-1">Variant</th>
                        <th className="p-1">SKU</th>
                        <th className="p-1">Price</th>
                        <th className="p-1">MRP</th>
                        <th className="p-1">Stock</th>
                        <th className="p-1">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formVariants.map((variant, index) => (
                        <tr key={`${variant.sku}-${index}`} className="border-t">
                          <td className="p-1">
                            <input type="radio" checked={variant.isDefault === true} onChange={() => updateVariant(index, "isDefault", true)} />
                          </td>
                          <td className="p-1">{variant.title}</td>
                          <td className="p-1">
                            <input className="w-28 rounded border p-1" value={variant.sku || ""} onChange={(e) => updateVariant(index, "sku", e.target.value)} />
                          </td>
                          <td className="p-1">
                            <input className="w-20 rounded border p-1" type="number" value={variant.price ?? ""} onChange={(e) => updateVariant(index, "price", Number(e.target.value || 0))} />
                          </td>
                          <td className="p-1">
                            <input className="w-20 rounded border p-1" type="number" value={variant.mrp ?? ""} onChange={(e) => updateVariant(index, "mrp", Number(e.target.value || 0))} />
                          </td>
                          <td className="p-1">
                            <input className="w-20 rounded border p-1" type="number" value={variant.stock ?? ""} onChange={(e) => updateVariant(index, "stock", Number(e.target.value || 0))} />
                          </td>
                          <td className="p-1">
                            <select className="rounded border p-1" value={variant.status || "active"} onChange={(e) => updateVariant(index, "status", e.target.value)}>
                              <option value="active">active</option>
                              <option value="inactive">inactive</option>
                              <option value="out_of_stock">out of stock</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="rounded border border-slate-200 p-3">
              <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Dimensions</p>
              <div className="grid gap-2 sm:grid-cols-5">
                <select className="rounded border p-2 sm:col-span-2" value={form.dimensionPreset} onChange={(e) => setForm((v) => ({ ...v, dimensionPreset: e.target.value }))}>
                  <option value="">No preset</option>
                  {dimensions.map((item) => (
                    <option key={idOf(item)} value={item.dimensions_value}>
                      {item.dimensions_value}
                    </option>
                  ))}
                </select>
                <input className="rounded border p-2" type="number" placeholder="L" value={form.dimensionLength} onChange={(e) => setForm((v) => ({ ...v, dimensionLength: e.target.value }))} />
                <input className="rounded border p-2" type="number" placeholder="W" value={form.dimensionWidth} onChange={(e) => setForm((v) => ({ ...v, dimensionWidth: e.target.value }))} />
                <input className="rounded border p-2" type="number" placeholder="H" value={form.dimensionHeight} onChange={(e) => setForm((v) => ({ ...v, dimensionHeight: e.target.value }))} />
              </div>
              <select className="mt-2 rounded border p-2" value={form.dimensionUnit} onChange={(e) => setForm((v) => ({ ...v, dimensionUnit: e.target.value }))}>
                <option value="cm">cm</option>
                <option value="mm">mm</option>
                <option value="in">in</option>
                <option value="m">m</option>
              </select>
            </div>

            <div className="rounded border border-slate-200 p-3">
              <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Warranty</p>
              <div className="grid gap-2 sm:grid-cols-3">
                <select className="rounded border p-2 sm:col-span-3" value={form.warrantyTemplateId} onChange={(e) => setForm((v) => ({ ...v, warrantyTemplateId: e.target.value, warrantyPeriod: "" }))}>
                  <option value="">No warranty template</option>
                  {warrantyTemplates.map((item) => (
                    <option key={idOf(item)} value={idOf(item)}>
                      {item.period}
                    </option>
                  ))}
                </select>
                <input className="rounded border p-2" type="number" placeholder="Period" value={form.warrantyPeriod} onChange={(e) => setForm((v) => ({ ...v, warrantyPeriod: e.target.value }))} />
                <select className="rounded border p-2" value={form.warrantyPeriodUnit} onChange={(e) => setForm((v) => ({ ...v, warrantyPeriodUnit: e.target.value }))}>
                  <option value="days">days</option>
                  <option value="weeks">weeks</option>
                  <option value="months">months</option>
                  <option value="years">years</option>
                </select>
              </div>
            </div>
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
                              dimensionPreset: product.metadata?.dimensionPreset || product.dimensions?.preset || "",
                              dimensionLength: product.dimensions?.length ?? "",
                              dimensionWidth: product.dimensions?.width ?? "",
                              dimensionHeight: product.dimensions?.height ?? "",
                              dimensionUnit: product.dimensions?.unit || "cm",
                              warrantyTemplateId: product.metadata?.warrantyTemplateId || "",
                              warrantyPeriod: product.warranty?.period ?? "",
                              warrantyPeriodUnit: product.warranty?.periodUnit || "months",
                              attributesJson: JSON.stringify(product.attributes || {}, null, 2),
                              optionsJson: JSON.stringify(product.options || [], null, 2),
                              variantsJson: JSON.stringify(product.variants || [], null, 2),
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
