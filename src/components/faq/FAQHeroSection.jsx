export default function FAQHeroSection({
  title = "",
}) {
  return (
    <section className="relative left-1/2 right-1/2 w-[100vw] -ml-[50vw] -mr-[50vw] bg-gradient-to-r from-navy to-navy-dark py-20 text-center text-white">
      <h1 className="text-3xl font-bold">
        {title}
      </h1>
    </section>
  );
}
