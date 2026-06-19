export default function AuthCard({
  children,
  eyebrow,
  subtitle,
  title,
  image,
  icon,
  maxWidth = "max-w-[480px]",
  maxHeight,
}) {
  return (
    <section className="mt-6">
      <div
        className={`mx-auto w-full ${maxWidth}   bg-[#F7F8FC]  rounded-xl border border-[#EAEFF3] p-4 lg:p-6 shadow-sm`}
      >
        <div className="flex flex-col md:flex-row items-stretch gap-6">
          {/* Left image - visible on md+ */}
          <div
            className={`w-full hidden lg:block lg:w-1/2 ${
              maxHeight || "h-full"
            }`}
          >
            <img
              src={image}
              alt="Register Decorative Image"
              className="w-full h-full object-cover rounded-md"
            />
          </div>

          {/* Right content */}
          <div className="flex w-full flex-col justify-center lg:w-1/2">
            <div className="w-full">
              <div className="mb-3 text-center ">
                <div className="mx-auto   mb-2 flex h-[80px] w-[80px] items-center justify-center rounded-full text-gold">
                  {icon ? (
                    <img
                      src={icon}
                      alt="Icon"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <rect
                        x="3"
                        y="11"
                        width="18"
                        height="11"
                        rx="2.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                      <path
                        d="M7 11V7a5 5 0 0110 0v4"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="12" cy="16.5" r="1.4" fill="currentColor" />
                      <line
                        x1="12"
                        y1="17.9"
                        x2="12"
                        y2="19.5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </div>

                {eyebrow && (
                  <button className="my-2 py-2 px-6 text-blue rounded-full bg-[#E5D09E] border border-[#CE9F2D] font-medium text-sm">
                    <div className="flex gap-2 items-center">
                      <div className="bg-blue w-2 h-2 rounded-full " />
                      {eyebrow}
                    </div>
                  </button>
                )}

                {title && (
                  <h1 className="text-2xl font-semibold text-[#2E2E2E] py-3">
                    {title}
                  </h1>
                )}

                {subtitle && (
                  <p className="mx-auto  max-w-md   text-base text-muted">
                    {subtitle}
                  </p>
                )}
              </div>

              <div className="w-full pt-4">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
