
import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function ShareProductPopover({ shareUrl }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        shareUrl || window.location.href
      );

      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      console.error("Unable to copy product link");
    }
  };

  return (
    <div className="absolute right-0 top-12 z-50 w-fit rounded-lg border border-gold/30 bg-white p-2 shadow-lg">
      <button
        type="button"
        onClick={handleCopy}
        className="flex min-w-[110px] items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-[#FDF5E3] px-3 py-2 text-xs font-medium text-[#B8860B] transition-colors duration-200 hover:bg-gold hover:text-white"
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
        {copied ? "Copied!" : "Copy Link"}
      </button>
    </div>
  );
}
