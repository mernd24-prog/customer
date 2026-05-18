import CmsPage from "./CmsPage";

export default function CmsFallbackPage({ fallbackType }) {
  return <CmsPage slugOverride={fallbackType} />;
}
