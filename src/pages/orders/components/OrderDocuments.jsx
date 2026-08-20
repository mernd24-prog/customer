import { Download, FileText } from "lucide-react";
import Button from "../../../components/ui/buttons/Button";
import OrderDetailSectionCard from "./OrderDetailSectionCard";

export default function OrderDocuments({
  downloadableDocuments,
  visiblePendingSellerDocuments,
  invoiceDownloadAvailable,
  customerInvoices,
  getInvoiceUrl,
  downloadingId,
  handleDownload,
  order,
  selectedOrderItem,
}) {
  const hasDocuments =
    downloadableDocuments?.length > 0 ||
    visiblePendingSellerDocuments?.length > 0;
  const hasInvoice =
    invoiceDownloadAvailable &&
    !customerInvoices?.length &&
    getInvoiceUrl(order);

  if (!hasDocuments && !hasInvoice) {
    return null;
  }

  const docCount =
    (downloadableDocuments?.length || 0) +
    (visiblePendingSellerDocuments?.length || 0);

  return (
    <OrderDetailSectionCard
      title={
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-[#3E4093]" />
          <span>
            {selectedOrderItem ? "Selected Item Documents" : "Order Documents"}
          </span>
        </div>
      }
      headerContent={
        <span className="rounded-full bg-[#CE9F2D1A] border border-[#CE9F2D40] px-3 py-1 text-xs font-bold text-[#CE9F2D]">
          {docCount} document{docCount === 1 ? "" : "s"}
        </span>
      }
      headerClassName="!min-h-[60px] !py-4"
      titleClassName="text-lg font-bold"
      bodyClassName="p-5"
    >
      <p className="mb-4 text-xs font-medium text-[#5F6078]">
        {selectedOrderItem
          ? "Only documents related to this item are shown here."
          : "Invoices appear after seller delivery. Reverse invoices appear after cancellation or return refund."}
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        {downloadableDocuments.map((document) => (
          <div
            key={`${document.title}-${document.id}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-[#CE9F2D40] bg-[#FFFDF8] p-3.5 text-sm transition-all hover:border-[#CE9F2D80]"
          >
            <div className="min-w-0">
              <strong className="block font-bold text-[#2E2E2E]">
                {document.title}
              </strong>
              <div className="mt-0.5 truncate text-xs font-medium text-[#737373]">
                {document.subtitle}
              </div>
            </div>
            {document.pending ? (
              <span className="rounded-full bg-[#CE9F2D1A] px-3 py-1 text-xs font-bold text-[#CE9F2D]">
                Pending
              </span>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                loading={downloadingId === document.downloadPath}
                onClick={() =>
                  handleDownload(document.downloadPath, document.filename)
                }
                className="border-[#CE9F2D] font-semibold text-[#1B1D60] hover:bg-[#FFF9EA]"
              >
                <Download size={13} /> Download
              </Button>
            )}
          </div>
        ))}

        {visiblePendingSellerDocuments.map((document, index) => (
          <div
            key={`${document.sellerName}-${index}`}
            className="rounded-[12px] border border-dashed border-[#CE9F2D66] bg-[#FFFDF8] p-3.5 text-sm"
            title={(document.productTitles || []).join(", ")}
          >
            <strong className="block font-bold text-[#2E2E2E]">
              {document.sellerName} seller invoice
            </strong>
            <div className="mt-1 text-xs font-medium text-[#737373]">
              Available after delivery
            </div>
          </div>
        ))}

        {!downloadableDocuments.length &&
          !visiblePendingSellerDocuments.length && (
            <div className="rounded-[12px] border border-dashed border-[#CE9F2D66] bg-[#FFFDF8] p-3.5 text-xs font-medium text-[#737373]">
              No documents are available yet.
            </div>
          )}

        {invoiceDownloadAvailable &&
          !customerInvoices.length &&
          getInvoiceUrl(order) && (
            <Button
              variant="secondary"
              onClick={() =>
                window.open(
                  getInvoiceUrl(order),
                  "_blank",
                  "noopener,noreferrer",
                )
              }
              className="flex min-h-[42px] items-center justify-center gap-2 rounded-[10px] border border-[#CE9F2D] bg-[#FFFDF8] px-4 text-xs font-bold text-[#1B1D60] hover:bg-[#FFF9EA]"
            >
              <Download size={15} /> Download invoice
            </Button>
          )}
      </div>
    </OrderDetailSectionCard>
  );
}
