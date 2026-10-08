
import { asArray } from "../../utils/content";
import { FALLBACK_FOOTER } from "../../data/fallbackCmsData";

export const normalizeText = (value = "") =>
  String(value).trim().toLowerCase();

export const buildCategorySlug = (name = "category") =>
  String(name)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

export function getCategoryKey(item = {}) {
  return (
    item?.categoryKey ||
    item?.key ||
    item?.slug ||
    item?._id ||
    buildCategorySlug(item?.title || item?.name)
  );
}
export function getCategoryListFromResponse(data) {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.list)) return data.list;
  if (Array.isArray(data.categories)) return data.categories;
  if (data.category && typeof data.category === "object") return [data.category];
  if (data.data) return getCategoryListFromResponse(data.data);
  return [data];
}

export function getBrandListFromResponse(data) {
  const payload = data?.data ?? data;
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  return (
    [payload.brands, payload.items, payload.list, payload.results].find(
      Array.isArray,
    ) || []
  );
}
export function getRootCategories(categories = []) {
  const byKey = new Map();

  const visit = (category, parentKey = null) => {
    if (!category || typeof category !== "object") return;

    const categoryKey = getCategoryKey(category);
    if (!categoryKey) return;

    byKey.set(categoryKey, {
      ...category,
      categoryKey,
      parentKey: category?.parentKey ?? parentKey,
    });

    asArray(category?.children).forEach((child) => visit(child, categoryKey));
    asArray(category?.subCategories).forEach((child) => visit(child, categoryKey));
  };

  asArray(categories).forEach((category) =>
    visit(category, category?.parentKey ?? null),
  );

  return Array.from(byKey.values()).filter((category) => {
    const count = category?.productCount ?? category?.count;
    const hasExplicitZeroCount =
      count !== undefined &&
      count !== null &&
      count !== "" &&
      Number(count) < 1;

    return (
      (category.parentKey === null ||
        category.parentKey === undefined ||
        !byKey.has(category.parentKey) ||
        Number(category.level || 0) === 0) &&
      !hasExplicitZeroCount
    );
  });
}
export function getCmsPayload(page) {
  if (!page) return null;
  return (
    page?.metadata?.data ??
    page?.metadata?.content ??
    page?.metadata?.sections ??
    page?.data ??
    page?.content ??
    page?.sections ??
    page
  );
}
export function getCmsSections(page) {
  const payload = getCmsPayload(page);
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  if (Array.isArray(payload.sections)) return payload.sections;
  if (Array.isArray(payload.data)) return payload.data;
  if (payload.data && typeof payload.data === "object") {
    if (Array.isArray(payload.data.sections)) return payload.data.sections;
  }
  if (Array.isArray(payload.content)) return payload.content;
  return [];
}

export function getCmsImageUrl(image) {
  if (!image) return "";
  if (typeof image === "string") return image.trim();
  return String(
    image?.url || image?.src || image?.imageUrl || image?.path || "",
  ).trim();
}

export function getCmsSection(sections, title) {
  const normalizedTitle = normalizeText(title);
  return asArray(sections).find((section) => {
    const sectionTitle = normalizeText(section?.title);
    const sectionType = normalizeText(section?.type);
    return sectionTitle === normalizedTitle || sectionType === normalizedTitle;
  });
}
export function getCmsSectionTitle(section) {
  const title = String(section?.title || "").trim();
  if (title) return title;
  const type = String(section?.type || "").trim();
  if (type && normalizeText(type) !== "content") return type;
  return "";
}
export function getCmsPointImage(point) {
  return getCmsImageUrl(point?.image);
}
export function normalizeFooterCmsData(page) {
  const payload = getCmsPayload(page);
  const sections = getCmsSections(page);

  if ((!payload || typeof payload !== "object") && !Array.isArray(payload)) {
    return null;
  }

  const footerLinksSection = getCmsSection(sections, "footer-links");
  const appSection = getCmsSection(sections, "appDownload");
  const copyrightSection = getCmsSection(sections, "copyright");
  const logo =
    getCmsImageUrl(appSection?.image) || getCmsImageUrl(payload?.image);
  const benefits = asArray(footerLinksSection?.points)
    .map((point) => {
      const title = String(point?.title || "").trim();
      const description = String(point?.description || "").trim();
      const icon = getCmsPointImage(point);
      if (!title && !description && !icon) return null;
      return {
        title,
        description,
        icon,
        alt: point?.image?.alt || title || "Benefit",
      };
    })
    .filter(Boolean);
  const ignoredSectionTitles = new Set(["footer-links", "appdownload", "copyright"]);

  const linkGroups = sections
    .map((section) => {
      const normalizedTitle = normalizeText(section?.title);
      const normalizedType = normalizeText(section?.type);
      if (
        ignoredSectionTitles.has(normalizedTitle) ||
        ignoredSectionTitles.has(normalizedType)
      ) {
        return null;
      }

      const title = getCmsSectionTitle(section);
      if (!title) return null;

      const links = asArray(section?.points)
        .map((point) => {
          const label = String(
            point?.cta?.label || point?.title || "",
          ).trim();
          const href = String(
            point?.cta?.url || point?.url || "",
          ).trim();
          if (!label || !href) return null;
          return {
            label,
            href,
            target: point?.cta?.target || point?.target || "_self",
          };
        })
        .filter(Boolean);

      if (!links.length) return null;
      return { title, links };
    })
    .filter(Boolean);
  const appLinks = asArray(appSection?.points)
    .map((point) => {
      const image = getCmsPointImage(point);
      const label = String(
        point?.title || point?.cta?.label || "",
      ).trim();
      const href = String(
        point?.cta?.url || point?.url || "/mobile-app",
      ).trim();
      if (!image && !label) return null;
      return {
        label,
        href,
        image,
        alt: point?.image?.alt || label || "App",
        target: point?.cta?.target || point?.target || "_self",
      };
    })
    .filter(Boolean);
  const socialNames = [
    "instagram",
    "facebook",
    "youtube",
    "twitter",
    "linkedin",
    "pinterest",
  ];

  const socialLinks = asArray(copyrightSection?.points)
    .map((point) => {
      const title = normalizeText(point?.title || point?.cta?.label || "");
      const isSocial = socialNames.some((name) => title.includes(name));
      if (!isSocial) return null;

      const icon = getCmsPointImage(point);
      return {
        label: String(point?.cta?.label || point?.title || "").trim(),
        href: String(point?.cta?.url || point?.url || "").trim(),
        icon,
        alt: point?.image?.alt || point?.cta?.label || point?.title || "Social media",
        target: point?.cta?.target || point?.target || "_blank",
      };
    })
    .filter((item) => item?.label || item?.href || item?.icon);
  const copyright = String(
    copyrightSection?.description || payload?.copyright || "",
  ).trim();
  return {
    logo,
    benefits,
    linkGroups,
    appDownload: {
      title: String(appSection?.description || "").trim(),
      links: appLinks,
    },
    copyright,
    socialLinks,
  };
}
export function mergeFooterBenefits(fallbackBenefits = [], cmsBenefits = []) {
  if (!cmsBenefits.length) return fallbackBenefits;
  return cmsBenefits.map((cmsItem, index) => {
    const fallbackItem = fallbackBenefits[index] || {};
    return {
      ...fallbackItem,
      ...cmsItem,
      title: cmsItem?.title || fallbackItem?.title || "",
      description: cmsItem?.description || fallbackItem?.description || "",
      icon: cmsItem?.icon || fallbackItem?.icon || "",
      alt: cmsItem?.alt || fallbackItem?.alt || "Benefit",
    };
  });
}

export function mergeAppLinks(fallbackLinks = [], cmsLinks = []) {
  if (!cmsLinks.length) return fallbackLinks;
  return cmsLinks.map((cmsItem, index) => {
    const fallbackItem = fallbackLinks[index] || {};
    return {
      ...fallbackItem,
      ...cmsItem,
      label: cmsItem?.label || fallbackItem?.label || "",
      href: cmsItem?.href || fallbackItem?.href || "/mobile-app",
      image: cmsItem?.image || fallbackItem?.image || "",
      alt:
        cmsItem?.alt || fallbackItem?.alt || cmsItem?.label || fallbackItem?.label || "App",
      target: cmsItem?.target || fallbackItem?.target || "_self",
    };
  });
}

export function mergeSocialLinks(fallbackLinks = [], cmsLinks = []) {
  if (!cmsLinks.length) return fallbackLinks;
  return cmsLinks.map((cmsItem, index) => {
    const fallbackItem = fallbackLinks[index] || {};
    return {
      ...fallbackItem,
      ...cmsItem,
      label: cmsItem?.label || fallbackItem?.label || "",
      href: cmsItem?.href || fallbackItem?.href || "#",
      icon: cmsItem?.icon || fallbackItem?.icon || "",
      alt:
        cmsItem?.alt ||
        fallbackItem?.alt ||
        cmsItem?.label ||
        fallbackItem?.label ||
        "Social media",
      target: cmsItem?.target || fallbackItem?.target || "_blank",
    };
  });
}

export function mergeLinkGroups(fallbackGroups = [], cmsGroups = []) {
  if (!cmsGroups.length) return fallbackGroups;

  return cmsGroups.map((cmsGroup, groupIndex) => {
    const cmsTitle = normalizeText(cmsGroup?.title);
    const fallbackGroup =
      fallbackGroups.find(
        (group) => normalizeText(group?.title) === cmsTitle,
      ) ||
      fallbackGroups[groupIndex] ||
      {};

    const fallbackLinks = asArray(fallbackGroup?.links);
    const cmsLinks = asArray(cmsGroup?.links);

    const mergedLinks = cmsLinks.map((cmsLink, linkIndex) => {
      const fallbackLink = fallbackLinks[linkIndex] || {};
      return {
        ...fallbackLink,
        ...cmsLink,
        label: cmsLink?.label || fallbackLink?.label || "",
        href: cmsLink?.href || fallbackLink?.href || "",
        target: cmsLink?.target || fallbackLink?.target || "_self",
      };
    });

    return {
      ...fallbackGroup,
      ...cmsGroup,
      title: cmsGroup?.title || fallbackGroup?.title || "",
      links: mergedLinks.length > 0 ? mergedLinks : fallbackLinks,
    };
  });
}

export function mergeFooterData(fallback, cmsData) {
  const safeFallback = fallback || FALLBACK_FOOTER;
  if (!cmsData) return safeFallback;

  return {
    ...safeFallback,
    logo: cmsData?.logo || safeFallback?.logo || "",
    benefits: mergeFooterBenefits(
      asArray(safeFallback?.benefits),
      asArray(cmsData?.benefits),
    ),
    linkGroups: mergeLinkGroups(
      asArray(safeFallback?.linkGroups),
      asArray(cmsData?.linkGroups),
    ),
    appDownload: {
      ...safeFallback?.appDownload,
      title:
        cmsData?.appDownload?.title || safeFallback?.appDownload?.title || "",
      links: mergeAppLinks(
        asArray(safeFallback?.appDownload?.links),
        asArray(cmsData?.appDownload?.links),
      ),
    },
    copyright: cmsData?.copyright || safeFallback?.copyright || "",
    socialLinks: mergeSocialLinks(
      asArray(safeFallback?.socialLinks),
      asArray(cmsData?.socialLinks),
    ),
  };
}
