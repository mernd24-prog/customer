
import { LockIcon } from "./icons";

export default function AuthCard({
  children,
  subtitle,
  title,
  image = "/image/png/authImage.png",
  icon,
  maxWidth = "max-w-[480px]",
  maxHeight,
  topSpacing = true,
}) {
  return (
    <section className={`auth-card w-full ${topSpacing ? "py-6 sm:py-8" : ""}`}>
      <div
        className={`customer-card customer-card-padding mx-auto w-full ${maxWidth} overflow-hidden bg-[var(--customer-surface-soft)]`}
      >
        <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:gap-5">
          {/* Left image - visible on large screens */}
          <div
            className={`relative hidden w-full lg:block lg:w-1/2 ${
              maxHeight || "min-h-[440px]"
            }`}
          >
            <img
              loading="lazy"
              width="400"
              height="400"
              src={image}
              alt=""
              className="absolute inset-0 h-full w-full rounded-lg object-cover"
            />
          </div>

          {/* Right content */}
          <div className="flex w-full flex-col justify-center lg:w-1/2">
            <div className="w-full">
              <div className="mb-2 text-center">
                <div className="mx-auto mb-2 flex h-[40px] w-[40px] items-center justify-center rounded-full text-gold sm:h-[48px] sm:w-[48px]">
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
                  <h1 className="text-h4 font-bold leading-tight text-[var(--customer-navy)]">
                    {title}
                  </h1>
                )}

                {subtitle && (
                  <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-muted sm:text-base">
                    {subtitle}
                  </p>
                )}
              </div>

              <div className="w-full pt-1">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
