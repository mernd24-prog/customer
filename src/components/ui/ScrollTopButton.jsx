import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

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
      className="fixed bottom-[94px] right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gold text-[#1B1D60] shadow-[0_4px_14px_0_rgba(0,0,0,0.12)] border border-gold transition-all duration-300 ease-out hover:bg-yellow-400 hover:scale-[1.03] hover:shadow-[0_6px_20px_rgba(0,0,0,0.16)] active:scale-95 focus:outline-none focus:ring-4 focus:ring-yellow-200"
    >
      <ArrowUp size={22} strokeWidth={2.5} />
    </button>
  );
}
