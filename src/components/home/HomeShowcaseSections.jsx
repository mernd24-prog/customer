import ShowcaseSection from "./ShowcaseSection";

export default function HomeShowcaseSections({
  sections = [],
  loading = false,
}) {
  return (
    <div>
      {sections.map((section) => (
        <div key={section.id} className="my-8 lg:my-12">
          <ShowcaseSection loading={loading} {...section} />
        </div>
      ))}
    </div>
  );
}
