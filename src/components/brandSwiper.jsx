import { brandSwiperData } from "../data/aboutSection";

export default function BrandSwiper({}) {
  const { sectionDetails, logos } = brandSwiperData;
  const duplicatedLogos = [...logos, ...logos];

  return (
    <section className="overflow-hidden py-10">
      <div className="font-montserrat  flex flex-col items-center gap-2 text-center">
        <h2 className="font-bold custom-h5">{sectionDetails.heading}</h2>
        <p className="custom-h6 ">{sectionDetails.description}</p>
      </div>
      <div className="brand-auto-carousel my-10 lg:my-16 flex w-max items-center gap-10 md:gap-20">
        {duplicatedLogos.map((item, index) => (
          <div key={index} className="flex-shrink-0">
            <img
              src={item.image}
              alt={item.name}
              className="h-8 md:h-12 lg:h-18 w-full object-contain"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
