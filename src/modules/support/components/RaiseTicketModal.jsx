import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Ticket, Sparkles, Loader2, Info, LifeBuoy } from "lucide-react";

import BaseModal from "../../../components/ui/overlay/BaseModal";
import CustomDropdown from "../../../components/ui/CustomDropdown";
import { useAuthModal } from "../../../modules/auth/context/AuthModalContext";
import { useSupportController } from "../controllers/useSupportController";

const CUSTOMER_SUPPORT_CATEGORIES = [
  { value: "ORDER_ISSUE", label: "Order Issue" },
  { value: "DELIVERY_ISSUE", label: "Delivery Issue" },
  { value: "PAYMENT_ISSUE", label: "Payment Issue" },
  { value: "REFUND_RETURN_ISSUE", label: "Return & Refund" },
  { value: "PRODUCT_ISSUE", label: "Product Issue" },
  { value: "ACCOUNT_ISSUE", label: "Account Issue" },
  { value: "OTHER", label: "Other" },
];

const INITIAL_FORM = {
  category: "ORDER_ISSUE",
  subject: "",
  message: "",
};

export function RaiseTicketModal() {
  const {
    raiseTicketModalOpen,
    raiseTicketModalData,
    handleCloseRaiseTicketModal,
    submitTicket,
    supportSubmitting,
  } = useSupportController();

  const user = useSelector((state) => state.auth.current);
  const isSignedIn = Boolean(user);
  const { openAuthModal } = useAuthModal();

  const [form, setForm] = useState({ ...INITIAL_FORM });
  const isFromAiChat = Boolean(
    raiseTicketModalData?.subject || raiseTicketModalData?.message,
  );

  // Form Hydration Lifecycle
  useEffect(() => {
    if (raiseTicketModalOpen) {
      if (raiseTicketModalData) {
        setForm({
          category: raiseTicketModalData.category || INITIAL_FORM.category,
          subject: raiseTicketModalData.subject || "",
          message: raiseTicketModalData.message || "",
        });
      } else {
        setForm({ ...INITIAL_FORM });
      }
    }
  }, [raiseTicketModalOpen, raiseTicketModalData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleCategoryChange = (val) => {
    setForm((prev) => ({ ...prev, category: val }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isSignedIn) {
      openAuthModal?.();
      return;
    }

    const success = await submitTicket(form);
    if (success) {
      setForm({ ...INITIAL_FORM });
    }
  };

  if (!raiseTicketModalOpen) return null;

  return (
    <BaseModal onClose={handleCloseRaiseTicketModal} maxWidth="max-w-lg">
      <div className="p-6 sm:p-7">
        {/* Header */}
        <div className="border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-lg font-bold text-[#1B1D60]">
                Raise a Support Ticket
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Our support team will respond to your query directly
              </p>
            </div>
          </div>
        </div>

        {/* AI Chat Pre-fill Alert */}
        {isFromAiChat && (
          <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900">
            <Sparkles size={16} className="text-[#CE9F2D] shrink-0" />
            <span className="leading-relaxed">
              Details have been pre-filled from your AI chat. You can review or
              edit before submitting.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <CustomDropdown
            label="Issue Category"
            options={CUSTOMER_SUPPORT_CATEGORIES}
            value={form.category}
            onChange={handleCategoryChange}
            placeholder="Select Category"
          />

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Subject
            </span>
            <input
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="e.g. Order #1234 Delivery Delay"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#CE9F2D] focus:ring-2 focus:ring-[#CE9F2D]/20 focus:outline-none transition"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Detailed Description
            </span>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={4}
              placeholder="Describe your issue with order numbers, items, or screenshots..."
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-[#CE9F2D] focus:ring-2 focus:ring-[#CE9F2D]/20 focus:outline-none transition"
              required
            />
          </label>

          <div className="pt-2">
            <button
              type="submit"
              disabled={supportSubmitting}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#CE9F2D] text-sm font-bold text-white shadow-md transition hover:bg-[#B88B22] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {supportSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Submitting Ticket...</span>
                </>
              ) : (
                <>
                  <Ticket size={16} />
                  <span>Submit Ticket</span>
                </>
              )}
            </button>

            {!isSignedIn && (
              <p className="mt-2.5 text-center text-xs font-medium text-slate-500 flex items-center justify-center gap-1.5">
                <Info size={13} className="text-amber-600" />
                <span>You will be prompted to log in before submitting.</span>
              </p>
            )}
          </div>
        </form>
      </div>
    </BaseModal>
  );
}
