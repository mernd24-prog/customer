import { useNavigate } from "react-router-dom";

import BrandButton from "../../ui/BrandButton";
import DropdownContainer from "./DropdownContainer";

export default function SellDropdown({ data }) {
  const navigate = useNavigate();

  return (
    <DropdownContainer width="w-[340px]">
      <div className="p-6">
        <h2 className="text-[25px] font-bold leading-tight text-black">
          {data.title}
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-black">
          {data.description}
        </p>

        <div className="mt-7 flex flex-col gap-5">
          {data.features.map((feature) => (
            <div key={feature.text} className="flex items-start gap-4">
              <div className="mt-0.5 text-black">{feature.icon}</div>
              <p className="text-[14px] font-medium leading-tight text-black">
                {feature.text}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3">
          {data.buttons.map((button) => (
            <BrandButton
              key={button.label}
              variant="gradient"
              rounded
              label={button.label}
              className="w-full py-2.5 text-[13px] font-bold"
              onClick={() => navigate(button.path)}
            />
          ))}
        </div>
      </div>
    </DropdownContainer>
  );
}
