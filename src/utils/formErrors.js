const DEFAULT_FIELD_ALIASES = {
  dialCode: "phone",
};

const getFirstError = (errors, path = []) => {
  for (const [key, value] of Object.entries(errors || {})) {
    const fieldPath = [...path, key];

    if (value?.message || value?.ref) {
      return {
        fieldName: fieldPath.join("."),
        fieldError: value,
      };
    }

    if (value && typeof value === "object") {
      const nestedError = getFirstError(value, fieldPath);
      if (nestedError) return nestedError;
    }
  }

  return null;
};

const getFallbackElement = (fallbackRef) =>
  fallbackRef?.current || fallbackRef || null;

export function scrollToFormField(fieldName, fieldError, options = {}) {
  if (!fieldName || typeof document === "undefined") return;

  const {
    idPrefix = "",
    fieldAliases = {},
    fieldSelectors = {},
    fallbackRef,
    behavior = "smooth",
    block = "center",
  } = options;
  const fieldKey = String(fieldName).split(".").at(-1);
  const aliases = { ...DEFAULT_FIELD_ALIASES, ...fieldAliases };
  const normalizedFieldName =
    aliases[fieldName] || aliases[fieldKey] || fieldName;

  const run = () => {
    const errorRef = fieldError?.ref;
    const registeredField =
      errorRef?.type !== "hidden" &&
      typeof errorRef?.scrollIntoView === "function"
        ? errorRef
        : null;
    const fieldId = idPrefix
      ? `${idPrefix}-${String(normalizedFieldName).split(".").at(-1)}`
      : "";
    const selectedField = fieldSelectors[fieldName]
      ? document.querySelector(fieldSelectors[fieldName])
      : null;
    const namedField = Array.from(
      document.getElementsByName(normalizedFieldName),
    ).find((element) => element.type !== "hidden");
    const field =
      registeredField ||
      (fieldId ? document.getElementById(fieldId) : null) ||
      selectedField ||
      namedField ||
      getFallbackElement(fallbackRef);

    if (!field) return;

    if (field.type !== "hidden" && !field.disabled) {
      field.focus?.({ preventScroll: true });
    }
    field.scrollIntoView?.({ behavior, block });
  };

  if (typeof window !== "undefined" && window.requestAnimationFrame) {
    window.requestAnimationFrame(run);
  } else {
    run();
  }
}

export function scrollToFirstFormError(errors, options = {}) {
  const firstError = getFirstError(errors);
  if (!firstError) return;

  scrollToFormField(firstError.fieldName, firstError.fieldError, options);
}
