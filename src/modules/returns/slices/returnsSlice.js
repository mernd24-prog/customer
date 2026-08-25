import { createApiSlice, defaultInitialState } from "../../../features/createApiSlice";
import { returnsThunks } from "../../../features/domainThunks";
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
  disputeReturnQc,
  createReplacement,
  closeReturn,
} = returnsThunks;
export default createApiSlice({ name: "returns", thunks: returnsThunks }).reducer;
