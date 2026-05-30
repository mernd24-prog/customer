import { z } from "zod";
import {
  addressLineField,
  couponCodeField,
  locationField,
  nameField,
  optionalAddressLineField,
  optionalMoneyField,
  optionalString,
  optionalSafeTextField,
  phoneField,
  postalCodeField,
  quantityField,
  requiredString,
  validatePostalCodeForCountry,
} from "../common/commonValidations";

export const addressBaseSchema = z.object({
  label: z.enum(["home", "work", "other"]).optional(),
  fullName: nameField("Full name", { max: 80 }),
  dialCode: optionalString(10),
  phone: phoneField,
  line1: addressLineField("Address line 1"),
  line2: optionalAddressLineField(120),
  city: locationField("City"),
  state: locationField("State"),
  postalCode: postalCodeField,
  country: locationField("Country"),
  isDefault: z.coerce.boolean().optional(),
  couponCode: couponCodeField,
  walletAmount: optionalMoneyField("Wallet amount", { min: 0 }),
});

const validateCountryPostalCode = (values, ctx) => {
  const result = validatePostalCodeForCountry(values.postalCode, values.country);
  if (result.valid) return;

  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    message: result.message,
    path: ["postalCode"],
  });
};

export const addressSchema = addressBaseSchema.superRefine(validateCountryPostalCode);

export const checkoutAddressBaseSchema = addressBaseSchema.omit({
  label: true,
  isDefault: true,
});

export const checkoutAddressSchema = checkoutAddressBaseSchema.superRefine(validateCountryPostalCode);

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
