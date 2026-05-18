export default function FAQHeroSection({
  title = "Frequently Asked Questions",
  eyebrow = "",
  description = "",
}) {
  return (
    <section className="bg-[linear-gradient(270deg,_#3E4094_5.77%,_#1B1D60_100%)] py-10 text-center text-white">
    
      <h1 className="text-3xl font-bold">
        {title}
      </h1>
      {description && (
        <p className="mx-auto mt-3 max-w-2xl px-4 font-montserrat text-base text-white/85">
          {description}
        </p>
      )}
    </section>
  );
}