
import { LockIcon } from "./icons";

export default function AuthCard({
  children,
  subtitle,
  title,
  image,
  icon,
  maxWidth = "max-w-[480px]",
  maxHeight,
}) {
  return (
    <section className="w-full">
      <div
        className={`mx-auto w-full ${maxWidth} overflow-hidden rounded-[16px] bg-[#F7F8FC] p-4 shadow-xl sm:rounded-[18px] sm:p-5 lg:rounded-[20px] lg:p-6 md:shadow-sm`}
      >
        <div className="flex flex-col items-stretch gap-5 lg:flex-row lg:gap-6">
          {/* Left image - visible on large screens */}
          <div
            className={`hidden w-full lg:block lg:w-1/2 ${
              maxHeight || "h-full"
            }`}
          >
            <img
              loading="lazy"
              width="400"
              height="400"
              src={image}
              alt=""
              className="h-full w-full rounded-lg object-cover"
            />
          </div>

          {/* Right content */}
          <div className="flex w-full flex-col justify-center lg:w-1/2">
            <div className="w-full">
              <div className="mb-3 text-center sm:mb-4">
                <div className="mx-auto mb-2 flex h-[52px] w-[52px] items-center justify-center rounded-full text-gold sm:h-[60px] sm:w-[60px] lg:h-[70px] lg:w-[70px]">
                  {icon ? (
                    <img
                      loading="lazy"
                      width="400"
                      height="400"
                      src={icon}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <LockIcon size={22} />
                  )}
                </div>

                {title && (
                  <h1 className="pt-1 text-h4 font-semibold leading-tight text-[#2E2E2E] sm:pt-2 lg:py-3">
                    {title}
                  </h1>
                )}

                {subtitle && (
                  <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-muted sm:text-base">
                    {subtitle}
                  </p>
                )}
              </div>

              <div className="w-full pt-2 sm:pt-4">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
