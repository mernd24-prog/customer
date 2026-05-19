import React, { useMemo } from "react";
 
import Seo from "../common/Seo";
import ApiState from "../common/ApiState";
import { useCmsRecord, getCmsPayload } from "../../hooks/useCmsRecord";
import PolicySection from "../policy/PolicySection";
import PolicyHeader from "../policy/PolicyHeader";
import PolicyIntro from "../policy/PolicyIntro";

const ShippingDelivery = () => {
  // CMS Fetch
  const { page: cmsPolicy, loading } = useCmsRecord("shipping-policy");

  // Clean CMS Payload
  const cmsData = useMemo(() => getCmsPayload(cmsPolicy, null), [cmsPolicy]);

  // Safely construct data, avoiding errors if API returns partial data
  const data = useMemo(() => {
    if (!cmsData) return null;
    return {
      title: cmsData.title || "Shipping Policy",
      intro: {
        heading: cmsData.intro?.heading || cmsData.title || "Shipping Policy",
        description: cmsData.intro?.description || cmsData.description || "",
      },
      sections: cmsData.sections || [],
    };
  }, [cmsData]);
  console.log(cmsData);
 


  const pageTitle = `${data?.title || "Shipping Policy"} | Sam Global`;
  const pageDescription =
    data?.intro?.description ||
    "Learn about our shipping times, costs, and delivery methods.";

  return (
    <main className="w-full bg-white font-montserrat pb-20">
      <Seo title={pageTitle} description={pageDescription} />

      <ApiState
        loading={loading && !cmsData}
        error={null}
        empty={!cmsData && !loading}
        emptyTitle="Content Not Found"
        emptyText="The shipping policy is currently unavailable."
      >
        {data && (
          <>
            <PolicyHeader title={data.title} />

            <div className="w-full px-8 md:px-12 lg:px-16 mt-12 md:mt-16 max-w-[1648px] mx-auto">
              <PolicyIntro
                heading={data.intro?.heading}
                description={data.intro?.description}
              />

              {data.sections?.length > 0 && (
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
              )}
            </div>
          </>
        )}
      </ApiState>
    </main>
  );
};

export default ShippingDelivery;
