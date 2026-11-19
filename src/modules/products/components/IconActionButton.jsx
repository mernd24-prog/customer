import { DynamicButton } from "../../../components/ui/button";
export default function IconActionButton({
  title,
  onClick,
  children,
  className = "",
}) {
  return (
    <DynamicButton
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-full border border-blue/60 bg-[#F5F8FB] p-0 transition-[color,background-color,border-color,box-shadow] duration-300 ease-in-out hover:bg-[#EAF0F8] hover:shadow-sm sm:h-10 sm:w-10 ${className}`}
      title={title}
      aria-label={title}
    >
      {children}
    </DynamicButton>
  );
}