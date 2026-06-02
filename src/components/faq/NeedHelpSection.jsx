import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";

export default function NeedHelpSection({
  heading1,
  heading2,
  description,
  buttonText,
  buttonPath = "",
  isFullWidth = true,
  layout = "col",
}) {
  const navigate = useNavigate();
  return (
    <section
      className={`${
        isFullWidth
          ? "relative left-1/2 right-1/2 w-[100vw] -ml-[50vw] -mr-[50vw] -mb-[56px] rounded-t-[8px]"
          : "w-full rounded-[var(--customer-radius)]"
      } flex ${
        layout === "row"
          ? "flex-col md:flex-row md:justify-between"
          : "flex-col justify-center"
      } min-h-[200px] items-center bg-gradient-to-r from-gold-dark to-gold px-4 py-10 sm:px-6 md:px-12`}
    >
      <div
        className={`${layout === "row" ? "text-left max-w-[800px]" : "text-center max-w-[660px]"}`}
      >
        <h2 className=" uppercase leading-tight text-white">
          <span className="block text-[22px] font-bold sm:inline md:text-[26px]">
            {heading1}
          </span>{" "}
          {heading2 && (
            <span className="block text-[20px] font-medium sm:inline md:text-[24px]">
              {heading2}
            </span>
          )}
        </h2>

        <p className="mt-2  text-[26px] font-normal leading-6 text-white/90 sm:text-[16px]">
          {description}
        </p>
      </div>

      <Button
        label={buttonText}
        className={`mt-6 shrink-0 rounded-full px-8 py-3 text-[16px] font-semibold sm:text-[18px] md:text-[20px] transition-all duration-300 ease-in-out ${
          layout === "row"
            ? "!bg-navy !border-none !text-white hover:!bg-navy-dark md:mt-0 md:ml-6"
            : "!mt-4 !min-h-[34px] w-auto min-w-[124px] border border-border-strong !bg-white !px-6 !py-2 !text-[13px] !font-medium !text-ink hover:!bg-cream"
        }`}
        onClick={() => navigate(buttonPath)}
      />
    </section>
  );
}
