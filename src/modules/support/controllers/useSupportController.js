import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { openModal, closeModal } from "../slices/supportSlice";
import { supportService } from "../services/supportService";
import { notify } from "../../../utils/notify";
import { normalizeSupportQueries } from "../utils/supportUtils";

export const useSupportController = () => {
  const dispatch = useDispatch();
  
  // Modals state from Redux
  const raiseTicketModalState = useSelector((state) => state.support?.modals?.raiseTicket) || {};
  const ticketSuccessModalState = useSelector((state) => state.support?.modals?.ticketSuccess) || {};

  const [supportQueries, setSupportQueries] = useState([]);
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportError, setSupportError] = useState("");
  const [supportSubmitting, setSupportSubmitting] = useState(false);

  // --- Modal Handlers ---
  const handleOpenRaiseTicketModal = useCallback((data = null) => {
    dispatch(openModal({ modalId: "raiseTicket", data }));
  }, [dispatch]);

  const handleCloseRaiseTicketModal = useCallback(() => {
    dispatch(closeModal({ modalId: "raiseTicket" }));
  }, [dispatch]);

  const handleOpenSuccessModal = useCallback((ticketId = null) => {
    dispatch(openModal({ modalId: "ticketSuccess", data: { ticketId } }));
  }, [dispatch]);

  const handleCloseSuccessModal = useCallback(() => {
    dispatch(closeModal({ modalId: "ticketSuccess" }));
  }, [dispatch]);

  // --- API Handlers ---
  const loadSupportQueries = useCallback(async (selectedCategory = "") => {
    setSupportLoading(true);
    setSupportError("");

    try {
      const result = await supportService.fetchSupportQueries(selectedCategory);
      setSupportQueries(normalizeSupportQueries(result.data));
    } catch (error) {
      setSupportError(error?.message || "Unable to load support tickets.");
    } finally {
      setSupportLoading(false);
    }
  }, []);

  const submitTicket = useCallback(async (formData) => {
    const subject = formData.subject.trim();
    const message = formData.message.trim();

    if (subject.length < 5) {
      notify.warning("Please enter a subject with at least 5 characters.");
      return false;
    }

    if (message.length < 10) {
      notify.warning("Please describe your issue in at least 10 characters.");
      return false;
    }

    setSupportSubmitting(true);

    try {
      const response = await supportService.submitTicket(formData.category, subject, message);
      const ticketId = response?.data?.queryId || response?.data?.id || "";
            handleCloseRaiseTicketModal();
      handleOpenSuccessModal(ticketId);
      
      return true;
    } catch (error) {
      notify.error(error?.message || "Failed to send support message.");
      return false;
    } finally {
      setSupportSubmitting(false);
    }
  }, [handleCloseRaiseTicketModal, handleOpenSuccessModal]);

  return {
    // State
    supportQueries,
    supportLoading,
    supportError,
    supportSubmitting,
    
    // Modal State
    raiseTicketModalOpen: raiseTicketModalState.isOpen,
    raiseTicketModalData: raiseTicketModalState.data,
    ticketSuccessModalOpen: ticketSuccessModalState.isOpen,
    ticketSuccessModalData: ticketSuccessModalState.data,
    
    // Actions
    handleOpenRaiseTicketModal,
    handleCloseRaiseTicketModal,
    handleOpenSuccessModal,
    handleCloseSuccessModal,
    loadSupportQueries,
    submitTicket,
  };
};
