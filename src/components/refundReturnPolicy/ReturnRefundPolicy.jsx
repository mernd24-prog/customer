import React from "react";
import { useSelector } from "react-redux";
import Header from "../../components/layout/Header";
import { Footer } from "../../components/layout/Footer";
import PolicyHeader from "../policy/PolicyHeader";
import Seo from "../common/Seo";
import ApiState from "../common/ApiState";
import { useCmsRecord, getCmsPayload } from "../../hooks/useCmsRecord";

const ReturnRefundPolicy = () => {
  const { page, loading } = useCmsRecord("refund-policy");
  const error = useSelector((state) => state.cms.error);
  const payload = getCmsPayload(page, null);

  const title = page?.title || payload?.title || "Refund Policy";
  const description =
    page?.description ||
    page?.excerpt ||
    page?.metadata?.seoDescription ||
    payload?.description ||
    payload?.excerpt ||
    "Refund process and timelines.";
  const body =
    page?.body || page?.content || payload?.body || payload?.content || "";
  const points = Array.isArray(page?.points)
    ? page.points
    : Array.isArray(payload?.points)
      ? payload.points
      : [];

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow w-full bg-white font-montserrat pb-20">
        <Seo title={`${title} | Sam Global`} description={description} />

        <PolicyHeader title={title} />

        <div className="w-full px-8 md:px-12 lg:px-16 mt-12 md:mt-16 max-w-[1648px] mx-auto">
          <div className="mb-8 text-center">
            {description && (
              <p className="mx-auto max-w-3xl text-[#787878] text-[15px] md:text-[17px] leading-loose tracking-wide">
                {description}
              </p>
            )}
          </div>

          <ApiState
            loading={loading && !page}
            error={error}
            empty={!page && !loading}
            emptyTitle="Refund policy not found"
            emptyText="The refund policy content is not available at the moment."
          >
            {body ? (
              <div
                className="cms-content space-y-6 font-montserrat text-[#787878] [&_h1]:text-3xl [&_h2]:text-2xl [&_h3]:text-xl [&_p]:leading-relaxed [&_ul]:list-disc [&_ol]:list-decimal [&_li]:ml-5"
                dangerouslySetInnerHTML={{ __html: body }}
              />
            ) : (
              <p className="text-[#787878] text-sm">
                No refund policy content is available.
              </p>
            )}

            {points.length > 0 && (
              <div className="mt-10 rounded-[12px] border border-[#e7dfd1] bg-[#fffdf8] p-6">
                <h2 className="mb-4 text-xl font-semibold text-[#2E2E2E]">
                  Highlights
                </h2>
                <ul className="space-y-3">
                  {points.map((point, idx) => (
                    <li
                      key={`${typeof point === "string" ? point : point?.title || "point"}-${idx}`}
                      className="text-[#787878] leading-relaxed"
                    >
                      {typeof point === "string" ? point : point?.title || ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </ApiState>
        </div>
      </main>
    </div>
  );
};

export default ReturnRefundPolicy;
