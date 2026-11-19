import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";


import DynamicButton from "./button/button.jsx";
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
    <DynamicButton
      variant="secondary"
      shape="circle"
      aria-label="Scroll to Top"
      title="Scroll to Top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-[94px] right-6 z-40 h-12 w-12"
    >
      <ArrowUp size={22} strokeWidth={2.5} />
    </DynamicButton>
  );
}
