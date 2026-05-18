import { roadAheadData } from "../../data/infoSectionData.js";
import NeedHelpSection from "../faq/NeedHelpSection.jsx";

const InfoSection = ({ data }) => {
  const finalData = data || roadAheadData[0];

  const {
    title,
    description,
    image,
    logo,
    brandText = "",
    helpSection,
  } = finalData;

  

  return (
    <section className="relative my-8 lg:my-16">
      {/* Golden Top Card */}
      {helpSection && (
        <div className="relative z-20 mx-auto mb-[-60px] max-w-[1400px] px-4">
          <NeedHelpSection
            heading1={helpSection.heading1}
            heading2={helpSection.heading2}
            description={helpSection.description}
            buttonText={helpSection.buttonText}
            isFullWidth={false}
            layout="row"
          />
        </div>
      )}

      {/* Main Blue Section */}
      <section className="w-full overflow-hidden rounded-[20px] bg-[linear-gradient(270deg,#3E4094_5.77%,#1B1D60_100%)] pt-[100px] pb-10 lg:pb-0">
        <div className="mx-auto flex max-w-[1648px] flex-col items-center gap-6 lg:flex-row lg:items-stretch lg:px-20">
          {/* Left Content */}
          <div className="flex w-full flex-col items-start px-4 text-left sm:px-10 lg:w-[60%] lg:px-0 lg:py-12">
            <div className="flex w-full flex-col gap-6">
              <h2 className="font-montserrat text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                {title}
              </h2>

              <div className="flex flex-col gap-5">
                <p
                  className="font-montserrat text-base font-light leading-8 text-white/90 sm:text-lg"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="mt-8 flex w-full items-end justify-center lg:mt-0 lg:w-[40%] lg:justify-end">
            <div className="relative w-full max-w-[340px] overflow-hidden rounded-t-[1.8rem] sm:max-w-[450px] lg:max-w-[700px]">
              <img
                src={image}
                alt={title}
                className="block h-auto w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </section>
  );
};

export default InfoSection;
