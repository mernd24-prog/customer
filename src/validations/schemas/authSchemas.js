import { z } from "zod";
import {
  aadhaarField,
  commonFieldValidators,
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
  email: commonFieldValidators.email,
  password: commonFieldValidators.loginPassword,
});

export const forgotPasswordSchema = z.object({
  email: commonFieldValidators.email,
});

export const verifyOtpSchema = z.object({
  email: commonFieldValidators.email,
  otp: commonFieldValidators.otp,
});

export const otpSchema = verifyOtpSchema;
export const emailSchema = forgotPasswordSchema;

export const registerSchema = z.object({
  firstName: commonFieldValidators.firstName,
  lastName: commonFieldValidators.lastName,
  email: commonFieldValidators.email,
  dialCode: z.string().optional(),
  phone: commonFieldValidators.phone,
  password: commonFieldValidators.password,
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

// export const resetPasswordSchema = withMatchingFields(
//   z.object({
//     email: emailField,
//     otp: otpField,
//     newPassword: strongPasswordField,
//     confirmPassword: confirmPasswordField,
//   }),
//   "newPassword",
//   "confirmPassword",
// );

export const resetSchema = z.object({
  email: commonFieldValidators.email,
  otp: commonFieldValidators.otp,
  newPassword: commonFieldValidators.password,
});

export const profileSchema = z.object({
  firstName: firstNameField(),
  lastName: lastNameField(),
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
