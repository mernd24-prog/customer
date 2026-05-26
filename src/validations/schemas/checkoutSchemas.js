import { z } from "zod";
import {
  addressLineField,
  couponCodeField,
  locationField,
  nameField,
  optionalMoneyField,
  optionalSafeTextField,
  phoneField,
  postalCodeField,
  quantityField,
  requiredString,
} from "../common/commonValidations";

export const addressSchema = z.object({
  label: optionalSafeTextField(40),
  fullName: nameField("Full name", { max: 80 }),
  phone: phoneField,
  line1: addressLineField("Address line 1"),
  line2: optionalSafeTextField(120),
  city: locationField("City"),
  state: locationField("State"),
  postalCode: postalCodeField,
  country: locationField("Country"),
  isDefault: z.coerce.boolean().optional(),
  couponCode: couponCodeField,
  walletAmount: optionalMoneyField("Wallet amount", { min: 0 }),
});

export const checkoutAddressSchema = addressSchema.omit({
  label: true,
  isDefault: true,
});

export const checkoutPaymentSchema = z.object({
  paymentMethod: z.enum(["card", "upi", "wallet", "cod"], {
    required_error: "Select a payment method",
  }),
  couponCode: couponCodeField,
  walletAmount: optionalMoneyField("Wallet amount", { min: 0 }),
});

export const cartItemSchema = z.object({
  productId: requiredString("Product"),
  variantId: optionalSafeTextField(80),
  quantity: quantityField("Quantity", { min: 1, max: 99 }),
});
