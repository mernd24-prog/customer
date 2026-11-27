import assert from 'node:assert/strict';
import { getReturnSteps } from '../src/modules/orders/utils/orderTimelineUtils.js';

const request = {
  createdAt: '2026-11-25T09:00:00Z',
  approvedAt: '2026-11-25T09:05:00Z',
  reverseShipment: { pickupScheduledAt: '2026-11-26T09:00:00Z' },
  timeline: [{ status: 'pickup_failed', at: '2026-11-26T09:30:00Z' }],
};
const steps = status => getReturnSteps({ ...request, status }, {}, 'INR', String, false);
for (const status of ['pickup_failed', 'return_pickup_failed']) {
  const failed = steps(status);
  assert.deepEqual(failed.slice(0, 3).map(step => step.completed), [true, true, true]);
  assert.equal(failed[1].time, request.approvedAt);
  assert.equal(failed[2].time, request.reverseShipment.pickupScheduledAt);
  assert.equal(failed[3].label, 'Pickup failed');
  assert.equal(failed[3].exception, true);
  assert.equal(failed[3].time, request.timeline[0].at);
  assert.match(failed[3].notice, /another pickup/);
  assert.ok(failed.slice(4).every(step => !step.completed));
}
const scheduled = steps('reverse_pickup_scheduled');
assert.equal(scheduled[3].label, 'Picked up');
assert.equal(scheduled[3].completed, false);
assert.equal(scheduled[3].notice, null);
assert.ok(!scheduled.some(step => step.exception));
for (const [status, completedCount] of [
  ['requested', 1], ['approved', 2], ['in_reverse_transit', 4],
  ['received', 5], ['qc_passed', 6], ['refunded', 7],
]) {
  assert.equal(steps(status).filter(step => step.completed).length, completedCount, status);
}
assert.deepEqual(steps('rejected').map(step => step.label), ['Return requested', 'Return rejected']);
console.log('PASS: pickup failure preserves completed steps; rescheduling and normal return progression remain intact.');

const doorstep = {
  ...request, status: 'reverse_pickup_scheduled', resolution: 'replacement',
  collectionQc: { required: true, status: 'pending' },
  replacement: { status: 'shipped', shippedAt: '2026-11-25T09:10:00Z' },
};
const exchangeSteps = getReturnSteps(doorstep, {}, 'INR', String, false);
assert.ok(exchangeSteps.some(step => step.label === 'Replacement dispatched' && step.completed));
assert.ok(!exchangeSteps.some(step => step.label.includes('Refund')));
assert.equal(exchangeSteps.at(-1).completed, false);
const collected = { ...doorstep, status: 'replacement_shipped', collectionQc: { required: true, status: 'passed', inspectedAt: 'now', collectedAt: 'now', allAccepted: true } };
const collectedSteps = getReturnSteps(collected, {}, 'INR', String, false);
assert.ok(collectedSteps.find(step => step.status === 'doorstep_collected').completed);
assert.equal(collectedSteps.at(-1).completed, false);
const handedOver = getReturnSteps({ ...collected, status: 'replacement_delivered', replacement: { status: 'delivered', deliveredAt: 'now' } }, {}, 'INR', String, false);
assert.equal(handedOver.at(-1).completed, true);
const qcFailed = getReturnSteps({ ...doorstep, status: 'qc_failed', collectionQc: { required: true, status: 'failed', inspectedAt: 'now' } }, {}, 'INR', String, false);
assert.ok(qcFailed.find(step => step.status === 'doorstep_qc').exception);
assert.equal(qcFailed.find(step => step.status === 'doorstep_collected').completed, false);
const pendingRefund = getReturnSteps({ ...collected, resolution: 'refund', status: 'refund_pending', refund: { status: 'pending' } }, {}, 'INR', String, false);
assert.equal(pendingRefund.at(-1).label, 'Collected — refund pending');
assert.equal(pendingRefund.at(-1).completed, false);
const manual = getReturnSteps({ ...doorstep, status: 'manual_ship_back', reverseShipment: { provider: 'customer_manual' } }, {}, 'INR', String, false);
assert.ok(!manual.some(step => step.status === 'doorstep_qc'));
console.log('PASS: doorstep exchanges never show a refund, collection and handover are separate, failed QC stays uncollected, pending refunds stay pending, manual fallback retains warehouse QC.');

const refundFailure = getReturnSteps({ ...collected, resolution: 'refund', status: 'refund_failed', refund: { status: 'failed' } }, {}, 'INR', String, false);
assert.equal(refundFailure.at(-1).completed, false);
assert.equal(refundFailure.at(-1).exception, true);
assert.equal(refundFailure.at(-1).label, 'Refund needs attention');
assert.equal(pendingRefund.find(step => step.status === 'doorstep_collected').label, 'Return item collected');
const refundedSteps = getReturnSteps({ ...collected, resolution: 'refund', status: 'refunded', refund: { status: 'completed' } }, {}, 'INR', String, false);
assert.equal(refundedSteps.at(-1).completed, true);
assert.equal(refundedSteps.at(-1).label, 'Refund completed');
console.log('PASS: collection, refund failure and completed payment are distinct customer states.');

const sameVisit = getReturnSteps({ ...collected, resolution: 'replacement', status: 'replaced', collectionQc: { ...collected.collectionQc, sameVisitExchange: true, exchangeCompletedAt: 'now' } }, {}, 'INR', String, false);
assert.equal(sameVisit.at(-1).label, 'Exchange completed');
assert.equal(sameVisit.at(-1).completed, true);
assert.equal(sameVisit.some(step => step.label === 'Old item collected'), false);
console.log('PASS: same-visit exchange has a single customer completion step.');
