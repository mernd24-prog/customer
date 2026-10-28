
import { Download, FileText } from "lucide-react";
import Button from "../../../components/ui/buttons/Button";

export default function OrderDocuments({
  documents = [],
  loading = false,
  downloadingId,
  handleDownload,
}) {
  if (!loading && documents.length === 0) {
    return null;
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="grid w-full min-w-0 grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:gap-3">
        {loading
          ? [1, 2].map((item) => (
              <div
                key={`skeleton-${item}`}
                className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-[#CE9F2D40] bg-white px-3 py-2 sm:flex-1"
              >
                <div className="flex min-w-0 items-center gap-1.5">
                  <div className="h-4 w-4 shrink-0 animate-pulse rounded bg-[#E7D9B8]" />
                  <div className="h-4 w-24 animate-pulse rounded bg-[#E7D9B8]" />
                </div>

                <div className="h-7 w-20 shrink-0 animate-pulse rounded bg-[#E7D9B8]" />
              </div>
            ))
          : documents.map((document) => (
              <div
                key={`${document.title}-${document.id}`}
                className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-[#CE9F2D40] bg-white px-3 py-2 transition-colors hover:border-[#CE9F2D80] sm:flex-1"
              >
                <div className="flex min-w-0 flex-1 items-center gap-1.5">
                  <FileText
                    size={15}
                    className="shrink-0 text-navy"
                  />

                  <span className="min-w-0 truncate text-label font-semibold text-ink">
                    {document.title}
                  </span>
                </div>

                {document.pending ? (
                  <span className="shrink-0 rounded-full bg-[#CE9F2D1A] px-2.5 py-0.5 text-caption font-bold text-gold">
                    Pending
                  </span>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={downloadingId === document.downloadPath}
                    onClick={() =>
                      handleDownload?.(
                        document.downloadPath,
                        document.filename,
                      )
                    }
                    className="h-7 shrink-0 gap-1.5 border-[#CE9F2D] px-3 text-xs font-semibold text-navy hover:bg-[#FFF9EA]"
                  >
                    <Download size={12} />
                    Download
                  </Button>
                )}
              </div>
            ))}
      </div>
    </div>
  );
}
