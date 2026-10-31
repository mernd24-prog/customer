import { useState, useEffect, useLayoutEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
import { formatPageTitle } from "../../../utils/common";
import {
  getProductTitle,
  getImageUrlFromValue,
} from "../../../utils/ecommerce";
import { capitalizeFirst } from "../../../utils/stringUtils";
import { ProductGallery } from "../components/ImageGallery";
import HorizontalScrollControls from "../../../components/ui/HorizontalScrollControls";

const decodeHtml = (html) => {
  if (!html || typeof html !== "string") return html || "";
  if (html.includes("&lt;") && html.includes("&gt;")) {
    return html
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }
  return html;
};

const normalizeDescriptionHtml = (html) => {
  if (!html || typeof html !== "string") return "";

  let normalized = html.trim();
  const emptyBlockPattern =
    /<(p|div|section|article|h[1-6])(?:\s[^>]*)?>\s*(?:&nbsp;|&#160;|<br\s*\/?\s*>|\s)*\s*<\/\1>/gi;

  let previous;
  do {
    previous = normalized;
    normalized = normalized.replace(emptyBlockPattern, "");
  } while (normalized !== previous);

  normalized = normalized
    .replace(/^(?:\s|&nbsp;|&#160;|<br\s*\/?\s*>)+/gi, "")
    .replace(/(?:\s|&nbsp;|&#160;|<br\s*\/?\s*>)+$/gi, "");

  return normalized.trim();
};

function ProductDescription({ content }) {
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    const el = contentRef.current;
    if (el) {
      setCanExpand(el.scrollHeight > 260);
    }
  }, [content]);

  if (!content) return null;

  return (
    <div className="w-full text-ink">
      <div
        ref={contentRef}
        className={`rich-text-content w-full min-w-0 max-w-none text-sm sm:text-base leading-relaxed text-ink transition-[max-height] duration-300 ${
          !expanded && canExpand ? "max-h-[220px] overflow-hidden" : ""
        }`}
        dangerouslySetInnerHTML={{ __html: normalizeDescriptionHtml(content) }}
      />
      {canExpand && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-navy hover:text-[#CE9F2D] transition-colors"
        >
          <span>{expanded ? "Read Less" : "Read More"}</span>
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      )}
    </div>
  );
}

export default function ProductInfoSection({
  detailRows = [],
  warranty,
  product = {},
  selectedVariant,
  effectiveDescription,
}) {
  const [cardOpen, setCardOpen] = useState(true);
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(null);

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const measure = () => setContentHeight(content.getBoundingClientRect().height);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    return () => observer.disconnect();
  }, []);
  const [activeTab, setActiveTab] = useState("specs");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const effectiveWarranty =
    warranty?.warrantyDetails || warranty || product?.warranty || {};
  const rawPeriodCount = Number(effectiveWarranty.period);
  const hasValidPeriod =
    effectiveWarranty.period !== null &&
    effectiveWarranty.period !== undefined &&
    effectiveWarranty.period !== "" &&
    !isNaN(rawPeriodCount) &&
    rawPeriodCount >= 1;
  const hasWarranty =
    effectiveWarranty.enabled !== false &&
    hasValidPeriod &&
    [effectiveWarranty.periodUnit, effectiveWarranty.type, effectiveWarranty.provider].every(
      (v) => Boolean(String(v || "").trim()),
    );

  const warrantyPeriod = hasValidPeriod
    ? [effectiveWarranty.period, effectiveWarranty.periodUnit]
        .filter((v) => v !== null && v !== undefined && v !== "")
        .join(" ")
    : "";
  const returnPolicy = effectiveWarranty.returnPolicy || {};

  const hasDescription = Boolean(
    effectiveDescription ||
      selectedVariant?.description ||
      product?.description,
  );
  const hasDetails = detailRows.length > 0;
  const hasCatalogueImages = Boolean(product?.commonImages?.length);

  // Available tabs
  const tabs = useMemo(() => {
    const list = [];
    if (hasDetails) list.push({ key: "specs", label: "Specifications" });
    if (hasDescription) list.push({ key: "desc", label: "Description" });
    list.push({ key: "warranty", label: "Warranty & Returns" });
    if (hasCatalogueImages) list.push({ key: "catalogue", label: "Catalogue" });
    if (product.seller || product.sellerName)
      list.push({ key: "seller", label: "Seller Information" });
    return list;
  }, [hasDetails, hasDescription, product.seller, product.sellerName, hasCatalogueImages]);

  // Set default active tab
  useEffect(() => {
    if (tabs.length > 0 && !tabs.some((t) => t.key === activeTab)) {
      setActiveTab(tabs[0].key);
    }
  }, [tabs, activeTab]);

  const visibleSpecs = detailRows;

  return (
    <div className="product-details-accordion min-w-0 border border-border rounded-lg overflow-hidden bg-white shadow-xs">
      {/* ── Flipkart-style Header: Title + Subtitle + Square Chevron Button ── */}
      <button
        type="button"
        onClick={() => setCardOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-5 py-2 bg-white hover:bg-surface-soft transition-colors text-left"
        aria-expanded={cardOpen}
      >
        <div>
          <h3 className="text-base sm:text-lg font-bold text-ink">
            All details
          </h3>
        </div>
        <div className="w-8 h-8 rounded-lg bg-cream hover:bg-cream-strong flex items-center justify-center text-ink transition-colors shrink-0 ml-3">
          <ChevronDown
            size={18}
            className={`product-details-chevron ${cardOpen ? "rotate-180" : "rotate-0"}`}
          />
        </div>
      </button>

      <div
        className="product-details-content overflow-hidden"
        style={{
          height: cardOpen ? (contentHeight ?? "auto") : 0,
        }}
        aria-hidden={!cardOpen}
        inert={cardOpen ? undefined : ""}
      >
        <div ref={contentRef} className="min-h-0 min-w-0 overflow-hidden">
        <div className="min-w-0 p-2 sm:p-3 border-t border-border">
          {/* Keep tabs on one row; use the shared scroll controls on overflow. */}
          <HorizontalScrollControls
            className="min-w-0 border-b border-border pb-2"
            viewportClassName="gap-2.5 py-1"
            showButtons={false}
            wheelToScroll
            dragToScroll
            scrollSelectedToCenter
            resetKey={activeTab}
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  data-scroll-selected={isActive ? "true" : undefined}
                  onClick={() => setActiveTab(tab.key)}
                  className={`shrink-0 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-navy text-white shadow-xs"
                      : "bg-cream text-ink hover:bg-cream-strong hover:text-ink"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </HorizontalScrollControls>

          {/* ── Tab 1: Specifications (Highlighted Cards Grid) ── */}
          {activeTab === "specs" && (
            <div className="pt-2">
              <div className="flex flex-wrap items-center justify-end gap-2 mb-2">
                <span className="text-xs font-medium text-muted">
                  {detailRows.length} {detailRows.length === 1 ? "detail" : "details"} listed
                </span>
              </div>

              <div className="grid grid-cols-1">
                {visibleSpecs.map(([key, value]) => (
                  <div
                    key={key}
                    className="flex min-w-0 items-baseline justify-between gap-4 border-b border-border/70 py-2 last:border-b-0"
                  >
                    <span className="shrink-0 text-xs font-medium text-muted sm:text-sm">
                      {formatPageTitle(key)}
                    </span>
                    <span className="min-w-0 break-words text-right text-sm font-semibold text-navy sm:text-base">
                      {Array.isArray(value) ? value.join(", ") : String(value)}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ── Tab 2: Description ── */}
          {activeTab === "desc" && (
            <div className="pt-2">
              <div className="border-0 bg-transparent p-0">
                <ProductDescription
                  content={decodeHtml(
                    effectiveDescription ||
                      selectedVariant?.description ||
                      product.description,
                  )}
                />
              </div>
            </div>
          )}

          {/* ── Tab 3: Warranty & Returns ── */}
          {activeTab === "warranty" && (
            <div className="pt-2 space-y-3">
              <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                <div className="flex min-w-0 flex-col gap-1 border-b border-border/70 py-3">
                  <span className="text-xs font-medium text-muted">
                    Warranty Period
                  </span>
                  <span className="text-sm font-semibold text-navy break-words sm:text-base">
                    {hasWarranty
                      ? capitalizeFirst(warrantyPeriod || "Standard Warranty")
                      : "No Warranty"}
                  </span>
                  {effectiveWarranty.type && (
                    <span className="text-xs text-muted">
                      Type: {capitalizeFirst(effectiveWarranty.type.replace(/_/g, " "))}
                    </span>
                  )}
                </div>

                <div className="flex min-w-0 flex-col gap-1 border-b border-border/70 py-3">
                  <span className="text-xs font-medium text-muted">
                    Return Window
                  </span>
                  <span className="text-sm font-semibold text-navy break-words sm:text-base">
                    {returnPolicy.returnable === false
                      ? "Non-Returnable"
                      : `${returnPolicy.returnWindowDays ?? returnPolicy.days ?? 7} Days Return Policy`}
                  </span>
                  <span className="text-xs text-muted">
                    {returnPolicy.inspectionRequired !== false
                      ? "Physical inspection required upon return"
                      : "Direct easy return"}
                  </span>
                </div>
              </div>

              {effectiveWarranty.coveredInWarranty && (
                <div className="border-t border-border/70 pt-3">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">
                    Covered in Warranty
                  </span>
                  <div
                    className="text-sm leading-relaxed text-ink"
                    dangerouslySetInnerHTML={{
                      __html: decodeHtml(effectiveWarranty.coveredInWarranty),
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* ── Tab 4: Manufacturer / Seller Info ── */}
          {activeTab === "seller" && (
            <div className="pt-2">
              <section className="overflow-hidden rounded-lg border border-[#E7D9B8] bg-white">
                <h4 className="bg-[#EAD8B3] px-4 py-3 text-base font-bold text-ink sm:px-5">
                  Seller Information
                </h4>

                <div className="grid grid-cols-1 divide-y divide-[#E9E1D3] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                  <div className="px-4 py-4 sm:px-5 sm:py-5">
                    <span className="block text-xs font-medium text-muted">Store Name</span>
                    <span className="mt-1.5 block break-words text-sm font-bold text-ink sm:text-base">
                      {product.seller?.storeName ||
                        product.seller?.name ||
                        product.sellerName ||
                        "SamGlobal Seller"}
                    </span>
                  </div>

                  <div className="px-4 py-4 sm:px-5 sm:py-5">
                    <span className="block text-xs font-medium text-muted">Seller Rating</span>
                    <span className="mt-1.5 block text-sm font-bold text-ink sm:text-base">
                      {Number.isFinite(Number(product.seller?.rating ?? product.seller?.averageRating)) &&
                      Number(product.seller?.rating ?? product.seller?.averageRating) > 0
                        ? `${Number(product.seller?.rating ?? product.seller?.averageRating).toFixed(1)} ★`
                        : "No Rating"}
                    </span>
                  </div>

                  <div className="px-4 py-4 sm:px-5 sm:py-5">
                    <span className="block text-xs font-medium text-muted">Joined SamGlobal</span>
                    <span className="mt-1.5 block text-sm font-bold text-ink sm:text-base">
                      {product.seller?.joinAt && !Number.isNaN(Date.parse(product.seller.joinAt))
                        ? new Date(product.seller.joinAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "Seller on SamGlobal"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-[#E9E1D3] bg-[#FAFCFA] px-4 py-3 text-sm sm:px-5">
                  <ShieldCheck size={19} className="shrink-0 text-[#16833B]" />
                  <span className="font-bold text-[#16833B]">Trusted &amp; Verified Seller</span>
                  <span className="hidden text-[#C8C8C8] sm:inline" aria-hidden="true">•</span>
                  <span className="text-muted">100% Genuine Products &amp; Quality Assured on SamGlobal</span>
                </div>
              </section>
            </div>
          )}

          {/* ── Tab 5: Catalogue ── */}
          {activeTab === "catalogue" && hasCatalogueImages && (
            <div className="pt-2">
              <div className="grid grid-cols-4 gap-3">
                {product.commonImages.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setIsModalOpen(true)}
                    className="relative aspect-square min-w-0 rounded-lg border border-border bg-white p-1.5 cursor-pointer hover:border-gold hover:shadow-sm transition-all"
                  >
                    <img
                      src={getImageUrlFromValue(img)}
                      alt="Catalogue"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        </div>
      </div>

      {isModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white p-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 z-[10000] w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <X size={24} />
            </button>
            <div className="flex h-[85vh] w-full max-w-[1000px] items-center justify-center">
              <ProductGallery
                images={product.commonImages.map((img) => getImageUrlFromValue(img))}
                isModal={true}
                fallbackLabel={getProductTitle(product)}
              />
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
