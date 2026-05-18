import Button from "../ui/BrandButton";

export default function NeedHelpSection({
  heading1,
  heading2,
  description,
  buttonText,
}) {
  return (
    <section className="flex w-full flex-col items-center justify-center rounded-tl-[20px] rounded-tr-[20px] rounded-br-[3px] bg-[linear-gradient(270deg,_#A26D27_5.77%,_#CE9F2D_100%)] px-4 py-10 sm:px-6 md:py-12 lg:h-[274px]">
      <h2 className="text-center font-montserrat uppercase leading-tight text-white sm:leading-[50px] lg:leading-[60px]">
        <span className="block text-[24px] font-bold sm:inline sm:text-[30px] md:text-[34px] lg:text-[38px]">
          {heading1}
        </span>{" "}
        <span className="block text-[22px] font-medium sm:inline sm:text-[26px] md:text-[30px] lg:text-[32px]">
          {heading2}
        </span>
      </h2>

      <p className="mt-3 max-w-[660px] text-center font-montserrat text-[14px] font-normal leading-6 text-white sm:text-[16px] sm:leading-7 md:text-[18px] md:leading-[32px]">
        {description}
      </p>

      <Button
        label={buttonText}
        variant="custom"
        rounded
        bgColor="#FFFFFF"
        textColor="#4E4E4E"
        borderColor="#666666"
        hoverBgColor="#F5F5F5"
        className="mt-6 h-[52px] w-[180px] text-[16px] font-semibold leading-[28px] sm:h-[60px] sm:w-[200px] sm:text-[18px] md:h-[68px] md:w-[213px] md:text-[20px] md:leading-[34px]"
      />
    </section>
  );
}
