import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Headphones, Paperclip, Send, UserRound } from "lucide-react";

import Seo from "../../../components/ui/Seo";
import ApiState from "../../../components/ui/ApiState";
import Breadcrumbs from "../../../components/ecommerce/Breadcrumbs";
import AppErrorBoundary from "../../../components/ui/AppErrorBoundary";
import Button from "../../../components/ui/buttons/Button";
import { useAuthModal } from "../../../features/auth/AuthModalContext";
import { useSelector } from "react-redux";
import { SUPPORT_BREADCRUMBS } from "../../../data/supportPage";
import { supportService } from "../services/supportService";
import { normalizeSupportQueries } from "../utils/supportUtils";

const statusLabel = (status = "") =>
  String(status || "pending")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const statusClass = (status = "") => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "resolved" || normalized === "closed") {
    return "border-green-200 bg-green-50 text-green-700";
  }
  if (normalized === "in_progress") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }
  return "border-[#E7D9B8] bg-[#FFF9EA] text-[#8A640D]";
};

function ChatBubble({ align = "left", name, time, children, tone = "default" }) {
  const isRight = align === "right";
  const bubbleClass = isRight
    ? "bg-[#1B1D60] text-white rounded-br-[4px]"
    : tone === "system"
      ? "border border-[#E7D9B8] bg-[#FFF9EA] text-[#4E4E4E]"
      : "border border-[#E7D9B8] bg-white text-[#2E2E2E] rounded-bl-[4px]";
  const Icon = isRight ? UserRound : Headphones;

  return (
    <div className={`flex gap-2 sm:gap-3 ${isRight ? "justify-end" : "justify-start"}`}>
      {!isRight && tone !== "system" ? (
        <span className="mt-5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F7EED8] text-[#CE9F2D]">
          <Icon size={18} />
        </span>
      ) : null}
      <div className={`flex max-w-[78%] flex-col ${isRight ? "items-end" : "items-start"}`}>
        {tone !== "system" ? (
          <div className={`mb-1 flex items-center gap-2 text-[11px] font-semibold ${isRight ? "text-[#666666]" : "text-[#1B1D60]"}`}>
            <span>{name}</span>
            {time ? <span className="font-medium text-[#8A8F9C]">{time}</span> : null}
          </div>
        ) : null}
        <div className={`whitespace-pre-wrap break-words rounded-[18px] px-4 py-3 text-sm leading-6 shadow-sm ${bubbleClass}`}>
          {children}
        </div>
      </div>
      {isRight ? (
        <span className="mt-5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1B1D60] text-white">
          <Icon size={18} />
        </span>
      ) : null}
    </div>
  );
}

export default function SupportTicketDetailsPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { openAuthModal } = useAuthModal();
  const user = useSelector((state) => state.auth.current);
  const [ticket, setTicket] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(Boolean(ticketId));
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [error, setError] = useState("");

  const breadcrumbs = useMemo(
    () => [
      ...SUPPORT_BREADCRUMBS,
      { label: "Ticket Details" },
    ],
    [],
  );

  useEffect(() => {
    if (!user) {
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
        const normalized = normalizeSupportQueries([result?.data]).filter(Boolean);
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
  }, [ticketId, user]);

  useEffect(() => {
    if (!user) return;

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
  }, [user]);

  const conversationItems = useMemo(() => {
    if (!ticket) return [];
    const items = [
      {
        type: "customer",
        body: ticket.message || "No message provided.",
        time: ticket.createdAt,
      },
    ];

    ticket.messages.forEach((message, index) => {
      items.push({
        type: message.senderType === "admin" || message.sender === "admin" ? "support" : "customer",
        body: message.message || message.body || message.text || "",
        time: message.createdAt || message.created_at || message.sentAt || "",
        key: `message-${index}`,
      });
    });

    if (ticket.adminNotes) {
      items.push({
        type: "support",
        body: ticket.adminNotes,
        time: ticket.updatedAt,
        key: "admin-notes",
      });
    }

    return items.filter((item) => item.body);
  }, [ticket]);

  return (
    <AppErrorBoundary>
      <Seo
        title={`${ticket?.subject || "Ticket Details"} | Sam Global Support`}
        description="View your Sam Global support ticket details and status history."
      />

      <main className="main-container p-0 sm:px-6 sm:py-6 lg:px-0 lg:py-8">
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

        {!user ? (
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
              { type: "box", width: "100%", height: "140px", className: "mt-5" },
              { type: "box", width: "100%", height: "240px", className: "mt-5" },
            ]}
            skeletonContainerClass="mt-6"
          >
            {ticket && (
              <div className="mt-6 grid h-[calc(100vh-210px)] min-h-[520px] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
                <section className="flex min-h-0 flex-col overflow-hidden rounded-[14px] border border-[#E7D9B8] bg-white shadow-sm">
                  <div className="flex items-center gap-3 border-b border-[#E7D9B8] bg-[#1B1D60] px-4 py-4 text-white sm:px-5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/12">
                      <Headphones size={22} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-2">
                        <h1 className="truncate text-base font-extrabold sm:text-lg">
                          Sam Global Support
                        </h1>
                        <span
                          className={`hidden rounded-full border px-2.5 py-1 text-[11px] font-bold sm:inline-flex ${statusClass(ticket.status)} bg-white`}
                        >
                          {statusLabel(ticket.status)}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs font-medium text-white/75">
                        {ticket.subject} · {ticket.categoryLabel || ticket.category}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate("/support")}
                      className="hidden h-9 rounded-[8px] border border-white/20 px-3 text-xs font-bold text-white hover:bg-white/10 sm:block"
                    >
                      Support Center
                    </button>
                  </div>

                  <div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-[#FFFCF6] px-3 py-5 sm:px-5 sm:py-6 custom-scrollbar">
                    {conversationItems.map((item, index) => (
                      <ChatBubble
                        key={item.key || `${item.type}-${index}`}
                        align={item.type === "customer" ? "right" : "left"}
                        name={item.type === "customer" ? "You" : "Sam Global Support"}
                        time={item.time}
                      >
                        {item.body}
                      </ChatBubble>
                    ))}

                    {Array.isArray(ticket.statusHistory) && ticket.statusHistory.length
                      ? ticket.statusHistory
                          .filter((item) => item.note)
                          .map((item, index) => (
                            <ChatBubble
                              key={`${item.status}-${item.changedAt || index}`}
                              name="Sam Global Support"
                              time={item.changedAt}
                            >
                              {item.note}
                            </ChatBubble>
                          ))
                      : null}
                  </div>

                  <div className="border-t border-[#E7D9B8] bg-white p-3 sm:p-4">
                    <div className="flex items-center gap-2 rounded-full border border-[#E7D9B8] bg-[#F8F8F8] px-3 py-2">
                      <Paperclip size={18} className="shrink-0 text-[#8A8F9C]" />
                      <div className="min-w-0 flex-1 px-1 text-sm font-medium text-[#8A8F9C]">
                        Replies from customer will be available soon
                      </div>
                      <button
                        type="button"
                        disabled
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#D8D8D8] text-white"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                </section>

                <aside className="flex min-h-0 flex-col overflow-hidden rounded-[14px] border border-[#E7D9B8] bg-white shadow-sm">
                  <div className="border-b border-[#E7D9B8] bg-[#F7EED8] px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-extrabold text-[#1B1D60]">All Tickets</h2>
                        <p className="mt-1 text-xs font-semibold text-[#666666]">
                          {tickets.length ? `${tickets.length} tickets` : "No tickets"}
                        </p>
                      </div>
                      {ticket.resolvedAt ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-[#117A65]">
                          <CheckCircle2 size={12} />
                          Resolved
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto p-2 custom-scrollbar">
                    {ticketsLoading ? (
                      <div className="space-y-2 p-2">
                        {[1, 2, 3].map((item) => (
                          <div key={item} className="h-16 animate-pulse rounded-[10px] bg-[#F7EED8]" />
                        ))}
                      </div>
                    ) : tickets.length ? (
                      tickets.map((item) => {
                        const active = String(item.id) === String(ticket.id);
                        return (
                          <Link
                            key={item.id}
                            to={`/support/tickets/${encodeURIComponent(item.id)}`}
                            className={`block rounded-[10px] px-3 py-3 transition ${
                              active ? "bg-[#1B1D60] text-white" : "hover:bg-[#FFF9EA]"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className={`truncate text-sm font-bold ${active ? "text-white" : "text-[#1B1D60]"}`}>
                                  {item.subject}
                                </p>
                                <p className={`mt-1 truncate text-xs font-medium ${active ? "text-white/70" : "text-[#666666]"}`}>
                                  {item.categoryLabel} · {item.updatedAt}
                                </p>
                              </div>
                              <span
                                className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                                  active ? "border-white/40 bg-white/10 text-white" : statusClass(item.status)
                                }`}
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
