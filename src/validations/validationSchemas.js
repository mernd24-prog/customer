import { z } from "zod";

/* -------------------------------------------------------------------------- */
/*                               COMMON FIELDS                                */
/* -------------------------------------------------------------------------- */

const textField = z.string().trim();

const emailField = textField
  .toLowerCase()
  .email("Please enter a valid email address");

const passwordField = textField
  .min(8, "Password must be at least 8 characters");

const strongPasswordField = passwordField
  .regex(/[A-Z]/, "Must contain one uppercase letter")
  .regex(/[a-z]/, "Must contain one lowercase letter")
  .regex(/[0-9]/, "Must contain one number")
  .regex(/[^A-Za-z0-9]/, "Must contain one special character");

const otpField = textField
  .regex(/^\d{6}$/, "Enter the 6-digit OTP");

const phoneField = textField
  .regex(/^\+?[0-9\s-]{10,15}$/, "Enter a valid phone number");

const optionalString = textField.optional();

const requiredString = (field) =>
  textField.min(1, `${field} is required`);

/* -------------------------------------------------------------------------- */
/*                                AUTH SCHEMAS                                */
/* -------------------------------------------------------------------------- */

export const loginSchema = z.object({
  email: emailField,
  password: passwordField,
});

export const emailSchema = z.object({
  email: emailField,
});

export const otpSchema = z.object({
  email: emailField,
  otp: otpField,
});

export const resetSchema = z.object({
  email: emailField,
  otp: otpField,
  newPassword: strongPasswordField,
});

export const registerSchema = z.object({
  firstName: requiredString("First name"),
  lastName: requiredString("Last name"),
  email: emailField,
  phone: phoneField,
  password: strongPasswordField,
  referralCode: optionalString,
});

export const verifyOtpSchema = z.object({
  email: emailField,
  otp: otpField,
});

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export const registerOtpSchema = z.object({
  firstName: requiredString("First name"),
  lastName: requiredString("Last name"),
  email: emailField,
  phone: phoneField,
  password: strongPasswordField,
  confirmPassword: strongPasswordField,
  referralCode: optionalString,
}).refine((v) => v.password === v.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const resetPasswordSchema = z
  .object({
    email: emailField,
    otp: otpField,
    newPassword: strongPasswordField,
    confirmPassword: strongPasswordField,
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/* -------------------------------------------------------------------------- */
/*                             CHECKOUT SCHEMA                                */
/* -------------------------------------------------------------------------- */

export const addressSchema = z.object({
  fullName: textField
    .min(2, "Full name is required"),

  phone: phoneField,

  line1: textField
    .min(3, "Address line 1 is required"),

  line2: optionalString,

  city: requiredString("City"),

  state: requiredString("State"),

  postalCode: textField
    .min(4, "Postal code is required"),

  country: requiredString("Country"),

  couponCode: optionalString,

  walletAmount: z.coerce
    .number()
    .min(0)
    .optional(),
});

/* -------------------------------------------------------------------------- */
/*                               RETURN SCHEMA                                */
/* -------------------------------------------------------------------------- */

export const returnSchema = z.object({
  productId: requiredString("Product"),

  quantity: z.coerce
    .number()
    .int()
    .min(1, "Quantity must be at least 1"),

  unitPrice: z.coerce
    .number()
    .min(0, "Unit price is required"),

  reason: z.enum([
    "defective",
    "not_as_described",
    "changed_mind",
    "other",
  ]),

  description: textField
    .min(
      10,
      "Please provide at least 10 characters describing the issue"
    ),
});

/* -------------------------------------------------------------------------- */
/*                          ACCOUNT SETTINGS SCHEMAS                          */
/* -------------------------------------------------------------------------- */

export const profileSchema = z.object({
  firstName: requiredString("First name"),

  lastName: requiredString("Last name"),

  avatarUrl: textField
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),
});

export const securitySchema = z
  .object({
    currentPassword: passwordField,

    newPassword: passwordField,

    confirmPassword: passwordField,
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/* -------------------------------------------------------------------------- */
/*                                 KYC SCHEMA                                 */
/* -------------------------------------------------------------------------- */

export const kycSchema = z.object({
  legalName: textField
    .min(2, "Legal name is required"),

  panNumber: textField
    .regex(
      /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
      "Enter a valid PAN (e.g. ABCDE1234F)"
    ),

  aadhaarNumber: textField
    .regex(
      /^\d{12}$/,
      "Aadhaar must be 12 digits"
    ),
});
