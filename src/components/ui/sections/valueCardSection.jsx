import ValuesCard from "../../cards/valueCard";

export default function ValueCardSection({ data }) {
  const { sectionDetails, cards } = data;
  return (
    <section>
      <div className="w-full flex flex-col items-center gap-4 ">
        <h2 className="font-montserrat text-2xl font-semibold py-2">
          {sectionDetails?.heading}
        </h2>
      </div>
      <div className="flex justify-center gap-8 my-8 flex-wrap">
        <ValuesCard data={cards} />
      </div>
    </section>
  );
}
