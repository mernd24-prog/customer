import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Headphones,
  Send,
  UserRound,
} from "lucide-react";

import Seo from "../../../components/ui/Seo";
import ApiState from "../../../components/ui/ApiState";
import Breadcrumbs from "../../../components/ecommerce/Breadcrumbs";
import AppErrorBoundary from "../../../components/ui/AppErrorBoundary";
import Button from "../../../components/ui/buttons/Button";
import { useAuthModal } from "../../auth/context/AuthModalContext";
import { useSelector } from "react-redux";
import { SUPPORT_BREADCRUMBS } from "../../../data/supportPage";
import { supportService } from "../services/supportService";
import {
  formatSupportDate,
  normalizeSupportQueries,
} from "../utils/supportUtils";

const statusLabel = (status = "") =>
  String(status || "pending")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const statusClass = (status = "") => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "resolved" || normalized === "closed") {
    return "border border-emerald-300/70 bg-emerald-50 text-emerald-700 shadow-2xs";
  }
  if (normalized === "in_progress") {
    return "border border-sky-300/70 bg-sky-50 text-sky-700 shadow-2xs";
  }
  return "border border-amber-300/70 bg-amber-50 text-amber-800 shadow-2xs";
};

function ChatBubble({
  align = "left",
  name,
  time,
  children,
  tone = "default",
  avatarUrl,
}) {
  const isRight = align === "right";
  const [imgError, setImgError] = useState(false);
  const bubbleClass = isRight
    ? "bg-gradient-to-br from-[#1B1D60] to-[#2B2E85] text-white rounded-[20px] rounded-tr-[4px] shadow-sm border border-[#2B2E85]/40"
    : tone === "system"
      ? "border border-[#E7D9B8] bg-[#FFF9EA] text-[#4E4E4E] rounded-[18px]"
      : "border border-[#E5DEC9] bg-white text-[#2D3142] rounded-[20px] rounded-tl-[4px] shadow-xs";
  const Icon = isRight ? UserRound : Headphones;

  return (
    <div
      className={`flex gap-2.5 sm:gap-3 ${isRight ? "justify-end" : "justify-start"}`}
    >
      {!isRight && tone !== "system" ? (
        <span className="mt-5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#F3E6C8] bg-[#FDF8EB] text-[#C49216] shadow-2xs">
          <Icon size={18} />
        </span>
      ) : null}
      <div
        className={`flex max-w-[86%] sm:max-w-[78%] flex-col ${isRight ? "items-end" : "items-start"}`}
      >
        {tone !== "system" ? (
          <div
            className={`mb-1 flex items-center gap-2 text-[11px] font-semibold ${isRight ? "text-[#717684]" : "text-[#1B1D60]"}`}
          >
            <span>{name}</span>
            {time ? (
              <span className="font-medium text-[#9AA0AF]">{time}</span>
            ) : null}
          </div>
        ) : null}
        <div
          className={`whitespace-pre-wrap break-words px-4 py-3 text-sm leading-6 ${bubbleClass}`}
        >
          {children}
        </div>
      </div>
      {isRight ? (
        avatarUrl && !imgError ? (
          <img
            src={avatarUrl}
            alt={name}
            onError={() => setImgError(true)}
            className="mt-5 h-9 w-9 shrink-0 rounded-full object-cover border border-[#CE9F2D]/40 shadow-xs ring-2 ring-[#CE9F2D]/15"
          />
        ) : (
          <span className="mt-5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1B1D60] text-white shadow-xs">
            <Icon size={18} />
          </span>
        )
      ) : null}
    </div>
  );
}

export default function SupportTicketDetailsPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { openAuthModal } = useAuthModal();
  const currentUser = useSelector((state) => state.auth.current);
  const profileUser =
    useSelector((state) => state.user?.current) || currentUser;
  const [ticket, setTicket] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(Boolean(ticketId));
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [error, setError] = useState("");
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const userAvatar =
    profileUser?.profile?.avatarUrl ||
    profileUser?.profile?.avatar ||
    currentUser?.profile?.avatarUrl ||
    currentUser?.profile?.avatar ||
    currentUser?.avatar ||
    currentUser?.profileImage ||
    "/image/png/person.png";

  const chatContainerRef = useRef(null);

  const breadcrumbs = useMemo(
    () => [...SUPPORT_BREADCRUMBS, { label: "Ticket Details" }],
    [],
  );

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError("");

    supportService
      .fetchSupportTicket(ticketId)
      .then((result) => {
        if (!active) return;
        const normalized = normalizeSupportQueries([result?.data]).filter(
          Boolean,
        );
        setTicket(normalized[0] || null);
      })
      .catch((err) => {
        if (!active) return;
        setError(err?.message || "Unable to load this support ticket.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [ticketId, currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    let active = true;
    setTicketsLoading(true);

    supportService
      .fetchSupportQueries("", 30)
      .then((result) => {
        if (!active) return;
        setTickets(normalizeSupportQueries(result.data));
      })
      .catch(() => {
        if (active) setTickets([]);
      })
      .finally(() => {
        if (active) setTicketsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [currentUser]);

  const conversationItems = useMemo(() => {
    if (!ticket) return [];
    const items = [];
    const seen = new Set();

    const addMessage = (item) => {
      const normalizedBody = (item.body || "").trim();
      if (!normalizedBody) return;
      if (seen.has(normalizedBody)) return;
      seen.add(normalizedBody);
      items.push(item);
    };

    addMessage({
      type: "customer",
      body: ticket.message || "No message provided.",
      time: ticket.createdAt,
      timestamp: ticket.rawCreatedAt || ticket.createdAt,
      key: "initial-message",
    });

    (ticket.messages || []).forEach((message, index) => {
      addMessage({
        type:
          message.senderType === "admin" || message.sender === "admin"
            ? "support"
            : "customer",
        body: message.message || message.body || message.text || "",
        time: message.createdAt || formatSupportDate(message.rawCreatedAt),
        timestamp:
          message.rawCreatedAt ||
          message.createdAt ||
          message.created_at ||
          message.sentAt,
        key: `message-${index}`,
      });
    });

    if (Array.isArray(ticket.statusHistory)) {
      ticket.statusHistory.forEach((historyItem, index) => {
        if (historyItem.note) {
          addMessage({
            type: "support",
            body: historyItem.note,
            time: historyItem.changedAt,
            timestamp: historyItem.rawChangedAt || historyItem.changedAt,
            key: `status-note-${index}`,
          });
        }
      });
    }

    if (ticket.adminNotes) {
      addMessage({
        type: "support",
        body: ticket.adminNotes,
        time: ticket.updatedAt,
        timestamp: ticket.rawUpdatedAt || ticket.updatedAt,
        key: "admin-notes",
      });
    }

    return items.sort((first, second) => {
      const firstTime = new Date(first.timestamp || 0).getTime();
      const secondTime = new Date(second.timestamp || 0).getTime();
      return firstTime - secondTime;
    });
  }, [ticket]);

  const prevTicketIdRef = useRef(ticketId);

  useEffect(() => {
    if (prevTicketIdRef.current !== ticketId) {
      prevTicketIdRef.current = ticketId;
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = 0;
      }
    }
  }, [ticketId]);

  useEffect(() => {
    if (chatContainerRef.current && prevTicketIdRef.current === ticketId) {
      // Keep scroll at top on initial load/ticket change, unless reply sent
    }
  }, [conversationItems, ticketId]);

  const handleSendReply = async (e) => {
    if (e) e.preventDefault();
    const text = replyText.trim();
    if (!text || sendingReply || !ticket) return;

    try {
      setSendingReply(true);
      await supportService.sendReply(ticket.id || ticketId, text);
      setReplyText("");
      const result = await supportService.fetchSupportTicket(
        ticket.id || ticketId,
      );
      const normalized = normalizeSupportQueries([result?.data]).filter(
        Boolean,
      );
      if (normalized[0]) {
        setTicket(normalized[0]);
      }
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop =
            chatContainerRef.current.scrollHeight;
        }
      }, 60);
    } catch (err) {
      console.error("Failed to send reply:", err);
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <AppErrorBoundary>
      <Seo
        title={`${ticket?.subject || "Ticket Details"} | Sam Global Support`}
        description="View your Sam Global support ticket details and status history."
      />

      <main className="main-container p-0 mt-6 sm:px-6 sm:py-6 lg:px-0 lg:py-8">
        <Breadcrumbs items={breadcrumbs} />

        <div className="mt-5">
          <Link
            to="/support"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#1B1D60] hover:text-[#CE9F2D]"
          >
            <ArrowLeft size={17} />
            Back to Support
          </Link>
        </div>

        {!currentUser ? (
          <section className="mt-6 rounded-[12px] border border-[#E7D9B8] bg-white p-6 text-center">
            <h1 className="text-xl font-bold text-[#1B1D60]">Login required</h1>
            <p className="mx-auto mt-2 max-w-xl text-sm text-[#666666]">
              Please login to view your support ticket.
            </p>
            <Button
              type="button"
              onClick={openAuthModal}
              className="mt-5 h-11 rounded-[10px] bg-[#CE9F2D] px-6 text-sm font-bold text-white hover:bg-[#B88200]"
            >
              Login to Continue
            </Button>
          </section>
        ) : (
          <ApiState
            loading={loading}
            error={error}
            empty={!loading && !error && !ticket}
            emptyTitle="Ticket not found"
            emptyText="This support ticket is unavailable or no longer exists."
            skeletonLayout={[
              { type: "box", width: "45%", height: "34px" },
              {
                type: "box",
                width: "100%",
                height: "140px",
                className: "mt-5",
              },
              {
                type: "box",
                width: "100%",
                height: "240px",
                className: "mt-5",
              },
            ]}
            skeletonContainerClass="mt-6"
          >
            {ticket && (
              <div className="mt-4 sm:mt-6 grid gap-4 sm:gap-5 lg:h-[calc(100vh-210px)] lg:min-h-[520px] lg:grid-cols-[minmax(0,1fr)_360px]">
                <section className="flex h-[calc(100vh-220px)] min-h-[450px] flex-col overflow-hidden rounded-[14px] border border-[#E3DCCE] bg-white shadow-sm lg:h-auto lg:min-h-0">
                  <div className="flex items-center gap-2.5 border-b border-white/10 bg-gradient-to-r from-[#111538] via-[#1B1D60] to-[#252875] px-3.5 py-3.5 text-white sm:gap-3 sm:px-5 sm:py-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 backdrop-blur-xs text-[#F5C451] shadow-2xs sm:h-11 sm:w-11">
                      <Headphones size={20} className="sm:hidden" />
                      <Headphones size={22} className="hidden sm:block" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-2">
                        <h1 className="truncate text-sm font-bold tracking-tight text-white sm:text-lg">
                          Sam Global Support
                        </h1>
                        <span
                          className={`inline-flex items-center shrink-0 whitespace-nowrap rounded-full px-2.5 py-[8px] text-[10px] sm:text-[11px] font-semibold leading-none ${statusClass(ticket.status)}`}
                        >
                          {statusLabel(ticket.status)}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-[11px] font-medium text-white/80 sm:text-xs">
                        {ticket.subject} ·{" "}
                        {ticket.categoryLabel || ticket.category}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate("/support")}
                      className="hidden h-9 rounded-[10px] border border-white/25 bg-white/10 px-3.5 text-xs font-semibold text-white transition hover:bg-white/20 active:scale-95 sm:block"
                    >
                      Support Center
                    </button>
                  </div>

                  <div
                    ref={chatContainerRef}
                    className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[#F8F7F4] px-3 py-4 sm:space-y-5 sm:px-5 sm:py-6 custom-scrollbar"
                  >
                    {conversationItems.map((item, index) => (
                      <ChatBubble
                        key={item.key || `${item.type}-${index}`}
                        align={item.type === "customer" ? "right" : "left"}
                        name={
                          item.type === "customer"
                            ? "You"
                            : "Sam Global Support"
                        }
                        time={item.time}
                        avatarUrl={item.type === "customer" ? userAvatar : null}
                      >
                        {item.body}
                      </ChatBubble>
                    ))}
                  </div>

                  <form
                    onSubmit={handleSendReply}
                    className="sticky bottom-0 z-10 border-t border-[#E3DCCE] bg-white p-2.5 sm:p-4"
                  >
                    <div className="flex items-center gap-2 rounded-full border border-[#DDD8C9] bg-[#F5F4F0] px-3.5 py-2 transition-all focus-within:border-[#CE9F2D] focus-within:bg-white focus-within:ring-3 focus-within:ring-[#CE9F2D]/15">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your message to support..."
                        disabled={sendingReply}
                        className="min-w-0 flex-1 border-none bg-transparent px-1.5 text-xs text-[#1E2338] placeholder-[#8A8F9C] outline-none shadow-none focus:border-none focus:outline-none focus:ring-0 sm:text-sm disabled:opacity-60"
                      />
                      <button
                        type="submit"
                        disabled={!replyText.trim() || sendingReply}
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all sm:h-9 sm:w-9 ${
                          replyText.trim() && !sendingReply
                            ? "bg-gradient-to-r from-[#CE9F2D] to-[#B88200] text-white hover:brightness-105 shadow-sm active:scale-95"
                            : "bg-[#DCDAD2] text-white cursor-not-allowed"
                        }`}
                        title="Send reply"
                      >
                        <Send size={15} />
                      </button>
                    </div>
                  </form>
                </section>

                <aside className="hidden min-h-0 flex-col overflow-hidden rounded-[14px] border border-[#E3DCCE] bg-white shadow-sm lg:flex">
                  <div className="border-b border-[#E3DCCE] bg-gradient-to-r from-[#FAF6ED] to-[#F3EAD7] px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-base font-extrabold text-[#1B1D60]">
                          All Tickets
                        </h2>
                        <p className="mt-0.5 text-xs font-semibold text-[#666666]">
                          {tickets.length
                            ? `${tickets.length} tickets`
                            : "No tickets"}
                        </p>
                      </div>
                      {ticket.resolvedAt ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/80 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 shadow-2xs">
                          <CheckCircle2 size={12} />
                          Resolved
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto p-2.5 custom-scrollbar">
                    {ticketsLoading ? (
                      <div className="space-y-2 p-2">
                        {[1, 2, 3].map((item) => (
                          <div
                            key={item}
                            className="h-16 animate-pulse rounded-[10px] bg-[#F7EED8]"
                          />
                        ))}
                      </div>
                    ) : tickets.length ? (
                      tickets.map((item) => {
                        const active = String(item.id) === String(ticket.id);
                        return (
                          <Link
                            key={item.id}
                            to={`/support/tickets/${encodeURIComponent(item.id)}`}
                            className={`block rounded-[12px] border px-3.5 py-3 transition-all ${
                              active
                                ? "border-l-4 border-l-[#CE9F2D] border-y-[#E3DCCE] border-r-[#E3DCCE] bg-[#FFFBF3] shadow-xs"
                                : "border-transparent bg-transparent hover:bg-[#F9F7F1]"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p
                                  className={`truncate text-sm font-bold ${active ? "text-[#1B1D60]" : "text-[#2E3142]"}`}
                                >
                                  {item.subject}
                                </p>
                                <p className="mt-1 truncate text-xs font-medium text-[#717684]">
                                  {item.categoryLabel} · {item.updatedAt}
                                </p>
                              </div>
                              <span
                                className={`shrink-0 whitespace-nowrap rounded-full px-2 py-2 text-[10px] font-semibold leading-none ${statusClass(item.status)}`}
                              >
                                {statusLabel(item.status)}
                              </span>
                            </div>
                          </Link>
                        );
                      })
                    ) : (
                      <p className="p-4 text-sm font-medium text-[#666666]">
                        No support tickets found.
                      </p>
                    )}
                  </div>
                </aside>
              </div>
            )}
          </ApiState>
        )}
      </main>
    </AppErrorBoundary>
  );
}
