import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain one uppercase letter")
  .regex(/[a-z]/, "Must contain one lowercase letter")
  .regex(/[0-9]/, "Must contain one number")
  .regex(/[^A-Za-z0-9]/, "Must contain one special character");

export const buyerRegisterSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    email: z.string().trim().email("Enter a valid email address"),
    phone: z.string().trim().regex(/^\+?[0-9\s-]{10,15}$/, "Enter a valid phone number"),
    password: passwordSchema,
    confirmPassword: passwordSchema,
    referralCode: z.string().trim().optional()
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });
