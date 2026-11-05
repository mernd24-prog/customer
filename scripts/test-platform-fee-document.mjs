import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source = fs.readFileSync(new URL('../src/modules/orders/controllers/actions/useOrderDocuments.js', import.meta.url), 'utf8');
const hook = source.slice(source.indexOf('export function')).replace('export function', 'function');
function documents(invoice, fee = 100) {
  let stateIndex = 0;
  const context = {
    useDispatch: () => () => {}, useEffect: () => {},
    useState: () => [stateIndex++ === 0 ? { customerFeeInvoice: invoice } : false, () => {}],
    hasDeliveredSellerPackage: () => false,
    getCustomerPlatformFeeAmount: () => fee,
    getDocumentId: doc => doc?.id,
    endpoints: { tax: { invoiceDownload: id => `/tax/invoices/${id}/download` } },
  };
  vm.runInNewContext(`${hook}; globalThis.result = useOrderDocuments({ orderId: 'order-a', order: {}, visibleReturns: [], visibleCancellations: [] });`, context);
  return context.result.downloadableDocuments;
}
const ready = documents({ id: 'fee-a', invoiceNumber: 'GST-F-001' });
assert.equal(ready.length, 1);
assert.equal(ready[0].type, 'platform_fee');
assert.equal(ready[0].downloadPath, '/tax/invoices/fee-a/download');
assert.equal(ready[0].filename, 'GST-F-001.pdf');
const pending = documents(null);
assert.equal(pending[0].pending, true);
assert.equal(pending[0].type, 'platform_fee');
assert.equal(documents(null, 0).length, 0);
console.log('PASS: paid platform-fee document appears before delivery, missing document is pending, zero fee has no document.');
