import { useEffect, useState } from "react";
import BaseModal from "../../../components/ui/overlay/BaseModal";
import CustomDropdown from "../../../components/ui/CustomDropdown";
import { useSelector } from "react-redux";
import { useAuthModal } from "../../auth/AuthModalContext";
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
    supportSubmitting 
  } = useSupportController();
  
  const user = useSelector((state) => state.auth.current);
  const isSignedIn = Boolean(user);

  const [form, setForm] = useState({ ...INITIAL_FORM });

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
    if (!isSignedIn) return;
    
    const success = await submitTicket(form);
    if (success) {
      setForm({ ...INITIAL_FORM });
    }
  };

  if (!raiseTicketModalOpen) return null;

  return (
    <BaseModal onClose={handleCloseRaiseTicketModal} maxWidth="max-w-md">
      <div className="p-6 sm:p-8">
        <h3 className="text-xl font-bold text-[#1B1D60] mb-5">
          Raise a Ticket
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <CustomDropdown
            label="Category"
            options={CUSTOMER_SUPPORT_CATEGORIES}
            value={form.category}
            onChange={handleCategoryChange}
            placeholder="Select Category"
          />

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#2E2E2E]">
              Subject
            </span>
            <input
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="Example: Refund Not Received"
              className="h-11 w-full rounded-lg border border-[#E7D9B8] bg-white px-3 text-sm text-[#2E2E2E] focus:outline-none placeholder:text-[#9A9A9A] focus:border-[#CE9F2D]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#2E2E2E]">
              Message
            </span>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={4}
              placeholder="Write Your Issue Here..."
              className="w-full resize-none rounded-lg border border-[#E7D9B8] bg-white px-3 py-3 text-sm leading-5 text-[#2E2E2E] placeholder:text-[#9A9A9A] focus:border-[#CE9F2D] focus:outline-none focus:ring-0 focus:shadow-none"
            />
          </label>

          <button
            type="submit"
            disabled={supportSubmitting || !isSignedIn}
            className="h-11 w-full rounded-lg bg-[#CE9F2D] text-sm font-bold text-white transition hover:bg-[#C9961F] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {supportSubmitting ? "Sending..." : "Send Message"}
          </button>

          {!isSignedIn && (
            <p className="text-center text-xs font-medium text-[#666666]">
              Login Is Required to Send a Support Message.
            </p>
          )}
        </form>
      </div>
    </BaseModal>
  );
}
