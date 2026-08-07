import { z } from "zod";
import {
  quantityField,
  requiredString,
  safeTextField
} from "../common/commonValidations";
export const returnSchema = z.object({
  productId: requiredString("Product"),
  orderItemId: requiredString("Order item"),
  resolution: z.enum(["refund", "replacement"]),
  quantity: quantityField("Quantity", { min: 1, max: 99 }),
  reason: z.enum(
    [
      "defective",
      "damaged_in_transit",
      "wrong_item",
      "missing_parts",
      "size_issue",
      "quality_issue",
      "not_as_described",
      "changed_mind",
      "other",
    ],
    {
      required_error: "Select a return reason",
    },
  ),
  description: safeTextField("Description", { min: 10, max: 1000 }),
});
