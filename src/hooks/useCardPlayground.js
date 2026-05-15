import { useMemo, useState } from "react";
import { asArray } from "../utils/content";

export function useCardPlayground(items = []) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [layout, setLayout] = useState("grid");
  const [favorites, setFavorites] = useState({});

  const source = asArray(items);

  const categories = useMemo(() => {
    const set = new Set();
    source.forEach((item) => {
      if (item?.category) set.add(item.category);
    });
    return ["all", ...Array.from(set)];
  }, [source]);

  const filtered = useMemo(() => {
    let list = source;

    if (category !== "all") {
      list = list.filter((item) => item?.category === category);
    }

    const trimmed = query.trim().toLowerCase();
    if (trimmed) {
      list = list.filter((item) => {
        const hay = `${item?.title || ""} ${item?.description || ""} ${item?.category || ""}`.toLowerCase();
        return hay.includes(trimmed);
      });
    }

    const next = [...list];
    if (sortBy === "title-asc") next.sort((a, b) => String(a?.title || "").localeCompare(String(b?.title || "")));
    if (sortBy === "title-desc") next.sort((a, b) => String(b?.title || "").localeCompare(String(a?.title || "")));
    if (sortBy === "rating-desc") next.sort((a, b) => Number(b?.rating || 0) - Number(a?.rating || 0));

    return next;
  }, [source, category, query, sortBy]);

  const toggleFavorite = (id) => {
    if (!id) return;
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return {
    query,
    setQuery,
    category,
    setCategory,
    sortBy,
    setSortBy,
    layout,
    setLayout,
    categories,
    filtered,
    favorites,
    toggleFavorite,
  };
}
