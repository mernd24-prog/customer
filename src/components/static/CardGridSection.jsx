import SectionContainer from "../ui/SectionContainer";

export default function CardGridSection({
  title,
  subtitle,
  children,
  className = "grid gap-6 sm:grid-cols-2",
}) {
  return (
    <SectionContainer
      title={title}
      subtitle={subtitle}
      headerbgColor="bg-white"
      bodybgColor="bg-slate-50"
    >
      <div className={className}>{children}</div>
    </SectionContainer>
  );
}
