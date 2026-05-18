import Button from "../ui/Button";

export default function NeedHelpSection({
  heading1,
  heading2,
  description,
  buttonText,
  isFullWidth = true,
  layout = "col",
}) {
  return (
    <section
      className={`${
        isFullWidth
          ? "relative left-1/2 right-1/2 w-[100vw] -ml-[50vw] -mr-[50vw] -mb-[56px] rounded-t-[20px]"
          : "w-full rounded-[24px]"
      } flex ${
        layout === "row" ? "flex-col md:flex-row md:justify-between" : "flex-col justify-center"
      } items-center bg-[linear-gradient(270deg,_#A26D27_5.77%,_#CE9F2D_100%)] px-4 py-10 sm:px-6 md:px-12 md:py-12`}
    >
      <div className={`${layout === "row" ? "text-left max-w-[800px]" : "text-center max-w-[660px]"}`}>
        <h2 className="font-montserrat uppercase leading-tight text-white sm:leading-[50px] lg:leading-[60px]">
          <span className="block text-[24px] font-bold sm:inline sm:text-[30px] md:text-[34px] lg:text-[38px]">
            {heading1}
          </span>{" "}
          {heading2 && (
            <span className="block text-[22px] font-medium sm:inline sm:text-[26px] md:text-[30px] lg:text-[32px]">
              {heading2}
            </span>
          )}
        </h2>

        <p className="mt-3 font-montserrat text-[14px] font-normal leading-6 text-white sm:text-[16px] sm:leading-7 md:text-[18px] md:leading-[32px]">
          {description}
        </p>
      </div>

      <Button
        label={buttonText}
        className={`mt-6 shrink-0 rounded-full px-8 py-3 text-[16px] font-semibold sm:text-[18px] md:text-[20px] transition-colors ${
          layout === "row"
            ? "!bg-[#3E4094] !border-none !text-white hover:!bg-[#1B1D60] md:mt-0 md:ml-6"
            : "!bg-white !text-[#4E4E4E] border border-[#666666] hover:!bg-[#F5F5F5] min-h-[52px] sm:min-h-[60px] md:min-h-[68px] w-[180px] sm:w-[200px] md:w-[213px]"
        }`}
      />
    </section>
  );
}
