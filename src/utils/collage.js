export const collageImageHeightClass = (count, index) => {
  if (count === 1) return "h-[200px] sm:h-[320px] lg:h-[300px] xl:h-[300px] col-span-2";
  if (count === 2) return "h-[200px] sm:h-[320px] lg:h-[300px] xl:h-[300px]";
  if (count === 3 && index === 2) return "h-[100px] sm:h-[160px] lg:h-[150px] xl:h-[150px] col-span-2";
  return "h-[100px] sm:h-[160px] lg:h-[150px] xl:h-[150px]";
};

export const compactLabel = (value = "", max = 16) => {
  const text = String(value || "").trim();
  return text.length > max ? `${text.slice(0, max).trim()}...` : text;
};

export const collageLabelWidthClass = (count, index) => {
  if (count === 1 || (count === 3 && index === 2)) return "max-w-[72%]";
  return "max-w-[82%]";
};

export const getImageUrl = (image) =>
  typeof image === "string"
    ? image
    : image?.url || image?.image || image?.imageUrl || image?.src || image?.coverImage || "";

export const getLinkUrl = (item = {}, fallback = "/products") =>
  item.link || item.url || item.href || item.cta?.url || fallback;

export const toCollageImage = (item = {}, fallbackLink = "/products") => ({
  image: getImageUrl(item.image || item),
  link: getLinkUrl(item, fallbackLink),
  label: item.label || item.title || item.alt || "Featured",
});

export const toCollageSections = (cmsPages = []) => {
  const sections = (Array.isArray(cmsPages) ? cmsPages : [])
    .filter((page) => String(page?.pageType || "") === "homepage-slide")
    .sort((a, b) => Number(a?.sortOrder || 0) - Number(b?.sortOrder || 0))
    .slice(0, 4)
    .map((page) => {
      const metadata = page?.metadata || {};
      const metadataData = metadata?.data || {};
      const fallbackLink =
        metadata?.ctaLink ||
        metadataData?.ctaLink ||
        page?.cta?.url ||
        `/cms/${page?.slug || ""}`;
      const sectionImages = (Array.isArray(page?.sections) ? page.sections : [])
        .flatMap((section) => [
          section?.image,
          ...(Array.isArray(section?.gallery) ? section.gallery : []),
          ...(Array.isArray(section?.points) ? section.points.map((point) => ({
            image: point?.image,
            label: point?.title,
            link: point?.cta?.url,
          })) : []),
        ]);
      const metadataImages =
        metadata?.images ||
        metadataData?.images ||
        metadata?.cards ||
        metadataData?.cards ||
        [];
      const galleryImages = [
        ...(Array.isArray(page?.gallery) ? page.gallery : []),
        ...(Array.isArray(page?.galleryImages) ? page.galleryImages : []),
      ];
      const sourceImages = [
        ...(Array.isArray(metadataImages) ? metadataImages : []),
        ...sectionImages,
        ...galleryImages,
        page?.coverImage || page?.metadata?.coverImage || page?.image,
      ];

      return {
        title: page?.title || metadataData?.title || "Featured",
        label: metadata?.badge || metadataData?.badge || "Trending",
        category: metadata?.category || metadataData?.category || page?.category,
        images: sourceImages
          .map((item) => toCollageImage(item, fallbackLink))
          .filter((img) => img.image)
          .slice(0, 4),
      };
    })
    .filter((section) => section.images.length > 0);
  return sections;
};

export const hasImages = (section = {}) =>
  Array.isArray(section.images) && section.images.some((item) => item?.image);

export const completeSection = (section = {}) => ({
  ...section,
  images: (section.images || []).filter((item) => item?.image).slice(0, 4),
});

export const resolveVisibleSections = (apiSections = [], cmsSections = [], fallbackSections = []) => {
  const realApiSections = apiSections.filter(hasImages).map(completeSection);
  if (realApiSections.length) return realApiSections.slice(0, 4);

  const byKeyOrTitle = (items = []) => {
    const map = new Map();
    items.forEach((section) => {
      if (section.key) map.set(section.key, section);
      if (section.title) map.set(section.title, section);
    });
    return map;
  };
  const apiMap = byKeyOrTitle(apiSections);
  const cmsMap = byKeyOrTitle(cmsSections);

  return fallbackSections.map((fallback) => {
    const apiSection = apiMap.get(fallback.key) || apiMap.get(fallback.title);
    if (hasImages(apiSection)) return completeSection(apiSection);
    const cmsSection = cmsMap.get(fallback.key) || cmsMap.get(fallback.title);
    if (hasImages(cmsSection)) return completeSection(cmsSection);
    return completeSection(fallback);
  });
};
