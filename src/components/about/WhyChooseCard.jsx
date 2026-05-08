export default function WhyChooseCard({ data }) {
  return (
    <article className="group">
      <div className="bg-white relative rounded-xl group-hover:bg-primary transition-colors shadow-md md:shadow-lg max-w-lg gap-8 p-4 lg:p-5">
        <div className="bg-blue w-[6rem] h-[5px] rounded-full absolute top-0 left-20" />
        <div className="flex flex-row gap-4 ">
          <div>
            <img
              src={data.icon}
              alt={data.title}
              className="aspect-square object-contain bg-primary rounded-lg group-hover:bg-blue transition-colors p-1 md:p-2"
            />
          </div>
          <div>
            <h4 className="font-montserrat text-blue font-semibold  text-md lg:text-lg group-hover:text-white transition-colors">
              {data.title}
            </h4>
            <p className=" font-montserrat text-sm lg:text-base max-w-sm py-2 group-hover:text-white transition-colors">
              {data.description}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
