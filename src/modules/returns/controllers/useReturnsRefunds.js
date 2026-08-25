import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  disputeReturnQc,
  fetchMyReturns,
} from "../slices/returnsSlice";
import { notify } from "../../../utils/notify";

export default function useReturnsRefunds() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.returns);
  const returns = Array.isArray(state.list) ? state.list : [];

  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedReturnId, setExpandedReturnId] = useState(null);
  const [qcDispute, setQcDispute] = useState({
    returnId: null,
    reason: "",
    evidence: "",
    submitting: false,
  });
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    const refreshReturns = () =>
      dispatch(fetchMyReturns())
        .unwrap()
        .catch((error) => {});

    refreshReturns();
    const intervalId = window.setInterval(refreshReturns, 30000);
    const refreshOnFocus = () => refreshReturns();
    window.addEventListener("focus", refreshOnFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshOnFocus);
    };
  }, [dispatch]);

  const handleStatusFilterChange = useCallback((newFilter) => {
    setStatusFilter(newFilter);
    setVisibleCount(3);
  }, []);

  const toggleTracking = useCallback((retId) => {
    setExpandedReturnId((prev) => (prev === retId ? null : retId));
  }, []);

  const submitQcDispute = useCallback(async () => {
    if (!qcDispute.returnId || qcDispute.reason.trim().length < 10) {
      notify.error("Please explain the QC dispute in at least 10 characters.");
      return;
    }
    try {
      setQcDispute((current) => ({ ...current, submitting: true }));
      await dispatch(
        disputeReturnQc({
          returnId: qcDispute.returnId,
          reason: qcDispute.reason.trim(),
          evidence: qcDispute.evidence
            .split(/[\n,]/)
            .map((value) => value.trim())
            .filter(Boolean),
        }),
      ).unwrap();
      notify.success("Your QC dispute was submitted for marketplace review.");
      setQcDispute({
        returnId: null,
        reason: "",
        evidence: "",
        submitting: false,
      });
      await dispatch(fetchMyReturns());
    } catch (error) {
      notify.error(error?.message || "Unable to submit the QC dispute.");
      setQcDispute((current) => ({ ...current, submitting: false }));
    }
  }, [qcDispute, dispatch]);

  const matchesFilter = (status, filter) => {
    if (filter === "all") return true;
    return String(status || "") === filter;
  };

  const filteredReturns = statusFilter === "all"
    ? returns
    : returns.filter((ret) => matchesFilter(ret.status, statusFilter));

  const visibleReturns = filteredReturns.slice(0, visibleCount);
  const hasMoreReturns = visibleCount < filteredReturns.length;

  return {
    state,
    returns,
    statusFilter,
    expandedReturnId,
    qcDispute,
    setQcDispute,
    visibleCount,
    setVisibleCount,
    filteredReturns,
    visibleReturns,
    hasMoreReturns,
    handleStatusFilterChange,
    toggleTracking,
    submitQcDispute
  };
}
