const DEFAULT_TTL = 1000 * 60 * 10;

function now() {
  return Date.now();
}

function getStorage(storage = "local") {
  if (typeof window === "undefined") return null;
  return storage === "session" ? window.sessionStorage : window.localStorage;
}

export function createCacheKey(namespace, keyParts = []) {
  const parts = Array.isArray(keyParts) ? keyParts : [keyParts];
  return [namespace, ...parts.map((part) => JSON.stringify(part))].join(":");
}

export function setCache(key, value, options = {}) {
  const storage = getStorage(options.storage);
  if (!storage) return;

  const ttl = options.ttl ?? DEFAULT_TTL;
  const payload = {
    value,
    expiresAt: ttl === Infinity ? null : now() + ttl,
    version: options.version || 1,
  };

  storage.setItem(key, JSON.stringify(payload));
}

export function getCache(key, options = {}) {
  const storage = getStorage(options.storage);
  if (!storage) return options.fallback;

  try {
    const raw = storage.getItem(key);
    if (!raw) return options.fallback;

    const payload = JSON.parse(raw);
    if (payload.version && options.version && payload.version !== options.version) {
      storage.removeItem(key);
      return options.fallback;
    }

    if (payload.expiresAt && payload.expiresAt < now()) {
      storage.removeItem(key);
      return options.fallback;
    }

    return payload.value;
  } catch {
    storage.removeItem(key);
    return options.fallback;
  }
}

export function removeCache(key, options = {}) {
  const storage = getStorage(options.storage);
  storage?.removeItem(key);
}

export function clearCacheByPrefix(prefix, options = {}) {
  const storage = getStorage(options.storage);
  if (!storage) return;

  Array.from({ length: storage.length }, (_, index) => storage.key(index))
    .filter((key) => key?.startsWith(prefix))
    .forEach((key) => storage.removeItem(key));
}

export async function getOrSetCache(key, fetcher, options = {}) {
  const cached = getCache(key, { ...options, fallback: undefined });
  if (cached !== undefined && !options.force) return cached;

  const value = await fetcher();
  setCache(key, value, options);
  return value;
}
