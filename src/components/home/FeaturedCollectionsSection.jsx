import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import { endpoints } from "../../api/endpoints";
import SectionContainer from "../ui/SectionContainer";

export default function FeaturedCollectionsSection() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.get(endpoints.platform.collections, { params: { featured: true, limit: 8 } })
      .then((response) => {
        const payload = response?.data?.data ?? response?.data ?? [];
        const items = Array.isArray(payload) ? payload : payload?.items || [];
        if (active) setCollections(items);
      })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (!loading && !collections.length) return null;
  return <SectionContainer title="Featured Collections" subtitle="Curated picks for seasons, occasions and every budget" actionLabel="Shop All Products" actionHref="/products">
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:mt-8 lg:grid-cols-4">
      {(loading ? Array.from({ length: 4 }) : collections).map((collection, index) => {
        if (loading) return <div key={index} className="aspect-[4/3] animate-pulse rounded-2xl bg-gray-200" />;
        const value = collection._id || collection.slug || collection.name;
        return <Link key={value} to={`/products?collectionIds=${encodeURIComponent(value)}`} className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100 shadow-sm">
          {collection.thumbnailImage || collection.bannerImage ? <img src={collection.thumbnailImage || collection.bannerImage} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" /> : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 text-white"><h3 className="font-semibold">{collection.name}</h3>{collection.description ? <p className="mt-1 line-clamp-2 text-xs text-white/80">{collection.description}</p> : null}</div>
        </Link>;
      })}
    </div>
  </SectionContainer>;
}
