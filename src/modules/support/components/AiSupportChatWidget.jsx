import { useState, useRef, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  X,
  Send,
  Loader2,
  MessageCircle,
} from "lucide-react";

import { supportService } from "../services/supportService";
import { useSupportController } from "../controllers/useSupportController";
import { useAuthModal } from "../../auth/context/AuthModalContext";

const QUICK_PROMPTS = [
  "Where is my recent order?",
  "Return or refund",
  "Payment options",
  "Shipping & delivery",
];

const INITIAL_GREETING = {
  id: "welcome-msg",
  role: "assistant",
  text: "Hello! Welcome to **SAM-GLOBAL Support**.\n\nAsk me anything about your orders, returns, payments, delivery, or store policies.",
  found: true,
  createdAt: new Date().toISOString(),
};

/* Reusable support avatar */
function AgentAvatar({ size = "md" }) {
  const dim =
    size === "sm"
      ? "h-7 w-7 text-[11px]"
      : "h-10 w-10 text-sm";

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white ${dim}`}
      style={{
        background:
          "linear-gradient(135deg, #3E4093 0%, #1B1D60 100%)",
      }}
    >
      SG
    </div>
  );
}

export default function AiSupportChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_GREETING]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  /*
   * Authentication / support controller
   * These were accidentally removed from the previous update.
   */
  const user = useSelector((state) => state.auth.current);
  const isSignedIn = Boolean(user);

  const { openAuthModal } = useAuthModal();
  const { handleOpenRaiseTicketModal } = useSupportController();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  /*
   * Open chat from anywhere in the application
   */
  useEffect(() => {
    const handleOpenAiChat = () => {
      setIsOpen(true);
    };

    window.addEventListener(
      "open-ai-chat",
      handleOpenAiChat,
    );

    return () => {
      window.removeEventListener(
        "open-ai-chat",
        handleOpenAiChat,
      );
    };
  }, []);

  /*
   * Keep chat scrolled to the latest message
   */
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("ai-chat-toggle", {
        detail: { isOpen },
      }),
    );

    if (isOpen) {
      scrollToBottom();

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, messages, isTyping]);

  /*
   * Send message to AI support API
   */
  const handleSendMessage = useCallback(
    async (textToSend) => {
      const messageContent = (
        textToSend || inputText
      ).trim();

      if (!messageContent || isTyping) {
        return;
      }

      const userMsg = {
        id: `user-${Date.now()}`,
        role: "user",
        text: messageContent,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [
        ...prev,
        userMsg,
      ]);

      setInputText("");
      setIsTyping(true);

      const historyPayload = messages
        .slice(-10)
        .filter(
          (message) => message.id !== "welcome-msg",
        )
        .map((message) => ({
          role:
            message.role === "assistant"
              ? "model"
              : "user",
          content: message.text,
        }));

      try {
        const response =
          await supportService.sendAiChatMessage(
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

          suggestedCategory:
            aiData.suggestedCategory ||
            "ORDER_ISSUE",

          suggestedSubject:
            aiData.suggestedSubject ||
            messageContent.slice(0, 70),

          suggestedMessage:
            aiData.suggestedMessage ||
            messageContent,

          relevantLinks:
            Array.isArray(aiData.relevantLinks)
              ? aiData.relevantLinks
              : [],

          createdAt:
            new Date().toISOString(),
        };

        setMessages((prev) => [
          ...prev,
          assistantMsg,
        ]);
      } catch (error) {
        const fallbackErrorMsg = {
          id: `ai-err-${Date.now()}`,
          role: "assistant",

          text:
            "I'm having trouble reaching our system right now. Would you like to raise a support ticket so our team can help you directly?",

          found: false,

          suggestedCategory: "OTHER",

          suggestedSubject:
            messageContent.slice(0, 70),

          suggestedMessage: messageContent,

          createdAt:
            new Date().toISOString(),
        };

        setMessages((prev) => [
          ...prev,
          fallbackErrorMsg,
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [inputText, isTyping, messages],
  );

  /*
   * Enter key support
   */
  const handleKeyDown = (e) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /*
   * Raise support ticket
   */
  const handleRaiseTicketFromChat = (msg) => {
    if (!isSignedIn) {
      openAuthModal?.();
      return;
    }

    handleOpenRaiseTicketModal({
      category:
        msg.suggestedCategory ||
        "ORDER_ISSUE",

      subject:
        msg.suggestedSubject ||
        "Inquiry from Support Chat",

      message:
        msg.suggestedMessage ||
        msg.text ||
        "",
    });

    setIsOpen(false);
  };

  /*
   * Render basic markdown bold
   */
  const renderMessageContent = (text = "") => {
    const parts = text.split(
      /(\*\*.*?\*\*)/g,
    );

    return parts.map((part, index) => {
      if (
        part.startsWith("**") &&
        part.endsWith("**")
      ) {
        return (
          <strong
            key={index}
            className="font-semibold text-slate-900"
          >
            {part.slice(2, -2)}
          </strong>
        );
      }

      return part;
    });
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        type="button"
        onClick={() =>
          setIsOpen((prev) => !prev)
        }
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#1B1D60] text-white shadow-[0_8px_24px_rgba(27,29,96,0.28)] transition-colors hover:bg-[#252877] active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#1B1D60]/20"
        aria-label={
          isOpen
            ? "Close Support Chat"
            : "Open Support Chat"
        }
      >
        {isOpen ? (
          <X size={20} />
        ) : (
          <MessageCircle size={21} />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-3 sm:right-6 z-50 flex h-[570px] max-h-[84vh] w-[calc(100vw-1.5rem)] sm:w-[400px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.14)]">
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 text-white"
            style={{
              background:
                "linear-gradient(135deg, #1B1D60 0%, #3E4093 100%)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <AgentAvatar size="md" />

                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#1B1D60]" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-tight text-white">
                    SAM-GLOBAL Support
                  </h3>

                 
                </div>

                <p className="mt-0.5 text-[11px] font-medium text-blue-200">
                  {isSignedIn
                    ? `Hi ${
                        user?.name?.split(" ")[0] ||
                        "there"
                      }, how can we help?`
                    : "Typically replies instantly"}
                </p>
              </div>
            </div>

            {/* Only necessary header icon */}
            <button
              type="button"
              onClick={() =>
                setIsOpen(false)
              }
              title="Close"
              aria-label="Close Support Chat"
              className="rounded-lg p-1.5 text-blue-100 transition hover:bg-white/10 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-[#F7F8FC] px-3.5 py-3 space-y-3 [scrollbar-width:thin]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${
                  msg.role === "user"
                    ? "flex-row-reverse"
                    : "flex-row"
                }`}
              >
                {/* Avatar */}
                {msg.role === "user" ? (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[9px] font-bold text-slate-600">
                    YOU
                  </div>
                ) : (
                  <AgentAvatar size="sm" />
                )}

                <div
                  className={`flex max-w-[82%] flex-col ${
                    msg.role === "user"
                      ? "items-end"
                      : "items-start"
                  }`}
                >
                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed shadow-sm ${
                      msg.role === "user"
                        ? "rounded-tr-none bg-[#1B1D60] font-medium text-white"
                        : "rounded-tl-none border border-slate-200/80 bg-white text-slate-800"
                    }`}
                  >
                    <div className="whitespace-pre-line break-words">
                      {renderMessageContent(
                        msg.text,
                      )}
                    </div>

                    {/* Relevant Links */}
                    {msg.role ===
                      "assistant" &&
                      msg.relevantLinks &&
                      msg.relevantLinks.length >
                        0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-2.5">
                          {msg.relevantLinks.map(
                            (link, index) => (
                              <Link
                                key={index}
                                to={link.url}
                                onClick={() =>
                                  setIsOpen(false)
                                }
                                className="rounded-md border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-[#1B1D60] transition hover:bg-blue-100"
                              >
                                {link.label}
                              </Link>
                            ),
                          )}
                        </div>
                      )}
                  </div>

                  {/* Support CTA */}
                  {msg.role ===
                    "assistant" &&
                    msg.found === false && (
                      <div className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                        <p className="text-xs font-semibold text-slate-900">
                          Need more help?
                        </p>

                        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                          Our support team can
                          help you directly.
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            handleRaiseTicketFromChat(
                              msg,
                            )
                          }
                          className="mt-2.5 w-full rounded-lg bg-[#1B1D60] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#252877] active:scale-[0.98]"
                        >
                          Contact support team
                        </button>
                      </div>
                    )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start gap-2.5">
                <AgentAvatar size="sm" />

                <div className="rounded-2xl rounded-tl-none border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-medium text-slate-500">
                      Support is typing
                    </span>

                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />

                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0.15s]" />

                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0.3s]" />
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 2 &&
            !isTyping && (
              <div className="border-t border-slate-100 bg-white px-3.5 py-2.5">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Quick questions
                </p>

                <div className="grid grid-cols-2 gap-1.5">
                  {QUICK_PROMPTS.map(
                    (prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() =>
                          handleSendMessage(
                            prompt,
                          )
                        }
                        className="min-h-8 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-left text-[11px] font-medium leading-tight text-slate-600 transition hover:border-[#1B1D60]/30 hover:bg-[#1B1D60]/5 hover:text-[#1B1D60] active:scale-[0.98]"
                      >
                        {prompt}
                      </button>
                    ),
                  )}
                </div>
              </div>
            )}

          {/* Input */}
          <div className="border-t border-slate-100 bg-white p-3">
            <div className="flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 pl-4 pr-1.5 transition-all focus-within:border-[#1B1D60] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1B1D60]/10">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) =>
                  setInputText(
                    e.target.value,
                  )
                }
                onKeyDown={handleKeyDown}
                placeholder={
                  isTyping
                    ? "Waiting for response..."
                    : "Type your message..."
                }
                disabled={isTyping}
                className="h-full w-full min-w-0 flex-1 !border-0 !border-none !bg-transparent !p-0 text-sm text-slate-800 placeholder:text-slate-400 !outline-none !ring-0 !shadow-none focus:!border-none focus:!outline-none focus:!ring-0 focus-visible:!outline-none focus-visible:!ring-0 disabled:opacity-50"
              />

              <button
                type="button"
                onClick={() =>
                  handleSendMessage()
                }
                disabled={
                  isTyping ||
                  !inputText.trim()
                }
                aria-label="Send message"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1B1D60] text-white transition-colors hover:bg-[#252877] active:scale-95 disabled:opacity-40"
              >
                {isTyping ? (
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />
                ) : (
                  <Send
                    size={13}
                    className="ml-0.5"
                  />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}