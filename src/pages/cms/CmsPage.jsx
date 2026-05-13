import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Calendar, Clock } from "lucide-react";
import Seo from "../../components/common/Seo";
import ApiState from "../../components/common/ApiState";
import { fetchCmsPageBySlug } from "../../features/cms/cmsSlice";

function CmsContent({ body }) {
  if (!body) return null;
  return (
    <div
      className="cms-content text-slate-600 leading-relaxed [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-slate-900 [&_h1]:mt-8 [&_h1]:mb-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-slate-800 [&_h3]:mt-5 [&_h3]:mb-2 [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-slate-800 [&_h4]:mt-4 [&_h4]:mb-2 [&_p]:mb-4 [&_p]:leading-7 [&_a]:text-amber-600 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-amber-700 [&_strong]:font-bold [&_strong]:text-slate-800 [&_em]:italic [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_li]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-amber-400 [&_blockquote]:bg-amber-50 [&_blockquote]:px-4 [&_blockquote]:py-3 [&_blockquote]:rounded-r-lg [&_blockquote]:my-4 [&_blockquote]:italic [&_img]:rounded-2xl [&_img]:shadow-md [&_img]:my-6 [&_img]:max-w-full [&_hr]:border-stone-200 [&_hr]:my-8 [&_table]:border-collapse [&_table]:w-full [&_table]:my-4 [&_th]:border [&_th]:border-stone-200 [&_th]:bg-stone-100 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_td]:border [&_td]:border-stone-200 [&_td]:px-3 [&_td]:py-2 [&_code]:bg-stone-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_pre]:bg-slate-900 [&_pre]:text-white [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:my-4"
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}

export default function CmsPage() {
  const { slug } = useParams();
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
  const coverImage = page?.coverImage || page?.thumbnailUrl;
  const author = page?.author;
  const readTime = page?.readTime || page?.metadata?.readTime;

  return (
    <>
      <Seo
        title={`${title} | Sam Global`}
        description={description}
      />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1.5 text-xs text-slate-400">
          <Link to="/" className="hover:text-slate-700">Home</Link>
          <span>/</span>
          {category && (
            <>
              <span className="capitalize text-slate-500">{category}</span>
              <span>/</span>
            </>
          )}
          <span className="text-slate-700 line-clamp-1">{title}</span>
        </nav>

        <ApiState
          loading={cmsState.loading && !page}
          error={cmsState.error}
          empty={!page && !cmsState.loading}
          emptyTitle="Page not found"
          emptyText="This content page doesn't exist or has been removed."
          onRetry={() => dispatch(fetchCmsPageBySlug({ slug }))}
        >
          {page && (
            <article>
              {/* Hero image */}
              {coverImage && (
                <div className="mb-8 overflow-hidden rounded-2xl">
                  <img
                    src={coverImage}
                    alt={title}
                    className="w-full object-cover max-h-[420px]"
                  />
                </div>
              )}

              {/* Category badge */}
              {category && (
                <span className="mb-3 inline-block rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold uppercase tracking-wide text-amber-700">
                  {category}
                </span>
              )}

              {/* Title */}
              <h1 className="text-3xl font-bold text-slate-950 sm:text-4xl leading-tight">
                {page.title}
              </h1>

              {/* Excerpt */}
              {page.excerpt && (
                <p className="mt-3 text-lg text-slate-500 leading-relaxed">
                  {page.excerpt}
                </p>
              )}

              {/* Meta row */}
              <div className="mt-4 flex flex-wrap items-center gap-4 border-b border-stone-200 pb-6">
                {author && (
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                      {(author.name || author)[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      {author.name || author}
                    </span>
                  </div>
                )}
                {publishedAt && (
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Calendar size={13} />
                    {new Date(publishedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                )}
                {readTime && (
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock size={13} />
                    {readTime} min read
                  </div>
                )}
                {updatedAt && updatedAt !== publishedAt && (
                  <span className="text-xs text-slate-400">
                    Updated {new Date(updatedAt).toLocaleDateString("en-IN")}
                  </span>
                )}
              </div>

              {/* Body */}
              <div className="mt-8">
                <CmsContent body={page.body || page.content} />
              </div>

              {/* Tags */}
              {page.tags?.length > 0 && (
                <div className="mt-10 flex flex-wrap gap-2 border-t border-stone-200 pt-6">
                  {page.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-slate-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* CTA */}
              <div className="mt-10 rounded-2xl bg-slate-950 p-8 text-center">
                <p className="text-lg font-bold text-white">
                  Ready to start shopping?
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Discover thousands of products at Sam Global.
                </p>
                <Link
                  to="/products"
                  className="mt-4 inline-block rounded-full bg-amber-400 px-6 py-2.5 text-sm font-bold text-black hover:bg-amber-300 transition"
                >
                  Browse Products
                </Link>
              </div>
            </article>
          )}
        </ApiState>
      </div>
    </>
  );
}
