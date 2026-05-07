export function itemsFrom(state) {
  if (Array.isArray(state?.current)) return state.current;
  if (Array.isArray(state?.current?.items)) return state.current.items;
  if (Array.isArray(state?.current?.orders)) return state.current.orders;
  return state?.list || [];
}

export function byId(items = [], id) {
  return items.find((item) => item?.id === id || item?._id === id || item?.productId === id);
}
