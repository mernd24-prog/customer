import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Star, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
import { formatPageTitle } from "../../../utils/common";
import {
  getProductTitle,
  getImageUrlFromValue,
} from "../../../utils/ecommerce";
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

  // Remove empty editor-generated blocks that create unexplained vertical gaps.
  const emptyBlockPattern =
    /<(p|div|section|article|h[1-6])(?:\s[^>]*)?>\s*(?:&nbsp;|&#160;|<br\s*\/?\s*>|\s)*\s*<\/\1>/gi;

  let previous;
  do {
    previous = normalized;
    normalized = normalized.replace(emptyBlockPattern, "");
  } while (normalized !== previous);

  // Remove stray line breaks at the very beginning or end without touching
  // intentional line breaks inside the description.
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
      setCanExpand(el.scrollHeight > 220);
    }
  }, [content]);

  if (!content) return null;

  return (
    <div className="w-full px-4 py-4 text-ink">
      <div
        ref={contentRef}
        className={`rich-text-content w-full min-w-0 max-w-none text-base leading-relaxed text-ink [&_*]:!max-w-none [&_p]:!w-full [&_p]:!text-base [&_p]:!leading-relaxed [&_p]:!text-ink [&_li]:!text-base [&_li]:!leading-relaxed [&_li]:!text-ink [&_div]:!text-base [&_div]:!leading-relaxed [&_div]:!text-ink [&_h1]:!mb-3 [&_h1]:!mt-5 [&_h1]:!text-xl [&_h1]:!font-bold [&_h1]:!leading-snug [&_h1]:!text-navy [&_h2]:!mb-3 [&_h2]:!mt-5 [&_h2]:!text-xl [&_h2]:!font-bold [&_h2]:!leading-snug [&_h2]:!text-navy [&_h3]:!mb-2 [&_h3]:!mt-4 [&_h3]:!text-lg [&_h3]:!font-semibold [&_h3]:!leading-snug [&_h3]:!text-navy [&_ul]:!my-3 [&_ol]:!my-3 [&_li]:!my-1 transition-[max-height] duration-300 ${
          !expanded && canExpand ? "max-h-[200px] overflow-hidden" : ""
        }`}
        dangerouslySetInnerHTML={{ __html: normalizeDescriptionHtml(content) }}
      />
      {canExpand && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          className="mt-4 inline-flex items-center gap-1.5 bg-transparent p-0 text-sm font-semibold text-navy transition-colors duration-200 hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#CE9F2D]"
        >
          <span>{expanded ? "Read Less" : "Read More"}</span>
          {expanded ? (
            <ChevronUp size={15} aria-hidden="true" />
          ) : (
            <ChevronDown size={15} aria-hidden="true" />
          )}
        </button>
      )}
    </div>
  );
}
import { capitalizeFirst } from "../../../utils/stringUtils";
function InfoTabs({ tabs, activeTab, onChange }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const activeBtn = containerRef.current.querySelector(
        `[data-tab-key="${activeTab}"]`,
      );
      if (activeBtn) {
        const container = containerRef.current;
        container.scrollTo({
          left: activeBtn.offsetLeft,
          behavior: "smooth",
        });
      }
    }
  }, [activeTab]);

  return (
    <div
      ref={containerRef}
      className="flex overflow-x-auto border-b border-border relative scroll-smooth no-scrollbar"
      style={{ scrollbarWidth: "none" }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          data-tab-key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`min-w-max px-5 lg:py-4 py-2 text-lg font-medium transition-colors ${
            activeTab === tab.key
              ? "border-b-2 border-blue font-semibold text-blue"
              : "text-ink"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function InfoCard({ title, children, roundedClass = "rounded-xl" }) {
  return (
    <div
      className={`mt-5 overflow-hidden ${roundedClass} border border-border bg-white`}
    >
      <div className="bg-[#EAD9B6] px-4 py-4">
        <h2 className="text-sm md:text-lg font-bold text-ink">{title}</h2>
      </div>

      {children}
    </div>
  );
}

function DetailRows({
  rows,
  children,
  rowClassName = "grid grid-cols-1 gap-1 px-4 py-3 text-sm leading-relaxed text-ink lg:text-base sm:grid-cols-[220px_minmax(0,1fr)]",
  labelClassName = "font-medium text-navy",
  valueClassName = "text-left font-semibold text-navy sm:text-right",
}) {
  return (
    <dl className="divide-y divide-border">
      {rows.map(([key, value]) => (
        <div key={key} className={rowClassName}>
          <dt className={labelClassName}>{formatPageTitle(key)}</dt>
          <dd className={valueClassName}>
            {Array.isArray(value) ? value.join(", ") : String(value)}
          </dd>
        </div>
      ))}

      {children}
    </dl>
  );
}

export default function ProductInfoSection({
  infoTabs,
  activeInfoTab,
  setActiveInfoTab,
  detailRows,
  warranty,
  product,
  selectedVariant,
  effectiveDescription,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const catalogueContainerRef = useRef(null);
  const [catalogueMaxItems, setCatalogueMaxItems] = useState(4);

  useEffect(() => {
    if (!catalogueContainerRef.current) return;

    const updateMaxItems = () => {
      if (!catalogueContainerRef.current) return;
      const width = catalogueContainerRef.current.clientWidth;
      let targetCardWidth = 160;
      let gap = 16;

      if (width < 450) {
        targetCardWidth = 110;
        gap = 10;
      } else if (width < 640) {
        targetCardWidth = 130;
        gap = 12;
      } else if (width < 1024) {
        targetCardWidth = 150;
        gap = 16;
      }

      const count = Math.max(
        1,
        Math.floor((width + gap) / (targetCardWidth + gap)),
      );
      setCatalogueMaxItems(count);
    };

    updateMaxItems();

    const resizeObserver = new ResizeObserver(() => {
      updateMaxItems();
    });

    resizeObserver.observe(catalogueContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [product?.commonImages?.length, activeInfoTab]);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    };
  }, [isModalOpen]);

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
    [effectiveWarranty.periodUnit, effectiveWarranty.type, effectiveWarranty.provider]
      .every((value) => Boolean(String(value || "").trim()));

  const warrantyPeriod = hasValidPeriod
    ? [effectiveWarranty.period, effectiveWarranty.periodUnit]
        .filter((value) => value !== null && value !== undefined && value !== "")
        .join(" ")
    : "";
  const returnPolicy = effectiveWarranty.returnPolicy || {};

  return (
    <div className="relative  z-10  mt-8 lg:mt-24 bg-white">
      <InfoTabs
        tabs={infoTabs}
        activeTab={activeInfoTab}
        onChange={setActiveInfoTab}
      />

      {activeInfoTab === "details" && (
        <InfoCard title="Product Details" roundedClass="rounded-lg">
          {detailRows.length > 0 || warranty ? (
            <DetailRows
              rows={detailRows.map(([key, value]) => [
                formatPageTitle(key),
                value,
              ])}
              rowClassName="grid grid-cols-1 gap-1 px-4 py-4 text-sm leading-relaxed text-ink lg:text-base sm:grid-cols-[220px_minmax(0,1fr)]"
              labelClassName="font-medium text-navy"
              valueClassName="text-left font-semibold text-navy sm:text-right"
            ></DetailRows>
          ) : (
            <p className="px-4 py-4 text-sm lg:text-base text-ink whitespace-pre-line">
              No Product Details Available.
            </p>
          )}
        </InfoCard>
      )}

      {activeInfoTab === "description" && (
        <InfoCard title="Description" roundedClass="rounded-lg">
          {effectiveDescription ||
          selectedVariant?.description ||
          product?.description ? (
            <ProductDescription
              content={decodeHtml(
                effectiveDescription ||
                  selectedVariant?.description ||
                  product.description,
              )}
            />
          ) : (
            <p className="px-4 py-4 text-sm lg:text-base text-ink whitespace-pre-line">
              No Description Available.
            </p>
          )}
        </InfoCard>
      )}

        {activeInfoTab === "warranty" && (
          <InfoCard title="Warranty & Return Information" roundedClass="rounded-lg">
            <div className="space-y-6 px-4 py-5 text-sm leading-relaxed text-ink lg:text-base">
              {!hasWarranty && (
                <div>
                  <h3 className="text-base font-bold text-navy">Warranty</h3>
                  <p className="mt-2">No warranty is offered for this product.</p>
                </div>
              )}
              {hasWarranty && (effectiveWarranty.summary ||
                effectiveWarranty.warrantySummary ||
                warrantyPeriod ||
                effectiveWarranty.type ||
                effectiveWarranty.provider) && (
                <div>
                  <h3 className="text-base font-bold text-navy">
                    Warranty Summary
                  </h3>

                  <div className="mt-2 text-sm lg:text-base text-ink whitespace-pre-line leading-relaxed">
                    {effectiveWarranty.summary ||
                    effectiveWarranty.warrantySummary ? (
                      capitalizeFirst(
                        (
                          effectiveWarranty.summary ||
                          effectiveWarranty.warrantySummary
                        ).replace(/_/g, " "),
                      )
                    ) : (
                      <div className="space-y-1 text-sm lg:text-base text-ink">
                        {warrantyPeriod && (
                          <div>
                            <span className="font-medium text-navy">Period:</span>{" "}
                            {capitalizeFirst(warrantyPeriod)}
                          </div>
                        )}

                        {effectiveWarranty.type && (
                          <div>
                            <span className="font-medium text-navy">Type:</span>{" "}
                            {capitalizeFirst(
                              effectiveWarranty.type.replace(/_/g, " "),
                            )}
                          </div>
                        )}

                        {effectiveWarranty.provider && (
                          <div>
                            <span className="font-medium text-navy">
                              Provider:
                            </span>{" "}
                            {capitalizeFirst(
                              effectiveWarranty.provider.replace(/_/g, " "),
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {hasWarranty && (effectiveWarranty.coveredInWarranty ||
                effectiveWarranty.terms) && (
                <div>
                  <h3 className="text-base font-bold text-navy">
                    Covered in Warranty
                  </h3>
                  <div
                    className="mt-2 rich-text-content text-ink"
                    dangerouslySetInnerHTML={{
                      __html: decodeHtml(
                        effectiveWarranty.coveredInWarranty ||
                          effectiveWarranty.terms,
                      ),
                    }}
                  />
                </div>
              )}

              {hasWarranty && effectiveWarranty.notCoveredInWarranty && (
                <div>
                  <h3 className="text-base font-bold text-navy">
                    Not Covered in Warranty
                  </h3>
                  <div
                    className="mt-2 rich-text-content text-ink"
                    dangerouslySetInnerHTML={{
                      __html: decodeHtml(effectiveWarranty.notCoveredInWarranty),
                    }}
                  />
                </div>
              )}

              {Object.keys(returnPolicy).length > 0 && (
                <div className="border-t border-border pt-4">
                  <h3 className="mb-3 text-base font-bold text-navy">
                    Return Terms
                  </h3>
                  <div className="flex flex-wrap gap-2 text-xs lg:text-sm">
                    <span className="rounded-full bg-cream px-3 py-1.5 font-medium text-navy">
                      {returnPolicy.returnable === false
                        ? "Non-Returnable"
                        : `${returnPolicy.returnWindowDays ?? returnPolicy.days ?? 0}-day return window`}
                    </span>
                    {returnPolicy.resolution && (
                      <span className="rounded-full bg-cream px-3 py-1.5 font-medium text-navy">
                        {formatPageTitle(returnPolicy.resolution)}
                      </span>
                    )}
                    {returnPolicy.inspectionRequired !== false && (
                      <span className="rounded-full bg-cream px-3 py-1.5 font-medium text-navy">
                        Inspection Required
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </InfoCard>
        )}

      {activeInfoTab === "common-images" &&
        product.commonImages?.length > 0 && (
          <InfoCard title="Catalogue Images" roundedClass="rounded-lg">
            <div
              ref={catalogueContainerRef}
              className="flex flex-wrap gap-3 sm:gap-4 p-4"
            >
              {(() => {
                const totalImages = product.commonImages.length;
                const maxItems = Math.min(totalImages, catalogueMaxItems);
                const hasMore = totalImages > catalogueMaxItems;
                const extraCount = totalImages - catalogueMaxItems;
                const visibleImages = hasMore
                  ? product.commonImages.slice(0, catalogueMaxItems)
                  : product.commonImages;

                return visibleImages.map((image, index) => {
                  const isLast = index === visibleImages.length - 1 && hasMore;

                  return (
                    <div
                      key={`${image}-${index}`}
                      className="relative flex aspect-square flex-1 min-w-[110px] max-w-[190px] sm:min-w-[130px] sm:max-w-[200px] md:min-w-[150px] md:max-w-[210px] items-center justify-center overflow-hidden rounded-lg  bg-white cursor-pointer transition-all hover:border-gold hover:shadow-md"
                      onClick={() => setIsModalOpen(true)}
                    >
                      <img
                        width="400"
                        height="400"
                        src={getImageUrlFromValue(image)}
                        alt={`${getProductTitle(product)} detail ${index + 1}`}
                        className="h-full w-full object-contain p-2"
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                      {isLast && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-2xl sm:text-3xl font-bold rounded-xl backdrop-blur-[1px]">
                          +{extraCount}
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </InfoCard>
        )}

      {activeInfoTab === "seller" && (
        <InfoCard title="Seller Information" roundedClass="rounded-lg">
          {product.seller || product.sellerName ? (
            <div className="w-full divide-y divide-border text-sm leading-relaxed text-ink lg:text-base">
              <div className="grid w-full grid-cols-1 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-center sm:gap-4 px-4 py-4">
                <h3 className="font-medium text-ink">Store Name</h3>
                <p className="min-w-0 break-words font-semibold text-navy sm:text-right">
                  {product.seller?.name ||
                    product.seller?.storeName ||
                    product.sellerName ||
                    "Seller"}
                </p>
              </div>

              <div className="grid w-full grid-cols-1 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-center sm:gap-4 px-4 py-4">
                <h3 className="font-medium text-ink">Seller Rating</h3>
                <div className="min-w-0 sm:flex sm:justify-end">
                  {(() => {
                    const rawRating = Number(
                      product.seller?.rating ??
                        product.seller?.averageRating ??
                        product.sellerRating ??
                        0,
                    );
                    const rawCount = Number(
                      product.seller?.reviewCount ??
                        product.seller?.reviewsCount ??
                        product.seller?.ratingsCount ??
                        0,
                    );
                    const hasRating =
                      !Number.isNaN(rawRating) &&
                      rawRating > 0 &&
                      !Number.isNaN(rawCount) &&
                      rawCount > 0;

                    if (!hasRating) {
                      return (
                        <p className="font-semibold text-navy">
                          No Rating
                        </p>
                      );
                    }

                    return (
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="inline-flex items-center gap-1 rounded-md bg-[#CE9F2D] px-2.5 py-1 text-white">
                          <Star size={12} className="fill-white text-white" />
                          <span className="text-xs font-bold leading-none">
                            {rawRating.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-xs text-[#6B7280] sm:text-sm">
                          {rawCount} {rawCount === 1 ? "Rating" : "Ratings"}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="grid w-full grid-cols-1 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-center sm:gap-4 px-4 py-4">
                <h3 className="font-medium text-ink">Joined SamGlobal</h3>
                <p className="min-w-0 break-words font-semibold text-navy sm:text-right">
                  {(() => {
                    const joinedDate =
                      product.seller?.joinAt ||
                      product.seller?.createdAt ||
                      product.joinAt ||
                      product.sellerCreatedAt ||
                      product.createdAt;

                    if (!joinedDate) return "N/A";

                    const date = new Date(joinedDate);
                    if (Number.isNaN(date.getTime())) return "N/A";

                    return date.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });
                  })()}
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 bg-[#FAFCFA] px-4 py-4 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E9F7EC] text-[#1E8A38]">
                    <ShieldCheck size={14} strokeWidth={2.5} />
                  </span>
                  <span className="font-semibold text-[#1E8A38]">
                    Trusted &amp; Verified Seller
                  </span>
                </div>
                <span className="hidden text-[#C7C7C7] sm:inline" aria-hidden="true">
                  •
                </span>
                <p className="min-w-0 text-xs leading-5 text-[#6B7280] sm:text-sm">
                  100% Genuine Products &amp; Quality Assured on SamGlobal
                </p>
              </div>
            </div>
          ) : (
            <p className="px-4 py-5 text-sm leading-relaxed text-ink lg:text-base">
              Seller Information Is Not Available.
            </p>
          )}
        </InfoCard>
      )}

      {isModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white p-4 animate-fadeIn sm:p-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 z-[10000] w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-all duration-300 ease-in-out"
            >
              <X size={28} />
            </button>

            <div className="flex h-[90vh]  w-full max-w-[1200px] items-center justify-center bg-white">
              <ProductGallery
                images={product.commonImages.map((img) =>
                  getImageUrlFromValue(img),
                )}
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