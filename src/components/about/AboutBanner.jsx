export default function AboutBanner({ image }) {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative h-[250px] sm:h-[350px] md:h-[450px] lg:h-[550px] xl:h-[650px] w-full">
        {/* Background Image */}
        <img
          src={image}
          alt="About Sam-Global"
          className="h-full w-full object-cover"
        />
      </div>
    </section>
  );
}
