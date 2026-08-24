import { CheckCircle2 } from "lucide-react";
import BaseModal from "../../../components/ui/overlay/BaseModal";
import { useSupportController } from "../controllers/useSupportController";

export function TicketSuccessModal() {
  const { ticketSuccessModalOpen, ticketSuccessModalData, handleCloseSuccessModal } = useSupportController();

  if (!ticketSuccessModalOpen) return null;

  return (
    <BaseModal onClose={handleCloseSuccessModal} maxWidth="max-w-md">
      <div className="flex flex-col items-center px-6 py-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F8F5] text-[#117A65] mb-5">
          <CheckCircle2 size={40} strokeWidth={2.5} />
        </div>

        <h3 className="text-xl font-bold text-[#1B1D60] mb-2">
          Ticket Raised Successfully!
        </h3>

        <p className="text-sm text-[#4E4E4E] leading-relaxed mb-6">
          Thank you for contacting us. Your ticket has been logged and our support team will get back to you shortly.
          {ticketSuccessModalData?.ticketId && (
            <span className="block mt-2 font-semibold text-[#3E4093]">
              Ticket ID: #{ticketSuccessModalData.ticketId}
            </span>
          )}
        </p>

        <button
          type="button"
          onClick={handleCloseSuccessModal}
          className="w-full h-11 rounded-lg bg-[#CE9F2D] text-sm font-bold text-white transition hover:bg-[#C9961F] active:scale-[0.98]"
        >
          Done
        </button>
      </div>
    </BaseModal>
  );
}
