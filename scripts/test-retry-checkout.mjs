import assert from 'node:assert/strict';
import { openRazorpayCheckout, paymentPayload } from '../src/utils/razorpay.js';
const payment = { checkout: { keyId: 'test-key', orderId: 'order-test', amount: 10000 }, status: 'initiated' };
for (const wrapped of [payment, { data: payment }, { data: { payment } }, { data: { data: { payment } } }]) {
  assert.equal(paymentPayload(wrapped).checkout.orderId, 'order-test');
  let opened = false;
  globalThis.window = { Razorpay: class {
    constructor(options) { this.options = options; }
    on() {}
    open() { opened = true; this.options.modal.ondismiss(); }
  } };
  await assert.rejects(openRazorpayCheckout({ payment: wrapped, orderId: 'order-test' }), { code: 'PAYMENT_DISMISSED' });
  assert.equal(opened, true);
}
await assert.rejects(openRazorpayCheckout({ payment: {} }), { code: 'PAYMENT_CHECKOUT_UNAVAILABLE' });
console.log('PASS: retry opens Razorpay across response shapes; missing checkout is not payment confirmation pending.');
