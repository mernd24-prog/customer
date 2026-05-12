import { BadgePercent, Gift, Megaphone, Sparkles, Store } from "lucide-react";

import Seo from "../common/Seo";
import InfoCard from "../ui/InfoCard";
import { marketingPages } from "../../data/staticPages";
import CardGridSection from "./CardGridSection";
import PageHero from "./PageHero";

const iconByPage = {
  deals: BadgePercent,
  brandOutlet: Store,
  giftCards: Gift,
  advertise: Megaphone,
};

export default function MarketingPage({ pageKey }) {
  const page = marketingPages[pageKey];
  const Icon = iconByPage[pageKey] || Sparkles;

  return (
    <main className="content-page py-12">
      <Seo title={`${page.title} | Sam Global`} description={page.description} />
      <div className="mx-auto w-full max-w-6xl space-y-12">
        <PageHero
          eyebrow={page.eyebrow}
          title={page.title}
          description={page.description}
          ctaText={page.ctaText}
          ctaTo={page.ctaTo}
        />

        {page.sections.map((section) => (
          <CardGridSection
            key={section.title}
            title={section.title}
            subtitle={section.subtitle}
          >
            {section.items.map((item) => (
              <InfoCard
                key={item.title}
                icon={<Icon size={24} />}
                title={item.title}
                description={item.description}
              />
            ))}
          </CardGridSection>
        ))}
      </div>
    </main>
  );
}
