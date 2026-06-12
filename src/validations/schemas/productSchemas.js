import { z } from "zod";
import {
  moneyField,
  optionalMoneyField,
  optionalSafeTextField,
  quantityField,
  requiredString,
  safeTextField,
  skuField,
} from "../common/commonValidations";

export const productSearchSchema = z
  .object({
    q: optionalSafeTextField(100),
    category: optionalSafeTextField(80),
    brand: optionalSafeTextField(80),
    minPrice: optionalMoneyField("Minimum price", { min: 0 }),
    maxPrice: optionalMoneyField("Maximum price", { min: 0 }),
    sortBy: z.enum(["relevance", "newest", "price_low", "price_high", "rating"]).optional(),
  })
  .refine((values) => !values.minPrice || !values.maxPrice || values.maxPrice >= values.minPrice, {
    message: "Maximum price must be greater than minimum price",
    path: ["maxPrice"],
  });

export const productReviewSchema = z.object({
  productId: requiredString("Product"),
  rating: z.coerce
    .number({ invalid_type_error: "Select a rating" })
    .int("Rating must be a whole number")
    .min(1, "Select a rating")
    .max(5, "Rating cannot be greater than 5"),
  title: optionalSafeTextField(80),
  comment: safeTextField("Review", { min: 10, max: 1000 }),
});

export const productVariantSchema = z.object({
  sku: skuField,
  title: safeTextField("Variant title", { min: 2, max: 80 }),
  price: moneyField("Price", { min: 0 }),
  stock: quantityField("Stock", { min: 0, max: 999999 }),
});

export const returnSchema = z.object({
  productId: requiredString("Product"),
  quantity: quantityField("Quantity", { min: 1, max: 99 }),
  reason: z.enum(["defective", "not_as_described", "changed_mind", "other"], {
    required_error: "Select a return reason",
  }),
  description: safeTextField("Description", { min: 10, max: 1000 }),
});
