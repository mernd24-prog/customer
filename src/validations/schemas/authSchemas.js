import { z } from "zod";
import {
  aadhaarField,
  confirmPasswordField,
  emailField,
  firstNameField,
  lastNameField,
  loginPasswordField,
  nameField,
  optionalUrlField,
  otpField,
  panField,
  passwordField,
  phoneField,
  referralCodeField,
  strongPasswordField,
  withMatchingFields,
} from "../common/commonValidations";

export const loginSchema = z.object({
  email: emailField,
  password: loginPasswordField,
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
  firstName: firstNameField(),
  lastName: lastNameField(),
  email: emailField,
  phone: phoneField,
  password: strongPasswordField,
  referralCode: referralCodeField,
});

export const registerOtpSchema = withMatchingFields(
  registerSchema.extend({
    confirmPassword: confirmPasswordField,
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
    confirmPassword: confirmPasswordField,
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
  firstName: firstNameField(),
  lastName: lastNameField(),
  email: emailField,
  phone: phoneField,
  avatarUrl: optionalUrlField,
});

export const securitySchema = withMatchingFields(
  z
    .object({
      currentPassword: passwordField,
      newPassword: strongPasswordField,
      confirmPassword: confirmPasswordField,
    })
    .refine((values) => values.currentPassword !== values.newPassword, {
      message: "New password must be different from current password",
      path: ["newPassword"],
    }),
  "newPassword",
  "confirmPassword",
);

export const kycSchema = z.object({
  legalName: nameField("Legal name", { max: 100 }),
  panNumber: panField,
  aadhaarNumber: aadhaarField,
});
