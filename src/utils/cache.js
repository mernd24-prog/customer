const DEFAULT_TTL = 1000 * 60 * 10;
const MAX_API_CACHE_CHARS = 500000;
const MAX_API_CACHE_ENTRIES = 50;
const isDisposableCacheKey = (key) =>
  ["api:", "search-autocomplete-", "search-list-"].some((prefix) =>
    key?.startsWith(prefix),
  );

function cacheEntries(storage) {
  return Array.from({ length: storage.length }, (_, index) => storage.key(index))
    .filter(isDisposableCacheKey)
    .map((key) => ({ key, raw: storage.getItem(key) || "" }));
}

// Only API/search caches are disposable; preserve auth and shopping data.
export function clearDisposableCache() {
  const storage = getStorage();
  if (!storage) return;
  cacheEntries(storage).forEach(({ key }) => storage.removeItem(key));
}

function pruneCache(storage, incomingKey, incomingSize) {
  let entries = cacheEntries(storage).filter(({ key, raw }) => {
    try {
      const payload = JSON.parse(raw);
      if (key !== incomingKey && (!payload.expiresAt || payload.expiresAt >= now())) {
        return true;
      }
    } catch {}
    storage.removeItem(key);
    return false;
  });
  let size = entries.reduce((total, entry) => total + entry.key.length + entry.raw.length, 0);
  entries.sort((a, b) => (JSON.parse(a.raw).expiresAt || Infinity) - (JSON.parse(b.raw).expiresAt || Infinity));
  while (entries.length && (entries.length >= MAX_API_CACHE_ENTRIES || size + incomingSize > MAX_API_CACHE_CHARS)) {
    const entry = entries.shift();
    storage.removeItem(entry.key);
    size -= entry.key.length + entry.raw.length;
  }
}

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

export function isQuotaExceededError(error) {
  if (!error) return false;
  return (
    (typeof DOMException !== "undefined" && error instanceof DOMException &&
      (error.name === "QuotaExceededError" ||
        error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
        error.name === "QuotaExceededError")) ||
    error.code === 22 ||
    error.code === 1014 ||
    error.name === "QuotaExceededError" ||
    error.name === "NS_ERROR_DOM_QUOTA_REACHED"
  );
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

  try {
    const serialized = JSON.stringify(payload);
    if (isDisposableCacheKey(key)) {
      const size = key.length + serialized.length;
      pruneCache(storage, key, size);
      if (size > MAX_API_CACHE_CHARS) return;
    }
    storage.setItem(key, serialized);
  } catch (error) {
    if (isQuotaExceededError(error)) {
      try {
        cacheEntries(storage).forEach(({ key: cacheKey }) => storage.removeItem(cacheKey));
        storage.setItem(key, JSON.stringify(payload));
      } catch (innerError) {
        // Swallow quota errors to avoid app crash when localStorage is full.
      }
    }
  }
}

export function getCache(key, options = {}) {
  const storage = getStorage(options.storage);
  if (!storage) return options.fallback;

  try {
    const raw = storage.getItem(key);
    if (!raw) return options.fallback;

    const payload = JSON.parse(raw);
    if (
      payload.version &&
      options.version &&
      payload.version !== options.version
    ) {
      storage.removeItem(key);
      return options.fallback;
    }

    if (payload.expiresAt && payload.expiresAt < now() && !options.allowExpired) {
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
