import { API_PREFIX } from "../../../api/endpoints";

export const RETURNS_API_ENDPOINTS = {
  create: `${API_PREFIX}/returns`,
  mine: `${API_PREFIX}/returns/my-returns`,
  byOrder: (orderId) => `${API_PREFIX}/returns/order/${orderId}`,
  detail: (returnId) => `${API_PREFIX}/returns/${returnId}`,
  approve: (returnId) => `${API_PREFIX}/returns/${returnId}/approve`,
  reject: (returnId) => `${API_PREFIX}/returns/${returnId}/reject`,
  schedule: (returnId) => `${API_PREFIX}/returns/${returnId}/schedule`,
  shipBack: (returnId) => `${API_PREFIX}/returns/${returnId}/ship-back`,
  reverseShipmentTracking: (returnId) => `${API_PREFIX}/returns/${returnId}/reverse-shipment/tracking`,
  receive: (returnId) => `${API_PREFIX}/returns/${returnId}/receive`,
  refund: (returnId) => `${API_PREFIX}/returns/${returnId}/refund`,
  refundRetry: (returnId) => `${API_PREFIX}/returns/${returnId}/refund/retry`,
  refundSync: (returnId) => `${API_PREFIX}/returns/${returnId}/refund/sync`,
  qc: (returnId) => `${API_PREFIX}/returns/${returnId}/qc`,
  qcDispute: (returnId) => `${API_PREFIX}/returns/${returnId}/qc/dispute`,
  replacement: (returnId) => `${API_PREFIX}/returns/${returnId}/replacement`,
  close: (returnId) => `${API_PREFIX}/returns/${returnId}/close`,
};


export const RETURNS_ROUTES = Object.freeze({
  returns: "/returns",
  request: (orderId = ":orderId") => `/returns/request/${orderId}`,
  returnsRefunds: "/returns-refunds"
});
