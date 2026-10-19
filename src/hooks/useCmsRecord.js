import { useMemo } from "react";
import { useSelector } from "react-redux";

const cmsRecordKey = (item) =>
  item?.slug ||
  item?.cmsKey ||
  item?.metadata?.cmsKey ||
  item?.metadata?.data?.cmsKey ||
  item?.data?.cmsKey ||
  item?.metadata?.routePath?.replace(/^\//, "") ||
  item?.routePath?.replace(/^\//, "");

export function useCmsRecord(cmsKey) {
  const entities = useSelector((state) => state.cms.entities) || {};
  const list = useSelector((state) => state.cms.list);
  const current = useSelector((state) => state.cms.current);
  const loading = useSelector((state) => state.cms.loading);


  const page = useMemo(() => {
    if (!cmsKey) return null;
    if (entities[cmsKey]) return entities[cmsKey];
    if (cmsRecordKey(current) === cmsKey) return current;
    return Array.isArray(list)
      ? list.find((item) => cmsRecordKey(item) === cmsKey) || null
      : null;
  }, [cmsKey, current, entities, list]);

  return { page, loading };
}

export function getCmsPayload(page, fallback) {
  if (!page) return fallback;

  return (
    page?.metadata?.data ||
    page?.metadata?.content ||
    page?.metadata?.sections ||
    page?.data ||
    page?.content ||
    page?.sections ||
    page
  );
}

export function getCmsImageSet(page, fallbackImage = "") {
  return {
    heroImage:
      page?.heroImage ||
      page?.metadata?.heroImage ||
      page?.coverImage ||
      page?.metadata?.coverImage ||
      fallbackImage,
    coverImage:
      page?.coverImage ||
      page?.metadata?.coverImage ||
      page?.heroImage ||
      page?.metadata?.heroImage ||
      fallbackImage,
    thumbnailUrl:
      page?.thumbnailUrl ||
      page?.metadata?.thumbnailUrl ||
      page?.coverImage ||
      page?.metadata?.coverImage ||
      fallbackImage,
  };
}
