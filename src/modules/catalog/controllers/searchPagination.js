export function readSearchPage(payload, params) {
  const data = payload?.data ?? {};
  const items = Array.isArray(data) ? data : data.hits || data.products || data.results || data.items || [];
  const limit = Math.max(1, Number(params.limit) || 10);
  const page = Math.max(1, Number(params.page) || 1);
  const total = Number(data.total ?? payload?.meta?.total ?? items.length);
  return { items, meta: { ...(payload?.meta || {}), page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } };
}

export function appendSearchProducts(current, incoming) {
  const seen = new Set(current.map(product => product._id || product.id || product.slug).filter(Boolean));
  return [...current, ...incoming.filter(product => {
    const id = product._id || product.id || product.slug;
    if (id && seen.has(id)) return false;
    if (id) seen.add(id);
    return true;
  })];
}
