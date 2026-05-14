import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchCmsPageBySlug } from "../features/cms/cmsSlice";

export function useCmsRecord(cmsKey) {
  const dispatch = useDispatch();
  const entities = useSelector((state) => state.cms.entities || {});
  const list = useSelector((state) => state.cms.list);
  const loading = useSelector((state) => state.cms.loading);

  const page = useMemo(() => {
    if (!cmsKey) return null;
    if (entities[cmsKey]) return entities[cmsKey];
    return Array.isArray(list) ? list.find((item) => item?.slug === cmsKey) || null : null;
  }, [cmsKey, entities, list]);

  useEffect(() => {
    if (!cmsKey || page) return;
    dispatch(fetchCmsPageBySlug({ slug: cmsKey })).catch(() => {});
  }, [cmsKey, dispatch, page]);

  return { page, loading };
}

export function getCmsPayload(page, fallback) {
  return page?.metadata?.data || page?.metadata?.content || fallback;
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
