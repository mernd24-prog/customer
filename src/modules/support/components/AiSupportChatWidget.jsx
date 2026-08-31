import { useState, useRef, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  Ticket,
  Bot,
  User,
  ExternalLink,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  HelpCircle,
} from "lucide-react";

import { supportService } from "../services/supportService";
import { useSupportController } from "../controllers/useSupportController";
import { useAuthModal } from "../../auth/context/AuthModalContext";

const QUICK_PROMPTS = [
  "📦 Where is my recent order?",
  "🔄 Return & Refund Policy",
  "💳 Payment Options & Issues",
  "⏱️ Shipping & Delivery Timelines",
  "🛡️ Warranty & Service Centers",
  "❌ How to cancel an order?",
];

const INITIAL_GREETING = {
  id: "welcome-msg",
  role: "assistant",
  text: "Hello! 👋 I'm your **SAM-GLOBAL AI Support Assistant**.\n\nAsk me anything about your orders, returns, payments, or store policies!",
  found: true,
  createdAt: new Date().toISOString(),
};

export default function AiSupportChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_GREETING]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [unreadPrompt, setUnreadPrompt] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const quickPromptsRef = useRef(null);

  const user = useSelector((state) => state.auth.current);
  const isSignedIn = Boolean(user);
  const { openAuthModal } = useAuthModal();
  const { handleOpenRaiseTicketModal } = useSupportController();
  const navigate = useNavigate();

  const scrollQuickPrompts = (direction) => {
    if (quickPromptsRef.current) {
      quickPromptsRef.current.scrollBy({
        left: direction === "left" ? -180 : 180,
        behavior: "smooth",
      });
    }
  };

  const handleQuickPromptsWheel = (e) => {
    if (quickPromptsRef.current && e.deltaY !== 0) {
      e.preventDefault();
      quickPromptsRef.current.scrollLeft += e.deltaY;
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const handleOpenAiChat = () => {
      setIsOpen(true);
      setUnreadPrompt(false);
    };
    window.addEventListener("open-ai-chat", handleOpenAiChat);
    return () => window.removeEventListener("open-ai-chat", handleOpenAiChat);
  }, []);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("ai-chat-toggle", { detail: { isOpen } }),
    );
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
      setUnreadPrompt(false);
    }
  }, [isOpen, messages, isTyping]);

  const handleSendMessage = useCallback(
    async (textToSend) => {
      const messageContent = (textToSend || inputText).trim();
      if (!messageContent || isTyping) return;

      const userMsg = {
        id: `user-${Date.now()}`,
        role: "user",
        text: messageContent,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputText("");
      setIsTyping(true);

      const historyPayload = messages
        .slice(-10)
        .filter((m) => m.id !== "welcome-msg")
        .map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          content: m.text,
        }));

      try {
        const response = await supportService.sendAiChatMessage(
          messageContent,
          historyPayload,
        );

        const aiData = response?.data || {};
        const assistantMsg = {
          id: `ai-${Date.now()}`,
          role: "assistant",
          text:
            aiData.reply ||
            "I'm sorry, I couldn't process that request at this moment.",
          found: aiData.found !== false,
          suggestedCategory: aiData.suggestedCategory || "ORDER_ISSUE",
          suggestedSubject:
            aiData.suggestedSubject || messageContent.slice(0, 70),
          suggestedMessage: aiData.suggestedMessage || messageContent,
          relevantLinks: Array.isArray(aiData.relevantLinks)
            ? aiData.relevantLinks
            : [],
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (error) {
        const fallbackErrorMsg = {
          id: `ai-err-${Date.now()}`,
          role: "assistant",
          text: "I am having trouble reaching the knowledge service right now. Would you like to raise a support ticket so our team can help you?",
          found: false,
          suggestedCategory: "OTHER",
          suggestedSubject: messageContent.slice(0, 70),
          suggestedMessage: messageContent,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, fallbackErrorMsg]);
      } finally {
        setIsTyping(false);
      }
    },
    [inputText, isTyping, messages],
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        ...INITIAL_GREETING,
        id: `welcome-${Date.now()}`,
      },
    ]);
  };

  const handleRaiseTicketFromChat = (msg) => {
    if (!isSignedIn) {
      openAuthModal?.();
      return;
    }

    handleOpenRaiseTicketModal({
      category: msg.suggestedCategory || "ORDER_ISSUE",
      subject: msg.suggestedSubject || "Inquiry from AI Chat",
      message: msg.suggestedMessage || msg.text || "",
    });

    setIsOpen(false);
  };

  const renderMessageContent = (text = "") => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="font-semibold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5">
        {unreadPrompt && !isOpen && (
          <div className="relative animate-bounce rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-[#1B1D60] shadow-xl border border-[#E7D9B8] flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#CE9F2D]" />
            <span>Need Help? Chat with AI</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setUnreadPrompt(false);
              }}
              className="ml-1 text-gray-400 hover:text-gray-600 transition"
              aria-label="Dismiss prompt"
            >
              <X size={13} />
            </button>
          </div>
        )}

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="group relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#1B1D60] via-[#242777] to-[#1B1D60] text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-[#CE9F2D]/40"
          aria-label="Toggle AI Support Chat"
        >
          {isOpen ? (
            <ChevronDown
              size={28}
              className="transition-transform duration-200"
            />
          ) : (
            <>
              <Bot
                size={28}
                className="transition-transform duration-200 group-hover:scale-110"
              />
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#CE9F2D] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-[#CE9F2D] border-2 border-white"></span>
              </span>
            </>
          )}
        </button>
      </div>

      {/* Floating Chat Modal / Drawer */}
      {isOpen && (
        <div className="fixed bottom-24 right-3 sm:right-6 z-50 flex h-[600px] max-h-[86vh] w-[calc(100vw-1.5rem)] sm:w-[420px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-[#1B1D60] to-[#252877] px-4 py-3.5 text-white shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-[#CE9F2D] ring-2 ring-white/20">
                <Bot size={22} />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#1B1D60]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-tight text-white">
                    AI Support Assistant
                  </h3>
                  <span className="flex items-center gap-1 rounded bg-[#CE9F2D]/25 px-1.5 py-0.5 text-[10px] font-bold text-[#F5C72E]">
                    <Sparkles size={10} />
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-gray-300 font-medium">
                  {isSignedIn
                    ? `Hi ${user?.name?.split(" ")[0] || "there"}, how can we help?`
                    : "Instant grounded answers 24/7"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-gray-300">
              <button
                type="button"
                onClick={handleResetChat}
                title="Restart chat"
                className="rounded-lg p-1.5 hover:bg-white/15 hover:text-white transition"
              >
                <RotateCcw size={16} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="rounded-lg p-1.5 hover:bg-white/15 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-4 space-y-4 [scrollbar-width:thin]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    msg.role === "user"
                      ? "bg-[#1B1D60] text-white"
                      : "bg-[#F5C72E]/20 text-[#1B1D60] border border-[#CE9F2D]/40"
                  }`}
                >
                  {msg.role === "user" ? <User size={14} /> : <Bot size={15} />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`flex flex-col ${
                    msg.role === "user" ? "items-end" : "items-start"
                  } max-w-[82%]`}
                >
                  <div
                    className={`rounded-2xl px-4 py-3 text-xs sm:text-[13px] leading-relaxed shadow-sm ${
                      msg.role === "user"
                        ? "bg-[#1B1D60] text-white rounded-tr-none font-medium"
                        : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-none"
                    }`}
                  >
                    <div className="whitespace-pre-line break-words">
                      {renderMessageContent(msg.text)}
                    </div>

                    {/* Relevant Quick Links */}
                    {msg.role === "assistant" &&
                      msg.relevantLinks &&
                      msg.relevantLinks.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                          {msg.relevantLinks.map((link, idx) => (
                            <Link
                              key={idx}
                              to={link.url}
                              onClick={() => setIsOpen(false)}
                              className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-[#946A0B] border border-amber-200/60 hover:bg-amber-100 transition"
                            >
                              <span>{link.label}</span>
                              <ExternalLink size={10} />
                            </Link>
                          ))}
                        </div>
                      )}
                  </div>

                  {/* Escalation CTA (When answer is not found or user wants human agent) */}
                  {msg.role === "assistant" && msg.found === false && (
                    <div className="mt-2.5 w-full rounded-xl border border-amber-200 bg-amber-50 p-3.5 shadow-sm">
                      <div className="flex items-start gap-2.5">
                        <HelpCircle
                          size={17}
                          className="mt-0.5 text-[#CE9F2D] shrink-0"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            Need human assistance?
                          </p>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-normal">
                            Our customer care specialists are ready to help
                            resolve this issue.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRaiseTicketFromChat(msg)}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#CE9F2D] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#B88B22] active:scale-[0.98]"
                      >
                        <Ticket size={14} />
                        <span>Raise a Support Ticket</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Prominent Real-time Thinking / Loading State */}
            {isTyping && (
              <div className="flex gap-2.5 items-start">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F5C72E]/20 text-[#1B1D60] border border-[#CE9F2D]/40">
                  <Bot size={15} />
                </div>
                <div className="rounded-2xl rounded-tl-none border border-slate-200 bg-white px-4 py-3 shadow-sm max-w-[82%]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700">
                      Searching knowledge & order records
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#CE9F2D] animate-bounce"></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-[#CE9F2D] animate-bounce [animation-delay:0.2s]"></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-[#CE9F2D] animate-bounce [animation-delay:0.4s]"></span>
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Loader2
                      size={12}
                      className="animate-spin text-[#1B1D60]"
                    />
                    <span>Preparing verified answer...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          {messages.length <= 2 && !isTyping && (
            <div className="border-t border-slate-100 bg-white px-3.5 py-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Frequently Asked Questions
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => scrollQuickPrompts("left")}
                    aria-label="Scroll left"
                    title="Scroll left"
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition"
                  >
                    <ChevronLeft size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollQuickPrompts("right")}
                    aria-label="Scroll right"
                    title="Scroll right"
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition"
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>

              <div
                ref={quickPromptsRef}
                onWheel={handleQuickPromptsWheel}
                className="flex gap-1.5 overflow-x-auto pb-1 pt-0.5 scroll-smooth [scrollbar-width:thin] [scrollbar-color:#E2E8F0_transparent]"
              >
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() =>
                      handleSendMessage(prompt.replace(/^[^\s]+\s/, ""))
                    }
                    className="shrink-0 whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:border-[#CE9F2D] hover:bg-amber-50 hover:text-[#1B1D60] transition cursor-pointer active:scale-95"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Footer */}
          <div className="border-t border-slate-200 bg-white p-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-[#F8FAFC] px-3.5 py-2 focus-within:border-[#CE9F2D] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#CE9F2D]/20 transition">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isTyping
                    ? "AI is responding..."
                    : "Ask about orders, returns, payments..."
                }
                disabled={isTyping}
                className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isTyping}
                aria-label="Send message"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1B1D60] text-white transition hover:bg-[#252877] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isTyping ? (
                  <Loader2 size={15} className="animate-spin text-white" />
                ) : (
                  <Send size={14} />
                )}
              </button>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 px-1 font-medium">
              <span>SAM-GLOBAL AI Assistant</span>
              <span>Grounded on Verified Store Policies</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
