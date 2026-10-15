import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Seo from "../../components/ui/Seo";
import ApiState from "../../components/ui/ApiState";
import AppErrorBoundary from "../../components/ui/AppErrorBoundary";
import PageContainer from "../../components/ui/layout/PageContainer";
import PolicySection from "../../components/policy/PolicySection";
import { fetchCmsPageBySlug } from "../../features/cms/cmsSlice";
import { isNotFoundApiError } from "../../utils/apiErrors";
import { FALLBACK_CMS_PAGE_CONTENT } from "../../data/fallbackCmsData";

function CmsContent({ body }) {
  if (!body) return null;
  return (
    <div
      className="cms-content leading-relaxed text-muted [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-ink [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-ink [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-ink [&_h4]:mt-4 [&_h4]:mb-2 [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-ink [&_p]:mb-4 [&_p]:leading-7 [&_a]:font-semibold [&_a]:text-gold [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-gold-dark [&_strong]:font-bold [&_strong]:text-ink [&_em]:italic [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_blockquote]:my-4 [&_blockquote]:rounded-r-[8px] [&_blockquote]:border-l-4 [&_blockquote]:border-gold [&_blockquote]:bg-cream [&_blockquote]:px-4 [&_blockquote]:py-3 [&_blockquote]:italic [&_img]:my-6 [&_img]:max-w-full [&_img]:rounded-[12px] [&_hr]:my-8 [&_hr]:border-border [&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-border [&_th]:bg-cream [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:text-ink [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_code]:rounded [&_code]:bg-gold-soft [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm [&_code]:text-gold-dark [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-[8px] [&_pre]:bg-ink [&_pre]:p-4 [&_pre]:text-white"
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}

const cmsRecordKey = (item) =>
  item?.slug ||
  item?.cmsKey ||
  item?.metadata?.cmsKey ||
  item?.metadata?.data?.cmsKey ||
  item?.data?.cmsKey ||
  item?.metadata?.routePath?.replace(/^\//, "") ||
  item?.routePath?.replace(/^\//, "");

const getCmsPayload = (page) =>
  page?.metadata?.data ||
  page?.metadata?.content ||
  page?.data ||
  page?.content ||
  page;

function stripNumberPrefix(value = "") {
  return String(value || "")
    .replace(/^\s*\d+[.)]\s+/g, "")
    .replace(/^\s*[-–•]\s*/g, "")
    .trim();
}

function parseBodySections(body = "") {
  if (!body || typeof body !== "string") return [];

  const doc = new DOMParser().parseFromString(body, "text/html");
  const headings = Array.from(doc.body.querySelectorAll("h2, h3, h4"));

  if (!headings.length) return [];

  return headings
    .map((heading) => {
      const title = stripNumberPrefix(heading.textContent || "");
      if (!title) return null;

      const nodes = [];
      let current = heading.nextSibling;

      while (current) {
        if (current.nodeType === 1 && current.matches?.("h2, h3, h4")) {
          break;
        }
        if (current.nodeType === 1 || current.nodeType === 3) {
          nodes.push(current.cloneNode(true));
        }
        current = current.nextSibling;
      }

      const blockHtml = nodes.map((node) => node.outerHTML || node.textContent || "").join("");
      if (!blockHtml.trim()) return null;

      const blockDoc = new DOMParser().parseFromString(blockHtml, "text/html");
      const paragraphs = Array.from(blockDoc.body.querySelectorAll("p, li"));

      const points = paragraphs
        .map((paragraph) => {
          const rawText = String(paragraph.textContent || "").trim();
          const text = rawText.replace(/^\s*\d+[.)]\s*/g, "").replace(/!\[[^\]]*\]\([^)]*\)/g, "").trim();
          if (!text) return null;

          const strongNode = paragraph.querySelector("strong, b");
          const strongText = strongNode ? stripNumberPrefix(strongNode.textContent || "") : "";
          const plainText = strongText
            ? text.replace(strongText, "").replace(/^\s*[:\-–]\s*/, "").trim()
            : text;

          const titleText = strongText || "";
          const descriptionText = plainText || text;

          if (!titleText && !descriptionText) return null;

          return {
            title: titleText,
            description: descriptionText,
          };
        })
        .filter(Boolean);

      const description = paragraphs[0]
        ? String(paragraphs[0].outerHTML || "").trim()
        : "";

      return {
        title,
        description: description || (points[0]?.description ? points[0].description : ""),
        points: points.slice(0, 1).length ? points.slice(1) : points,
      };
    })
    .filter(Boolean);
}

export default function CmsPage({ slugOverride = "" }) {
  const { slug: slugFromParams } = useParams();
  const slug = slugOverride || slugFromParams;
  const dispatch = useDispatch();
  const cmsState = useSelector((s) => s.cms);
  const {
    current: currentPage,
    entities = {},
    list = [],
    loading: cmsLoading,
    error: cmsError,
  } = cmsState;
  const page = useMemo(() => {
    if (!slug) return null;

    const pageList = Array.isArray(list) ? list : [];
    const candidates = [entities[slug], currentPage, ...pageList].filter(
      Boolean,
    );

    const matchedPage =
      candidates.find((item) => cmsRecordKey(item) === slug) ||
      candidates.find((item) => cmsRecordKey(getCmsPayload(item)) === slug) ||
      null;

    return getCmsPayload(matchedPage) || FALLBACK_CMS_PAGE_CONTENT?.[slug] || null;
  }, [currentPage, entities, list, slug]);

  useEffect(() => {
    if (!slug) return;

    dispatch(fetchCmsPageBySlug({ slug })).unwrap();
  }, [dispatch, slug]);

  const title = page?.metadata?.seoTitle || page?.title || slug;
  const description = page?.metadata?.seoDescription || page?.excerpt || "";
  const rawContent = page?.body || page?.content || "";
  const parsedSections = useMemo(() => {
    if (!page) return [];

    if (Array.isArray(page.sections) && page.sections.length > 0) {
      return page.sections;
    }

    const htmlSections = parseBodySections(rawContent);
    if (htmlSections.length > 0) return htmlSections;

    const points = Array.isArray(page.points) ? page.points : [];
    if (!points.length) return [];

    return [
      {
        title: page.title || title,
        description: page.description || page.excerpt || description,
        points,
      },
    ];
  }, [description, page, rawContent, title]);
  const pageUnavailable =
    !page && !cmsLoading && (!cmsError || isNotFoundApiError(cmsError));
  const showCmsError = !page && !!cmsError && !isNotFoundApiError(cmsError);

  return (
    <AppErrorBoundary>
      <Seo title={`${title} | Sam Global`} description={description} />

      <section className="relative left-1/2 w-screen -translate-x-1/2 bg-[#211B73] py-10 md:py-12 lg:py-14">
        <div className="flex w-full items-center justify-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-center text-2xl font-bold text-white md:text-3xl lg:text-[32px]">
            {title}
          </h1>
        </div>
      </section>

      <section className="w-full pt-3 pb-10 md:pb-12">
        <PageContainer>
          <ApiState
            loading={cmsLoading && !page}
            error={showCmsError ? cmsError : null}
            empty={pageUnavailable}
            emptyTitle="Coming soon"
            emptyText="This content page is being prepared and will be available soon."
          >
            {page && (
              <div className="w-full">
                {(description || page?.description || page?.excerpt) && (
                  <p
                    className="mb-8 text-[14px] leading-relaxed text-muted md:text-base"
                    dangerouslySetInnerHTML={{ __html: description || page?.description || page?.excerpt || "" }}
                  />
                )}

                {parsedSections.length > 0 && (
                  <div className="space-y-7 md:space-y-8">
                    {parsedSections.map((section, index) => (
                      <PolicySection
                        key={
                          section?.cmsKey ||
                          section?.id ||
                          `${section?.title || "section"}-${index}`
                        }
                        title={section?.title || title}
                        description={section?.description || ""}
                        points={Array.isArray(section?.points) ? section.points : []}
                      />
                    ))}
                  </div>
                )}

                {!parsedSections.length && rawContent && (
                  <CmsContent body={rawContent} />
                )}
              </div>
            )}
          </ApiState>
        </PageContainer>
      </section>
    </AppErrorBoundary>
  );
}
