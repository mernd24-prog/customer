import { useMemo } from "react";
import {
  Mail,
  MapPin,
  // Phone,
  ScrollText,
} from "lucide-react";

import Seo from "../../components/common/Seo";
import ApiState from "../../components/common/ApiState";
import Button from "../../components/common/buttons/Button";
import FAQHeroSection from "../../components/faq/FAQHeroSection";
import { useCmsRecord } from "../../hooks/useCmsRecord";
import { CONTACT_ICON_MAP, SUPPORT_ICON_MAP } from "../../data/constant";

function getSupportIcon(title = "") {
  const n = title.toLowerCase();
  return (
    Object.entries(SUPPORT_ICON_MAP).find(([k]) => n.includes(k))?.[1] ||
    ScrollText
  );
}

function getContactIcon(title = "") {
  const n = title.toLowerCase();
  return (
    Object.entries(CONTACT_ICON_MAP).find(([k]) => n.includes(k))?.[1] || Mail
  );
}

// ─── CMS section helpers ───────────────────────────────────────

function getSectionByType(sections, type) {
  return Array.isArray(sections) ? sections.find((s) => s.type === type) : null;
}

function normalizeReasons(sections) {
  const sec = getSectionByType(sections, "support_categories");
  const pts = Array.isArray(sec?.points) ? sec.points : [];
  return pts.slice(0, 4).map((p) => ({
    title: p.title,
    description: p.description,
    icon: getSupportIcon(p.title),
  }));
}

function normalizeContactItems(sections) {
  const sec = getSectionByType(sections, "contact_info");
  const pts = Array.isArray(sec?.points) ? sec.points : [];
  return pts.map((p) => {
    const isPhone = /call|phone/i.test(p.title);
    const isAddress = /address|location/i.test(p.title);
    const isEmail = /email|mail/i.test(p.title);
    const href = isPhone
      ? `tel:${p.description.replace(/[^0-9+]/g, "")}`
      : isEmail
        ? `mailto:${p.description}`
        : isAddress
          ? undefined
          : undefined;
    return {
      label: p.title,
      value: p.description,
      href,
      icon: getContactIcon(p.title),
    };
  });
}

export function SectionIntro({ title, description, className = "" }) {
  return (
    <div className={`mx-auto max-w-4xl text-center  ${className}`}>
      <h2 className="text-heading-sm font-bold text-ink sm:text-heading-md">{title}</h2>
      {description && (
        <p className="mt-4 text-body-sm leading-relaxed text-muted sm:text-body-md">
          {description}
        </p>
      )}
    </div>
  );
}

export function CircleIcon({ icon: Icon, tone = "gold" }) {
  const colors =
    tone === "blue" ? "bg-navy-soft text-blue" : "bg-gold-soft text-gold-dark";

  return (
    <span className="relative flex h-[92px] w-[92px] items-center justify-center rounded-full border border-dashed border-gold/50 bg-white p-2">
      <span
        className={`flex h-[66px] w-[66px] items-center justify-center rounded-full ${colors}`}
      >
        <Icon size={32} strokeWidth={2.2} />
      </span>
    </span>
  );
}

export function ReasonCard({ item, showDivider }) {
  return (
    <div className="relative flex min-h-[180px] flex-col items-center justify-start px-4 text-center ">
      {showDivider && (
        <span className="absolute left-0 top-8 hidden h-[112px] w-px bg-border lg:block" />
      )}
      <CircleIcon icon={item.icon} />
      <h3 className="mt-6 max-w-[270px] text-subheading-md font-bold leading-snug text-ink sm:text-subheading-lg">
        {item.title}
      </h3>
      {item.description && (
        <p className="mt-2 max-w-[220px] text-caption-md leading-relaxed text-muted">
          {item.description}
        </p>
      )}
    </div>
  );
}

function ContactInfoCard({ item, showDivider }) {
  return (
    <div className="relative flex min-h-[96px] items-center gap-4 px-6 ">
      {showDivider && (
        <span className="absolute left-0 top-1/2 hidden h-[86px] w-px -translate-y-1/2 bg-border lg:block" />
      )}
      <span className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full border border-border bg-navy-soft text-blue">
        <item.icon size={27} fill="currentColor" strokeWidth={1.8} />
      </span>
      <div>
        <p className="text-label-md font-semibold text-blue">{item.label}</p>
        {item.href ? (
          <a
            href={item.href}
            className="mt-1 block text-body-md font-bold text-ink transition-all duration-300 ease-in-out hover:text-gold"
          >
            {item.value}
          </a>
        ) : (
          <p className="mt-1 max-w-[320px] text-caption-md font-medium leading-relaxed text-ink">
            {item.value}
          </p>
        )}
      </div>
    </div>
  );
}

function FramedPanel({
  title,
  description,
  icon: Icon,
  buttonText,
  href,
  variant = "blue",
}) {
  const isBlue = variant === "blue";

  return (
    <section
      className={`relative overflow-hidden border bg-white px-6 py-9 text-center  sm:px-10 ${isBlue ? "border-border" : "border-gold"
        }`}
    >
      <h3 className="text-subheading-lg font-bold text-blue sm:text-heading-sm">{title}</h3>
      <p className="mx-auto mt-5 max-w-md text-body-sm leading-relaxed text-muted">
        {description}
      </p>
      {href && (
        <Button
          rounded
          size="lg"
          onClick={() => {
            window.location.href = href;
          }}
          className={`mt-6 min-w-[250px] ${isBlue
              ? "!bg-blue !text-white hover:!bg-navy-dark"
              : "!bg-gold !text-white hover:!bg-gold-dark"
            }`}
          icon={
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
              <Icon size={21} className={isBlue ? "text-blue" : "text-gold"} />
            </span>
          }
        >
          {buttonText}
        </Button>
      )}
      <span className="pointer-events-none absolute -bottom-7 right-3 font-serif text-[92px] leading-none text-gold/10">
        SG
      </span>
    </section>
  );
}

function CommitmentBand({
  commitmentTitle,
  commitmentDescription,
  closingTitle,
}) {
  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2">
      <div className="grid min-h-[145px]  lg:grid-cols-2">
        {commitmentTitle && (
          <div className="bg-navy-soft px-[7%] py-9">
            <h3 className="text-subheading-lg font-bold text-blue">{commitmentTitle}</h3>
            {commitmentDescription && (
              <p className="mt-5 text-body-sm leading-relaxed text-muted">
                {commitmentDescription}
              </p>
            )}
          </div>
        )}
        {closingTitle && (
          <div className="bg-cream px-[7%] py-9">
            <p className="text-heading-sm font-bold leading-snug text-gold-dark sm:text-heading-md">
              {closingTitle}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

const EMPTY_SECTIONS = [];

export default function ContactUs() {
  const { page, loading } = useCmsRecord("help-contact");

  const sections = page?.sections || EMPTY_SECTIONS;

  const supportSection = getSectionByType(sections, "support_categories");
  const contactInfoSec = getSectionByType(sections, "contact_info");
  const businessSec = getSectionByType(sections, "business_inquiry");
  const visitSec = getSectionByType(sections, "visit_us");
  const commitmentSec = getSectionByType(sections, "response_commitment");
  const closingSec = getSectionByType(sections, "closing_message");

  const heroTitle = page?.title || "";
  const description = page?.description || page?.excerpt || "";
  const intro = page?.metadata?.data?.intro;

  const reasons = useMemo(() => normalizeReasons(sections), [sections]);
  const contactItems = useMemo(
    () => normalizeContactItems(sections),
    [sections],
  );

  const businessTitle = businessSec?.title || "";
  const businessDesc = businessSec?.description || "";
  const businessCta = businessSec?.cta;
  const businessHref = businessCta?.url || "";
  const businessBtn = businessCta?.label || "";

  const visitTitle = visitSec?.title || "";
  const visitDesc = visitSec?.description || "";
  const visitCta = visitSec?.cta;
  const visitHref = visitCta?.url || "";
  const visitBtn = visitCta?.label || visitSec?.points?.[0]?.description || "";
  const hasPageContent = Boolean(
    page &&
    (heroTitle ||
      description ||
      intro?.heading ||
      intro?.description ||
      supportSection ||
      reasons.length ||
      contactInfoSec ||
      contactItems.length ||
      businessTitle ||
      visitTitle ||
      commitmentSec ||
      closingSec ||
      page?.cta?.url),
  );
  const isPageLoading = loading && !page;

  if (isPageLoading || !hasPageContent) {
    return (
      <>
        <Seo
          title={`${heroTitle || "Help & Contact"} | Sam Global`}
          description={description}
        />
        <section className="w-container py-8 sm:py-10">
          <h1 className="mb-8 text-2xl font-bold text-ink sm:text-3xl">
            {heroTitle || "Help & Contact"}
          </h1>
          <ApiState
            loading={isPageLoading}
            empty={!isPageLoading && !hasPageContent}
            emptyTitle="Help & Contact content unavailable"
            emptyText="Support information will appear here ."
          />
        </section>
      </>
    );
  }

  return (
    <>
      <Seo
        title={`${heroTitle || "Help & Contact"} | Sam Global`}
        description={description}
      />

      <FAQHeroSection title={heroTitle} description={description} />

      <section className="w-container py-14 sm:py-16 lg:py-20">
        {(intro?.heading || intro?.description || description) && (
          <SectionIntro
            title={intro?.heading || ""}
            description={intro?.description || description}
          />
        )}

        {(supportSection || reasons.length > 0) && (
          <>
            <SectionIntro
              className="mt-16"
              title={supportSection?.title || ""}
              description={supportSection?.description || ""}
            />

            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-0">
              {reasons.map((item, index) => (
                <ReasonCard
                  key={item.title}
                  item={item}
                  showDivider={index > 0}
                />
              ))}
            </div>
          </>
        )}

        {page?.cta?.url && (
          <div className="mt-10 flex justify-center">
            <Button
              rounded
              size="lg"
              className="!bg-blue !px-8 !text-white hover:!bg-navy-dark"
              onClick={() => {
                window.location.href = page.cta.url;
              }}
            >
              {page.cta.label}
            </Button>
          </div>
        )}
      </section>

      {(contactInfoSec || contactItems.length > 0) && (
        <section className="relative left-1/2 w-screen -translate-x-1/2 bg-navy-soft py-12">
          <div className="w-container">
            <SectionIntro
              title={contactInfoSec?.title || ""}
              description={contactInfoSec?.description || ""}
            />
            <div className="mt-9 grid gap-8 lg:grid-cols-3 lg:gap-12">
              {contactItems.map((item, index) => (
                <ContactInfoCard
                  key={item.label}
                  item={item}
                  showDivider={index > 0}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {(businessTitle || visitTitle) && (
        <section className="w-container grid gap-6 py-12 lg:grid-cols-2 lg:py-16">
          {businessTitle && (
            <FramedPanel
              title={businessTitle}
              description={businessDesc}
              icon={Mail}
              buttonText={businessBtn}
              href={businessHref}
              variant="blue"
            />
          )}
          {visitTitle && (
            <FramedPanel
              title={visitTitle}
              description={visitDesc}
              icon={MapPin}
              buttonText={visitBtn}
              href={visitHref}
              variant="gold"
            />
          )}
        </section>
      )}

      {(commitmentSec || closingSec) && (
        <CommitmentBand
          commitmentTitle={commitmentSec?.title}
          commitmentDescription={commitmentSec?.description}
          closingTitle={closingSec?.title}
        />
      )}
    </>
  );
}
