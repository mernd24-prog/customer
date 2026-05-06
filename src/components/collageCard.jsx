const collageSections = [
  {
    title: "Best Sellers in Men's Fashion",
    images: [
      "/image/png/men-fashion.png",
      "/image/png/stylish-pair.png",
      "/image/png/gold-watch-with-rhinestones%201.png",
      "/image/png/blazer.png",
    ],
  },
  {
    title: "Up to 60% Off | Home & Lifestyle",
    images: [
      "/image/jpg/home-decor.jpg",
      "/image/png/stylish-pair.png",
      "/image/jpg/smart-home.jpg",
      "/image/png/men-fashion.png",
    ],
  },
  {
    title: "Trending in Women's Fashion",
    images: [
      "/image/jpg/home-decor.jpg",
      "/image/png/stylish-pair.png",
      "/image/jpg/smart-home.jpg",
      "/image/png/men-fashion.png",
    ],
  },
  {
    title: "Top Picks in Kids Fashion",
    images: [
      "/image/jpg/smart-home.jpg",
      "/image/png/gold-watch-with-rhinestones%201.png",
      "/image/png/stylish-pair.png",
      "/image/jpg/smart-home.jpg",
    ],
  },
];

function CollageImage({ src, title }) {
  return (
    <div
      className={`w-full h-28 md:w-full  lg:h-36 overflow-hidden rounded-lg bg-[#ece8df] `}
    >
      <img
        src={src}
        alt={title}
        className="h-full w-full object-top  object-cover transition-transform hover:scale-105"
        loading="lazy"
      />
    </div>
  );
}

function CollageCard({ section }) {
  return (
    <article className="rounded-2xl  bg-[#f7f7f9] p-4 sm:p-[18px]">
      <h2 className="mb-4 font-montserrat text-lg font-medium  text-[#262626] md:text-xl">
        {section.title}
      </h2>

      <div className="grid gap-2 md:gap-4 xs:grid-cols-2">
        {section.images.map((image) => (
          <CollageImage src={image} title={section.title} />
        ))}
      </div>
    </article>
  );
}

export default function Collage() {
  return (
    <section className="w-container  my-6 overflow-hidden lg:my-10">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {collageSections.map((section) => (
          <CollageCard key={section.title} section={section} />
        ))}
      </div>
    </section>
  );
}
