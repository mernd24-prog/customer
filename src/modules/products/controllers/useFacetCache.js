import { useMemo, useRef } from "react";

export function useStickyFacet(rawOptions = [], selectedValues = [], contextKey = "") {
  const optionsRef = useRef({ context: "", options: [] });
  
  return useMemo(() => {
    if (contextKey !== optionsRef.current.context || selectedValues.length === 0) {
      optionsRef.current = {
        context: contextKey,
        options: rawOptions,
      };
    }
    
    if (selectedValues.length > 0 && optionsRef.current.options.length > 0) {
      const mergedMap = new Map();
      optionsRef.current.options.forEach((opt) => mergedMap.set(opt.value ?? opt.key, { ...opt }));
      rawOptions.forEach((opt) => mergedMap.set(opt.value ?? opt.key, opt));
      return Array.from(mergedMap.values());
    }
    
    return optionsRef.current.options;
  }, [rawOptions, selectedValues, contextKey]);
}

export function useStickyAttributes(rawAttributes = [], hasAnySelected = false, contextKey = "") {
  const attributesRef = useRef({ context: "", attributes: [] });
  
  return useMemo(() => {
    if (contextKey !== attributesRef.current.context || !hasAnySelected) {
      attributesRef.current = {
        context: contextKey,
        attributes: rawAttributes,
      };
    }
    
    if (hasAnySelected && attributesRef.current.attributes.length > 0) {
      const mergedAttributes = attributesRef.current.attributes.map((cachedAttr) => {
        const rawAttr = rawAttributes.find((ra) => ra.key === cachedAttr.key);
        if (!rawAttr) return cachedAttr;
        const mergedValuesMap = new Map();
        (cachedAttr.values || []).forEach((v) => mergedValuesMap.set(v.value ?? v.key, { ...v }));
        (rawAttr.values || []).forEach((v) => mergedValuesMap.set(v.value ?? v.key, v));
        return {
          ...cachedAttr,
          values: Array.from(mergedValuesMap.values()),
        };
      });
      
      rawAttributes.forEach((rawAttr) => {
        if (!mergedAttributes.find((ma) => ma.key === rawAttr.key)) {
          mergedAttributes.push(rawAttr);
        }
      });
      return mergedAttributes;
    }
    
    return attributesRef.current.attributes;
  }, [rawAttributes, hasAnySelected, contextKey]);
}
