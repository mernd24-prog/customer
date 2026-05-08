export default function AboutBanner() {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative h-[250px] sm:h-[350px] md:h-[450px] lg:h-[550px] xl:h-[650px] w-full">
        {/* Background Image */}
        <img
          src="/image/png/aboutBanner.png"
          alt="About Sam-Global"
          className="h-full w-full object-cover"
        />

        {/* Color Overlays for Depth */}
        <div className="absolute inset-0 bg-[#9E886A] opacity-70"></div>
      </div>
    </section>
  );
}
