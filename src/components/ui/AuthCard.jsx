export default function AuthCard({
  children,
  eyebrow,
  subtitle,
  title,
  showFeatures = true,
  icon,
  maxWidth = "max-w-[480px]",
}) {
  return (
    <section className="px-4 py-2 sm:py-2 lg:py-3">
      <div className={`mx-auto flex w-full ${maxWidth} items-center justify-center`}>
        <div className="w-full overflow-hidden rounded-[var(--customer-radius-lg)] border border-border bg-white shadow-xl">
          <div className="h-[3px] w-full bg-gradient-to-r from-gold via-gold to-gold-dark" />

          <div className="px-5 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5 lg:px-6">
            <div className="mb-3 text-center">
              <div
                className="mx-auto mb-2 flex h-[46px] w-[46px] items-center justify-center rounded-full text-gold"
                style={{
                  background: "linear-gradient(135deg, var(--customer-gold-soft) 0%, var(--customer-cream) 100%)",
                  boxShadow: "0 0 0 5px rgba(214, 163, 35, 0.14), 0 0 0 8px rgba(214, 163, 35, 0.08)",
                }}
              >
                {icon ? (
                  icon
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="16.5" r="1.4" fill="currentColor" />
                    <line x1="12" y1="17.9" x2="12" y2="19.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                )}
              </div>

              {eyebrow && (
                <p className="mb-0.5  text-[0.68rem] font-semibold uppercase tracking-normal text-muted">
                  {eyebrow}
                </p>
              )}

              {title && (
                <h1 className=" text-[1.2rem] font-semibold leading-snug text-ink sm:text-[1.3rem]">
                  {title}
                </h1>
              )}

              {subtitle && (
                <p className="mx-auto mt-1 max-w-2xl  text-[0.78rem] leading-relaxed text-muted">
                  {subtitle}
                </p>
              )}
            </div>

            <div className="mb-3 h-px w-full bg-border" />

            <div className="w-full">
              {children}
            </div>

            {showFeatures && (
              <div className="mt-3 rounded-[8px] bg-cream px-3 py-1.5  text-[0.7rem] leading-4 text-muted">
                Sam Global Secure Access
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
