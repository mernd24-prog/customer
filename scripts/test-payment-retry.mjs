import assert from 'node:assert/strict';
import { canRetryOrderPayment } from '../src/modules/orders/utils/paymentRetry.js';
for (const status of ['pending_payment', 'payment_failed', 'confirmed']) {
  assert.equal(canRetryOrderPayment({ status, payment_status: 'failed', payment_provider: 'razorpay' }), true);
}
for (const payment_status of ['captured', 'paid', 'authorized', 'refunded', 'partially_refunded']) {
  assert.equal(canRetryOrderPayment({ status: 'payment_failed', payment_status }), false);
}
for (const status of ['cancelled', 'shipped', 'fulfilled', 'refunded', 'on_hold']) {
  assert.equal(canRetryOrderPayment({ status, payment_status: 'failed' }), false);
}
assert.equal(canRetryOrderPayment({ status: 'pending_payment', payment_provider: 'cod' }), false);
assert.equal(canRetryOrderPayment({ status: 'confirmed', payment_status: 'initiated' }), false);
console.log('PASS: payment retry follows unpaid online payment state and excludes paid, COD and closed orders.');
