import { normalizeErrorMessage } from "../api/normalizeApiError";
import { notify } from "../utils/notify";

export function useToastThunk() {
  return async (dispatch, thunk, successMessage) => {
    try {
      const result = await dispatch(thunk).unwrap();
      if (successMessage) notify.success(successMessage);
      return result;
    } catch (error) {
      notify.error(normalizeErrorMessage(error));
      throw error;
    }
  };
}
