import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

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
      className="fixed bottom-[92px] right-[30px] z-40 flex h-11 w-11 items-center justify-center rounded-full bg-gold text-[#03014D] shadow-lg border border-white/60 transition-all duration-300 ease-in-out hover:bg-gold-dark hover:scale-105 active:scale-95 focus:outline-none"
    >
      <ArrowUp size={20} />
    </button>
  );
}