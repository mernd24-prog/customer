export default function ValuesCard({ data }) {
  return (
    <>
      {data?.map((ele, index) => (
        <section key={index} className="w-full md:w-[26rem]  xl:w-[30rem]">
          <div className="bg-band flex w-full flex-col items-center justify-center gap-4 rounded-t-xl p-4 text-center md:p-8 xl:p-10">
            <img
              src={ele.image}
              alt={ele.title}
              className="h-14 w-14 object-contain md:h-18 md:w-18"
            />

            <h2 className="font-montserrat py-2 text-lg md:text-2xl font-semibold">
              {ele.title}
            </h2>

            <p className="font-montserrat">{ele.description}</p>
          </div>

          <div className="relative z-40 mx-auto -mt-1 h-[8px] max-w-60 rounded-full bg-gradient-to-l from-accent to-primary"></div>
        </section>
      ))}
    </>
  );
}
