export default function AboutBanner({ image }) {
  return (
    <section className="relative left-1/2 right-1/2 w-screen -ml-[50vw] -mr-[50vw] overflow-hidden">
      <div className="relative h-[250px] sm:h-[350px] md:h-[450px] lg:h-[550px] xl:h-[650px] w-full">
        <img
          src={image.url}
          alt="About Sam-Global"
          className="h-full w-full object-cover"
        />
      </div>
    </section>
  );
}