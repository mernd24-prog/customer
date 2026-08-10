import { Download } from "lucide-react";
import Button from "../../../components/ui/Button";

export default function OrderDocuments({
  downloadableDocuments,
  visiblePendingSellerDocuments,
  invoiceDownloadAvailable,
  customerInvoices,
  getInvoiceUrl,
  downloadingId,
  handleDownload,
  order,
  selectedOrderItem
}) {
  return (
    <>
      
              <section className="rounded-[8px] md:border md:border-border bg-white px-4 py-4 sm:px-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-ink">
                      {selectedOrderItem
                        ? "Selected item documents"
                        : "Order documents"}
                    </h2>
                    <p className="mt-1 text-xs text-muted">
                      {selectedOrderItem
                        ? "Only documents related to this item are shown here."
                        : "Invoices appear after seller delivery. Reverse invoices appear after cancellation or return refund."}
                    </p>
                  </div>
                  <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted">
                    {downloadableDocuments.length} document
                    {downloadableDocuments.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {downloadableDocuments.map((document) => (
                    <div
                      key={`${document.title}-${document.id}`}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-[6px] border border-border bg-surface px-3 py-3 text-sm"
                    >
                      <div className="min-w-0">
                        <strong>{document.title}</strong>
                        <div className="mt-1 truncate text-xs text-muted">
                          {document.subtitle}
                        </div>
                      </div>
                      {document.pending ? (
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-muted">
                          Pending
                        </span>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          loading={downloadingId === document.downloadPath}
                          onClick={() =>
                            handleDownload(
                              document.downloadPath,
                              document.filename,
                            )
                          }
                        >
                          <Download size={12} /> Download
                        </Button>
                      )}
                    </div>
                  ))}

                  {visiblePendingSellerDocuments.map((document, index) => (
                    <div
                      key={`${document.sellerName}-${index}`}
                      className="rounded-[6px] border border-dashed border-border bg-surface px-3 py-3 text-sm"
                      title={(document.productTitles || []).join(", ")}
                    >
                      <strong>{document.sellerName} seller invoice</strong>
                      <div className="mt-1 text-xs text-muted">
                        Available after delivery
                      </div>
                    </div>
                  ))}

                  {!downloadableDocuments.length &&
                    !visiblePendingSellerDocuments.length && (
                      <div className="rounded-[6px] border border-dashed border-border bg-surface px-3 py-3 text-sm text-muted">
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
                        className="flex min-h-[46px] items-center justify-center gap-2 rounded-[8px] border border-[#3E409380] bg-white px-4 text-[#3E4093]"
                      >
                        <Download size={16} /> Download invoice
                      </Button>
                    )}
                </div>
              </section>
            
    </>
  );
}
