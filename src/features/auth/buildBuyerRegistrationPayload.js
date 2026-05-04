export function buildBuyerRegistrationPayload(values) {
  return {
    email: values.email.trim(),
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
