import ShowMoreText from "../../../utils/showMore";

export default function ReturnTrackingCard({
  title = "Return Tracking – Smart Watch",
  returnId = "RTN8745621",
  steps: customSteps,
}) {
  const stepsToRender = customSteps || [];
  return (
    <section className="rounded-xl rounded-t-none border border-[#E7D9B8] bg-white px-3 py-4 min-[375px]:px-4 sm:px-6 lg:px-6 lg:py-9  ">
      <div>
        {stepsToRender.map((step, index) => {
          const isLast = index === stepsToRender.length - 1;

          return (
            <div
              key={step.title}
              className="relative grid grid-cols-[30px_minmax(0,1fr)] gap-3 pb-4 min-[375px]:grid-cols-[34px_minmax(0,1fr)] sm:grid-cols-[40px_minmax(0,1fr)_180px] sm:gap-4 lg:grid-cols-[50px_minmax(0,1fr)_260px] lg:gap-5 lg:pb-7"
            >
              {!isLast && (
                <span className=" absolute left-[14px] top-7 h-full w-px bg-[#D7C07A] min-[375px]:left-[16px] sm:left-[15px] sm:top-8 lg:top-[30px]" />
              )}

              <span
                className={`relative  z-10 flex items-center justify-center rounded-full border font-semibold ${
                  step.completed
                    ? "border-[#E0B84C] bg-[#FFF4D7] text-[#CE9F2D]"
                    : step.active
                      ? "border-[#1B1D60] bg-[#E9EAFB] text-[#1B1D60]"
                      : "border-[#BDBDBD] bg-[#E5E5E5] text-[#555]"
                } h-7 w-7 text-[12px] sm:h-8 sm:w-8 sm:text-[13px] lg:h-[30px] lg:w-[30px] lg:text-[16px]`}
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
                <h3 className="text-[14px] font-bold leading-tight text-[#1B1D60] sm:text-[16px]">
                  {step.title}
                </h3>

                {step.description && (
                  <div className="mt-1 text-[12px] font-medium leading-snug text-[#454545] sm:text-[13px]">
                    <ShowMoreText
                      text={step.description}
                      mode="lines"
                      limit={1}
                      moreLabel="more"
                      lessLabel="less"
                      textClassName="inline break-words"
                      buttonClassName="ml-1.5 text-xs sm:text-sm font-semibold text-[#3E4093] hover:underline cursor-pointer"
                    />
                  </div>
                )}
              </div>

              <p className="col-start-2 text-[12px] font-medium text-[#454545] sm:col-start-auto sm:text-right sm:text-[13px]">
                {step.time}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
