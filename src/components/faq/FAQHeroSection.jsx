export default function FAQHeroSection({
  title = "",
  eyebrow = "",
  description = "",
}) {
  return (
    <section className="relative left-1/2 right-1/2 w-[100vw] -ml-[50vw] -mr-[50vw] bg-[linear-gradient(270deg,_#3E4094_5.77%,_#1B1D60_100%)] py-20 text-center text-white">
      <h1 className="text-3xl font-bold">
        {title}
      </h1>
    </section>
  );
}