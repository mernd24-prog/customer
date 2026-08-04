import {
  ShieldCheck,
  PackageCheck,
  Truck,
  Wallet,
  BadgeCheck,
  FileCheck2,
  ClipboardList,
  Box,
  Headphones,
  BarChart3,
  TriangleAlert,
} from "lucide-react";

export default function SellerPolicy() {
  const compliance = [
    {
      icon: ShieldCheck,
      title: "Good Standing",
      desc: "Maintain accurate listings, timely shipping, and quality customer service to keep your seller account active and trusted.",
      color: "bg-green-50 text-green-600",
    },
    {
      icon: BarChart3,
      title: "Performance Review",
      desc: "Your account is regularly reviewed based on order fulfillment, cancellations, returns, and customer satisfaction.",
      color: "bg-[#18156D]/10 text-[#18156D]",
      featured: true,
    },
    {
      icon: TriangleAlert,
      title: "Policy Violations",
      desc: "Repeated policy violations may lead to listing restrictions, temporary suspension, or permanent account removal.",
      color: "bg-red-50 text-red-500",
    },
  ];

  const highlights = [
    {
      icon: ShieldCheck,
      title: "Genuine Products",
      desc: "Sell only authentic and legally sourced products.",
    },
    {
      icon: ClipboardList,
      title: "Accurate Listings",
      desc: "Provide correct titles, images, pricing and specifications.",
    },
    {
      icon: Truck,
      title: "Timely Shipping",
      desc: "Dispatch orders within the promised timeline.",
    },
    {
      icon: Wallet,
      title: "Secure Payments",
      desc: "Payments are released after successful order completion.",
    },
    {
      icon: BadgeCheck,
      title: "Customer Trust",
      desc: "Deliver quality service and maintain customer satisfaction.",
    },
    {
      icon: FileCheck2,
      title: "Policy Compliance",
      desc: "Follow marketplace standards to keep your account healthy.",
    },
  ];

  const responsibilities = [
    {
      icon: PackageCheck,
      title: "List Authentic Products",
      desc: "Upload only original products with complete details.",
    },
    {
      icon: ClipboardList,
      title: "Maintain Accurate Listings",
      desc: "Keep pricing, stock and product information updated.",
    },
    {
      icon: Box,
      title: "Process Orders Quickly",
      desc: "Accept, pack and dispatch every order on time.",
    },
    {
      icon: Headphones,
      title: "Support Customers",
      desc: "Respond professionally to customer queries and returns.",
    },
  ];

  return (
    <div 
      className="w-[100vw] overflow-x-hidden" 
      style={{ marginLeft: "calc(-50vw + 50%)" }}
    >
      {/* ================= HERO ================= */}

      <section className="relative isolate overflow-hidden w-full bg-[#FAF8F3]">
        {/* Background Image */}
        <img
          src="/image/png/sellerPrivacy.png"
          alt="Seller Policy"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-top"
        />

        {/* Content Overlay */}
        <div className="customer-container flex min-h-[570px] items-center py-16 lg:min-h-[780px] lg:py-20">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center rounded-full border border-[#D4A52A]/30 bg-[#D4A52A]/15 px-4 py-2 text-sm font-medium text-[#18156D] backdrop-blur-sm">
                Seller Guidelines
              </div>

              <h1 className="banner-heading font-bold text-[#18156D]">
                Seller Policy
              </h1>

              <p className="mt-6 max-w-xl text-base text-gray-700 sm:text-lg">
                Our Seller Policy defines the standards, responsibilities, and
                marketplace guidelines that help create a trusted experience for
                both sellers and customers.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="/become-a-seller" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#D4A52A] px-7 font-bold text-[#18156D] transition hover:-translate-y-0.5 hover:bg-[#e5b738]">
                  Become a Seller
                </a>

                <a href="/contact-us" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[#18156D]/20 bg-white/70 px-7 font-bold text-[#18156D] transition hover:-translate-y-0.5 backdrop-blur">
                  Contact Support
                </a>
              </div>
            </div>
          </div>
      </section>

      {/* ================= POLICY HIGHLIGHTS ================= */}
      <section className="py-8 bg-[#FAF8F3]">
        <div className="max-w-7xl  mx-auto px-8 py-8">
          <div className="text-center">
            <span className="rounded-full bg-[#F5E9C6] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#B88400]">
              Policy Highlights
            </span>

            <h2 className="mt-5 text-[20px] font-bold leading-[28px] tracking-[-0.01em] text-[#18156D] md:text-[24px] md:leading-[32px] lg:text-[28px] lg:leading-[36px]">
              Everything You Need To Sell Confidently
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-[14px] leading-[22px] text-gray-600 md:text-[18px] md:leading-[28px]">
              Our marketplace policies are designed to protect sellers,
              strengthen customer confidence and ensure smooth business
              operations.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {highlights.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={index}
                  className="group rounded-3xl bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#18156D]/10 text-[#18156D]">
                    <Icon size={28} />
                  </div>

                  <h3 className="mt-6 text-[16px] font-bold leading-tight text-[#18156D] md:text-[18px] lg:text-[20px]">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-[14px] leading-[22px] text-gray-600 md:text-[16px] md:leading-[26px]">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= RESPONSIBILITIES ================= */}

      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <span className="inline-flex rounded-full bg-[#F5E9C6] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#C59A22]">
              Seller Responsibilities
            </span>

            <h2 className="mt-5 text-[20px] font-bold leading-[28px] tracking-[-0.01em] text-[#18156D] md:text-[24px] md:leading-[32px] lg:text-[28px] lg:leading-[36px]">
              Your Commitment Matters
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-[14px] leading-[22px] text-gray-600 md:text-[18px] md:leading-[28px]">
              Follow these essential responsibilities to deliver a trusted
              shopping experience and build long-term customer confidence.
            </p>
          </div>

          <div className="mt-14 grid gap-7 lg:grid-cols-4">
            {responsibilities.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-[28px] border border-[#ECE7DD] bg-gradient-to-b from-white to-[#FCFBF8] p-7 transition-all duration-300 hover:border-[#D4A52A]"
                >
                  {/* Top Accent */}
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#D4A52A] via-[#F2D37A] to-[#D4A52A]" />

                  {/* Icon */}
                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#18156D]/8 text-[#18156D] transition-colors duration-300 group-hover:bg-[#18156D] group-hover:text-white">
                      <Icon size={20} strokeWidth={2.2} />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="mt-6 text-[16px] font-bold leading-tight text-[#18156D] md:text-[18px] lg:text-[20px]">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-[14px] leading-[22px] text-gray-600 md:text-[16px] md:leading-[26px]">
                    {item.desc}
                  </p>

                  {/* Bottom Divider */}
                  <div className="mt-6 h-px w-full bg-[#EFE8DA]" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 ">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <span className="inline-flex rounded-full bg-[#F5E9C6] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#C59A22]">
              Seller Account Compliance
            </span>

            <h2 className="mt-5 text-[20px] font-bold leading-[28px] tracking-[-0.01em] text-[#18156D] md:text-[24px] md:leading-[32px] lg:text-[28px] lg:leading-[36px]">
              Maintain a Healthy Seller Account
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-[14px] leading-[22px] text-gray-600 md:text-[18px] md:leading-[28px]">
              We regularly monitor seller performance to ensure customers
              receive a reliable and trustworthy shopping experience.
            </p>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-3">
            {compliance.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={index}
                  className={`rounded-[28px] border p-8 transition-all duration-300 ${
                    item.featured
                      ? "bg-[#18156D] text-white border-[#18156D]"
                      : "bg-white border-[#ECE7DD]"
                  }`}
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                      item.featured ? "bg-white/10" : item.color
                    }`}
                  >
                    <Icon size={22} />
                  </div>

                  <h3
                    className={`mt-6 text-[18px] md:text-[20px] lg:text-[24px] font-bold leading-tight ${
                      item.featured ? "text-white" : "text-[#18156D]"
                    }`}
                  >
                    {item.title}
                  </h3>

                  <p
                    className={`mt-4 text-[14px] leading-[22px] md:text-[16px] md:leading-[26px] ${
                      item.featured ? "text-white/75" : "text-gray-600"
                    }`}
                  >
                    {item.desc}
                  </p>

                  <div
                    className={`mt-8 h-1 w-16 rounded-full ${
                      item.featured ? "bg-[#D4A52A]" : "bg-[#D4A52A]/30"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
