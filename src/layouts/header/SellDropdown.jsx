import { useNavigate } from "react-router-dom";

import { HeaderGoldButton } from "../../components/dynamicComponent/button/static";
import BrandButton from "../../components/ui/BrandButton";
import { asArray, hrefOr, keyOr, textOr } from "../../utils/content";

export default function SellDropdown({ data }) {
  const navigate = useNavigate();
  const features = asArray(data?.features);
  const buttons = asArray(data?.buttons);

  return (
    <div className="w-[340px] overflow-hidden rounded-[var(--customer-radius)] border border-[var(--customer-border)] bg-white shadow-[var(--customer-shadow-strong)]">
      <div className="p-6">
        <h2 className="text-[22px] font-bold leading-tight text-[var(--customer-navy)]">
          {textOr(data?.title, "Sell with us")}
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-[var(--customer-muted)]">
          {textOr(data?.description)}
        </p>

        <div className="mt-6 flex flex-col gap-4">
          {features.map((feature, index) => (
            <div key={keyOr(feature?.text, `feature-${index}`)} className="flex items-start gap-4">
              <div className="mt-0.5 text-[var(--customer-gold-dark)]">{feature.icon}</div>
              <p className="text-[13px] font-semibold leading-tight text-[var(--customer-ink)]">
                {feature.text}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3">
          {buttons.map((button, index) => (
            <HeaderGoldButton
              key={keyOr(button?.label, `button-${index}`)}
              className="w-full max-w-none text-[13px] font-bold"
              onClick={() => navigate(hrefOr(button?.path, "/seller/status"))}
            >
              {textOr(button?.label, "Action")}
            </HeaderGoldButton>
          ))}
        </div>
      </div>
    </div>
  );
}
