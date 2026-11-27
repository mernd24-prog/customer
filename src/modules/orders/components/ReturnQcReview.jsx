import { useState } from 'react';
import { useDispatch } from 'react-redux';
import BaseModal from '../../../components/ui/overlay/BaseModal';
import { DynamicButton } from '../../../components/ui/button';
import { TextareaInput } from '../../../components/ui/input';
import { fetchReturnById, disputeReturnQc } from '../../returns/slices/returnsSlice';
import { fetchOrderById } from '../slices/orderSlice';
import { qcReviewEligibility, validateQcReviewReason } from '../utils/returnQcReview';

const labels = { identity: 'Product identity', serialNumber: 'Serial number / IMEI', accessories: 'Accessories', packaging: 'Packaging', condition: 'Condition eligibility' };
const unwrap = result => result?.data?.data || result?.data || result;
export default function ReturnQcReview({ request }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [reasonError, setReasonError] = useState('');
  const id = request?._id || request?.id;
  const load = async () => {
    setOpen(true); setError(''); setDetail(null); setLoading(true); setReason(''); setReasonError('');
    try { setDetail(unwrap(await dispatch(fetchReturnById({ returnId: id })).unwrap())); }
    catch (failure) { setError(failure?.message || 'Unable to load the inspection. Please try again.'); }
    finally { setLoading(false); }
  };
  const submit = async event => {
    event.preventDefault();
    const invalid = validateQcReviewReason(reason); setReasonError(invalid);
    if (invalid || !qcReviewEligibility(detail).allowed) return;
    setLoading(true); setError('');
    try {
      const result = await dispatch(disputeReturnQc({ returnId: id, data: { reason: reason.trim(), evidence: [] } })).unwrap();
      setDetail(unwrap(result)); setReason('');
      const orderId = detail.orderId || request.orderId;
      if (orderId) dispatch(fetchOrderById({ orderId }));
    } catch (failure) { setError(failure?.message || 'Unable to submit the review request. Please try again.'); }
    finally { setLoading(false); }
  };
  if (!id || !['qc_failed', 'qc_failure_upheld'].includes(request.status)) return null;
  const eligibility = qcReviewEligibility(detail || {});
  const items = detail?.collectionQc?.items || detail?.qcReview?.sellerEvidence || detail?.items || [];
  return <>
    <DynamicButton variant="outline" className="mt-4 rounded-md border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-900" onClick={load}>{request.status === 'qc_failure_upheld' ? 'View Inspection Decision' : request.qcReview?.customerDispute ? 'View Inspection & Review Status' : 'View Inspection & Request Review'}</DynamicButton>
    {open && <BaseModal onClose={() => !loading && setOpen(false)} maxWidth="max-w-2xl">
      <div className="space-y-5 p-5 sm:p-6">
        <h2 className="pr-8 text-lg font-semibold">Return inspection review</h2>
        {loading && <p role="status" className="text-sm text-slate-600">Loading inspection…</p>}
        {error && <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}{!detail && <DynamicButton className="ml-3 underline" onClick={load}>Try Again</DynamicButton>}</div>}
        {detail && <>
          <p className="text-sm text-slate-700">{detail.collectionQc?.required && !detail.collectionQc?.collectedAt ? 'Your item has not been collected. Keep it with you while the inspection is reviewed.' : 'Review the inspection findings below.'}</p>
          {items.map((item, index) => <div key={item.orderItemId || index} className="rounded-lg border border-slate-200 p-4 text-sm">
            <p className="font-semibold">{detail.items?.find(entry => entry.orderItemId === item.orderItemId)?.productTitle || item.productTitle || `Item ${index + 1}`}</p>
            <p className="mt-2 whitespace-pre-wrap text-slate-700">{item.notes || item.qcNotes || 'No inspection notes recorded.'}</p>
            {item.checks && <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">{Object.entries(item.checks).map(([key, value]) => <div key={key}><dt className="text-xs text-slate-500">{labels[key] || key}</dt><dd className={value === 'fail' ? 'font-semibold text-red-700' : 'text-slate-700'}>{value === 'not_applicable' ? 'Not applicable' : value === 'fail' ? 'Failed' : 'Passed'}</dd></div>)}</dl>}
            <div className="mt-3 flex flex-wrap gap-3">{(item.photos || item.qcPhotos || []).map((photo, index) => /^https?:\/\//i.test(photo) && <a key={photo} href={photo} target="_blank" rel="noreferrer" className="text-blue-700 underline">Inspection photo {index + 1}</a>)}</div>
          </div>)}
          {detail.qcReview?.decisionReason && <p className="rounded-lg bg-slate-50 p-3 text-sm">Platform decision: {detail.qcReview.decisionReason}</p>}
          <p role="status" className="text-sm text-slate-700">{eligibility.message}</p>
          {detail.qcReview?.disputeDeadline && <p className="text-xs text-slate-500">Review request deadline: {new Date(detail.qcReview.disputeDeadline).toLocaleString('en-IN')}</p>}
          {eligibility.allowed && <form onSubmit={submit} noValidate className="space-y-3">
            <TextareaInput label="Why do you disagree with this inspection?" name="reviewReason" value={reason} required minLength={10} maxLength={2000} rows={4}
              onChange={event => { setReason(event.target.value); if (reasonError) setReasonError(validateQcReviewReason(event.target.value)); }}
              onBlur={() => setReasonError(validateQcReviewReason(reason))} error={reasonError} placeholder="Explain the incorrect finding or why your item meets the return policy." />
            <DynamicButton type="submit" disabled={loading} className="rounded-md bg-[#1B1D60] px-4 py-2 font-semibold text-white">Request Platform Review</DynamicButton>
          </form>}
        </>}
      </div>
    </BaseModal>}
  </>;
}
