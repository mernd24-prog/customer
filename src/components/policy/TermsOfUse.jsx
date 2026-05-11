import React from "react";
import Header from "../../components/organism/Header";
import { Footer } from "../../components/organism/footer";
import PolicyHeader from "./PolicyHeader";
import PolicyIntro from "./PolicyIntro";
import PolicySection from "./PolicySection";
import Seo from "../../components/Seo";
import { POLICIES } from "../../data";

const TermsOfUse = () => {
  const data = POLICIES.terms;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow w-full bg-white font-montserrat pb-20">
        <Seo
          title={`${data.title} | Sam Global`}
          description={data.intro?.description}
        />

        <PolicyHeader title={data.title} />

        <div className="w-full px-8 md:px-12 lg:px-16 mt-12 md:mt-16 max-w-[1648px] mx-auto">
          <PolicyIntro
            heading={data.intro?.heading}
            description={data.intro?.description}
          />

          <div className="space-y-10 md:space-y-12">
            {data.sections.map((section, index) => (
              <PolicySection
                key={index}
                index={index}
                title={section.title}
                points={section.points}
                description={section.description}
                footer={section.footer}
              />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfUse;
