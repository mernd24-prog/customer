import { normalizeApiError } from "../api/normalizeApiError";

export function getApiErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  return normalizeApiError(error) || fallback;
}

export default getApiErrorMessage;
