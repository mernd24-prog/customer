import ShowcaseSection from "../ui/sections/ShowcaseSection";

export default function HomeShowcaseSections({ sections = [], loading = false }) {
    return (
        <>
            {sections.map((section) => (
                <ShowcaseSection key={section.id} loading={loading} {...section} />
            ))}
        </>
    );
}
