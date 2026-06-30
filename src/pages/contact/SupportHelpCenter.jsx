import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
 
  ChevronRight,
  ChevronDown,
  MessageSquare,
  Phone,
  Mail,
  Ticket,
} from "lucide-react";

import Seo from "../../components/common/Seo";
import ApiState from "../../components/common/ApiState";
import Button from "../../components/common/buttons/Button";
import SearchBar from "../../components/ui/SearchBar";
import Breadcrumbs from "../../components/ecommerce/Breadcrumbs";
import { useCmsRecord } from "../../hooks/useCmsRecord";
const topicImageByTitle = {
  order: "/image/png/track-order.png",
  track: "/image/png/track-order.png",
  return: "/image/png/return-refund.png",
  refund: "/image/png/return-refund.png",
  payment: "/image/png/payment-issues.png",
  paying: "/image/png/payment-issues.png",
  seller: "/image/png/seller-support.png",
  reward: "/image/png/rewards-help.png",
  account: "/image/png/account-security.png",
  security: "/image/png/account-security.png",
};

function getTopicImage(title = "") {
  const normalized = title.toLowerCase();

  const match = Object.entries(topicImageByTitle).find(([key]) =>
    normalized.includes(key),
  );

  return match?.[1] || "/image/png/default-topic.png";
}

function parseBodySections(body = "") {
  if (!body) return [];

  const sections = [];
  let current = null;

  body.split(/\n+/).forEach((line) => {
    const value = line.trim();
    if (!value) return;

    if (value.startsWith("## ")) {
      current = {
        title: value.replace(/^##\s+/, "").trim(),
        description: "",
      };
      sections.push(current);
      return;
    }

    if (value.startsWith("# ")) return;

    if (current) {
      current.description = [current.description, value]
        .filter(Boolean)
        .join(" ");
    }
  });

  return sections.filter((section) => section.title);
}

function normalizeKey(value = "") {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getSection(page, names) {
  const sections = Array.isArray(page?.sections) ? page.sections : [];
  const normalizedNames = names.map(normalizeKey);

  return sections.find((section) => {
    const sectionKeys = [section?.type, section?.title].map(normalizeKey);

    return sectionKeys.some((key) => normalizedNames.includes(key));
  });
}

function getSectionTitle(section) {
  return section?.title || section?.type || "";
}

function mapCards(items = []) {
  return items
    .filter((item) => item?.title)
    .map((item, index) => ({
      title: item.title,
      description: item.description,
      image: getTopicImage(item.title),
      active: index === 1,
    }));
}

function normalizeHelpTopics(page) {
  const section = getSection(page, ["All Help Topics"]);
  const points = Array.isArray(section?.points) ? section.points : [];

  if (points.length) return mapCards(points);

  const rootPoints = Array.isArray(page?.points) ? page.points : [];
  return mapCards(rootPoints.filter((item) => !item?.description)).slice(0, 8);
}

function normalizeCommonQuestions(page) {
  const section = getSection(page, ["Common Question", "Common Questions"]);
  const points = Array.isArray(section?.points) ? section.points : [];

  if (points.length) return mapCards(points);

  const rootPoints = Array.isArray(page?.points) ? page.points : [];
  const questionPoints = rootPoints.filter((item) => item?.description);
  const bodySections = parseBodySections(page?.body);

  return mapCards(questionPoints.length ? questionPoints : bodySections).slice(
    0,
    3,
  );
}

function normalizeOptions(page) {
  const optionSection = getSection(page, [
    "Other Options For You",
    "Options",
    "Support Options",
  ]);
  const points = Array.isArray(optionSection?.points)
    ? optionSection.points
    : [];

  return mapCards(points);
}

// Styled Quick Action container color-theme helper
function getTopicStyles(title = "") {
  const normalized = title.toLowerCase();
  if (normalized.includes("track") || normalized.includes("order")) {
    return {
      bg: "bg-[#FDF2E9]",
      iconBg: "bg-[#FDF2E9] text-[#D35400]",
      iconColor: "text-[#D35400]",
      border: "border-[#FAE5D3]",
    };
  }
  if (normalized.includes("return") || normalized.includes("refund")) {
    return {
      bg: "bg-[#E8F8F5]",
      iconBg: "bg-[#E8F8F5] text-[#117A65]",
      iconColor: "text-[#117A65]",
      border: "border-[#D1F2EB]",
    };
  }
  if (
    normalized.includes("payment") ||
    normalized.includes("pay") ||
    normalized.includes("wallet")
  ) {
    return {
      bg: "bg-[#EBF5FB]",
      iconBg: "bg-[#EBF5FB] text-[#2471A3]",
      iconColor: "text-[#2471A3]",
      border: "border-[#D4E6F1]",
    };
  }
  if (normalized.includes("seller") || normalized.includes("store")) {
    return {
      bg: "bg-[#FDEDEC]",
      iconBg: "bg-[#FDEDEC] text-[#CB4335]",
      iconColor: "text-[#CB4335]",
      border: "border-[#FADBD8]",
    };
  }
  if (
    normalized.includes("reward") ||
    normalized.includes("award") ||
    normalized.includes("badge") ||
    normalized.includes("help")
  ) {
    return {
      bg: "bg-[#FEF9E7]",
      iconBg: "bg-[#FEF9E7] text-[#B7950B]",
      iconColor: "text-[#B7950B]",
      border: "border-[#FCF3CF]",
    };
  }
  if (
    normalized.includes("security") ||
    normalized.includes("account") ||
    normalized.includes("safe")
  ) {
    return {
      bg: "bg-[#E8F8F5]",
      iconBg: "bg-[#E8F8F5] text-[#239B56]",
      iconColor: "text-[#239B56]",
      border: "border-[#D1F2EB]",
    };
  }
  return {
    bg: "bg-[#F4F6F6]",
    iconBg: "bg-[#F4F6F6] text-[#5D6D7E]",
    iconColor: "text-[#5D6D7E]",
    border: "border-[#E5E8E8]",
  };
}

function TopicCard({ topic }) {
  const styles = getTopicStyles(topic.title);
  return (
    <button
      type="button"
      className="flex min-h-[130px] w-full cursor-pointer flex-col items-center justify-center border-solid bg-white p-4 text-center outline-none group sm:min-h-[150px] sm:p-5"
    >
      <div
        className={`mb-3 flex h-14 w-14 items-center justify-center overflow-hidden rounded-[10px] border border-solid transition-transform duration-300 group-hover:scale-105 sm:h-16 sm:w-16 lg:h-[125px] lg:w-[130px] ${styles.bg} ${styles.border}`}
      >
        <img
          src={topic.image}
          alt={topic.title}
          className="h-8 w-8 object-contain sm:h-10 sm:w-10 lg:h-[70px] lg:w-[72px]"
        />
      </div>
      <span className="text-xs font-bold leading-snug text-[#03014D] sm:text-sm lg:text-[22px]">
        {topic.title}
      </span>
    </button>
  );
}

function getContactMethodInfo(title = "") {
  const norm = title.toLowerCase();
  if (norm.includes("chat")) {
    return {
      icon: MessageSquare,
      status: "Available 24/7",
      color: "text-[#228B22]",
    };
  }
  if (norm.includes("call") || norm.includes("phone")) {
    return {
      icon: Phone,
      status: "Mon - Sun, 9AM - 6PM",
      color: "text-[#22A447]",
    };
  }
  if (norm.includes("email") || norm.includes("mail")) {
    return {
      icon: Mail,
      status: "Response within 24 hours",
      color: "text-[#22A447]",
    };
  }
  if (norm.includes("ticket") || norm.includes("raise")) {
    return {
      icon: Ticket,
      status: "Mon - Sun, 9AM - 6PM",
      color: "text-[#22A447]",
    };
  }
  return {
    icon: MessageSquare,
    status: "Mon - Sun, 9AM - 6PM",
    color: "text-[#22A447]",
  };
}
function OptionCard({ option }) {
  const info = getContactMethodInfo(option.title);
  const IconComponent = info.icon || option.icon || MessageSquare;

  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center rounded-[20px] border border-[#CE9F2D]/50 bg-white px-4 py-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:min-h-[280px] sm:px-6 sm:py-8 lg:min-h-[300px]">
      {/* Icon */}
      <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-[#F2F3FD] sm:h-[90px] sm:w-[90px] lg:h-[100px] lg:w-[100px]">
        <IconComponent size={38} className="text-[#2B2D73] sm:h-11 sm:w-11 lg:h-[46px] lg:w-[46px]" />
      </div>

      {/* Title */}
      <h3 className="mb-3 text-lg font-bold text-[#3E4093] sm:text-[20px] lg:text-[24px]">
        {option.title}
      </h3>

      {/* Description */}
      <p className="mb-4 min-h-[24px] text-sm leading-6 text-[#666666] sm:mb-5 sm:text-[16px] lg:text-[18px]">
        {option.description}
      </p>

      {/* Status */}
      <span
        className={`text-sm font-semibold sm:text-[16px] lg:text-[18px] ${info.color}`}
      >
        {info.status}
      </span>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = status.toLowerCase();
  if (s === "open" || s === "pending") {
    return (
      <span className="inline-flex min-w-[86px] items-center justify-center rounded-full bg-[#D9A11D] px-4 py-2 text-sm font-medium leading-none text-white">
        {status}
      </span>
    );
  }
  if (s === "resolved" || s === "closed" || s === "completed") {
    return (
      <span className="inline-flex min-w-[86px] items-center justify-center rounded-full bg-[#07943A] px-4 py-2 text-sm font-medium leading-none text-white">
        {status}
      </span>
    );
  }
  return (
    <span className="inline-flex min-w-[86px] items-center justify-center rounded-full bg-[#6B7280] px-4 py-2 text-sm font-medium leading-none text-white">
      {status}
    </span>
  );
}

export default function SupportHelpCenter() {
  const { page, loading } = useCmsRecord("support-center");
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const pageTitle = page?.title || "";
  const pageDescription = page?.description || page?.excerpt || "";
  const topics = useMemo(() => normalizeHelpTopics(page), [page]);
  const commonQuestions = useMemo(() => normalizeCommonQuestions(page), [page]);
  const options = useMemo(() => normalizeOptions(page), [page]);
  // const introSection = getSection(page, [
  //   "Help & Support Centre",
  //   "Support Center",
  // ]);
  // const commonSection = getSection(page, [
  //   "Common Question",
  //   "Common Questions",
  // ]);
  // const topicsSection = getSection(page, ["All Help Topics"]);
  // const optionsSection = getSection(page, ["Other Options For You"]);
  // const ctaLabel = page?.cta?.label;
  // const ctaUrl = page?.cta?.url;
  const searchPlaceholder =
    page?.metadata?.data?.searchPlaceholder ||
    "Search for products, brands and categories...";
  // const hasPageContent = true;
  const isPageLoading = loading && !page;

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Help & Support" },
  ];

  const fallbackFaqs = [
    {
      title: "How do i cancel an order ?",
      description:
        "You can cancel your order directly from the My Orders section of your profile before the item is shipped. Once shipped, order cancellations are not possible, but you can initiate a return after delivery.",
    },
    {
      title: "When will i receive my refund ?",
      description:
        "Refunds are processed within 5-7 business days after we receive and inspect the returned item at our warehouse. The refund will be credited back to your original payment method or wallet.",
    },
    {
      title: "How do i track my order ?",
      description:
        "You can track your order using the 'Track Order' option under Quick Actions or by checking the tracking link sent to your registered email and mobile number after shipment.",
    },
    {
      title: "How do i contact a seller ?",
      description:
        "To contact a seller, go to the product detail page, click on the seller name listed under the product title, and use the 'Contact Seller' option to send a message.",
    },
    {
      title: "How do i change my delivery address ?",
      description:
        "You can update your delivery address in your Account settings. If you have already placed an order, please contact customer support immediately to check if the shipping address can be modified before dispatch.",
    },
    {
      title: "What payment methods do you accept ?",
      description:
        "We accept all major credit and debit cards, UPI payments, net banking, mobile wallets, and Cash on Delivery (COD) for eligible pincodes.",
    },
  ];

  const faqData = commonQuestions.length > 0 ? commonQuestions : fallbackFaqs;

  const fallbackTopics = [
    { title: "Track Order", image: "/image/png/track-order.png" },
    { title: "Return & Refund", image: "/image/png/return-refund.png" },
    { title: "Payment Issues", image: "/image/png/payment-issues.png" },
    { title: "Seller Support", image: "/image/png/seller-support.png" },
    { title: "Rewards & Help", image: "/image/png/rewards-help.png" },
    { title: "Account Security", image: "/image/png/account-security.png" },
  ];

  const quickActions = topics.length > 0 ? topics : fallbackTopics;

  const fallbackOptions = [
    {
      title: "Live Chat",
      description: "Chat with our support agent",
      active: true,
    },
    { title: "Call Us", description: "+91 1234557890", active: false },
    {
      title: "Email Support",
      description: "support@samglobal.com",
      active: false,
    },
    {
      title: "Raise a Ticket",
      description: "Submit a ticket and we will get back",
      active: false,
    },
  ];

  const contactMethods = options.length > 0 ? options : fallbackOptions;

  const mockTickets = [
    {
      id: "TK00345",
      subject: "Refund not received",
      category: "Refunds",
      lastUpdated: "24 Jun 2026, 10:00 AM",
      status: "Open",
    },
    {
      id: "TK00346",
      subject: "Wrong item received",
      category: "Orders",
      lastUpdated: "20 Jun 2026, 06:15 PM",
      status: "Resolved",
    },
  ];

  if (isPageLoading) {
    return (
      <>
        <Seo
          title={`${pageTitle || "Customer Support"} | Sam Global`}
          description={pageDescription}
        />
        <section className="w-container py-8 sm:py-10">
          <div className="py-4">
            <Breadcrumbs items={breadcrumbItems} />
          </div>
          <h1 className="mb-8 text-heading-sm font-bold text-ink sm:text-heading-md">
            {pageTitle || "Customer Support"}
          </h1>
          <ApiState
            loading={isPageLoading}
            empty={!isPageLoading && !page}
            emptyTitle="Customer Support"
            emptyText="Help topics and support options will appear here ."
          />
        </section>
      </>
    );
  }

  return (
    <>
      <Seo
        title={`${pageTitle || "Customer Support"} | Sam Global`}
        description={pageDescription}
      />

      <div className="main-container px-4 py-4 sm:px-6 sm:py-6 lg:px-0">
        {/* Breadcrumb */}
        <Breadcrumbs items={breadcrumbItems} />

        {/* Page Title & Subtitle */}
        <div className="mb-6 mt-4 sm:mb-8 sm:mt-6">
          <h1 className="text-[28px] font-bold text-[#3E4093] sm:text-[32px] lg:text-[38px]">
            Help & Support
          </h1>
          <p className="mt-3 text-sm text-[#000000] sm:mt-4 sm:text-base lg:mt-6 lg:text-[20px]">
            Need assistance? We're here to help 24/7.
          </p>
        </div>

        {/* How can we help you today Banner */}
        <div className="relative mb-8 flex flex-col items-start justify-between gap-6 overflow-hidden rounded-2xl border border-[#1B1D60]/30 bg-gradient-to-r from-[#e9e9f0] to-[#e9e9f0] p-5 sm:mb-10 sm:gap-8 sm:p-8 md:items-center md:px-10 md:py-8 lg:flex-row lg:items-center lg:p-10">
          <div className="w-full flex-1">
            <h2 className="mb-3 text-[15px] font-bold leading-tight text-[#03014D] min-[375px]:text-[18px] min-[425px]:text-[20px] sm:text-[26px] md:text-center lg:mb-6 lg:text-left lg:text-[32px] xl:mb-8 xl:text-[38px]">
              How can we help you today ?
            </h2>
            <SearchBar
              placeholder={searchPlaceholder}
              showButtonLabel={false}
              enableCategoryDropdown={false}
              className=" md:mx-auto lg:mx-0"
            />
          </div>

          {/* Headphones illustration */}
          <div className="relative mx-auto hidden shrink-0 lg:block lg:mx-0">
            <img
              src="/image/png/help.png"
              alt=""
              className="h-[180px] w-[220px] rotate-[15deg] object-contain lg:h-[200px] lg:w-[200px]"
            />
          </div>
        </div>

        {/* Quick Actions Grid */}
        {quickActions.length > 0 && (
          <div className="mb-8 rounded-2xl border border-[#CE9F2D80]/50 bg-white p-4 sm:mb-12 sm:p-6 lg:p-7 xl:p-8">
            <h2 className="mb-5 text-xl font-bold text-[#03014D] sm:mb-6 sm:text-2xl lg:text-[30px] xl:text-[38px]">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-5 xl:grid-cols-6 xl:gap-6">
              {quickActions.map((topic, index) => (
                <TopicCard key={`${topic.title}-${index}`} topic={topic} />
              ))}
            </div>
          </div>
        )}

        {/* Frequently Asked Questions */}
        <div className="mb-8 rounded-2xl border border-[#CE9F2D]/50 bg-white px-4 py-6 sm:mb-12 sm:px-6 sm:py-8 lg:px-8 lg:py-10 xl:px-10 xl:py-12">
          {/* Header */}
          <div className="flex flex-col gap-3 border-b border-[#CE9F2D]/50 pb-5 sm:flex-row sm:items-center sm:justify-between sm:pb-8">
            <h2 className="text-[16px] font-bold text-[#03014D] sm:text-2xl lg:text-[30px] xl:text-[38px]">
              Frequently Asked Questions
            </h2>

            <Link
              to="/faq"
              className="text-sm font-bold text-[#3E4093] transition-colors hover:text-[#CE9F2D] sm:text-base lg:text-[20px] xl:text-[24px]"
            >
              View All FAQs
            </Link> 
          </div>

          {/* FAQ List */}
          <div className="divide-y divide-[#CE9F2D]/50">
            {faqData.map((faq, index) => {
              const isOpen = openFaqIndex === index;

              return (
                <div key={index}>
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="flex w-full items-start justify-between gap-3 py-4 text-left focus:outline-none sm:items-center sm:py-5"
                  >
                    <span className="text-sm font-bold text-[#03014D] transition-colors hover:text-[#CE9F2D] sm:text-base lg:text-[20px] xl:text-[24px]">
                      {faq.title || faq.question}
                    </span>

                    <ChevronDown
                      size={28}
                      className={`text-[#1B1D60] transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen ? "max-h-96 pt-0 pb-5 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <p className="pr-8 text-sm leading-7 text-gray-500 sm:text-base">
                      {faq.description || faq.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Support */}
        <div className="mb-8 rounded-[24px] border border-[#CE9F2D]/50 bg-white px-4 py-6 sm:mb-12 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <h2 className="mb-6 text-[22px] font-bold text-[#03014D] sm:mb-8 sm:text-[24px] lg:mb-8 lg:text-[30px] xl:mb-10 xl:text-[38px]">
            Contact Support
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-2 xl:grid-cols-4">
            {contactMethods.map((method, index) => (
              <OptionCard key={`${method.title}-${index}`} option={method} />
            ))}
          </div>
        </div>
        {/* Support Ticket History */}
        <div className="mb-8 rounded-2xl border border-[#CE9F2D]/50 bg-white px-4 py-6 sm:px-6 sm:py-8">
          <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-bold text-[#1B1D60] sm:text-2xl lg:text-[26px]">
              Support Ticket History
            </h2>

            <Link
              to="/profile?tab=tickets"
              className="text-sm font-bold text-[#3E4093] transition-colors hover:text-[#CE9F2D] sm:text-base lg:text-[20px]"
            >
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left lg:min-w-[900px]">
              <thead>
                <tr className="rounded-md bg-[#F0F3FB]">
                  <th className="px-4 py-4 text-[15px] font-bold text-[#03014D]">
                    Ticket ID
                  </th>
                  <th className="px-4 py-4 text-[15px] font-bold text-[#03014D]">
                    Subject
                  </th>
                  <th className="px-4 py-4 text-[15px] font-bold text-[#03014D]">
                    Category
                  </th>
                  <th className="px-4 py-4 text-[15px] font-bold text-[#03014D]">
                    Last Updated
                  </th>
                  <th className="px-4 py-4 text-[15px] font-bold text-[#03014D]">
                    Status
                  </th>
                  <th className="px-4 py-4"></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#CE9F2D]/50">
                {mockTickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="px-4 py-6 text-[16px] font-medium text-[#2E2E2E]">
                      {ticket.id}
                    </td>
                    <td className="px-4 py-6 text-[16px] font-medium text-[#2E2E2E]">
                      {ticket.subject}
                    </td>
                    <td className="px-4 py-6 text-[16px] font-medium text-[#2E2E2E]">
                      {ticket.category}
                    </td>
                    <td className="px-4 py-6 text-[16px] font-medium text-[#2E2E2E]">
                      {ticket.lastUpdated}
                    </td>
                    <td className="px-4 py-6">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-4 py-6 text-right">
                      <button className="flex h-10 w-10 items-center justify-center rounded-full border border-[#3E4093]/70 transition-colors hover:bg-[#F0F3FB] focus:outline-none">
                        <ChevronRight  className="text-[#3E4093]" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
