import { useCallback, useEffect, useState } from "react";
import { getOrSetCache, removeCache } from "../utils/cache";

export function useCachedAsync(key, fetcher, options = {}) {
  const [state, setState] = useState({
    data: options.initialData,
    loading: Boolean(options.enabled ?? true),
    error: null,
  });

  const enabled = options.enabled ?? true;

  const load = useCallback(
    async ({ force = false } = {}) => {
      if (!enabled || !key) return undefined;

      setState((current) => ({ ...current, loading: true, error: null }));

      try {
        const data = await getOrSetCache(key, fetcher, { ...options, force });
        setState({ data, loading: false, error: null });
        return data;
      } catch (error) {
        setState((current) => ({
          ...current,
          loading: false,
          error: error?.message || "Something went wrong",
        }));
        return undefined;
      }
    },
    [enabled, fetcher, key, options],
  );

  const refresh = useCallback(() => load({ force: true }), [load]);
  const clear = useCallback(() => removeCache(key, options), [key, options]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    ...state,
    refresh,
    clear,
  };
}

export default useCachedAsync;
