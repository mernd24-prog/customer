import { useEffect, useState } from "react";
import api from "../api/client";
import { tokenStorage } from "../api/tokenStorage";

const images = new Map();
const fallback = "/image/png/person.png";

export function invalidateProfileImageCache() {
  for (const [, entry] of images.entries()) {
    if (entry.url) {
      URL.revokeObjectURL(entry.url);
    }
  }
  images.clear();
}

function acquireImage(key) {
  let entry = images.get(key);
  if (!entry) {
    entry = { users: 0, url: null, cleanup: null };
    entry.promise = api
      .get("/api/v1/users/me/profile-image", {
        responseType: "blob",
        _skipServiceAvailability: true,
      })
      .then(({ data }) => {
        entry.url = URL.createObjectURL(data);
        return entry.url;
      })
      .catch((err) => {
        if (images.get(key) === entry) {
          images.delete(key);
        }
        throw err;
      });
    images.set(key, entry);
  }
  clearTimeout(entry.cleanup);
  entry.users += 1;
  return entry;
}

function releaseImage(key, entry) {
  entry.users -= 1;
  if (entry.users) return;
  entry.cleanup = setTimeout(() => {
    if (entry.users) return;
    if (images.get(key) === entry) images.delete(key);
    entry.promise
      .then(() => {
        if (entry.url) URL.revokeObjectURL(entry.url);
      })
      .catch(() => {});
  }, 1000);
}

export function useProfileImageState(source, revision) {
  const protectedImage = /\/api\/v1\/users\/me\/profile-image(?:$|\?)/.test(source || "");
  const token = tokenStorage.getAccessToken();
  const key = token ? `${token}:${revision || "current"}` : null;

  const [loaded, setLoaded] = useState(() => {
    if (key && images.get(key)?.url) {
      return { key, url: images.get(key).url };
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(() => {
    if (!protectedImage || !key) return false;
    return !images.get(key)?.url;
  });

  useEffect(() => {
    if (!protectedImage || !key) {
      setIsLoading(false);
      return;
    }

    let active = true;
    const entry = acquireImage(key);

    if (entry.url) {
      if (loaded?.key !== key) {
        setLoaded({ key, url: entry.url });
      }
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }

    entry.promise
      .then((url) => {
        if (active) {
          setLoaded({ key, url });
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setLoaded(null);
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
      releaseImage(key, entry);
    };
  }, [key, protectedImage]);

  if (!protectedImage) {
    return {
      src: source || fallback,
      isLoading: false,
    };
  }

  const currentUrl = (loaded?.key === key && loaded.url) || (key ? images.get(key)?.url : null);
  return {
    src: currentUrl || fallback,
    isLoading: isLoading && !currentUrl,
  };
}

export default function useProfileImage(source, revision) {
  const { src } = useProfileImageState(source, revision);
  return src;
}

