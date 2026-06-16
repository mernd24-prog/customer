import { createApiSlice } from "../createApiSlice";
import { returnsThunks } from "../domainThunks";
export const {
  requestReturn,
  fetchMyReturns,
  fetchReturnByOrder,
  fetchReturnById,
  rejectReturn,
  scheduleReversePickup,
  shipReturnBack,
  updateReverseShipment,
  receiveReturn,
  processRefund,
  retryRefund,
  syncRefund,
  qcReturn,
  createReplacement,
  closeReturn,
} = returnsThunks;
export default createApiSlice({ name: "returns", thunks: returnsThunks }).reducer;
