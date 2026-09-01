import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export default function ScrollTopButton() {
  const [visible, setVisible] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setVisible(window.scrollY > 300);
          ticking = false;
        });
        ticking = true;
      }
    };

    const onChatStateChange = (e) => {
      setIsChatOpen(Boolean(e.detail?.isOpen));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("ai-chat-toggle", onChatStateChange);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("ai-chat-toggle", onChatStateChange);
    };
  }, []);

  if (!visible || isChatOpen) return null;

  return (
    <button
      type="button"
      aria-label="Scroll to Top"
      title="Scroll to Top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-[94px] right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#1B1D60] shadow-[0_4px_14px_0_rgba(0,0,0,0.12)] border border-slate-200 transition-all duration-300 ease-out hover:bg-slate-50 hover:scale-[1.03] hover:shadow-[0_6px_20px_rgba(0,0,0,0.16)] active:scale-95 focus:outline-none focus:ring-4 focus:ring-slate-100"
    >
      <ChevronUp size={28} strokeWidth={2.5} />
    </button>
  );
}