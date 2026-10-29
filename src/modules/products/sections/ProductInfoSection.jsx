import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Star, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
import { formatPageTitle } from "../../../utils/common";
import {
  getProductTitle,
  getImageUrlFromValue,
} from "../../../utils/ecommerce";
import { capitalizeFirst } from "../../../utils/stringUtils";
import { ProductGallery } from "../components/ImageGallery";

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
    <div className="w-full text-[#374151]">
      <div
        ref={contentRef}
        className={`rich-text-content w-full min-w-0 max-w-none text-sm sm:text-base leading-relaxed text-[#374151] transition-[max-height] duration-300 ${
          !expanded && canExpand ? "max-h-[220px] overflow-hidden" : ""
        }`}
        dangerouslySetInnerHTML={{ __html: normalizeDescriptionHtml(content) }}
      />
      {canExpand && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[#1B1D60] hover:text-[#CE9F2D] transition-colors"
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
  const [activeTab, setActiveTab] = useState("specs");
  const [showAllSpecs, setShowAllSpecs] = useState(false);
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
    if (product.seller || product.sellerName)
      list.push({ key: "seller", label: "Manufacturer / Seller" });
    if (hasCatalogueImages) list.push({ key: "catalogue", label: "Catalogue" });
    return list;
  }, [hasDetails, hasDescription, product.seller, product.sellerName, hasCatalogueImages]);

  // Set default active tab
  useEffect(() => {
    if (tabs.length > 0 && !tabs.some((t) => t.key === activeTab)) {
      setActiveTab(tabs[0].key);
    }
  }, [tabs, activeTab]);

  // Show up to 10 specs by default, then button for remaining
  const visibleSpecs = showAllSpecs ? detailRows : detailRows.slice(0, 10);
  const hasMoreSpecs = detailRows.length > 10;

  return (
    <div className="border border-[#E5E7EB] rounded-lg overflow-hidden bg-white shadow-xs">
      {/* ── Flipkart-style Header: Title + Subtitle + Square Chevron Button ── */}
      <button
        type="button"
        onClick={() => setCardOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-[#FAF9F6] transition-colors text-left"
        aria-expanded={cardOpen}
      >
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#111827]">
            All details
          </h3>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">
            Features, specifications, description and more
          </p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] flex items-center justify-center text-[#374151] transition-colors shrink-0 ml-3">
          {cardOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {cardOpen && (
        <div className="p-5 border-t border-[#E5E7EB]">
          {/* ── Flipkart-style Pill Tabs with rounded-lg ── */}
          <div className="flex flex-wrap items-center gap-2.5 pb-4 border-b border-[#F0F0F0]">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-[#1B1D60] text-white shadow-xs"
                      : "bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB] hover:text-[#111827]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ── Tab 1: Specifications (Highlighted Cards Grid) ── */}
          {activeTab === "specs" && (
            <div className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-[#1B1D60] uppercase tracking-wider">
                  Product Specifications
                </h4>
                <span className="text-xs font-medium text-[#6B7280]">
                  {detailRows.length} {detailRows.length === 1 ? "detail" : "details"} listed
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {visibleSpecs.map(([key, value]) => (
                  <div
                    key={key}
                    className="flex flex-col rounded-lg bg-[#FAF9F6] p-3.5 border border-[#EBE5D8] transition-colors hover:border-[#CE9F2D]"
                  >
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                      {formatPageTitle(key)}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-[#1B1D60] mt-1 break-words">
                      {Array.isArray(value) ? value.join(", ") : String(value)}
                    </span>
                  </div>
                ))}
              </div>

              {hasMoreSpecs && (
                <button
                  type="button"
                  onClick={() => setShowAllSpecs((prev) => !prev)}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#E5E7EB] bg-white text-sm font-bold text-[#1B1D60] hover:bg-[#FAF9F6] hover:border-[#CE9F2D] transition-all shadow-xs"
                >
                  <span>{showAllSpecs ? "Show less specifications" : `View all ${detailRows.length} specifications`}</span>
                  {showAllSpecs ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>
              )}
            </div>
          )}

          {/* ── Tab 2: Description ── */}
          {activeTab === "desc" && (
            <div className="pt-4">
              <h4 className="text-sm font-bold text-[#1B1D60] mb-3 uppercase tracking-wider">
                Product Description
              </h4>
              <div className="rounded-lg bg-[#FAF9F6] p-4 sm:p-5 border border-[#EBE5D8]">
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
            <div className="pt-4 space-y-4">
              <h4 className="text-sm font-bold text-[#1B1D60] uppercase tracking-wider">
                Warranty &amp; Return Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col rounded-lg bg-[#FAF9F6] p-4 border border-[#EBE5D8]">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                    Warranty Period
                  </span>
                  <span className="text-base font-bold text-[#1B1D60] mt-1">
                    {hasWarranty
                      ? capitalizeFirst(warrantyPeriod || "Standard Warranty")
                      : "No Warranty"}
                  </span>
                  {effectiveWarranty.type && (
                    <span className="text-xs text-[#6B7280] mt-1">
                      Type: {capitalizeFirst(effectiveWarranty.type.replace(/_/g, " "))}
                    </span>
                  )}
                </div>

                <div className="flex flex-col rounded-lg bg-[#FAF9F6] p-4 border border-[#EBE5D8]">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                    Return Window
                  </span>
                  <span className="text-base font-bold text-[#1B1D60] mt-1">
                    {returnPolicy.returnable === false
                      ? "Non-Returnable"
                      : `${returnPolicy.returnWindowDays ?? returnPolicy.days ?? 7} Days Return Policy`}
                  </span>
                  <span className="text-xs text-[#6B7280] mt-1">
                    {returnPolicy.inspectionRequired !== false
                      ? "Physical inspection required upon return"
                      : "Direct easy return"}
                  </span>
                </div>
              </div>

              {effectiveWarranty.coveredInWarranty && (
                <div className="rounded-lg bg-[#FAF9F6] p-4 border border-[#EBE5D8]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1B1D60] block mb-1">
                    Covered in Warranty
                  </span>
                  <div
                    className="text-sm text-[#4E4E4E] leading-relaxed"
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
            <div className="pt-4 space-y-3">
              <h4 className="text-sm font-bold text-[#1B1D60] uppercase tracking-wider">
                Seller &amp; Origin Details
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg bg-[#FAF9F6] p-4 border border-[#EBE5D8]">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                    Store / Seller Name
                  </span>
                  <span className="text-base font-bold text-[#1B1D60] mt-1 block">
                    {product.seller?.name ||
                      product.seller?.storeName ||
                      product.sellerName ||
                      "SamGlobal Verified Seller"}
                  </span>
                </div>

                <div className="rounded-lg bg-[#FAF9F6] p-4 border border-[#EBE5D8]">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                    Seller Rating
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="inline-flex items-center gap-1 rounded bg-[#388E3C] px-2 py-0.5 text-white font-bold text-xs">
                      <span>
                        {Number(
                          product.seller?.rating ??
                            product.seller?.averageRating ??
                            4.5,
                        ).toFixed(1)}
                      </span>
                      <Star size={11} className="fill-white" />
                    </div>
                    <span className="text-xs text-[#6B7280]">
                      1+ Year on SamGlobal
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg bg-[#F1FBF3] p-4 border border-[#C6ECD2] text-[#1E8A38]">
                <ShieldCheck size={22} className="shrink-0" />
                <div>
                  <span className="text-sm font-bold block">
                    100% Genuine Products &amp; Quality Assured
                  </span>
                  <span className="text-xs text-[#4B7C59]">
                    All items shipped from this seller are verified by SamGlobal quality standards.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── Tab 5: Catalogue ── */}
          {activeTab === "catalogue" && hasCatalogueImages && (
            <div className="pt-4">
              <h4 className="text-sm font-bold text-[#1B1D60] mb-3 uppercase tracking-wider">
                Catalogue Images ({product.commonImages.length})
              </h4>
              <div className="flex flex-wrap gap-3">
                {product.commonImages.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setIsModalOpen(true)}
                    className="relative aspect-square w-20 sm:w-24 rounded-lg border border-[#E5E7EB] bg-white p-1.5 cursor-pointer hover:border-[#CE9F2D] hover:shadow-sm transition-all"
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
      )}

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
