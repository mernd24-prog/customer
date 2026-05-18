export default function AuthCard({
  children,
  eyebrow,
  subtitle,
  title,
  showFeatures = true,
}) {
  return (
    <section className="min-h-screen   py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-48px)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-lg  md:rounded-[28px] border border-[#E5E7EB] bg-white shadow-xl lg:grid-cols-[0.95fr_1.05fr]">
          {/* LEFT SIDE */}
          <aside className="relative overflow-hidden bg-gradient-to-br from-[#1E1B6D] via-[#27248A] to-[#15134D] px-6 py-10 text-white sm:px-10 sm:py-12 lg:px-12 lg:py-16">
            {/* Decorative Effects */}
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#D4A017]/20 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-white/10 blur-2xl" />

            {/* Eyebrow */}
            {eyebrow && (
              <p className="mb-4 text-xs  font-semibold uppercase  text-white sm:text-sm">
                {eyebrow}
              </p>
            )}

            {/* Title */}
            {title && (
              <h1 className="max-w-lg lg:max-w-md text-2xl font-bold leading-tight sm:text-4xl xl:text-5xl">
                {title}
              </h1>
            )}

            {/* Subtitle */}
            {subtitle && (
              <p className="mt-5 max-w-md text-sm leading-7 text-slate-200 sm:text-base">
                {subtitle}
              </p>
            )}

            {/* FEATURES */}
            {showFeatures && (
              <div className="mt-10 space-y-5">
                <div className="flex items-start gap-2">
                  <div className="mt-2 h-2.5 w-2.5 rounded-full bg-white" />
                  <p className="text-sm text-slate-100 sm:text-base">
                    Secure and fast authentication
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-2 h-2.5 w-2.5 rounded-full bg-white" />
                  <p className="text-sm text-slate-100 sm:text-base">
                    Access cart, orders & wishlist
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-2 h-2.5 w-2.5 rounded-full bg-white" />
                  <p className="text-sm text-slate-100 sm:text-base">
                    Personalized shopping experience
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Badge */}
            <div className="mt-10 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm sm:text-sm">
              Sam Global Secure Access
            </div>
          </aside>

          {/* RIGHT SIDE */}
          <div className="flex items-center bg-white px-5 py-4 sm:px-8 sm:py-10 lg:px-12 lg:py-14">
            <div className="w-full">{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}