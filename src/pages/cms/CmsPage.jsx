import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Calendar, Clock, Tag } from "lucide-react";
import Seo from "../../components/common/Seo";
import ApiState from "../../components/common/ApiState";
import BrandButton from "../../components/ui/BrandButton";
import { fetchCmsPageBySlug } from "../../features/cms/cmsSlice";
import { isNotFoundApiError } from "../../utils/apiErrors";

function CmsContent({ body }) {
  if (!body) return null;
  return (
    <div
      className=" cms-content  leading-relaxed text-muted [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]: [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-ink [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]: [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-ink [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]: [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-ink [&_h4]:mt-4 [&_h4]:mb-2 [&_h4]: [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-ink [&_p]:mb-4 [&_p]:leading-7 [&_a]:font-semibold [&_a]:text-gold [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-gold-dark [&_strong]:font-bold [&_strong]:text-ink [&_em]:italic [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_blockquote]:my-4 [&_blockquote]:rounded-r-[8px] [&_blockquote]:border-l-4 [&_blockquote]:border-gold [&_blockquote]:bg-cream [&_blockquote]:px-4 [&_blockquote]:py-3 [&_blockquote]:italic [&_img]:my-6 [&_img]:max-w-full [&_img]:rounded-[12px] [&_hr]:my-8 [&_hr]:border-border [&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-border [&_th]:bg-cream [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]: [&_th]:font-semibold [&_th]:text-ink [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_code]:rounded [&_code]:bg-gold-soft [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm [&_code]:text-gold-dark [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-[8px] [&_pre]:bg-ink [&_pre]:p-4 [&_pre]:text-white"
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}

export default function CmsPage({ slugOverride = "" }) {
  const { slug: slugFromParams } = useParams();
  const slug = slugOverride || slugFromParams;
  const dispatch = useDispatch();
  const cmsState = useSelector((s) => s.cms);
  const page = cmsState.current;

  useEffect(() => {
    dispatch(fetchCmsPageBySlug({ slug }));
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
  const points = Array.isArray(page?.points) ? page.points : [];
  const galleryImages = Array.isArray(page?.galleryImages)
    ? page.galleryImages
    : [];
  const author = page?.author;
  const readTime = page?.readTime || page?.metadata?.readTime;
  const pageUnavailable =
    !page &&
    !cmsState.loading &&
    (!cmsState.error || isNotFoundApiError(cmsState.error));

  return (
    <>
      <Seo title={`${title} | Sam Global`} description={description} />

      {/* Page header band */}
      <div className="border-b border-border bg-cream px-4 py-6 sm:px-6">
        <div className="w-container">
          <nav className="mb-2 flex items-center gap-1  text-xs text-gray">
            <Link to="/" className="hover:text-ink">
              Home
            </Link>
            <span>/</span>
            {category && (
              <>
                <span className="capitalize text-muted">{category}</span>
                <span>/</span>
              </>
            )}
            <span className="line-clamp-1 text-ink">{title}</span>
          </nav>
        </div>
      </div>

      <div className="w-container  py-8">
        <ApiState
          loading={cmsState.loading && !page}
          error={pageUnavailable ? null : cmsState.error}
          empty={pageUnavailable}
          emptyTitle="Coming soon"
          emptyText="This content page is being prepared and will be available soon."
        >
          {page && (
            <div className="mx-auto max-w-3xl ">
              {/* Cover image */}
              {coverImage && (
                <div className="mb-8 overflow-hidden  rounded-[var(--customer-radius)]">
                  <img
                    src={coverImage}
                    alt={title}
                    className="max-h-[420px] w-full object-cover"
                  />
                </div>
              )}

              {/* Category badge */}
              {category && (
                <span className="chip mb-3 inline-block text-xs font-semibold uppercase tracking-normal">
                  {category}
                </span>
              )}

              {/* Title */}
              <h1 className="  text-3xl font-bold leading-tight text-ink sm:text-[36px]">
                {page.title}
              </h1>

              {/* Excerpt */}
              {(page.excerpt || page.description) && (
                <p className="mt-3   text-[17px] leading-relaxed text-muted">
                  {page.excerpt || page.description}
                </p>
              )}

              {/* Meta row */}
              <div className="mt-5  flex flex-wrap items-center gap-4 border-b border-border pb-6">
                {author && (
                  <div className="flex items-center gap-2 ">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold  text-xs font-bold text-white">
                      {(typeof author === "string"
                        ? author
                        : author?.name || "A")[0]?.toUpperCase()}
                    </div>
                    <span className=" text-sm font-medium text-ink">
                      {typeof author === "string"
                        ? author
                        : author?.name || "Admin"}
                    </span>
                  </div>
                )}
                {publishedAt && (
                  <div className="flex items-center gap-1  text-xs text-gray">
                    <Calendar size={13} />
                    {new Date(publishedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                )}
                {readTime && (
                  <div className="flex items-center gap-1  text-xs text-gray">
                    <Clock size={13} />
                    {readTime} min read
                  </div>
                )}
                {updatedAt && updatedAt !== publishedAt && (
                  <span className=" text-xs text-gray">
                    Updated {new Date(updatedAt).toLocaleDateString("en-IN")}
                  </span>
                )}
              </div>

              {/* Body content */}
              <div className="mt-8">
                <CmsContent body={page.body || page.content} />
              </div>

              {points.length > 0 && (
                <div className="mt-8 rounded-[12px] border border-border bg-surface-soft p-5">
                  <h2 className="mb-3  text-xl font-semibold text-ink">
                    Highlights
                  </h2>
                  <div className="space-y-3">
                    {points.map((point, idx) => (
                      <div
                        key={`${point?.title || "point"}-${idx}`}
                        className="flex gap-3"
                      >
                        {point?.image ? (
                          <img
                            src={point.image}
                            alt={point?.title || "point"}
                            className="h-12 w-12 rounded object-cover"
                          />
                        ) : null}
                        <div>
                          <p className=" text-sm font-semibold text-ink">
                            {point?.title}
                          </p>
                          {point?.description ? (
                            <p className=" text-sm text-muted">
                              {point.description}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gallery */}
              {galleryImages.length > 0 && (
                <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {galleryImages.map((imageUrl) => (
                    <img
                      key={imageUrl}
                      src={imageUrl}
                      alt={page.title}
                      className="h-28 w-full rounded-[10px] object-cover sm:h-36"
                    />
                  ))}
                </div>
              )}

              {/* Tags */}
              {page.tags?.length > 0 && (
                <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-border pt-6">
                  <Tag size={13} className="text-gray" />
                  {page.tags.map((tag) => (
                    <span key={tag} className="chip text-xs font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* CTA block */}
              <div className="mt-10 rounded-[var(--customer-radius)] bg-ink px-8 py-10 text-center">
                <p className=" text-xl font-bold text-white">
                  Ready to start shopping?
                </p>
                <p className="mt-1  text-sm text-gray">
                  Discover thousands of products at Sam Global.
                </p>
                <div className="mt-5 flex justify-center">
                  <Link to="/products">
                    <BrandButton
                      variant="primary"
                      rounded
                      label="Browse Products"
                      size="md"
                      className="h-11 px-8 text-sm font-semibold"
                    />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </ApiState>
      </div>
    </>
  );
}
