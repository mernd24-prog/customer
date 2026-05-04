import { toast } from "react-toastify";

export function useToastThunk() {
  return async (dispatch, thunk, successMessage) => {
    try {
      const result = await dispatch(thunk).unwrap();
      if (successMessage) toast.success(successMessage);
      return result;
    } catch (error) {
      toast.error(error || "Request failed");
      throw error;
    }
  };
}
