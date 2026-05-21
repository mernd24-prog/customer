import { useMemo } from "react";
import {
  Handshake,
  Mail,
  MapPin,
  Phone,
  ScrollText,
  Store,
  WalletCards,
} from "lucide-react";

import Seo from "../../components/common/Seo";
import Button from "../../components/common/buttons/Button";
import { useCmsRecord } from "../../hooks/useCmsRecord";

// ─── Static fallbacks ──────────────────────────────────────────

const FALLBACK_REASONS = [
  { title: "General Inquiries", icon: ScrollText },
  { title: "Brand And Partnership Discussions", icon: Handshake },
  { title: "Store And Retail Opportunities", icon: Store },
  { title: "Customer Support", icon: WalletCards },
];

const FALLBACK_CONTACT_ITEMS = [
  { label: "Email", value: "info@samglobal.com", href: "mailto:info@samglobal.com", icon: Mail },
  { label: "Call", value: "+91 97790-15070", href: "tel:+919779015070", icon: Phone },
  { label: "Address", value: "Shop No. 12, Ground Floor, Indore, Madhya Pradesh, India", icon: MapPin },
];

const FALLBACK_PAGE = {
  title: "Contact Our Support Team",
  description:
    "Every great experience begins with a conversation. Whether you're a customer, a brand partner, or someone looking to collaborate, we're here to connect, understand, and assist.",
};

// ─── Icon maps ─────────────────────────────────────────────────

const SUPPORT_ICON_MAP = {
  general: ScrollText,
  brand: Handshake,
  partnership: Handshake,
  store: Store,
  retail: Store,
  customer: WalletCards,
  order: ScrollText,
  payment: WalletCards,
  return: Store,
  seller: Handshake,
};

const CONTACT_ICON_MAP = {
  email: Mail,
  call: Phone,
  phone: Phone,
  address: MapPin,
  location: MapPin,
};

function getSupportIcon(title = "") {
  const n = title.toLowerCase();
  return Object.entries(SUPPORT_ICON_MAP).find(([k]) => n.includes(k))?.[1] || ScrollText;
}

function getContactIcon(title = "") {
  const n = title.toLowerCase();
  return Object.entries(CONTACT_ICON_MAP).find(([k]) => n.includes(k))?.[1] || Mail;
}

// ─── CMS section helpers ───────────────────────────────────────

function getSectionByType(sections, type) {
  return Array.isArray(sections) ? sections.find((s) => s.type === type) : null;
}

function normalizeReasons(sections) {
  const sec = getSectionByType(sections, "support_categories");
  const pts = Array.isArray(sec?.points) ? sec.points : [];
  if (!pts.length) return FALLBACK_REASONS;
  return pts.slice(0, 4).map((p) => ({
    title: p.title,
    description: p.description,
    icon: getSupportIcon(p.title),
  }));
}

function normalizeContactItems(sections) {
  const sec = getSectionByType(sections, "contact_info");
  const pts = Array.isArray(sec?.points) ? sec.points : [];
  if (!pts.length) return FALLBACK_CONTACT_ITEMS;
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
    return { label: p.title, value: p.description, href, icon: getContactIcon(p.title) };
  });
}

// ─── Sub-components ────────────────────────────────────────────

export function ContactHero({ title = "Contact Our Support Team" }) {
  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 bg-blue">
      <div className="mx-auto flex min-h-[132px] w-11/12 items-center justify-center py-8 text-center md:w-[85%] lg:w-[95%] xl:w-10/12">
        <h1 className="font-montserrat text-2xl font-bold text-white sm:text-3xl">
          {title}
        </h1>
      </div>
    </section>
  );
}

export function SectionIntro({ title, description, className = "" }) {
  return (
    <div className={`mx-auto max-w-4xl text-center font-montserrat ${className}`}>
      <h2 className="text-2xl font-bold text-[#2E2E2E] sm:text-3xl">{title}</h2>
      {description && (
        <p className="mt-4 text-sm leading-7 text-[#787878] sm:text-base">
          {description}
        </p>
      )}
    </div>
  );
}

export function CircleIcon({ icon: Icon, tone = "gold" }) {
  const colors =
    tone === "blue"
      ? "bg-[#F3F3FA] text-blue"
      : "bg-[#F7EDD9] text-[#A26D27]";

  return (
    <span className="relative flex h-[92px] w-[92px] items-center justify-center rounded-full border border-dashed border-[#D4A33B]/50 bg-white p-2">
      <span className={`flex h-[66px] w-[66px] items-center justify-center rounded-full ${colors}`}>
        <Icon size={32} strokeWidth={2.2} />
      </span>
    </span>
  );
}

export function ReasonCard({ item, showDivider }) {
  return (
    <div className="relative flex min-h-[180px] flex-col items-center justify-start px-4 text-center font-montserrat">
      {showDivider && (
        <span className="absolute left-0 top-8 hidden h-[112px] w-px bg-[#D9D9E8] lg:block" />
      )}
      <CircleIcon icon={item.icon} />
      <h3 className="mt-6 max-w-[270px] text-lg font-bold leading-snug text-[#2E2E2E] sm:text-xl">
        {item.title}
      </h3>
      {item.description && (
        <p className="mt-2 max-w-[220px] text-sm leading-6 text-[#787878]">
          {item.description}
        </p>
      )}
    </div>
  );
}

function ContactInfoCard({ item, showDivider }) {
  return (
    <div className="relative flex items-center gap-4 font-montserrat">
      {showDivider && (
        <span className="absolute left-0 top-0 hidden h-full w-px bg-[#D9D9E8] lg:block" />
      )}
      <span className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full border border-[#C7C7D8] bg-[#F3F3FA] text-blue">
        <item.icon size={27} fill="currentColor" strokeWidth={1.8} />
      </span>
      <div>
        <p className="text-sm font-semibold text-blue">{item.label}</p>
        {item.href ? (
          <a
            href={item.href}
            className="mt-1 block text-base font-bold text-[#2E2E2E] transition hover:text-[#CE9F2D]"
          >
            {item.value}
          </a>
        ) : (
          <p className="mt-1 max-w-[320px] text-sm font-medium leading-6 text-[#2E2E2E]">
            {item.value}
          </p>
        )}
      </div>
    </div>
  );
}

function FramedPanel({ title, description, icon: Icon, buttonText, href, variant = "blue" }) {
  const isBlue = variant === "blue";

  return (
    <section
      className={`relative overflow-hidden border bg-white px-6 py-9 text-center font-montserrat sm:px-10 ${
        isBlue ? "border-[#C7C7D8]" : "border-[#D4A33B]"
      }`}
    >
      <h3 className="text-xl font-bold text-blue sm:text-2xl">{title}</h3>
      <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-[#787878]">
        {description}
      </p>
      {href && (
        <Button
          rounded
          size="lg"
          onClick={() => { window.location.href = href; }}
          className={`mt-6 min-w-[250px] ${
            isBlue
              ? "!bg-blue !text-white hover:!bg-[#1b1a62]"
              : "!bg-[#CE9F2D] !text-white hover:!bg-[#A26D27]"
          }`}
          icon={
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
              <Icon size={21} className={isBlue ? "text-blue" : "text-[#CE9F2D]"} />
            </span>
          }
        >
          {buttonText}
        </Button>
      )}
      <span className="pointer-events-none absolute -bottom-7 right-3 font-serif text-[92px] leading-none text-[#D4A33B]/10">
        SG
      </span>
    </section>
  );
}

function CommitmentBand({ commitmentTitle, commitmentDescription, closingTitle }) {
  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2">
      <div className="grid min-h-[145px] font-montserrat lg:grid-cols-2">
        <div className="bg-[#F3F3FA] px-[7%] py-9">
          <h3 className="text-xl font-bold text-blue">
            {commitmentTitle || "Response Commitment"}
          </h3>
          <p className="mt-5 text-sm text-[#787878]">We value your time.</p>
          <p className="mt-3 text-sm leading-7 text-[#787878]">
            {commitmentDescription ||
              "Our team will respond to all queries within"}{" "}
            {!commitmentDescription && (
              <strong className="font-bold text-blue">24–48 business hours.</strong>
            )}
          </p>
        </div>
        <div className="bg-[#FAF6EE] px-[7%] py-9">
          <p className="text-2xl font-bold leading-snug text-[#A26D27] sm:text-3xl">
            {closingTitle ? (
              closingTitle
            ) : (
              <>
                We&apos;re building more than retail.
                <br />
                <span className="text-blue">We&apos;re building connections.</span>
              </>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Main page ─────────────────────────────────────────────────

export default function ContactUs() {
  const { page } = useCmsRecord("help-contact");

  const sections = page?.sections || [];

  const supportSection    = getSectionByType(sections, "support_categories");
  const contactInfoSec    = getSectionByType(sections, "contact_info");
  const businessSec       = getSectionByType(sections, "business_inquiry");
  const visitSec          = getSectionByType(sections, "visit_us");
  const commitmentSec     = getSectionByType(sections, "response_commitment");
  const closingSec        = getSectionByType(sections, "closing_message");

  const heroTitle    = page?.title || FALLBACK_PAGE.title;
  const description  = page?.description || page?.excerpt || FALLBACK_PAGE.description;
  const intro        = page?.metadata?.data?.intro;

  const reasons      = useMemo(() => normalizeReasons(sections), [sections]);
  const contactItems = useMemo(() => normalizeContactItems(sections), [sections]);

  // Business inquiry panel
  const businessTitle = businessSec?.title || "For Brand & Business Inquiries";
  const businessDesc  = businessSec?.description || "Looking to partner with us or expand with Sam Global?";
  const businessCta   = businessSec?.cta;
  const businessHref  = businessCta?.url || "mailto:info@samglobal.com";
  const businessBtn   = businessCta?.label || "info@samglobal.com";

  // Visit us panel
  const visitTitle = visitSec?.title || "Visit Us";
  const visitDesc  = visitSec?.description || "As we expand across cities, we invite you to experience Sam Global through our growing retail presence.";
  const visitCta   = visitSec?.cta;
  const visitHref  = visitCta?.url || "https://maps.google.com/?q=Sam+Global+Indore";
  const visitBtn   = visitCta?.label || (visitSec?.points?.[0]?.description) || "Shop No. 12, Ground Floor, Indore";

  return (
    <>
      <Seo
        title={`${heroTitle} | Sam Global`}
        description={description}
      />
      <ContactHero title={heroTitle} />

      {/* Let's Connect */}
      <section className="w-container py-14 sm:py-16 lg:py-20">
        <SectionIntro
          title={intro?.heading || "Let's Connect"}
          description={intro?.description || description}
        />

        {/* Support categories */}
        <SectionIntro
          className="mt-16"
          title={supportSection?.title || "How Can We Help You?"}
          description={supportSection?.description || "From product queries to partnership opportunities, our team is available to support you at every step."}
        />

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {reasons.map((item, index) => (
            <ReasonCard key={item.title} item={item} showDivider={index > 0} />
          ))}
        </div>

        {page?.cta?.url && (
          <div className="mt-10 flex justify-center">
            <Button
              rounded
              size="lg"
              className="!bg-blue !px-8 !text-white hover:!bg-[#1b1a62]"
              onClick={() => { window.location.href = page.cta.url; }}
            >
              {page.cta.label || "Contact Support"}
            </Button>
          </div>
        )}
      </section>

      {/* Get In Touch */}
      <section className="relative left-1/2 w-screen -translate-x-1/2 bg-[#F3F3FA] py-12">
        <div className="w-container">
          <SectionIntro
            title={contactInfoSec?.title || "Get In Touch"}
            description={contactInfoSec?.description || "We'd love to hear from you."}
          />
          <div className="mt-9 grid gap-8 lg:grid-cols-3 lg:gap-12">
            {contactItems.map((item, index) => (
              <ContactInfoCard key={item.label} item={item} showDivider={index > 0} />
            ))}
          </div>
        </div>
      </section>

      {/* Business inquiry + Visit us */}
      <section className="w-container grid gap-6 py-12 lg:grid-cols-2 lg:py-16">
        <FramedPanel
          title={businessTitle}
          description={businessDesc}
          icon={Mail}
          buttonText={businessBtn}
          href={businessHref}
          variant="blue"
        />
        <FramedPanel
          title={visitTitle}
          description={visitDesc}
          icon={MapPin}
          buttonText={visitBtn}
          href={visitHref}
          variant="gold"
        />
      </section>

      {/* Response commitment + Closing */}
      <CommitmentBand
        commitmentTitle={commitmentSec?.title}
        commitmentDescription={commitmentSec?.description}
        closingTitle={closingSec?.title}
      />
    </>
  );
}
