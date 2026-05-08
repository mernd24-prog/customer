import { Helmet } from "react-helmet-async";
import { SITE_CONFIG } from "../../config/site";
import { buildSeo } from "../../utils/seo";

export default function Seo({
  title,
  description,
  image,
  path,
  canonical,
  type,
  robots,
  jsonLd,
}) {
  const meta = buildSeo({
    title,
    description,
    image,
    path,
    canonical,
    type,
    robots,
    jsonLd,
  });

  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta name="robots" content={meta.robots} />
      <link rel="canonical" href={meta.canonical} />
      <meta property="og:site_name" content={SITE_CONFIG.name} />
      <meta property="og:locale" content={SITE_CONFIG.locale} />
      <meta property="og:type" content={meta.type} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={meta.canonical} />
      <meta property="og:image" content={meta.image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={meta.image} />
      {SITE_CONFIG.twitterHandle && (
        <meta name="twitter:site" content={SITE_CONFIG.twitterHandle} />
      )}
      {meta.jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(meta.jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
