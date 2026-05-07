import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronDown,
  ShieldCheck,
  Sparkles,
  LifeBuoy,
  Shield,
  Headphones,
  CheckCircle2,
} from "lucide-react";
import Seo from "../components/Seo";
import InfoCard from "../components/ui/InfoCard";
import SectionContainer from "../components/ui/SectionContainer";
import { faqItems, supportTopics, whyChooseUsItems, commitmentItems, featureItems } from "../data/staticPages";

function PageHero({ eyebrow, title, description, ctaText, ctaTo, children }) {
  return (
    <section className="rounded-[32px] bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-14 text-white shadow-2xl shadow-slate-900/10">
      <div className="w-full max-w-6xl mx-auto">
        <span className="mb-4 inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-200">
          {eyebrow}
        </span>
        <div className="mt-4 max-w-3xl space-y-5">
          <h1 className="custom-h2 text-white">{title}</h1>
          <p className="custom-para max-w-2xl text-slate-300">{description}</p>
          {ctaText ? (
            <Link
              to={ctaTo}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-slate-950 transition duration-300 hover:-translate-y-0.5 hover:bg-accent/90"
            >
              {ctaText}
              <ArrowRight size={18} />
            </Link>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}

function FaqItem({ item, index }) {
  const [open, setOpen] = useState(false);
  return (
    <article className="group rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl focus-within:border-accent focus-within:outline-none">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`faq-panel-${index}`}
        className="flex w-full items-start justify-between gap-4 text-left"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="custom-h5 text-slate-950">{item.question}</span>
        <ChevronDown className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <div
        id={`faq-panel-${index}`}
        role="region"
        aria-labelledby={`faq-title-${index}`}
        className={`mt-4 overflow-hidden transition-all duration-300 ${open ? "max-h-80" : "max-h-0"}`}
      >
        <p className="custom-para leading-relaxed text-slate-600">{item.answer}</p>
      </div>
    </article>
  );
}

export function FaqPage() {
  return (
    <main className="content-page py-12">
      <Seo title="FAQs | Sam Global" />
      <div className="w-full max-w-6xl mx-auto space-y-12">
        <PageHero
          eyebrow="Support"
          title="Frequently Asked Questions"
          description="Quick answers for the most common questions about orders, payments, deliveries, and returns."
          ctaText="Visit Support Center"
          ctaTo="/support"
        />

        <SectionContainer
          title="Top questions"
          subtitle="Clear, easy answers to help you move faster."
          headerbgColor="bg-white"
          bodybgColor="bg-slate-50"
        >
          <div className="grid gap-4 md:grid-cols-2">
            {faqItems.map((faq, index) => (
              <FaqItem key={faq.question} item={faq} index={index} />
            ))}
          </div>
        </SectionContainer>
      </div>
    </main>
  );
}

export function SupportCenterPage() {
  return (
    <main className="content-page py-12">
      <Seo title="Support Center | Sam Global" />
      <div className="w-full max-w-6xl mx-auto space-y-12">
        <PageHero
          eyebrow="Help center"
          title="Support Center"
          description="Find the right support path for orders, returns, account issues, and product questions."
          ctaText="Browse FAQs"
          ctaTo="/faq"
        >
          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <span className="rounded-3xl border border-white/15 bg-white/10 px-5 py-4 text-sm text-slate-200 shadow-sm backdrop-blur">
              <strong className="block text-lg font-semibold">Live help</strong>
              <span className="mt-1 block text-slate-300">Available 24/7 for urgent order questions.</span>
            </span>
            <span className="rounded-3xl border border-white/15 bg-white/10 px-5 py-4 text-sm text-slate-200 shadow-sm backdrop-blur">
              <strong className="block text-lg font-semibold">Fast responses</strong>
              <span className="mt-1 block text-slate-300">We aim to resolve support requests within one business day.</span>
            </span>
          </div>
        </PageHero>

        <SectionContainer
          title="Instant support topics"
          subtitle="Choose the topic that best matches your request."
          headerbgColor="bg-white"
          bodybgColor="bg-slate-50"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            {supportTopics.map((topic) => (
              <InfoCard
                key={topic.title}
                icon={<LifeBuoy size={24} />}
                title={topic.title}
                description={topic.description}
                to={topic.href}
                actionLabel="Get help"
              />
            ))}
          </div>
        </SectionContainer>

        <section className="rounded-[28px] bg-white p-8 shadow-sm shadow-slate-200/50">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h2 className="custom-h4 mb-3">Need real-time support?</h2>
              <p className="custom-para text-slate-600">
                Email us at <a href="mailto:support@samglobal.com" className="text-accent underline">support@samglobal.com</a> or visit the FAQ page for guided answers.
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
  return (
    <main className="content-page py-12">
      <Seo title="Why Choose Us | Sam Global" />
      <div className="w-full max-w-6xl mx-auto space-y-12">
        <PageHero
          eyebrow="Why choose us"
          title="Shop with confidence at Sam Global"
          description="Enjoy curated products, meaningful savings, fast delivery, and customer service built around your needs."
          ctaText="See features"
          ctaTo="/features"
        />

        <SectionContainer
          title="What sets us apart"
          subtitle="The reasons customers keep choosing Sam Global."
          headerbgColor="bg-white"
          bodybgColor="bg-slate-50"
        >
          <div className="grid gap-6 lg:grid-cols-2">
            {whyChooseUsItems.map((item) => (
              <InfoCard
                key={item.title}
                icon={<Sparkles size={24} />}
                title={item.title}
                description={item.description}
              />
            ))}
          </div>
        </SectionContainer>
      </div>
    </main>
  );
}

export function OurCommitmentPage() {
  return (
    <main className="content-page py-12">
      <Seo title="Our Commitment | Sam Global" />
      <div className="w-full max-w-6xl mx-auto space-y-12">
        <PageHero
          eyebrow="Our promise"
          title="Committed to quality, transparency, and every customer"
          description="We keep our promises with clear policies, dependable service, and continuous improvement."
          ctaText="Browse support"
          ctaTo="/support"
        />

        <SectionContainer
          title="Our commitment to you"
          subtitle="Meaningful service, clear policies, and quality first."
          headerbgColor="bg-white"
          bodybgColor="bg-slate-50"
        >
          <div className="grid gap-6 md:grid-cols-2">
            {commitmentItems.map((item) => (
              <InfoCard
                key={item.title}
                icon={<Shield size={24} />}
                title={item.title}
                description={item.description}
              />
            ))}
          </div>
        </SectionContainer>
      </div>
    </main>
  );
}

export function FeaturesPage() {
  return (
    <main className="content-page py-12">
      <Seo title="Features | Sam Global" />
      <div className="w-full max-w-6xl mx-auto space-y-12">
        <PageHero
          eyebrow="Features"
          title="Features designed for effortless shopping"
          description="Explore the tools and experiences that make Sam Global fast, secure, and easy to use."
        />

        <SectionContainer
          title="Platform features"
          subtitle="Smart shopping features built to help you save time and shop confidently."
          headerbgColor="bg-white"
          bodybgColor="bg-slate-50"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            {featureItems.map((item) => (
              <InfoCard
                key={item.title}
                icon={<CheckCircle2 size={24} />}
                title={item.title}
                description={item.description}
              />
            ))}
          </div>
        </SectionContainer>

        <section className="rounded-[28px] bg-white p-8 shadow-sm shadow-slate-200/50">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="custom-h4">A smoother shopping experience</h2>
              <p className="custom-para text-slate-600">
                From search to checkout, every interaction is designed to feel fast and effortless.
              </p>
            </div>
            <Link
              to="/support"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-slate-950 transition duration-300 hover:-translate-y-0.5 hover:bg-accent/90"
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
