import { z } from "zod";
import { REGEX } from "../common/regex";
import {
  phoneField,
  requiredString,
  safeTextField,
  nameField,
} from "../common/validationHelpers";

export const contactSchema = z.object({
  name: nameField("Full Name", {
    min: 3,
    max: 80,
  }),
  email: requiredString("Email", {
    max: 254,
    pattern: REGEX.email,
    patternMessage: "Please enter a valid email address",
  }),
  phone: phoneField,
  subject: requiredString("Subject", {
    min: 1,
    max: 120,
    pattern: REGEX.safeText,
    patternMessage: "Please select a subject",
  }),
  message: safeTextField("Message", {
    min: 10,
    max: 1000,
    patternMessage: "Please enter at least 10 characters",
  }),
});
