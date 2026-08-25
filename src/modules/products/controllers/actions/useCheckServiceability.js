import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkServiceability } from "../../../../features/delivery/deliverySlice";
import { notify } from "../../../../utils/notify";

export function useCheckServiceability() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.current);
  const customer = useSelector((state) => state.user.current);

  return useCallback(async (product) => {
    const addresses = customer?.addresses || user?.addresses || [];
    const address = addresses.find((item) => item?.isDefault || item?.is_default) || addresses[0];
    const pincode = String(
      address?.postalCode || address?.postal_code || address?.pincode || address?.zip || "",
    ).trim();
    const productId = product?._id || product?.id || product?.productId?._id || product?.productId;
    if (!/^\d{6}$/.test(pincode) || !productId) return true;

    try {
      const payload = await dispatch(checkServiceability({ pincode, productId })).unwrap();
      const result = payload?.data || payload;
      if (result?.serviceable !== false) return true;
      notify.error({
        title: "Not deliverable to your address",
        message: `This product cannot be delivered to pincode ${pincode}. Choose another address or product.`,
      });
      return false;
    } catch (error) {
      notify.error({
        title: "Delivery check unavailable",
        message: typeof error === "string" ? error : "Please try adding this product again.",
      });
      return false;
    }
  }, [customer?.addresses, dispatch, user?.addresses]);
}
