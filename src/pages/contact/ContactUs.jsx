import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle,
  ChevronRight,
  CircleHelp,
  Handshake,
  Headset,
  Info,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  RefreshCw,
  Send,
  Store,
  Truck,
  Wallet,
} from "lucide-react";
import { useForm } from "react-hook-form";

import Seo from "../../components/ui/Seo";
import PageIntroBanner from "../../components/ui/PageIntroBanner";
import CustomDropdown from "../../components/ui/CustomDropdown";
import BaseModal from "../../components/ui/overlay/BaseModal";
import PageContainer from "../../components/ui/layout/PageContainer";
import Loader from "../../components/ui/Loader";
import { TextInput } from "../../components/ui/inputs";
import { getCmsPayload, useCmsRecord } from "../../hooks/useCmsRecord";
import { FALLBACK_CONTACT_PAGE } from "../../data/fallbackCmsData";
import { contactSchema } from "../../validations/validationSchemas";
import {
  getSectionByTitle,
  mapContactInformation,
  getSubjectOptions,
} from "./contactUtils";

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

const inquiryTypes = [
  { label: "General Inquiry", icon: MessageCircle, subject: "General Inquiry" },
  { label: "Order & Delivery", icon: Package, subject: "Order & Delivery" },
  { label: "Returns & Refunds", icon: RefreshCw, subject: "Returns & Refunds" },
  { label: "Business Partnership", icon: Handshake, subject: "Business Partnership" },
  { label: "Seller Support", icon: Store, subject: "Seller Support" },
  { label: "Customer Support", icon: Headset, subject: "Customer Support" },
];


const fieldClass =
  "h-10 w-full rounded-lg border border-[#D8DCE8] bg-white px-3.5 text-sm text-[#171B3F] outline-none transition-colors duration-200 placeholder:text-[#9298AA] hover:border-[#B9A36B] focus:border-[#D4A12F] focus:ring-2 focus:ring-[#D4A12F]/15";

export default function ContactUs() {
  const { page: cmsPage, loading } = useCmsRecord("contact-us");

  const cmsPayload = getCmsPayload(cmsPage);
  const cmsSections = Array.isArray(cmsPayload?.sections)
    ? cmsPayload.sections
    : [];
  const fallbackSections = Array.isArray(FALLBACK_CONTACT_PAGE?.sections)
    ? FALLBACK_CONTACT_PAGE.sections
    : [];

  const cmsContactSection = getSectionByTitle(cmsSections, "contact-info");
  const fallbackContactSection = getSectionByTitle(
    fallbackSections,
    "contact-info",
  );

  const cmsContactInformation = mapContactInformation(cmsContactSection);
  const fallbackContactInformation = mapContactInformation(
    fallbackContactSection,
  );

  const contactInformation =
    cmsContactInformation.length > 0
      ? cmsContactInformation
      : fallbackContactInformation;

  const cmsSubjectSection = getSectionByTitle(cmsSections, "subject");
  const fallbackSubjectSection = getSectionByTitle(fallbackSections, "subject");
  const cmsSubjectOptions = getSubjectOptions(cmsSubjectSection);
  const fallbackSubjectOptions = getSubjectOptions(fallbackSubjectSection);

  const subjectOptions =
    cmsSubjectOptions.length > 0 ? cmsSubjectOptions : fallbackSubjectOptions;

  const pageTitle =
    cmsPayload?.title?.trim() || FALLBACK_CONTACT_PAGE?.title || "Contact Us";

  const pageDescription =
    cmsPayload?.description?.trim() ||
    cmsPayload?.excerpt?.trim() ||
    FALLBACK_CONTACT_PAGE?.excerpt ||
    "Get in touch with Sam Global for support, inquiries, or feedback.";

  const businessEmail =
    contactInformation.find((item) => item.title.toLowerCase() === "email")
      ?.value || "maintenancestesting@gmail.com";

  const [submitted, setSubmitted] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactSchema),
    mode: "onChange",
    defaultValues: INITIAL_FORM,
  });

  const currentSubject = watch("subject") || "";
  const subjectDisplayMap = new Map(
    [...inquiryTypes, ...subjectOptions.map((subject) => ({
      label: subject,
      subject,
      icon: MessageCircle,
    }))]
      .filter((item) => item?.subject)
      .map((item) => [String(item.subject).trim(), item.label || item.subject]),
  );

  const dropdownOptions = Array.from(
    new Map(
      [...inquiryTypes.map((item) => item.subject), ...subjectOptions]
        .filter(Boolean)
        .map((subject) => [String(subject).trim().toLowerCase(), subject]),
    ).values(),
  );

  const selectedInquiry =
    subjectDisplayMap.get(currentSubject) || "General Inquiry";

  const handleInquirySelect = (inquiry) => {
    setValue("subject", inquiry.subject, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const onSubmit = (values) => {
    setLoadingForm(true);
    setTimeout(() => {
      setLoadingForm(false);
      setSubmitted(true);
      reset(INITIAL_FORM);
    }, 1500);
  };

  return (
    <>
      <Seo
        title={`${pageTitle} - Sam Global`}
        metaDescription={pageDescription}
      />

      {loading && !cmsPage ? (
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader size="xl" />
        </div>
      ) : (
        <>
          <PageIntroBanner title={pageTitle} description={pageDescription} />

          <section className="w-full py-5 sm:py-6">
            <PageContainer>
              <div className="grid items-start gap-5 lg:grid-cols-[minmax(280px,0.78fr)_minmax(0,2fr)]">
                <aside className="rounded-lg border border-[#E5E8F0] bg-white p-4 shadow-[0_8px_24px_rgba(23,27,63,0.06)] sm:p-5">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold tracking-tight text-[#171B65] sm:text-2xl">
                      Get in Touch
                    </h2>
                    <div className="mt-2 h-0.5 w-12 bg-[#D4A12F]" />
                    <p className="mt-2 text-sm text-[#626982]">
                      We&apos;d love to hear from you.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {contactInformation.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={`${item.title}-${index}`}
                          className="group flex items-start gap-3"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FBF5E9] text-[#B98212] transition-colors duration-200 group-hover:bg-[#D4A12F] group-hover:text-white">
                            <Icon size={19} strokeWidth={1.8} />
                          </div>

                          <div className="min-w-0 flex-1 pt-0.5">
                            <p className="text-sm font-semibold text-[#171B3F]">
                              {item.title === "email"
                                ? "Email Us"
                                : item.title === "phone"
                                  ? "Call Us"
                                  : item.title === "address"
                                    ? "Visit Us"
                                    : item.title}
                            </p>
                            <p className="mt-0.5 whitespace-pre-line break-words text-sm leading-5 text-[#626982] cursaor-pointer">
                              {item.value}
                            </p>
                            {item.title.toLowerCase() === "phone" && (
                              <p className="mt-0.5 text-xs text-[#858BA0]">
                                Mon – Sat, 10:00 AM – 7:00 PM
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="my-4 border-t border-[#E5E8F0]" />

                
                  <div className="mt-4 rounded-lg border border-[#E9D9B5] bg-[#FFFAEF] p-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-[#171B65]">
                      Brand & Business Inquiries
                    </p>
                    <p className="mt-1.5 text-sm leading-5 text-[#626982]">
                      Looking to partner with us or expand with Sam Global?
                    </p>
                    <p className="mt-1.5 break-all text-sm font-semibold text-[#171B65] cursor-pointer">
                      {businessEmail}
                    </p>
                  </div>
                </aside>

                {/* Contact form */}
                <div className="rounded-lg border border-[#E5E8F0] bg-white p-4 shadow-[0_8px_24px_rgba(23,27,63,0.06)] sm:p-5">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold tracking-tight text-[#171B65] sm:text-2xl">
                      How Can We Help You?
                    </h2>
                    <div className="mt-2 h-0.5 w-12 bg-[#D4A12F]" />
                    <p className="mt-2 text-sm leading-5 text-[#626982]">
                      Select a topic and share your details. Our team will get
                      back to you at the earliest.
                    </p>
                  </div>

                  <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
                    {inquiryTypes.map((inquiry) => {
                      const Icon = inquiry.icon;
                      const isSelected = selectedInquiry === inquiry.label;

                      return (
                        <button
                          key={inquiry.label}
                          type="button"
                          onClick={() => handleInquirySelect(inquiry)}
                          aria-pressed={isSelected}
                          className={`flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-lg border px-2 py-3 text-center transition-all duration-200 ${
                            isSelected
                              ? "border-[#D4A12F] bg-[#FFF7E7] text-[#171B65] shadow-[0_3px_10px_rgba(212,161,47,0.12)]"
                              : "border-[#E0E4EE] bg-white text-[#171B3F] hover:border-[#D4A12F] hover:bg-[#FFFAEF]"
                          }`}
                        >
                          <span
                            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                              isSelected
                                ? "bg-white text-[#B98212]"
                                : "bg-[#F5F6FA] text-[#171B65] group-hover:bg-white"
                            }`}
                          >
                            <Icon size={21} strokeWidth={1.8} />
                          </span>
                          <span className="text-xs font-semibold leading-4">
                            {inquiry.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {submitted && (
                    <BaseModal
                      onClose={() => setSubmitted(false)}
                      maxWidth="max-w-md"
                    >
                      <div className="p-6 sm:p-8">
                        <div className="flex flex-col items-center text-center">
                          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-green-50">
                            <CheckCircle className="h-9 w-9 text-green-600" />
                          </div>
                          <h3 className="text-2xl font-bold text-[#171B65]">
                            Thank You!
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-[#626982]">
                            Your message has been submitted successfully. Our
                            team will contact you within 24 hours.
                          </p>
                          <button
                            type="button"
                            onClick={() => setSubmitted(false)}
                            className="mt-5 h-10 w-full rounded-lg bg-[#D4A12F] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#B98212]"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    </BaseModal>
                  )}

                  <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="grid gap-x-4 gap-y-3.5 sm:grid-cols-2">
                      <TextInput
                        id="contact-name"
                        label="Full Name"
                        required
                        type="text"
                        autoComplete="name"
                        placeholder="Enter your full name"
                        registration={register("name")}
                        error={errors.name}
                        inputClassName={`${fieldClass} ${errors.name ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}`}
                      />

                      <TextInput
                        id="contact-email"
                        label="Email Address"
                        required
                        type="email"
                        autoComplete="email"
                        placeholder="Enter your email address"
                        registration={register("email")}
                        error={errors.email}
                        inputClassName={`${fieldClass} ${errors.email ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}`}
                      />

                      <TextInput
                        id="contact-phone"
                        label="Phone Number"
                        required
                        type="tel"
                        autoComplete="tel"
                        placeholder="Enter your 10-digit phone number"
                        registration={{
                          ...register("phone"),
                          onChange: (event) => {
                            const sanitizedValue = event.target.value
                              .replace(/\D/g, "")
                              .slice(0, 10);

                            event.target.value = sanitizedValue;
                            register("phone").onChange(event);
                          },
                        }}
                        error={errors.phone}
                        inputClassName={`${fieldClass} ${errors.phone ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}`}
                      />

                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-[#171B3F]">
                          Subject <span className="text-red-500">*</span>
                        </label>
                        <CustomDropdown
                          options={dropdownOptions}
                          value={currentSubject}
                          onChange={(val) => {
                            setValue("subject", val, {
                              shouldValidate: true,
                              shouldDirty: true,
                            });
                          }}
                          placeholder="Select a subject"
                          buttonClassName={`!h-10 !rounded-lg !border !border-[#D8DCE8] !bg-white !text-sm !text-[#171B3F] !shadow-none transition-colors hover:!border-[#B9A36B] focus:!border-[#D4A12F] focus:!ring-2 focus:!ring-[#D4A12F]/15 ${errors.subject ? "!border-red-400" : ""}`}
                          error={errors.subject}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="contact-message"
                          className="mb-1.5 block text-sm font-semibold text-[#171B3F]"
                        >
                          Message <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="contact-message"
                          rows={4}
                          {...register("message")}
                          placeholder="Describe your query in detail..."
                          aria-invalid={Boolean(errors.message)}
                          className={`min-h-[104px] w-full resize-y rounded-lg border border-[#D8DCE8] bg-white px-3.5 py-3 text-sm text-[#171B3F] outline-none transition-colors duration-200 placeholder:text-[#9298AA] hover:border-[#B9A36B] focus:border-[#D4A12F] focus:ring-2 focus:ring-[#D4A12F]/15 ${errors.message ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}`}
                        />
                        {errors.message && (
                          <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>
                        )}
                      </div>
                    </div>

                    <div className=" flex flex-col gap-3 border-t border-[#EEF0F5] pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-2 text-[#626982]">
                        <Info size={17} className="mt-0.5 shrink-0 text-[#171B65]" />
                        <p className="text-xs leading-5">
                          We typically respond within 24 hours.
                          <span className="block text-[#858BA0]">
                            Mon – Sat, 10:00 AM – 7:00 PM
                          </span>
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={loadingForm}
                        className="inline-flex h-10 min-w-[150px] items-center justify-center gap-2 rounded-lg bg-[#D4A12F] px-5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(212,161,47,0.2)] transition-colors duration-200 hover:bg-[#B98212] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A12F] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Send size={16} />
                        {loadingForm ? "Sending..." : "Send Message"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </PageContainer>
          </section>
        </>
      )}
    </>
  );
}