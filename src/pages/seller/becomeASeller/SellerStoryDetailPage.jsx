import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, BarChart3, Store } from "lucide-react";
import EmptyState from "../../../components/ui/feedback/EmptyState";
import Seo from "../../../components/ui/Seo";
import PageContainer from "../../../components/ui/layout/PageContainer";
import Breadcrumbs from "../../../modules/common/components/Breadcrumbs";
import { useCmsRecord } from "../../../hooks/useCmsRecord";
import { FALLBACK_SELLER_PAGE } from "../../../data/fallbackCmsData";
import {
  GoldOutlineButton,
  PillButton,
} from "../../../components/ui/button/buttonSpecialized";

export const sellerStorySlug = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "seller-story";

const getCmsPayload = (page) =>
  page?.metadata?.data ||
  page?.metadata?.content ||
  page?.data ||
  page?.content ||
  page;

export default function SellerStoryDetailPage() {
  const { storySlug } = useParams();
  const { page: cmsPage, loading } = useCmsRecord("become-a-seller");

  const sellerPage = getCmsPayload(cmsPage);

  const fallbackStories = FALLBACK_SELLER_PAGE?.sections?.[0]?.points || [];

  const storySection =
    sellerPage?.sections?.find(
      (section) => section?.type === "seller-stories",
    ) || FALLBACK_SELLER_PAGE.sections[0];

  const story = useMemo(() => {
    const cmsStories = Array.isArray(storySection?.points)
      ? storySection.points
      : [];

    const stories = cmsStories.length > 0 ? cmsStories : fallbackStories;

    return stories
      .map((point, index) => {
        const fallback =
          fallbackStories.find((item) => item?.title === point?.title) ||
          fallbackStories[index] ||
          {};

        const name = point?.title || fallback?.title || "";

        return {
          name,
          role: point?.metadata?.role || fallback?.metadata?.role || "",
          quote: point?.description || fallback?.description || "",
          result: point?.cta?.label || fallback?.cta?.label || "",
          photo:
            point?.image?.url ||
            point?.image ||
            fallback?.image?.url ||
            fallback?.image ||
            "",
          slug: sellerStorySlug(name),
        };
      })
      .find((item) => item.slug === storySlug);
  }, [fallbackStories, storySection, storySlug]);

  if (loading && !cmsPage) {
    return (
      <main className="customer-container py-10 text-sm text-[#5E6472]">
        Loading seller story...
      </main>
    );
  }

  if (!story) {
    return (
      <>
        <Seo title="Seller story not found | Sam Global" />

        <PageContainer>
          <div className="py-10">
            <EmptyState
              illustration="box"
              title="Seller Story Not Found"
              description="This seller story may have been removed or the link may be incorrect."
              actionLabel="Back to Seller Stories"
              onAction={() => {
                window.location.href = "/become-a-seller";
              }}
              buttonSize="sm"
              bordered
            />
          </div>
        </PageContainer>
      </>
    );
  }
  return (
    <>
      <Seo
        title={`${story.name} | Seller Story | Sam Global`}
        description={story.quote || story.role}
      />

      <main className="bg-[#FAF8F3]">
        <PageContainer>
          <div>
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                {
                  label: "Become a Seller",
                  href: "/become-a-seller",
                },
                { label: "Seller Stories", href: "/become-a-seller" },
                { label: story.name },
              ]}
            />
            <article className="mt-5 overflow-hidden rounded-xl border border-[#EEE7DA] bg-white p-3 shadow-sm sm:mt-7 sm:p-5 lg:p-7">
              <div className="grid items-center gap-5 md:grid-cols-2 md:gap-7 lg:gap-8">
                {story.photo && (
                  <div className="flex min-w-0 items-center justify-center overflow-hidden rounded-xl bg-[#F5F2EC]">
                    <img
                      src={story.photo}
                      alt={`${story.name} at their business`}
                      className="h-[230px] w-full object-contain sm:h-[300px] lg:h-[340px]"
                    />
                  </div>
                )}

                <div className="flex min-w-0 flex-col items-start py-2 sm:py-4">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#F8F1E2] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#956309]">
                    <Store size={14} />         
                    Seller Story
                  </span>

                  <h1 className="mt-3 text-2xl font-bold leading-tight text-[#18156D] sm:text-3xl lg:text-4xl">
                    {story.name}
                  </h1>

                  {story.role && (
                    <p className="mt-2 text-sm font-semibold text-[#3E4093] sm:text-base">
                      {story.role}
                    </p>
                  )}

                  {story.quote && (
                    <p className="mt-4 text-sm leading-7 text-[#50545E] sm:text-base sm:leading-7">
                      {story.quote}
                    </p>
                  )}

                  {story.result && (
                    <div className="mt-5 inline-flex max-w-full items-center gap-2.5 rounded-full bg-[#F8F2E6] px-3.5 py-2.5 text-xs font-bold text-[#895B0A] sm:px-4 sm:text-sm">
                      <BarChart3
                        size={18}
                        className="shrink-0 text-[#B88416]"
                      />
                      <span>{story.result}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-5 flex flex-col justify-between gap-3 border-t border-[#EEE9DF] pt-5 sm:mt-7 sm:flex-row sm:items-center">
                <GoldOutlineButton
                shape="square"
                  size="sm"
                  to="/become-a-seller"
                >
                  <ArrowLeft size={17} />
                  Back to Seller Stories
                </GoldOutlineButton>

                <PillButton
                shape="square"
                  size="sm"
                  to="/become-a-seller"
                >
                  Become a Seller
                  <ArrowRight size={17} />
                </PillButton>
              </div>
            </article>
          </div>
        </PageContainer>
      </main>
    </>
  );
}
