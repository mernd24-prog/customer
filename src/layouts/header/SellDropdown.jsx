import { useNavigate } from "react-router-dom";

import BrandButton from "../../components/ui/BrandButton";
import DropdownContainer from "./DropdownContainer";
import { asArray, hrefOr, keyOr, textOr } from "../../utils/content";

export default function SellDropdown({ data }) {
  const navigate = useNavigate();
  const features = asArray(data?.features);
  const buttons = asArray(data?.buttons);

  return (
    <DropdownContainer width="w-[340px]">
      <div className="p-6">
        <h2 className="text-[25px] font-bold leading-tight text-black">
          {textOr(data?.title, "Sell with us")}
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-black">
          {textOr(data?.description)}
        </p>

        <div className="mt-7 flex flex-col gap-5">
          {features.map((feature, index) => (
            <div key={keyOr(feature?.text, `feature-${index}`)} className="flex items-start gap-4">
              <div className="mt-0.5 text-black">{feature.icon}</div>
              <p className="text-[14px] font-medium leading-tight text-black">
                {feature.text}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3">
          {buttons.map((button, index) => (
            <BrandButton
              key={keyOr(button?.label, `button-${index}`)}
              variant="gradient"
              rounded 
              label={textOr(button?.label, "Action")}
              className="w-full py-2.5 text-[13px] font-bold"
              onClick={() => navigate(hrefOr(button?.path, "/seller/status"))}
            />
          ))}
        </div>
      </div>
    </DropdownContainer>
  );
}
