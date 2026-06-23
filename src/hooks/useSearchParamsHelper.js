export const useSearchParamHelper = (setSearchParams) => {
  const updateSearchParams = (callback, resetPage = true) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);

      callback(next);

      if (resetPage) {
        next.delete("page");
      }

      return next;
    });
  };

  return { updateSearchParams };
};

