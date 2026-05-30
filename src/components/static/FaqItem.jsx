import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "../../utils/classNames";

export default function FaqItem({ item, index }) {
  const [open, setOpen] = useState(false);
  const titleId = `faq-title-${index}`;
  const panelId = `faq-panel-${index}`;

  return (
    <article className="group rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl focus-within:border-accent focus-within:outline-none">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-start justify-between gap-4 text-left"
        onClick={() => setOpen((value) => !value)}
      >
        <span id={titleId} className="custom-h5 text-slate-950">
          {item.question}
        </span>
        <ChevronDown
          className={cn("transition-all duration-300 ease-in-out", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={titleId}
        className={cn(
          "mt-4 overflow-hidden transition-all duration-300 ease-in-out",
          open ? "max-h-80" : "max-h-0",
        )}
      >
        <p className="custom-para leading-relaxed text-slate-600">
          {item.answer}
        </p>
      </div>
    </article>
  );
}
