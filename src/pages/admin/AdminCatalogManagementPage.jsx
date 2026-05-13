import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createPlatformCategory,
  createPlatformHsnCode,
  createPlatformProductFamily,
  createPlatformProductOption,
  createPlatformProductOptionValue,
  createPlatformProductVariant,
  deletePlatformCategory,
  deletePlatformHsnCode,
  deletePlatformProductFamily,
  deletePlatformProductOption,
  deletePlatformProductOptionValue,
  deletePlatformProductVariant,
  fetchPlatformCategories,
  fetchPlatformHsnCodes,
  fetchPlatformProductFamilies,
  fetchPlatformProductOptions,
  fetchPlatformProductOptionValues,
  fetchPlatformProductVariants,
} from "../../features/admin/adminSlice";
import AdminShell from "./AdminShell";

const sections = [
  { key: "category", title: "Categories", fetch: fetchPlatformCategories, create: createPlatformCategory, remove: deletePlatformCategory, idKey: "categoryKey" },
  { key: "family", title: "Families", fetch: fetchPlatformProductFamilies, create: createPlatformProductFamily, remove: deletePlatformProductFamily, idKey: "familyCode" },
  { key: "variant", title: "Variants", fetch: fetchPlatformProductVariants, create: createPlatformProductVariant, remove: deletePlatformProductVariant, idKey: "id" },
  { key: "hsn", title: "HSN/Tax", fetch: fetchPlatformHsnCodes, create: createPlatformHsnCode, remove: deletePlatformHsnCode, idKey: "hsnCode" },
  { key: "option", title: "Product Options", fetch: fetchPlatformProductOptions, create: createPlatformProductOption, remove: deletePlatformProductOption, idKey: "id" },
  { key: "value", title: "Product Option Values", fetch: fetchPlatformProductOptionValues, create: createPlatformProductOptionValue, remove: deletePlatformProductOptionValue, idKey: "id" },
];

export default function AdminCatalogManagementPage() {
  const dispatch = useDispatch();
  const adminState = useSelector((s) => s.admin);
  const [active, setActive] = useState(sections[0]);
  const [payload, setPayload] = useState("{\n  \n}");

  const list = useMemo(() => adminState.list || [], [adminState.list]);

  useEffect(() => {
    dispatch(active.fetch({ params: { limit: 100 } }));
  }, [active, dispatch]);

  const onCreate = async () => {
    const parsed = JSON.parse(payload);
    await dispatch(active.create({ data: parsed })).unwrap();
    dispatch(active.fetch({ params: { limit: 100 } }));
  };

  const onDelete = async (item) => {
    const id = item?.[active.idKey] || item?._id || item?.id;
    if (!id) return;
    const keyArgName = active.idKey === "id" ? inferIdArgName(active.key) : active.idKey;
    await dispatch(active.remove({ [keyArgName]: id })).unwrap();
    dispatch(active.fetch({ params: { limit: 100 } }));
  };

  return (
    <AdminShell title="Catalog Masters">
      <div className="mb-4 flex flex-wrap gap-2">
        {sections.map((section) => (
          <button
            key={section.key}
            type="button"
            onClick={() => setActive(section)}
            className={`rounded px-3 py-1.5 text-sm ${
              section.key === active.key ? "bg-slate-900 text-white" : "bg-slate-100"
            }`}
          >
            {section.title}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="mb-2 text-sm font-semibold text-slate-700">Create {active.title} (JSON)</p>
          <textarea
            className="h-72 w-full rounded border p-2 font-mono text-xs"
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
          />
          <button type="button" className="mt-2 rounded bg-slate-900 px-3 py-2 text-white" onClick={onCreate}>
            Create
          </button>
          {adminState.error && <p className="mt-2 text-sm text-rose-700">{String(adminState.error)}</p>}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="mb-2 text-sm font-semibold text-slate-700">{active.title} List</p>
          <div className="max-h-[60vh] overflow-auto">
            {list.map((item, index) => (
              <div key={item?.id || item?._id || index} className="mb-2 rounded border p-2">
                <pre className="overflow-auto text-xs">{JSON.stringify(item, null, 2)}</pre>
                <button type="button" className="mt-2 rounded bg-rose-600 px-2 py-1 text-xs text-white" onClick={() => onDelete(item)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function inferIdArgName(sectionKey) {
  if (sectionKey === "variant") return "variantId";
  if (sectionKey === "option") return "optionId";
  if (sectionKey === "value") return "optionValueId";
  return "id";
}
