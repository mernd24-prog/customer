export default function ValueCard({ data, icon, title, description }) {
  const card = data || { icon, title, description };

  return (
    <article className="w-full md:w-[26rem] xl:w-[30rem]">
      <div className="bg-band flex w-full flex-col items-center justify-center gap-4 rounded-t-xl p-4 text-center md:p-8 xl:p-10">
        <img
          src={card.image}
          alt={card.title}
          className="h-14 w-14 object-contain md:h-18 md:w-18"
        />

        <h3 className="font-montserrat py-2 text-lg md:text-2xl font-semibold">
          {card.title}
        </h3>

        <p className="font-montserrat pb-2 md:pb-0">{card.description}</p>
      </div>

      <div className="relative z-40 mx-auto -mt-1 h-[8px] max-w-60 rounded-full bg-gradient-to-l from-accent to-primary" />
    </article>
  );
}
