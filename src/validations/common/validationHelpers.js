import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { REGEX } from "./regex";

export const ERROR_MESSAGES = Object.freeze({
  required: (field) => `${field} is required`,
  min: (field, length) => `${field} must be at least ${length} characters`,
  max: (field, length) => `${field} must be ${length} characters or less`,
  email: "Enter a valid email address",
  phone: "Enter a valid 10-digit Indian mobile number",
  safeText: "Only letters, numbers, spaces, and basic punctuation are allowed",
  name: (field) => `${field} can contain letters, spaces, apostrophes, dots, and hyphens only`,
  firstName: "First name should contain only letters",
  lastName: "Last name should contain only letters",
  passwordMin: "Password must be at least 8 characters",
  passwordUppercase: "Password must contain at least one uppercase letter",
  passwordLowercase: "Password must contain at least one lowercase letter",
  passwordNumber: "Password must contain at least one number",
  passwordSpecial: "Password must contain at least one special character",
  passwordMatch: "Passwords do not match",
  passwordSameAsCurrent: "New password must be different from current password",
  otp: "Enter the 6-digit OTP",
  postalCode: "Enter a valid postal code",
  indianPostalCode: "Enter PIN code",
  url: "Enter a valid URL",
});

const normalizeCountry = (country = "") =>
  String(country)
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, "");

// Only enforce Indian PIN validation for India; otherwise fallback to generic postal code validation.
export const getPostalCodeRule = (country) => {
  const normalizedCountry = normalizeCountry(country);
  const indianCountries = ["india", "bharat", "in"];

  if (indianCountries.includes(normalizedCountry)) {
    return {
      pattern: REGEX.indianPostalCode,
      message: ERROR_MESSAGES.indianPostalCode,
    };
  }

  return undefined;
};

export const validatePostalCodeForCountry = (postalCode, country) => {
  const value = String(postalCode || "").trim();
  const rule = getPostalCodeRule(country);

  if (!rule) {
    return REGEX.postalCode.test(value)
      ? { valid: true }
      : { valid: false, message: ERROR_MESSAGES.postalCode };
  }

  return rule.pattern.test(value)
    ? { valid: true }
    : { valid: false, message: rule.message };
};

export const trimString = z.string().trim();

export const compactSpaces = (value = "") => String(value).replace(/\s+/g, " ").trim();

export const sanitizeTextInput = (value = "") =>
  compactSpaces(value)
    .split("")
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code > 31 && code !== 127;
    })
    .join("");

export const hasNoMarkup = (value = "") => !/[<>]/.test(value);

export const sanitizeSearchQuery = (value = "", maxLength = 100) =>
  sanitizeTextInput(value).replace(/[<>]/g, "").slice(0, maxLength);

export const isValidSearchQuery = (value = "", options = {}) => {
  const { min = 1, max = 100 } = options;
  const query = sanitizeSearchQuery(value, max);

  return query.length >= min && query.length <= max;
};

export const requiredString = (field, options = {}) => {
  const { min = 1, max = 120, pattern, patternMessage = ERROR_MESSAGES.safeText } = options;

  let stringSchema = trimString.min(1, ERROR_MESSAGES.required(field));

  if (min > 1) {
    stringSchema = stringSchema.min(min, ERROR_MESSAGES.min(field, min));
  }

  stringSchema = stringSchema.max(max, ERROR_MESSAGES.max(field, max));

  if (pattern) {
    stringSchema = stringSchema.regex(pattern, patternMessage);
  }

  stringSchema = stringSchema.refine(hasNoMarkup, patternMessage);

  return z.preprocess(
    (value) => (typeof value === "string" ? sanitizeTextInput(value) : value),
    stringSchema,
  );
};

export const optionalString = (max = 250) =>
  z.preprocess(
    (value) => {
      if (typeof value !== "string") return value;

      const sanitized = sanitizeTextInput(value);
      return sanitized === "" ? undefined : sanitized;
    },
    trimString
      .max(max, ERROR_MESSAGES.max("This field", max))
      .refine(hasNoMarkup, ERROR_MESSAGES.safeText)
      .optional(),
  );

export const safeTextField = (field, options = {}) =>
  requiredString(field, {
    ...options,
    pattern: options.pattern || REGEX.safeText,
    patternMessage: options.patternMessage || ERROR_MESSAGES.safeText,
  });

export const optionalSafeTextField = (max = 250, pattern = REGEX.safeText, message = ERROR_MESSAGES.safeText) =>
  optionalString(max).refine((value) => !value || pattern.test(value), {
    message,
  });

export const nameField = (field, options = {}) =>
  requiredString(field, {
    min: 2,
    max: 50,
    ...options,
    pattern: REGEX.name,
    patternMessage: ERROR_MESSAGES.name(field),
  });

export const firstNameField = (options = {}) =>
  requiredString("First name", {
    min: 2,
    max: 40,
    ...options,
    pattern: REGEX.lettersOnly,
    patternMessage: ERROR_MESSAGES.firstName,
  });

export const lastNameField = (options = {}) =>
  requiredString("Last name", {
    min: 1,
    max: 50,
    ...options,
    pattern: REGEX.lettersOnly,
    patternMessage: ERROR_MESSAGES.lastName,
  });

export const addressLineField = (field, options = {}) =>
  requiredString(field, {
    min: 3,
    max: 120,
    ...options,
    pattern: REGEX.addressLine,
    patternMessage: `Enter a valid ${field.toLowerCase()}`,
  });

export const optionalAddressLineField = (max = 120) =>
  optionalString(max).refine((value) => !value || REGEX.addressLine.test(value), {
    message: "Enter a valid address line",
  });

export const locationField = (field, options = {}) =>
  requiredString(field, {
    min: 1,
    max: 80,
    pattern: /^[\p{L}\p{N}\s.,'’"()/&:+#-]+$/u,
    patternMessage: `Enter a valid ${field.toLowerCase()}`,
    ...options,
  });

export const couponCodeField = optionalString(30).transform((value) => value?.toUpperCase()).refine(
  (value) => !value || REGEX.couponCode.test(value),
  { message: "Enter a valid coupon code" },
);

export const referralCodeField = optionalString(30).transform((value) => value?.toUpperCase()).refine(
  (value) => !value || REGEX.couponCode.test(value),
  { message: "Enter a valid referral code" },
);

export const panField = z.preprocess(
  (value) => (typeof value === "string" ? sanitizeTextInput(value).toUpperCase() : value),
  trimString
    .min(1, ERROR_MESSAGES.required("PAN number"))
    .regex(REGEX.pan, "Enter a valid PAN number"),
);

export const aadhaarField = z.preprocess(
  (value) => (typeof value === "string" ? value.replace(/\s/g, "") : value),
  trimString
    .min(1, ERROR_MESSAGES.required("Aadhaar number"))
    .regex(REGEX.aadhaar, "Aadhaar must be 12 digits"),
);

export const skuField = z.preprocess(
  (value) => (typeof value === "string" ? sanitizeTextInput(value).toUpperCase() : value),
  trimString
    .min(3, ERROR_MESSAGES.min("SKU", 3))
    .max(40, ERROR_MESSAGES.max("SKU", 40))
    .regex(REGEX.sku, "Enter a valid SKU"),
);

export const emailField = trimString
  .toLowerCase()
  .min(1, ERROR_MESSAGES.required("Email"))
  .max(254, ERROR_MESSAGES.max("Email", 254))
  .regex(REGEX.email, ERROR_MESSAGES.email)
  .refine((value) => {
    const [localPart = "", domain = ""] = value.split("@");

    return localPart.length <= 64 && domain.length <= 253;
  }, ERROR_MESSAGES.email)
  .refine((value) => {
    const [localPart = ""] = value.split("@");

    return !localPart.startsWith(".") && !localPart.endsWith(".");
  }, ERROR_MESSAGES.email)
  .refine((value) => {
    const [, domain = ""] = value.split("@");

    return domain
      .split(".")
      .every((label) => label.length > 0 && label.length <= 63 && !label.startsWith("-") && !label.endsWith("-"));
  }, ERROR_MESSAGES.email);

export const normalizePhoneNumber = (value = "") => String(value).replace(/\D/g, "").slice(0, 10);

export const phoneField = z.preprocess(
  (value) => (typeof value === "string" ? normalizePhoneNumber(value) : value),
  trimString
    .min(1, ERROR_MESSAGES.required("Phone number"))
    .regex(REGEX.phone, ERROR_MESSAGES.phone),
);

export const passwordField = z
  .string()
  .min(8, ERROR_MESSAGES.passwordMin)
  .max(72, ERROR_MESSAGES.max("Password", 72));

export const loginPasswordField = z
  .string({
    required_error: ERROR_MESSAGES.required("Password"),
    invalid_type_error: ERROR_MESSAGES.required("Password"),
  })
  .min(1, ERROR_MESSAGES.required("Password"))
  .max(72, ERROR_MESSAGES.max("Password", 72));

export const confirmPasswordField = z
  .string({
    required_error: ERROR_MESSAGES.required("Confirm password"),
    invalid_type_error: ERROR_MESSAGES.required("Confirm password"),
  })
  .min(1, ERROR_MESSAGES.required("Confirm password"))
  .max(72, ERROR_MESSAGES.max("Confirm password", 72));

export const strongPasswordField = passwordField
  .regex(REGEX.passwordUppercase, ERROR_MESSAGES.passwordUppercase)
  .regex(REGEX.passwordLowercase, ERROR_MESSAGES.passwordLowercase)
  .regex(REGEX.passwordNumber, ERROR_MESSAGES.passwordNumber)
  .regex(REGEX.passwordSpecial, ERROR_MESSAGES.passwordSpecial)
  .refine((value) => !/\s/.test(value), "Password cannot contain spaces");

export const otpField = trimString.regex(REGEX.otp, ERROR_MESSAGES.otp);

export const postalCodeField = trimString
  .min(1, ERROR_MESSAGES.required("Postal code"))
  .regex(REGEX.postalCode, ERROR_MESSAGES.postalCode);

export const indianPostalCodeField = trimString
  .min(1, ERROR_MESSAGES.required("PIN code"))
  .regex(REGEX.indianPostalCode, ERROR_MESSAGES.indianPostalCode);

export const idField = (field = "Selection") =>
  requiredString(field, {
    min: 1,
    max: 80,
    pattern: /^[A-Za-z0-9_-]+$/,
    patternMessage: `Enter a valid ${field.toLowerCase()}`,
  });

export const moneyField = (field, options = {}) => {
  const { min = 0, max = 99999999 } = options;

  return z.preprocess(
    (value) => {
      if (typeof value === "string") {
        const trimmedValue = value.trim();
        return trimmedValue === "" ? undefined : trimmedValue;
      }

      return value;
    },
    z.coerce
      .number({
        required_error: `${field} is required`,
        invalid_type_error: `${field} must be a valid amount`,
      })
      .finite(`${field} must be a valid amount`)
      .min(min, `${field} cannot be less than ${min}`)
      .max(max, `${field} cannot be greater than ${max}`),
  );
};

export const optionalMoneyField = (field, options = {}) => {
  const { min = 0, max = 99999999 } = options;

  return z.preprocess(
    (value) => {
      if (typeof value === "string") {
        const trimmedValue = value.trim();
        return trimmedValue === "" ? undefined : trimmedValue;
      }

      return value;
    },
    z.coerce
      .number({ invalid_type_error: `${field} must be a valid amount` })
      .finite(`${field} must be a valid amount`)
      .min(min, `${field} cannot be less than ${min}`)
      .max(max, `${field} cannot be greater than ${max}`)
      .optional(),
  );
};

export const quantityField = (field = "Quantity", options = {}) => {
  const { min = 1, max = 999 } = options;

  return z.preprocess(
    (value) => {
      if (typeof value === "string") {
        const trimmedValue = value.trim();
        return trimmedValue === "" ? undefined : trimmedValue;
      }

      return value;
    },
    z.coerce
      .number({
        required_error: `${field} is required`,
        invalid_type_error: `${field} must be a valid number`,
      })
      .int(`${field} must be a whole number`)
      .min(min, `${field} must be at least ${min}`)
      .max(max, `${field} cannot be greater than ${max}`),
  );
};

export const optionalUrlField = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  trimString
    .refine(
      (value) => value.startsWith("data:image/") || z.string().url().safeParse(value).success,
      ERROR_MESSAGES.url,
    )
    .optional(),
);

export const matchFields = (leftField, rightField, message = ERROR_MESSAGES.passwordMatch) => ({
  message,
  path: [rightField],
  validate: (values) => values[leftField] === values[rightField],
});

export const withMatchingFields = (schema, leftField, rightField, message) => {
  const rule = matchFields(leftField, rightField, message);

  return schema.refine(rule.validate, {
    message: rule.message,
    path: rule.path,
  });
};

export const createZodResolver = (schema) => zodResolver(schema);

export const getFieldError = (errors, name) => name.split(".").reduce((value, key) => value?.[key], errors);

export const applyServerErrors = (setError, errors = {}) => {
  Object.entries(errors).forEach(([field, messages]) => {
    const message = Array.isArray(messages) ? messages[0] : messages;

    if (message) {
      setError(field, { type: "server", message });
    }
  });
};

export const pickSchemaFields = (schema, keys) =>
  schema.pick(keys.reduce((shape, key) => ({ ...shape, [key]: true }), {}));
