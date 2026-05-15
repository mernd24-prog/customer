import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Calendar, Clock, Tag } from "lucide-react";
import Seo from "../../components/common/Seo";
import ApiState from "../../components/common/ApiState";
import BrandButton from "../../components/ui/BrandButton";
import { fetchCmsPageBySlug } from "../../features/cms/cmsSlice";
import PolicyPage from "../customer/policyPage";

function CmsContent({ body }) {
  if (!body) return null;
  return (
    <div
      className="cms-content font-montserrat leading-relaxed text-[#787878] [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:font-montserrat [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-[#2E2E2E] [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:font-montserrat [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[#2E2E2E] [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:font-montserrat [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-[#2E2E2E] [&_h4]:mt-4 [&_h4]:mb-2 [&_h4]:font-montserrat [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-[#2E2E2E] [&_p]:mb-4 [&_p]:leading-7 [&_a]:font-semibold [&_a]:text-[#CE9F2D] [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-[#A26D27] [&_strong]:font-bold [&_strong]:text-[#2E2E2E] [&_em]:italic [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_blockquote]:my-4 [&_blockquote]:rounded-r-[8px] [&_blockquote]:border-l-4 [&_blockquote]:border-[#CE9F2D] [&_blockquote]:bg-[#FAF6EE] [&_blockquote]:px-4 [&_blockquote]:py-3 [&_blockquote]:italic [&_img]:my-6 [&_img]:max-w-full [&_img]:rounded-[12px] [&_hr]:my-8 [&_hr]:border-[#e7dfd1] [&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-[#e7dfd1] [&_th]:bg-[#FAF6EE] [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-montserrat [&_th]:font-semibold [&_th]:text-[#2E2E2E] [&_td]:border [&_td]:border-[#e7dfd1] [&_td]:px-3 [&_td]:py-2 [&_code]:rounded [&_code]:bg-[#F5ECDD] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm [&_code]:text-[#A26D27] [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-[8px] [&_pre]:bg-[#2E2E2E] [&_pre]:p-4 [&_pre]:text-white"
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}

<<<<<<< HEAD
=======
<<<<<<< HEAD
export default function CmsPage() {
  const { slug } = useParams();
=======
>>>>>>> origin/aditi-dev
const CMS_SLUG_ALIASES = {
  "terms-and-conditions": ["terms-and-conditions", "terms-of-use"],
  "terms-of-use": ["terms-of-use", "terms-and-conditions"],
  "refund-policy": ["refund-policy", "return-refund-policy"],
  "return-refund-policy": ["return-refund-policy", "refund-policy"],
<<<<<<< HEAD
  "about": ["about", "about-us"],
  "about-us": ["about-us", "about"],
  "help": ["help", "help-and-support"],
=======
  about: ["about", "about-us"],
  "about-us": ["about-us", "about"],
  help: ["help", "help-and-support"],
>>>>>>> origin/aditi-dev
};

function slugCandidates(slug = "") {
  const value = String(slug || "").trim();
  if (!value) return [];
  return CMS_SLUG_ALIASES[value] || [value];
}

export default function CmsPage({ fallbackData = null, slugOverride = "" }) {
  const { slug: paramSlug } = useParams();
  const slug = slugOverride || paramSlug;
  const candidates = slugCandidates(slug);
<<<<<<< HEAD
=======
>>>>>>> 3827ea0 (fix:Api related error fixes in the policy pages)
>>>>>>> origin/aditi-dev
  const dispatch = useDispatch();
  const cmsState = useSelector((s) => s.cms);
  const page = cmsState.current;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!candidates.length) return;
      for (const candidate of candidates) {
        try {
          await dispatch(fetchCmsPageBySlug({ slug: candidate })).unwrap();
          return;
        } catch {
          // try next alias
        }
      }
      if (mounted) {
        dispatch(fetchCmsPageBySlug({ slug: candidates[0] })).catch(() => {});
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [dispatch, slug]);

  const title = page?.metadata?.seoTitle || page?.title || slug;
  const description = page?.metadata?.seoDescription || page?.excerpt || "";
  const publishedAt = page?.publishedAt || page?.createdAt;
  const updatedAt = page?.updatedAt;
  const category = page?.category || page?.type;
  const coverImage =
    page?.coverImage ||
    page?.heroImage ||
    page?.thumbnailUrl ||
    page?.metadata?.coverImage ||
    page?.metadata?.heroImage ||
    page?.metadata?.thumbnailUrl;
  const galleryImages = Array.isArray(page?.galleryImages)
    ? page.galleryImages
    : [];
  const author = page?.author;
  const readTime = page?.readTime || page?.metadata?.readTime;

  return (
    <>
      <Seo title={`${title} | Sam Global`} description={description} />

      {/* Page header band */}
      <div className="border-b border-[#e7dfd1] bg-[#FAF6EE] px-4 py-6 sm:px-6">
        <div className="w-container">
          <nav className="mb-2 flex items-center gap-1 font-montserrat text-xs text-[#A6A6A6]">
            <Link to="/" className="hover:text-[#2E2E2E]">
              Home
            </Link>
            <span>/</span>
            {category && (
              <>
                <span className="capitalize text-[#787878]">{category}</span>
                <span>/</span>
              </>
            )}
            <span className="line-clamp-1 text-[#2E2E2E]">{title}</span>
          </nav>
        </div>
      </div>

      <div className="w-container py-8">
<<<<<<< HEAD
        {!cmsState.loading && !page && fallbackData ? (
          <PolicyPage data={fallbackData} />
        ) : (
=======
<<<<<<< HEAD
>>>>>>> origin/aditi-dev
        <ApiState
          loading={cmsState.loading && !page}
          error={cmsState.error}
          empty={!page && !cmsState.loading}
          emptyTitle="Page not found"
          emptyText="This content page doesn't exist or has been removed."
          onRetry={() => dispatch(fetchCmsPageBySlug({ slug: candidates[0] || slug }))}
        >
          {page && (
            <div className="mx-auto max-w-3xl">
              {/* Cover image */}
              {coverImage && (
                <div className="mb-8 overflow-hidden rounded-[16px]">
                  <img src={coverImage} alt={title} className="max-h-[420px] w-full object-cover" />
                </div>
              )}

              {/* Category badge */}
              {category && (
                <span className="chip mb-3 inline-block text-xs font-semibold uppercase tracking-wide">
                  {category}
                </span>
              )}

              {/* Title */}
              <h1 className="font-montserrat text-3xl font-bold leading-tight text-[#2E2E2E] sm:text-[36px]">
                {page.title}
              </h1>

              {/* Excerpt */}
              {page.excerpt && (
                <p className="mt-3 font-montserrat text-[17px] leading-relaxed text-[#787878]">
                  {page.excerpt}
                </p>
              )}

              {/* Meta row */}
              <div className="mt-5 flex flex-wrap items-center gap-4 border-b border-[#e7dfd1] pb-6">
                {author && (
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#CE9F2D] font-montserrat text-xs font-bold text-white">
                      {(author.name || author)[0]?.toUpperCase()}
                    </div>
                    <span className="font-montserrat text-sm font-medium text-[#2E2E2E]">
                      {author.name || author}
                    </span>
=======
        {!cmsState.loading && !page && fallbackData ? (
          <PolicyPage data={fallbackData} />
        ) : (
          <ApiState
            loading={cmsState.loading && !page}
            error={cmsState.error}
            empty={!page && !cmsState.loading}
            emptyTitle="Page not found"
            emptyText="This content page doesn't exist or has been removed."
            onRetry={() =>
              dispatch(fetchCmsPageBySlug({ slug: candidates[0] || slug }))
            }
          >
            {page && (
              <div className="mx-auto max-w-3xl">
                {/* Cover image */}
                {coverImage && (
                  <div className="mb-8 overflow-hidden rounded-[16px]">
                    <img
                      src={coverImage}
                      alt={title}
                      className="max-h-[420px] w-full object-cover"
                    />
>>>>>>> 3827ea0 (fix:Api related error fixes in the policy pages)
                  </div>
                )}

                {/* Category badge */}
                {category && (
                  <span className="chip mb-3 inline-block text-xs font-semibold uppercase tracking-wide">
                    {category}
                  </span>
                )}

                {/* Title */}
                <h1 className="font-montserrat text-3xl font-bold leading-tight text-[#2E2E2E] sm:text-[36px]">
                  {page.title}
                </h1>

                {/* Excerpt */}
                {page.excerpt && (
                  <p className="mt-3 font-montserrat text-[17px] leading-relaxed text-[#787878]">
                    {page.excerpt}
                  </p>
                )}

                {/* Meta row */}
                <div className="mt-5 flex flex-wrap items-center gap-4 border-b border-[#e7dfd1] pb-6">
                  {author && (
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#CE9F2D] font-montserrat text-xs font-bold text-white">
                        {(author?.name ||
                          (typeof author === "string"
                            ? author
                            : ""))[0]?.toUpperCase()}
                      </div>
                      <span className="font-montserrat text-sm font-medium text-[#2E2E2E]">
                        {author?.name ||
                          (typeof author === "string" ? author : "")}
                      </span>
                    </div>
                  )}
                  {publishedAt && (
                    <div className="flex items-center gap-1 font-montserrat text-xs text-[#A6A6A6]">
                      <Calendar size={13} />
                      {new Date(publishedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  )}
                  {readTime && (
                    <div className="flex items-center gap-1 font-montserrat text-xs text-[#A6A6A6]">
                      <Clock size={13} />
                      {readTime} min read
                    </div>
                  )}
                  {updatedAt && updatedAt !== publishedAt && (
                    <span className="font-montserrat text-xs text-[#A6A6A6]">
                      Updated {new Date(updatedAt).toLocaleDateString("en-IN")}
                    </span>
                  )}
                </div>

                {/* Body content */}
                <div className="mt-8">
                  <CmsContent body={page.body || page.content} />
                </div>
              </div>
<<<<<<< HEAD
            </div>
          )}
        </ApiState>
<<<<<<< HEAD
        )}
=======
=======
            )}
          </ApiState>
        )}
>>>>>>> 3827ea0 (fix:Api related error fixes in the policy pages)
>>>>>>> origin/aditi-dev
      </div>
    </>
  );
}
