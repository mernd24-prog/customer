import { ExternalLink } from "lucide-react";

const steps = [
  {
    title: "Return Requested",
    description: "Your return request has been submitted successfully.",
    time: "24 Jun 2026, 10:30 AM",
    completed: true,
  },
  {
    title: "Pickup Scheduled",
    description: "Pickup has been scheduled with our delivery partner.",
    time: "25 Jun 2026, 09:15 AM",
    completed: true,
  },
  {
    title: "Product Picked Up",
    description: "Your item has been picked up by the delivery partner.",
    time: "25 Jun 2026, 04:45 PM",
    completed: true,
  },
  {
    title: "Quality Check",
    description: "We are checking the returned item at our facility.",
    time: "26 Jun 2026, 11:25 AM",
    active: true,
  },
  {
    title: "Refund Initiated",
    description: "Refund will be initiated once the item is approved.",
    time: "—",
  },
  {
    title: "Refund Completed",
    description: "The refund amount will be credited to your account.",
    time: "—",
  },
];

export default function ReturnTrackingCard({
  title = "Return Tracking – Smart Watch",
  returnId = "RTN8745621",
  policyHref = "/refund-policy",
}) {
  return (
    <section className="rounded-xl rounded-t-none border border-[#E7D9B8] bg-white px-3 py-4 min-[375px]:px-4 sm:px-6 lg:px-6 lg:py-9  ">
      <h2 className="text-[16px] font-semibold leading-tight text-[#1B1D60] sm:text-[18px] md:text-[22px] lg:text-[26px] pb-2">
        {title}{" "}
        <span className="text-[13px] font-semibold text-[#555] sm:text-[15px] md:text-[20px] lg:text-[20px]">
          ({returnId})
        </span>
      </h2>

      <div className="my-4 h-px bg-[#2E2E2E]/40" />

      <div>
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;

          return (
            <div
              key={step.title}
              className="relative grid grid-cols-[30px_minmax(0,1fr)] gap-3 pb-6 min-[375px]:grid-cols-[34px_minmax(0,1fr)] sm:grid-cols-[40px_minmax(0,1fr)_180px] sm:gap-4 lg:grid-cols-[50px_minmax(0,1fr)_260px] lg:gap-5 lg:pb-10 lg:pt-9"
            >
              {!isLast && (
                <span className="absolute left-[14px] top-7 h-full w-px bg-[#D7C07A] min-[375px]:left-[16px] sm:left-[19px] sm:top-8 lg:left-[24px] lg:top-[50px]" />
              )}

              <span
                className={`relative z-10 flex items-center justify-center rounded-full border font-semibold ${
                  step.completed
                    ? "border-[#E0B84C] bg-[#FFF4D7] text-[#CE9F2D]"
                    : step.active
                      ? "border-[#1B1D60] bg-[#E9EAFB] text-[#1B1D60]"
                      : "border-[#BDBDBD] bg-[#E5E5E5] text-[#555]"
                } h-7 w-7 text-[12px] sm:h-8 sm:w-8 sm:text-[13px] lg:h-[50px] lg:w-[50px] lg:text-[18px]`}
              >
                {step.completed ? (
                  <svg
                    viewBox="0 0 11 8"
                    className="h-[8px] w-[11px]"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 4L4 7L10 1"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </span>

              <div className="min-w-0">
                <h3 className="text-[15px] font-bold leading-tight text-[#1B1D60] sm:text-[17px] md:text-[20px] lg:text-[24px]">
                  {step.title}
                </h3>

                <p className="mt-1 text-[12px] leading-snug text-[#2E2E2E] sm:text-sm md:text-base lg:text-[18px]">
                  {step.description}
                </p>
              </div>

              <p className="col-start-2 text-[12px] text-[#2E2E2E] sm:col-start-auto sm:text-right sm:text-sm md:text-base font-medium lg:text-[22px]">
                {step.time}
              </p>
            </div>
          );
        })}
      </div>

      <div className="h-px bg-[#2E2E2E]/40" />

      <a
        href={policyHref}
        className="mt-4 inline-flex items-center gap-2 text-[14px]  font-bold text-[#1B1D60] sm:text-[16px] lg:text-[24px] leading-[200%] "
      >
        View Return Policy
        <ExternalLink size={18} />
      </a>
    </section>
  );
}
