export const qcReviewEligibility = (request = {}, now = Date.now()) => {
  if (request.status !== 'qc_failed') return { allowed: false, message: 'This inspection is not open for a new review request.' };
  if (request.qcReview?.customerDispute) return { allowed: false, message: 'Your review request has been submitted. The platform will review the inspection evidence.' };
  const deadline = new Date(request.qcReview?.disputeDeadline || 0).getTime();
  if (deadline && deadline < now) return { allowed: false, message: 'The review request period has ended. Please contact support for assistance.' };
  return { allowed: true, message: 'If you disagree with the inspection, explain why and request platform review. Keep the item with you until you receive further instructions.' };
};
export const validateQcReviewReason = value => {
  const reason = String(value || '').trim();
  if (reason.length < 10) return 'Explain why you disagree using at least 10 characters.';
  if (reason.length > 2000) return 'Your explanation must be at most 2000 characters.';
  return '';
};
