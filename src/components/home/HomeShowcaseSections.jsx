import ShowcaseSection from "../ui/sections/ShowcaseSection";

export default function HomeShowcaseSections({
  sections = [],
  loading = false,
}) {
  return (
    <div>
      {sections.map((section) => (
        <div className="my-8 lg:my-12">
          <ShowcaseSection key={section.id} loading={loading} {...section} />
        </div>
      ))}
    </div>
  );
}
