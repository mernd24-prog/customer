export function buildBuyerRegistrationPayload(values) {
  return {
    email: values.email.trim(),
    dialCode: values.dialCode?.trim() || "+91",
    phone: values.phone.trim(),
    password: values.password,
    role: "buyer",
    profile: {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim()
    },
    referralCode: values.referralCode?.trim() || undefined
  };
}
