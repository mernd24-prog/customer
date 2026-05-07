import { useMemo, useState } from "react";

export function usePagination({ total = 0, initialPage = 1, pageSize = 12 } = {}) {
  const [page, setPage] = useState(initialPage);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  const pagination = useMemo(() => {
    const safePage = Math.min(Math.max(page, 1), pageCount);
    const offset = (safePage - 1) * pageSize;

    return {
      page: safePage,
      pageSize,
      pageCount,
      offset,
      limit: pageSize,
      hasNext: safePage < pageCount,
      hasPrevious: safePage > 1,
      nextPage: () => setPage((current) => Math.min(current + 1, pageCount)),
      previousPage: () => setPage((current) => Math.max(current - 1, 1)),
      setPage,
    };
  }, [page, pageCount, pageSize]);

  return pagination;
}

export default usePagination;
