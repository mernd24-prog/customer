export function canRetryOrderPayment(order = {}, fallbackStatus = '') {
  const status = String(order.status || order.order_status || fallbackStatus).toLowerCase();
  const payment = String(order.payment_status || order.paymentStatus || '').toLowerCase();
  const provider = String(order.payment_provider || order.paymentProvider || '').toLowerCase();
  if (provider && !['razorpay'].includes(provider)) return false;
  if (['captured', 'paid', 'authorized', 'refunded', 'partially_refunded'].includes(payment)) return false;
  if (['pending_payment', 'payment_failed'].includes(status)) return true;
  return status === 'confirmed' && payment === 'failed';
}
