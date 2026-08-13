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
    <section className="mt-10 md:mt-8">
      <div
        className={`mx-auto w-full ${maxWidth}  shadow-xl  bg-[#F7F8FC]  rounded-xl border border-[#EAEFF3] p-4 lg:p-6 md:shadow-sm`}
      >
        <div className="flex flex-col md:flex-row items-stretch gap-6">
          {/* Left image - visible on md+ */}
          <div
            className={`dw-full hidden lg:block lg:w-1/2 ${
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
          <div className="flex w-full  flex-col justify-center lg:w-1/2">
            <div className="w-full">
              <div className="mb-3 text-center ">
                <div className="mx-auto   mb-2 flex w-[60px] h-[60px] lg:h-[70px] lg:w-[70px] items-center justify-center rounded-full text-gold">
                  {icon ? (
                    <img
                      src={icon}
                      alt="Icon"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <LockIcon size={22} />
                  )}
                </div>
                {title && (
                  <h1 className="text-h4 font-semibold text-[#2E2E2E] pt-2 lg:py-3">
                    {title}
                  </h1>
                )}

                {subtitle && (
                  <p className="mx-auto  max-w-md  text-sm lg:text-base text-muted">
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
