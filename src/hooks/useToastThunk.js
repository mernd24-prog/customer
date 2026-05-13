import { toast } from "react-toastify";
import { normalizeErrorMessage } from "../api/normalizeApiError";

export function useToastThunk() {
  return async (dispatch, thunk, successMessage) => {
    try {
      const result = await dispatch(thunk).unwrap();
      if (successMessage) toast.success(successMessage);
      return result;
    } catch (error) {
      toast.error(normalizeErrorMessage(error));
      throw error;
    }
  };
}
