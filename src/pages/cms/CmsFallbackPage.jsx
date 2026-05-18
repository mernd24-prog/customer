import { useMemo } from "react";
import CmsPage from "./CmsPage";
import PolicyPage from "../customer/PolicyPage";
import { termsOfUseData } from "../../data/termsOfUseData";
import { shippingPolicyData } from "../../data/shippingPolicyData";
import { refundPolicyData } from "../../data/refundPolicyData";

const FALLBACK_BY_TYPE = {
  terms: termsOfUseData,
  shipping: shippingPolicyData,
  refund: refundPolicyData,
};

export default function CmsFallbackPage({ fallbackType }) {
  const fallback = useMemo(() => FALLBACK_BY_TYPE[fallbackType], [fallbackType]);
  try {
    return <CmsPage />;
  } catch {
    return fallback ? <PolicyPage data={fallback} /> : null;
  }
}
