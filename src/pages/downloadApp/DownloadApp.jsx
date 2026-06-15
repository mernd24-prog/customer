import { BadgeCheck, RotateCcw, ShieldCheck } from "lucide-react";
import Seo from "../../components/common/Seo";
import { footerData } from "../../data/footer";

const benefits = [
  {
    label: "Genuine Products",
    icon: BadgeCheck,
  },
  {
    label: "Secure Shopping",
    icon: ShieldCheck,
  },
  {
    label: "Hassle-free Returns",
    icon: RotateCcw,
  },
];

export default function DownloadApp() {
  return (
    <>
      <Seo
        title="Download the Sam Global App"
        description="Download the Sam Global app for faster shopping, secure checkout, genuine products, and easy returns."
        path="/mobile-app"
      />

      <section className="relative left-1/2 right-1/2 w-screen -ml-[50vw] -mr-[50vw] bg-[var(--customer-surface-soft)] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1280px] overflow-hidden bg-gradient-to-br from-[var(--customer-navy)] via-[#111653] to-[var(--customer-navy-dark)] text-white shadow-[0_18px_45px_rgba(3,1,77,0.16)]">
          <div className="relative grid min-h-[520px] grid-cols-1 items-center gap-2 sm:gap-12 px-5 py-10 sm:px-8 md:min-h-[600px] lg:grid-cols-[1fr_0.82fr] lg:px-20 lg:py-6 xl:min-h-[700px]">
            <div className="relative z-10 flex flex-col items-center text-center lg:items-start lg:text-left">
              <div className=" flex  gap-3">
                <img
                  src="/image/png/logoWithWhiteText.png"
                  alt="Sam Global"
                  className="h-28 w-auto object-contain sm:h-32"
                />
              </div>

              <h1 className="max-w-[760px] text-xl font-bold  sm:text-5xl xl:text-6xl">
                INDIA'S SMART SHOPPING APP
              </h1>
              <p className="mt-4 max-w-[620px] text-base font-medium  text-white/90 sm:text-2xl">
                Fashion, brands, deals, orders, rewards, and returns in one Sam
                Global experience.
              </p>

              <div className="mt-6  lg:mt-10 grid w-full max-w-[760px] grid-cols-1 gap-4 sm:grid-cols-3">
                {benefits.map(({ label, icon: Icon }) => (
                  <div
                    key={label}
                    className="flex min-h-[58px] items-center justify-center gap-3 rounded-[8px] border border-white/10 bg-white/[0.08] px-3 py-3 text-xs xl:text-sm font-medium text-white sm:justify-start"
                  >
                    <span className="flex h-6 w-6  xl:h-10 xl:w-10 shrink-0 items-center justify-center rounded-full bg-[var(--customer-gold)] text-[var(--customer-navy)]">
                      <Icon size={18} strokeWidth={2.4} />
                    </span>
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 sm:mt-12 flex w-full  items-center justify-center gap-2 xl:gap-4 flex-row lg:justify-start">
                {footerData.appDownload.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    aria-label={link.label}
                    className="flex h-[58px] w-[205px] items-center justify-center rounded-[8px] border border-white/20 bg-black px-4 shadow-lg"
                  >
                    <img
                      src={link.image}
                      alt={link.alt}
                      className="max-h-11 w-full object-contain"
                    />
                  </a>
                ))}
              </div>
            </div>

            <div className="relative z-10  flex items-end justify-center self-end lg:h-full lg:justify-end">
              <img
                src="/image/png/downloadApp.png"
                alt="Sam Global mobile app preview"
                className="w-full max-w-[330px] object-contain  sm:max-w-[430px] lg:max-w-[520px] xl:max-w-[570px]"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
