import { useEffect, useState } from "react";
import api from "../api/client";
import { tokenStorage } from "../api/tokenStorage";

const images = new Map();
const fallback = "/image/png/person.png";

function acquireImage(key) {
  let entry = images.get(key);
  if (!entry) {
    entry = { users: 0, url: null, cleanup: null };
    entry.promise = api.get("/api/v1/users/me/profile-image", {
      responseType: "blob",
      _skipServiceAvailability: true,
    }).then(({ data }) => {
      entry.url = URL.createObjectURL(data);
      return entry.url;
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
  // Delay cleanup so React StrictMode's immediate remount can reuse the request.
  entry.cleanup = setTimeout(() => {
    if (entry.users) return;
    if (images.get(key) === entry) images.delete(key);
    entry.promise.then(() => { if (entry.url) URL.revokeObjectURL(entry.url); }).catch(() => {});
  }, 50);
}

export default function useProfileImage(source, revision) {
  const [loaded, setLoaded] = useState(null);
  const protectedImage = /\/api\/v1\/users\/me\/profile-image(?:$|\?)/.test(source || "");
  const token = tokenStorage.getAccessToken();
  const key = token ? `${token}:${revision || "current"}` : null;
  useEffect(() => {
    if (!protectedImage || !key) return;
    let active = true;
    const entry = acquireImage(key);
    entry.promise.then((url) => {
      if (active) setLoaded({ key, url });
    }).catch(() => { if (active) setLoaded(null); });
    return () => { active = false; releaseImage(key, entry); };
  }, [key, protectedImage]);
  if (!protectedImage) return source;
  return key && loaded?.key === key ? loaded.url : fallback;
}
