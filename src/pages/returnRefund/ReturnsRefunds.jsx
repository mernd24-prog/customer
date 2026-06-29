import Seo from "../../components/common/Seo";
import Breadcrumbs from "../../components/ecommerce/Breadcrumbs";
import RefundSummaryCard from "../../components/returns/RefundSummaryCard";
import ReturnItemCard from "../../components/returns/ReturnItemCard";
import ReturnTrackingCard from "../../components/returns/ReturnTrackingCard";
import Tabs from "../../components/ui/Tabs";

import { useState } from "react";

const RETURN_ITEMS = [
  {
    title: "Smart Watch - Phoenix Black",
    image: "/image/png/watch.png",
    orderId: "SG123456",
    quantity: 1,
    seller: "Techhub Electronics",
    price: 1999,
    status: "Under Review",
    requestedOn: "24 Jun 2026",
    returnId: "RTN8745621",
    reason: "Damaged Product",
  },
];

function ReturnsRefundsPage() {
  const [activeTab, setActiveTab] = useState("active");
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Returns & Refunds" },
  ];

  const tabs = [
    { id: "active", label: "Active Returns", count: 2 },
    { id: "refunds", label: "Refunds", count: 1 },
    { id: "history", label: "Return History", count: 6 },
  ];
  return (
    <>
      <Seo title="Returns & Refunds | Sam Global" />
      <div className="py-6 sm:py-8">
        <Breadcrumbs
          items={breadcrumbItems}
          linkClassName="font-medium text-[14px] sm:text-[16px] lg:text-[18px] leading-[100%] text-[#2E2E2E]"
          separatorClassName="text-[#2E2E2E]"
        />
        <h1 className="lg:mb-4 lg:mt-5 font-sans text-[20px] font-bold text-[#3E4093] min-[375px]:text-[20px] min-[425px]:text-[24px] sm:text-[34px] lg:text-[38px]">
          Returns & Refunds
        </h1>
        <p className="mb-2 max-w-[600px] font-sans text-[13px] font-medium leading-[20px] text-[#2E2E2E] min-[375px]:text-[14px] min-[375px]:leading-[22px] sm:text-[16px] sm:leading-[24px] xl:text-[20px] xl:leading-[30px]">
          Manage your return requests and track refund status.
        </p>
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          sticky
        />

        {activeTab === "active" && (
          <div className="grid gap-5">
            {RETURN_ITEMS.map((item) => (
              <ReturnItemCard key={item.returnId} {...item} />
            ))}
            <RefundSummaryCard
              amount={1999}
              paymentMethod="VISA"
              paymentLastFour="4589"
              expectedDate="27 Jun 2026"
              status="Processing"
            />
          </div>
        )}
        <ReturnTrackingCard
          title="Return Tracking – Smart Watch"
          returnId="RTN8745621"
        />
      </div>
    </>
  );
}

export default ReturnsRefundsPage;
