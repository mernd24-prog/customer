import { z } from "zod";
import {
  aadhaarField,
  emailField,
  nameField,
  optionalUrlField,
  otpField,
  panField,
  passwordField,
  phoneField,
  referralCodeField,
  requiredString,
  strongPasswordField,
  withMatchingFields,
} from "../common/commonValidations";

export const loginSchema = z.object({
  email: emailField,
  password: requiredString("Password", { max: 72 }),
});

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export const verifyOtpSchema = z.object({
  email: emailField,
  otp: otpField,
});

export const otpSchema = verifyOtpSchema;
export const emailSchema = forgotPasswordSchema;

export const registerSchema = z.object({
  firstName: nameField("First name"),
  lastName: nameField("Last name"),
  email: emailField,
  phone: phoneField,
  password: strongPasswordField,
  referralCode: referralCodeField,
});

export const registerOtpSchema = withMatchingFields(
  registerSchema.extend({
    confirmPassword: strongPasswordField,
  }),
  "password",
  "confirmPassword",
);

export const buyerRegisterSchema = registerOtpSchema;

export const resetPasswordSchema = withMatchingFields(
  z.object({
    email: emailField,
    otp: otpField,
    newPassword: strongPasswordField,
    confirmPassword: strongPasswordField,
  }),
  "newPassword",
  "confirmPassword",
);

export const resetSchema = z.object({
  email: emailField,
  otp: otpField,
  newPassword: strongPasswordField,
});

export const profileSchema = z.object({
  firstName: nameField("First name"),
  lastName: nameField("Last name"),
  avatarUrl: optionalUrlField,
});

export const securitySchema = withMatchingFields(
  z.object({
    currentPassword: passwordField,
    newPassword: strongPasswordField,
    confirmPassword: strongPasswordField,
  }),
  "newPassword",
  "confirmPassword",
);

export const kycSchema = z.object({
  legalName: nameField("Legal name", { max: 100 }),
  panNumber: panField,
  aadhaarNumber: aadhaarField,
});
