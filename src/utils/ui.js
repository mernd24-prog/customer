export function cx(...values) {
  return values
    .flatMap((value) => {
      if (!value) return [];
      if (typeof value === "string") return [value];
      if (Array.isArray(value)) return [cx(...value)];
      if (typeof value === "object") {
        return Object.entries(value)
          .filter(([, enabled]) => Boolean(enabled))
          .map(([className]) => className);
      }
      return [];
    })
    .filter(Boolean)
    .join(" ");
}

export function createVariantClass(baseClass, variants = {}, defaults = {}) {
  return (options = {}) => {
    const selected = { ...defaults, ...options };
    const variantClasses = Object.entries(selected).map(
      ([key, value]) => variants[key]?.[value],
    );

    return cx(baseClass, variantClasses, options.className);
  };
}

export function getInitials(name = "", fallback = "SG") {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return initials || fallback;
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return Number(count) === 1 ? singular : plural;
}
