import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
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

function InfoTabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex  overflow-x-auto border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`min-w-max px-5  lg:py-4 py-2 text-lg font-medium ${
            activeTab === tab.key
              ? "border-b-2 border-navy font-semibold text-navy"
              : "text-[#2E2E2E]"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function InfoCard({ title, children, roundedClass = "rounded-[8px]" }) {
  return (
    <div
      className={`mt-5 overflow-hidden ${roundedClass} border border-[#E7D9B8] bg-white`}
    >
      <div className="bg-[#CE9F2D33] px-4 py-6">
        <h2 className="text-sm md:text-lg font-bold text-[#2E2E2E]">{title}</h2>
      </div>

      {children}
    </div>
  );
}

function DetailRows({
  rows,
  children,
  rowClassName = "grid grid-cols-1 gap-1 px-4 py-3 d text-sm md:text-lg sm:grid-cols-[220px_minmax(0,1fr)]",
  labelClassName = "font-medium text-ink",
  valueClassName = "text-left font-bold text-navy md:text-right",
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
  const warrantyPeriod = [
    effectiveWarranty.period,
    effectiveWarranty.periodUnit,
  ]
    .filter((value) => value !== null && value !== undefined && value !== "")
    .join(" ");
  const returnPolicy = effectiveWarranty.returnPolicy || {};

  return (
    <div className="relative  z-10  mt-8 lg:mt-24 bg-white">
      <InfoTabs
        tabs={infoTabs}
        activeTab={activeInfoTab}
        onChange={setActiveInfoTab}
      />

      {activeInfoTab === "details" && (
        <InfoCard title="Product Details" roundedClass="rounded-xl">
          {detailRows.length > 0 || warranty ? (
            <DetailRows
              rows={detailRows.map(([key, value]) => [
                formatPageTitle(key),
                value,
              ])}
              rowClassName="grid grid-cols-1 gap-1 px-4 py-4 text-[16px] sm:grid-cols-[220px_minmax(0,1fr)]"
              labelClassName="font-medium text-[#2E2E2E]"
              valueClassName="text-left font-bold text-navy sm:text-right"
            ></DetailRows>
          ) : (
            <p className="px-4 py-4 text-sm lg:text-base text-[#4E4E4E] whitespace-pre-line">
              No Product Details Available.
            </p>
          )}
        </InfoCard>
      )}

      {activeInfoTab === "description" && (
        <InfoCard title="Description">
          {effectiveDescription || selectedVariant?.description || product?.description ? (
            <div
              className="rich-text-content px-4 py-4 text-[#4E4E4E]"
              dangerouslySetInnerHTML={{
                __html: decodeHtml(
                  effectiveDescription || selectedVariant?.description || product.description,
                ),
              }}
            />
          ) : (
            <p className="px-4 py-4 text-sm lg:text-base text-[#4E4E4E] whitespace-pre-line">
              No Description Available.
            </p>
          )}
        </InfoCard>
      )}

      {activeInfoTab === "warranty" && (
        <InfoCard title="Warranty Information" roundedClass="rounded-xl">
          <div className="space-y-6 px-4 py-5 text-sm lg:text-base text-[#4E4E4E] leading-relaxed">
            {(effectiveWarranty.summary ||
              effectiveWarranty.warrantySummary ||
              warrantyPeriod ||
              effectiveWarranty.type ||
              effectiveWarranty.provider) && (
              <div>
                <h3 className="text-base font-bold text-ink">
                  Warranty Summary
                </h3>
                <div className="mt-2 text-sm lg:text-base text-[#4E4E4E] whitespace-pre-line leading-relaxed">
                  {effectiveWarranty.summary ||
                    effectiveWarranty.warrantySummary || (
                      <div className="space-y-1 text-sm lg:text-base text-[#4E4E4E]">
                        {warrantyPeriod && (
                          <div>
                            <span className="font-medium text-ink">
                              Period:
                            </span>{" "}
                            {warrantyPeriod}
                          </div>
                        )}
                        {effectiveWarranty.type && (
                          <div>
                            <span className="font-medium text-ink">Type:</span>{" "}
                            {effectiveWarranty.type}
                          </div>
                        )}
                        {effectiveWarranty.provider && (
                          <div>
                            <span className="font-medium text-ink">
                              Provider:
                            </span>{" "}
                            {effectiveWarranty.provider}
                          </div>
                        )}
                      </div>
                    )}
                </div>
              </div>
            )}

            {(effectiveWarranty.coveredInWarranty ||
              effectiveWarranty.terms) && (
              <div>
                <h3 className="text-base font-bold text-ink">
                  Covered in Warranty
                </h3>
                <div
                  className="mt-2 rich-text-content text-[#4E4E4E]"
                  dangerouslySetInnerHTML={{
                    __html: decodeHtml(
                      effectiveWarranty.coveredInWarranty ||
                        effectiveWarranty.terms,
                    ),
                  }}
                />
              </div>
            )}

            {effectiveWarranty.notCoveredInWarranty && (
              <div>
                <h3 className="text-base font-bold text-ink">
                  Not Covered in Warranty
                </h3>
                <div
                  className="mt-2 rich-text-content text-[#4E4E4E]"
                  dangerouslySetInnerHTML={{
                    __html: decodeHtml(effectiveWarranty.notCoveredInWarranty),
                  }}
                />
              </div>
            )}

            {Object.keys(returnPolicy).length > 0 && (
              <div className="border-t border-border pt-4">
                <h3 className="mb-3 text-base font-bold text-ink">
                  Return Terms
                </h3>
                <div className="flex flex-wrap gap-2 text-xs lg:text-sm">
                  <span className="rounded-full bg-cream px-3 py-1.5 font-medium text-navy">
                    {returnPolicy.returnable === false
                      ? "Non-returnable"
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
          <InfoCard title="Catalogue Images" roundedClass="rounded-xl">
            <div className="grid grid-cols-2 gap-4 p-4 sm:flex sm:flex-wrap">
              {product.commonImages.slice(0, 4).map((image, index) => {
                const isLast = index === 3;
                const hasMore = product.commonImages.length > 4;
                const extraCount = product.commonImages.length - 4;

                return (
                  <div
                    key={`${image}-${index}`}
                    className="relative flex aspect-square w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E7D9B8] bg-white cursor-pointer transition-colors hover:border-gold sm:h-[180px] sm:w-[180px] md:h-[200px] md:w-[200px]"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <img width="400" height="400"
                      src={getImageUrlFromValue(image)}
                      alt={`${getProductTitle(product)} detail ${index + 1}`}
                      className="h-full w-full object-contain p-2"
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                    {isLast && hasMore && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-3xl font-bold">
                        +{extraCount}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </InfoCard>
        )}

      {activeInfoTab === "seller" && (
        <InfoCard title="Seller Information">
          {product.seller ? (
            <div className="flex items-center gap-3 px-4 py-4">
              <div>
                <p className="text-sm font-semibold text-ink">
                  Store Name:{" "}
                  {product.seller.name || product.seller.storeName || "Seller"}
                </p>
              </div>
            </div>
          ) : (
            <div className="px-4 py-4 text-sm lg:text-lg text-black/90 whitespace-pre-line">
              Seller Information Is Not Available.
            </div>
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
