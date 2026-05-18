import {
  ShieldCheck,
  Sparkles,
  LifeBuoy,
  Shield,
  Headphones,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import Seo from "../components/common/Seo";
import InfoCard from "../components/ui/InfoCard";
import CardGridSection from "../components/static/CardGridSection";
import FaqItem from "../components/static/FaqItem";
import MarketingPage from "../components/static/MarketingPage";
import PageHero from "../components/static/PageHero";
import { getCmsImageSet, getCmsPayload, useCmsRecord } from "../hooks/useCmsRecord";

function useStaticCmsPage(cmsKey, fallback) {
  const { page } = useCmsRecord(cmsKey);
  return {
    page: getCmsPayload(page, fallback),
    images: getCmsImageSet(page, fallback.heroImage),
  };
}

export const DealsPage = () => <MarketingPage pageKey="deals" />;
export const BrandOutletPage = () => <MarketingPage pageKey="brandOutlet" />;
export const GiftCardsPage = () => <MarketingPage pageKey="giftCards" />;
export const HelpContactPage = () => <MarketingPage pageKey="helpContact" />;
export const WhoWeArePage = () => <MarketingPage pageKey="whoWeAre" />;
export const MobileAppPage = () => <MarketingPage pageKey="mobileApp" />;
export const SellerPoliciesPage = () => (
  <MarketingPage pageKey="sellerPolicies" />
);
export const GrowthSupportPage = () => (
  <MarketingPage pageKey="growthSupport" />
);
export const AdvertisePage = () => <MarketingPage pageKey="advertise" />;
export const BlogPage = () => <MarketingPage pageKey="blog" />;
export const UpdatesPage = () => <MarketingPage pageKey="updates" />;
export const AnnouncementsPage = () => (
  <MarketingPage pageKey="announcements" />
);

export function FaqPage() {
  const { page, images } = useStaticCmsPage("faq", {
    eyebrow: "Support",
    title: "Frequently Asked Questions",
    description:
      "Quick answers for the most common questions about orders, payments, deliveries, and returns.",
    ctaText: "Visit Support Center",
    ctaTo: "/support",
    questions: [],
  });

  return (
    <main className="content-page py-12">
      <Seo title="FAQs | Sam Global" />
      <div className="w-full max-w-6xl mx-auto space-y-12">
        <PageHero
          eyebrow={page.eyebrow}
          title={page.title}
          description={page.description}
          ctaText={page.ctaText}
          ctaTo={page.ctaTo}
          image={images.heroImage}
        />

        <CardGridSection
          title="Top questions"
          subtitle="Clear, easy answers to help you move faster."
          className="grid gap-4 md:grid-cols-2"
        >
          {(Array.isArray(page.questions) ? page.questions : []).map((faq, index) => (
            <FaqItem key={faq.question} item={faq} index={index} />
          ))}
        </CardGridSection>
      </div>
    </main>
  );
}

export function SupportCenterPage() {
  const { page, images } = useStaticCmsPage("support-center", {
    eyebrow: "Help center",
    title: "Support Center",
    description:
      "Find the right support path for orders, returns, account issues, and product questions.",
    ctaText: "Browse FAQs",
    ctaTo: "/faq",
    topics: [],
  });
  const topics = Array.isArray(page?.topics) && page.topics.length
    ? page.topics
    : (Array.isArray(page?.points) ? page.points.map((p) => ({ title: p.title, description: p.description, href: "/support" })) : []);

  return (
    <main className="content-page py-12">
      <Seo title="Support Center | Sam Global" />
      <div className="w-full max-w-6xl mx-auto space-y-12">
        <PageHero
          eyebrow={page.eyebrow}
          title={page.title}
          description={page.description}
          ctaText={page.ctaText}
          ctaTo={page.ctaTo}
          image={images.heroImage}
        >
          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <span className="rounded-3xl border border-white/15 bg-white/10 px-5 py-4 text-sm text-slate-200 shadow-sm backdrop-blur">
              <strong className="block text-lg font-semibold">Live help</strong>
              <span className="mt-1 block text-slate-300">
                Available 24/7 for urgent order questions.
              </span>
            </span>
            <span className="rounded-3xl border border-white/15 bg-white/10 px-5 py-4 text-sm text-slate-200 shadow-sm backdrop-blur">
              <strong className="block text-lg font-semibold">
                Fast responses
              </strong>
              <span className="mt-1 block text-slate-300">
                We aim to resolve support requests within one business day.
              </span>
            </span>
          </div>
        </PageHero>

        <CardGridSection
          title="Instant support topics"
          subtitle="Choose the topic that best matches your request."
        >
          {topics.map((topic) => (
            <InfoCard
              key={topic.title}
              icon={<LifeBuoy size={24} />}
              title={topic.title}
              description={topic.description}
              to={topic.href}
              actionLabel="Get help"
            />
          ))}
        </CardGridSection>

        <section className="rounded-[28px] bg-white p-8 shadow-sm shadow-[#e7dfd1]">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h2 className="custom-h4 mb-3">Need real-time support?</h2>
              <p className="custom-para text-[#787878]">
                Email us at{" "}
                <a
                  href="mailto:support@samglobal.com"
                  className="text-accent underline"
                >
                  support@samglobal.com
                </a>{" "}
                or visit the FAQ page for guided answers.
              </p>
            </div>
            <div className="grid gap-4">
              <InfoCard
                icon={<Headphones size={24} />}
                title="Contact support"
                description="Get help with orders, account updates, and returns."
                to="/support"
                actionLabel="Contact us"
              />
              <InfoCard
                icon={<ShieldCheck size={24} />}
                title="Trust and safety"
                description="Learn about secure payments and fraud protection."
                to="/features"
                actionLabel="View features"
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export function WhyChooseUsPage() {
  const { page, images } = useStaticCmsPage("why-choose-us", {
    eyebrow: "Why choose us",
    title: "Shop with confidence at Sam Global",
    description:
      "Enjoy curated products, meaningful savings, fast delivery, and customer service built around your needs.",
    ctaText: "See features",
    ctaTo: "/features",
    items: [],
  });
  const items = Array.isArray(page?.items) && page.items.length
    ? page.items
    : (Array.isArray(page?.points) ? page.points.map((p) => ({ title: p.title, description: p.description })) : []);

  return (
    <main className="content-page py-12">
      <Seo title="Why Choose Us | Sam Global" />
      <div className="w-full max-w-6xl mx-auto space-y-12">
        <PageHero
          eyebrow={page.eyebrow}
          title={page.title}
          description={page.description}
          ctaText={page.ctaText}
          ctaTo={page.ctaTo}
          image={images.heroImage}
        />

        <CardGridSection
          title="What sets us apart"
          subtitle="The reasons customers keep choosing Sam Global."
          className="grid gap-6 lg:grid-cols-2"
        >
          {items.map((item) => (
            <InfoCard
              key={item.title}
              icon={<Sparkles size={24} />}
              title={item.title}
              description={item.description}
            />
          ))}
        </CardGridSection>
      </div>
    </main>
  );
}

export function OurCommitmentPage() {
  const { page, images } = useStaticCmsPage("our-commitment", {
    eyebrow: "Our promise",
    title: "Committed to quality, transparency, and every customer",
    description:
      "We keep our promises with clear policies, dependable service, and continuous improvement.",
    ctaText: "Browse support",
    ctaTo: "/support",
    items: [],
  });
  const items = Array.isArray(page?.items) && page.items.length
    ? page.items
    : (Array.isArray(page?.points) ? page.points.map((p) => ({ title: p.title, description: p.description })) : []);

  return (
    <main className="content-page py-12">
      <Seo title="Our Commitment | Sam Global" />
      <div className="w-full max-w-6xl mx-auto space-y-12">
        <PageHero
          eyebrow={page.eyebrow}
          title={page.title}
          description={page.description}
          ctaText={page.ctaText}
          ctaTo={page.ctaTo}
          image={images.heroImage}
        />

        <CardGridSection
          title="Our commitment to you"
          subtitle="Meaningful service, clear policies, and quality first."
          className="grid gap-6 md:grid-cols-2"
        >
          {items.map((item) => (
            <InfoCard
              key={item.title}
              icon={<Shield size={24} />}
              title={item.title}
              description={item.description}
            />
          ))}
        </CardGridSection>
      </div>
    </main>
  );
}

export function FeaturesPage() {
  const { page, images } = useStaticCmsPage("features", {
    eyebrow: "Features",
    title: "Features designed for effortless shopping",
    description: "Explore the tools and experiences that make Sam Global fast, secure, and easy to use.",
    items: [],
  });
  const items = Array.isArray(page?.items) && page.items.length
    ? page.items
    : (Array.isArray(page?.points) ? page.points.map((p) => ({ title: p.title, description: p.description })) : []);

  return (
    <main className="content-page py-12">
      <Seo title="Features | Sam Global" />
      <div className="w-full max-w-6xl mx-auto space-y-12">
        <PageHero
          eyebrow={page.eyebrow}
          title={page.title}
          description={page.description}
          image={images.heroImage}
        />

        <CardGridSection
          title="Platform features"
          subtitle="Smart shopping features built to help you save time and shop confidently."
        >
          {items.map((item) => (
            <InfoCard
              key={item.title}
              icon={<CheckCircle2 size={24} />}
              title={item.title}
              description={item.description}
            />
          ))}
        </CardGridSection>

        <section className="rounded-[28px] bg-white p-8 shadow-sm shadow-[#e7dfd1]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="custom-h4">A smoother shopping experience</h2>
              <p className="custom-para text-[#787878]">
                From search to checkout, every interaction is designed to feel
                fast and effortless.
              </p>
            </div>
            <Link
              to="/support"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-[#2E2E2E] transition duration-300 hover:-translate-y-0.5 hover:bg-accent/90"
            >
              Visit support
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
