import { RefreshCw, XCircle } from "lucide-react";
import Button from "../../../components/ui/Button";

export default function OrderActions({
  order,
  status,
  canCancelOrder,
  retrying,
  handleRetryPayment,
  openCancellation,
  selectedOrderItem
}) {
  return (
    <>
      
                <section className="rounded-[15px] lg:border lg:border-[#CE9F2D66] bg-white py-4 sm:px-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    {(status === "pending_payment" ||
                      status === "payment_failed") && (
                      <Button
                        className="min-h-[38px] w-full sm:w-auto text-white"
                        loading={retrying}
                        onClick={handleRetryPayment}
                      >
                        <RefreshCw size={15} /> Retry payment
                      </Button>
                    )}
                    {canCancelOrder(order) && (
                      <Button
                        variant="secondary"
                        className="min-h-[38px] w-full border-[#CE9F2D66] text-[#1B1D60] sm:w-auto"
                        onClick={openCancellation}
                      >
                        <XCircle size={15} />{" "}
                        {selectedOrderItem
                          ? "Cancel selected item"
                          : "Cancel order"}
                      </Button>
                    )}
                    {/* {!track && (
                    <Link
                      to={`/orders/${orderId}/track${selectedOrderItem ? `?orderItemId=${encodeURIComponent(getOrderItemId(selectedOrderItem))}` : ""}`}
                      className="block sm:inline-flex"
                    >
                      <Button
                        variant="secondary"
                        className="min-h-[38px] w-full border-[#CE9F2D66] text-[#1B1D60] sm:w-auto"
                      >
                        <Truck size={15} /> {selectedOrderItem ? "Track selected item" : "Track order"}
                      </Button>
                    </Link>
                  )}
                  {track && (
                    <Link
                      to={`/orders/${orderId}`}
                      className="block sm:inline-flex"
                    >
                      <Button
                        variant="secondary"
                        className="min-h-[38px] w-full border-[#CE9F2D66] text-[#1B1D60] sm:w-auto"
                      >
                        <ReceiptText size={15} /> View order
                      </Button>
                    </Link>
                  )} */}
                  </div>
                </section>
              
    </>
  );
}
