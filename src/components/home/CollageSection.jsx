import { useEffect, useState } from "react";
import { SKELETON_PRESETS, SkeletonLoader } from "../ui/skeleton";
import CollageCard from "../ui/CollageCard";
import { apiRequest } from "../../api/client";
import { endpoints } from "../../api/endpoints";
import { FALLBACK_COLLAGE_SECTIONS } from "../../constants/home.constant";
import { 
  toCollageSections, 
  resolveVisibleSections, 
  completeSection, 
  hasImages 
} from "../../utils/collage";

const loadCollageSections = () => {
  return apiRequest({
    url: endpoints.home.collectionCollages,
    params: { limit: 4, itemsPerSection: 4, v: 8, ts: Date.now() },
  });
};

export default function CollageSection({ cmsPages = [] }) {
  const [loading, setLoading] = useState(true);
  const [apiSections, setApiSections] = useState([]);
  const [apiFailed, setApiFailed] = useState(false);

  useEffect(() => {
    let active = true;

    const request = loadCollageSections().catch(() => {
      if (active) setApiFailed(true);
      return { data: [] };
    });

    request.then((response) => {
      if (!active) return;
      const sections = Array.isArray(response?.data) ? response.data : [];
      if (!sections.length) setApiFailed(true);
      setApiSections(sections);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);
  
  const sections = toCollageSections(cmsPages);
  
  const visibleSections = apiFailed
    ? resolveVisibleSections(apiSections, sections, FALLBACK_COLLAGE_SECTIONS)
    : apiSections.filter(hasImages).map(completeSection).slice(0, 4);

  return (
    <section className="my-6 overflow-hidden sm:my-7 md:my-8">
      {loading ? (
        <SkeletonLoader
          layout={SKELETON_PRESETS.HERO_CARDS}
          count={4}
          containerClass="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:gap-8 md:grid-cols-2 xl:grid-cols-4 h-full">
          {visibleSections.map((section, idx) => (
            <CollageCard key={idx} section={section} />
          ))}
        </div>
      )}
    </section>
  );
}
