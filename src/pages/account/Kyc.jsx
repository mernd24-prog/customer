import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BadgeCheck, Shield, Upload } from "lucide-react";
import FormField from "../../components/ui/FormField";
import Button from "../../components/ui/Button";
import { useToastThunk } from "../../hooks/useToastThunk";
import { submitUserKyc, uploadKycDocuments } from "../../features/user/userSlice";
import { kycSchema } from "../../validations/validationSchemas";

const KYC_DOCS = [
  { key: "panDocumentUrl", label: "PAN card" },
  { key: "gstCertificateUrl", label: "GST certificate (optional)" },
  { key: "aadhaarFrontUrl", label: "Aadhaar front" },
  { key: "aadhaarBackUrl", label: "Aadhaar back" },
  { key: "addressProofUrl", label: "Address proof" },
];

export default function KycTab({ user }) {
  const dispatch = useDispatch();
  const run = useToastThunk();
  const { loading } = useSelector((s) => s.user);
  const [docUrls, setDocUrls] = useState({});
  const kyc = user?.kyc;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(kycSchema),
    defaultValues: {
      legalName: kyc?.legalName || user?.profile?.firstName || "",
      panNumber: kyc?.panNumber || "",
      aadhaarNumber: kyc?.aadhaarNumber || "",
    },
  });

  const handleDocUpload = async (docKey, url) => {
    if (!url) return;
    setDocUrls((prev) => ({ ...prev, [docKey]: url }));
  };

  const submit = async (values) => {
    if (Object.keys(docUrls).length > 0) {
      await run(
        dispatch,
        uploadKycDocuments({ documents: docUrls }),
        "Documents saved",
      );
    }
    await run(
      dispatch,
      submitUserKyc({
        legalName: values.legalName,
        panNumber: values.panNumber,
        aadhaarNumber: values.aadhaarNumber,
        documents: docUrls,
      }),
      "KYC submitted for review",
    );
  };

  const statusColor =
    {
      verified: "text-emerald-700 bg-emerald-100",
      under_review: "text-amber-700 bg-amber-100",
      rejected: "text-red-700 bg-red-100",
      submitted: "text-blue-700 bg-blue-100",
    }[kyc?.status] || "text-[#787878] bg-[#FAF6EE]";

  return (
    <form className="grid gap-6" onSubmit={handleSubmit(submit)} noValidate>
      {kyc?.status && (
        <div className="flex items-center gap-3">
          <BadgeCheck size={20} className="shrink-0 text-[#787878]" />
          <div>
            <p className="text-sm text-[#A6A6A6]">KYC status</p>
            <span
              className={`mt-0.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusColor}`}
            >
              {kyc.status.replace(/_/g, " ")}
            </span>
          </div>
        </div>
      )}

      {kyc?.status === "verified" ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Your KYC is verified. No action needed.
        </div>
      ) : (
        <>
          <div className="grid gap-5 max-w-md">
            <FormField
              id="legalName"
              label="Legal name (as on PAN)"
              registration={register("legalName")}
              error={errors.legalName}
              placeholder="As it appears on your PAN card"
            />
            <FormField
              id="panNumber"
              label="PAN number"
              registration={register("panNumber")}
              error={errors.panNumber}
              placeholder="ABCDE1234F"
              className="uppercase"
            />
            <FormField
              id="aadhaarNumber"
              label="Aadhaar number"
              registration={register("aadhaarNumber")}
              error={errors.aadhaarNumber}
              placeholder="12-digit Aadhaar"
              inputMode="numeric"
            />
          </div>

          {/* Document URLs */}
          <div>
            <p className="mb-3 text-sm font-medium text-[#2E2E2E]">
              Document URLs
            </p>
            <p className="mb-4 text-xs text-[#A6A6A6]">
              Upload each document to a file hosting service and paste the URL
              here.
            </p>
            <div className="grid gap-3">
              {KYC_DOCS.map(({ key, label }) => (
                <label
                  key={key}
                  className="grid gap-1.5 text-sm font-medium text-[#2E2E2E]"
                >
                  <span className="flex items-center gap-1.5">
                    <Upload size={13} /> {label}
                  </span>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={docUrls[key] || ""}
                    onChange={(e) => handleDocUpload(key, e.target.value)}
                    className="min-h-10 rounded-md border border-[#cfc6b8] bg-white px-3 py-2 text-[#2E2E2E] outline-none transition-all duration-300 ease-in-out placeholder:text-[#A6A6A6] focus:border-[#CE9F2D] focus:ring-2 focus:ring-[#CE9F2D]/20"
                  />
                </label>
              ))}
            </div>
          </div>

          {kyc?.rejectionReason && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              <strong>Rejection reason:</strong> {kyc.rejectionReason}
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full sm:w-auto">
            <Shield size={16} /> Submit KYC
          </Button>
        </>
      )}
    </form>
  );
}
