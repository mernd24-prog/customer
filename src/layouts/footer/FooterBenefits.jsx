export default function FooterBenefits({ items = [] }) {
  if (!items.length) return null;

  return (
    <section className="">
      <div className="flex flex-col  lg:flex-row justify-between py-3">
        {items.map((item, index) => (
          <div
            key={item?.title || `benefit-${index}`}
            className="flex items-center gap-4 rounded-[var(--customer-radius)] px-4 py-3"
          >
            <img
              className="h-10 w-10 shrink-0 object-contain sm:h-12 sm:w-12 2xl:h-16 2xl:w-16"
              src={item?.icon}
              alt={item?.alt || item?.title || "Benefit"}
            />
            <div>
              <h2 className="mb-0 text-lg xl:text-2xl  font-bold text-[#1B1D60]">
                {item?.title}
              </h2>
              <p className="text-sm xl:text-lg font-light text-[#2E2E2E]">
                {item?.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
