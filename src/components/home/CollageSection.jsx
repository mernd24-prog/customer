import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { SKELETON_PRESETS, SkeletonLoader } from "../ui/skeleton";
import CollageCard from "../ui/CollageCard";
import { apiRequest } from "../../api/client";
import { endpoints } from "../../api/endpoints";
import { FALLBACK_COLLAGE_SECTIONS } from "../../constants/home.constant";
import {
  toCollageSections,
  resolveVisibleSections,
  completeSection,
  hasImages,
} from "../../utils/collage";

export default function CollageSection({ cmsPages = [] }) {
  const [loading, setLoading] = useState(true);
  const [apiSections, setApiSections] = useState([]);
  const [apiFailed, setApiFailed] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();

    apiRequest({
      url: endpoints.home.collectionCollages,
      params: { limit: 4, itemsPerSection: 4, v: 8 },
      signal: abortController.signal,
    })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setApiFailed(true);
        }
        return { data: [] };
      })
      .then((response) => {
        if (abortController.signal.aborted) return;
        const sections = Array.isArray(response?.data) ? response.data : [];
        if (!sections.length) setApiFailed(true);
        setApiSections(sections);
        setLoading(false);
      });

    return () => {
      abortController.abort();
    };
  }, []);

  const sections = toCollageSections(cmsPages);

  const visibleSections = apiFailed
    ? resolveVisibleSections(apiSections, sections, FALLBACK_COLLAGE_SECTIONS)
    : apiSections.filter(hasImages).map(completeSection);

  // Filter out Electronics and limit to 3 sections as requested
  const finalSections = visibleSections
    .filter(
      (s) =>
        !String(s.title || "")
          .toLowerCase()
          .includes("electronic"),
    )
    .slice(0, 3);

  return (
    <section className="py-8 lg:py-10 overflow-hidden relative">
      {loading ? (
        <SkeletonLoader
          layout={SKELETON_PRESETS.HERO_CARDS}
          count={3}
          containerClass="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {finalSections.map((section, idx) => (
            <div key={idx} className="h-auto">
              <CollageCard section={section} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
