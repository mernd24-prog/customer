import { useMemo, useState } from "react";
import { CheckCircle, Clock3, Mail, MapPin, Phone, Send } from "lucide-react";
import Seo from "../../components/ui/Seo";
import CustomDropdown from "../../components/ui/CustomDropdown";
import BaseModal from "../../components/ui/overlay/BaseModal";
import Breadcrumbs from "../../modules/common/components/Breadcrumbs";
import PageContainer from "../../components/ui/layout/PageContainer";
import Loader from "../../components/ui/Loader";
import { useCmsRecord } from "../../hooks/useCmsRecord";
import { FALLBACK_CONTACT_PAGE } from "../../data/fallbackCmsData";
const getCmsPayload = (page) =>
  page?.metadata?.data ||
  page?.metadata?.content ||
  page?.data ||
  page?.content ||
  page;
const getSectionByTitle = (sections, title) => {
  if (!Array.isArray(sections)) return null;
  const normalizedTitle = title.trim().toLowerCase();
  return (
    sections.find(
      (section) => section?.title?.trim().toLowerCase() === normalizedTitle,
    ) || null
  );
};
const getContactIcon = (title = "") => {
  const normalizedTitle = title.trim().toLowerCase();
  switch (normalizedTitle) {
    case "email":
      return Mail;
    case "phone":
      return Phone;
    case "working hours":
      return Clock3;
    case "office":
      return MapPin;
    default:
      return Mail;
  }
};
const mapContactInformation = (section) => {
  if (!Array.isArray(section?.points)) {
    return [];
  }
  return section.points
    .map((point) => ({
      icon: getContactIcon(point?.title),
      title: point?.title?.trim() || "",
      value: point?.description?.trim() || "",
    }))
    .filter((item) => item.title && item.value);
};
const getSubjectOptions = (section) => {
  if (!Array.isArray(section?.points)) {
    return [];
  }
  return section.points
    .map((point) => point?.title?.trim() || "")
    .filter(Boolean);
};
export default function ContactUs() {
  const { page: cmsPage, loading } = useCmsRecord("contact-us");
  const cmsPayload = getCmsPayload(cmsPage);
  const cmsSections = Array.isArray(cmsPayload?.sections)
    ? cmsPayload.sections
    : [];
  const fallbackSections = Array.isArray(FALLBACK_CONTACT_PAGE?.sections)
    ? FALLBACK_CONTACT_PAGE.sections
    : [];
  /* * --------------------------------------------------------- * Contact Information * --------------------------------------------------------- */ const cmsContactSection =
    getSectionByTitle(cmsSections, "contact-info");
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
  /* * --------------------------------------------------------- * Subject Dropdown * --------------------------------------------------------- */ const cmsSubjectSection =
    getSectionByTitle(cmsSections, "subject");
  const fallbackSubjectSection = getSectionByTitle(fallbackSections, "subject");
  const cmsSubjectOptions = getSubjectOptions(cmsSubjectSection);
  const fallbackSubjectOptions = getSubjectOptions(fallbackSubjectSection);
  const subjectOptions =
    cmsSubjectOptions.length > 0 ? cmsSubjectOptions : fallbackSubjectOptions;
  /* * --------------------------------------------------------- * Page Content * --------------------------------------------------------- */ const pageTitle =
    cmsPayload?.title?.trim() || FALLBACK_CONTACT_PAGE?.title || "Contact Us";
  const pageDescription =
    cmsPayload?.description?.trim() ||
    cmsPayload?.excerpt?.trim() ||
    FALLBACK_CONTACT_PAGE?.excerpt ||
    "Get in touch with Sam Global for support, inquiries, or feedback.";
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const breadcrumbs = useMemo(
    () => [{ label: "Home", href: "/" }, { label: pageTitle }],
    [pageTitle],
  );
  const validate = () => {
    const err = {};
    if (!form.name.trim()) {
      err.name = "Name is required";
    } else if (form.name.trim().length < 3) {
      err.name = "Minimum 3 characters";
    }
    if (!form.email.trim()) {
      err.email = "Email is required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email)) {
      err.email = "Invalid email";
    }
    if (!form.phone.trim()) {
      err.phone = "Phone is required";
    } else if (!/^\d{10}$/.test(form.phone)) {
      err.phone = "Enter valid 10 digit number";
    }
    if (!form.subject) {
      err.subject = "Please select subject";
    }
    if (!form.message.trim()) {
      err.message = "Message is required";
    } else if (form.message.trim().length < 10) {
      err.message = "Minimum 10 characters";
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoadingForm(true);
    setTimeout(() => {
      setLoadingForm(false);
      setSubmitted(true);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
      setErrors({});
    }, 1500);
  };
  return (
    <>
      {" "}
      <Seo
        title={`${pageTitle} - Sam Global`}
        metaDescription={pageDescription}
      />{" "}
      {loading && !cmsPage ? (
        <div className="flex min-h-[60vh] items-center justify-center">
          {" "}
          <Loader size="xl" />{" "}
        </div>
      ) : (
        <>
          {" "}
          {/* Page Banner */}{" "}
          <section className="relative left-1/2 w-screen -translate-x-1/2 bg-[#211B73] py-10 md:py-12 lg:py-14">
            {" "}
            <div className="flex w-full items-center justify-center px-4 sm:px-6 lg:px-8">
              {" "}
              <h1 className="text-center text-2xl font-bold text-white md:text-3xl lg:text-[32px]">
                {" "}
                {pageTitle}{" "}
              </h1>{" "}
            </div>{" "}
          </section>{" "}
          {/* Breadcrumb + Contact Content */}{" "}
          <section className="w-full pt-3 pb-10 md:pb-12">
            {" "}
            <PageContainer>
              {" "}
              {/* Breadcrumbs */}{" "}
              <Breadcrumbs
                items={breadcrumbs}
                className="mb-6 flex flex-wrap items-center gap-[10px] sm:mb-8 sm:gap-[12px] lg:gap-[15px]"
              />{" "}
              {/* Main Contact Layout */}{" "}
              <div className="grid items-start gap-8 lg:grid-cols-3 lg:gap-10">
                {" "}
                {/* LEFT - CONTACT INFORMATION */}{" "}
                <div className="rounded-lg bg-white p-6 shadow-[0_6px_24px_rgba(0,0,0,0.10)] sm:p-8 lg:col-span-1">
                  {" "}
                  <div className="mb-7">
                    {" "}
                    <h2 className="text-2xl font-bold text-[#1d2377]">
                      {" "}
                      {cmsContactSection?.title
                        ? "Contact Information"
                        : "Contact Information"}{" "}
                    </h2>{" "}
                    <div className="mt-2 h-[2px] w-12 bg-[#d4a12f]" />{" "}
                    {cmsContactSection?.description?.trim() && (
                      <p className="mt-3 text-sm leading-6 text-gray-500">
                        {" "}
                        {cmsContactSection.description.trim()}{" "}
                      </p>
                    )}{" "}
                  </div>{" "}
                  <div className="space-y-7">
                    {" "}
                    {contactInformation.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={`${item.title}-${index}`}
                          className="group flex items-start gap-4"
                        >
                          {" "}
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fff8e8] transition-all duration-300 group-hover:bg-[#d4a12f]">
                            {" "}
                            <Icon
                              size={20}
                              strokeWidth={1.8}
                              className="text-[#d4a12f] transition-colors duration-300 group-hover:text-white"
                            />{" "}
                          </div>{" "}
                          <div className="min-w-0 pt-0.5">
                            {" "}
                            <p className="mb-1 text-sm font-semibold text-[#1d2377]">
                              {" "}
                              {item.title}{" "}
                            </p>{" "}
                            <p className="whitespace-pre-line break-words text-sm leading-6 text-gray-500">
                              {" "}
                              {item.value}{" "}
                            </p>{" "}
                          </div>{" "}
                        </div>
                      );
                    })}{" "}
                  </div>{" "}
                </div>{" "}
                {/* RIGHT - CONTACT FORM */}{" "}
                <div className="rounded-lg bg-white p-6 shadow-[0_6px_24px_rgba(0,0,0,0.10)] sm:p-7 lg:col-span-2">
                  {" "}
                  <div className="mb-7">
                    {" "}
                    <h2 className="text-2xl font-bold text-[#1d2377]">
                      {" "}
                      Send us a Message{" "}
                    </h2>{" "}
                    <div className="mt-2 h-[2px] w-12 bg-[#d4a12f]" />{" "}
                  </div>{" "}
                  {/* Success Modal */}{" "}
                  {submitted && (
                    <BaseModal
                      onClose={() => setSubmitted(false)}
                      maxWidth="max-w-md"
                    >
                      {" "}
                      <div className="relative p-6 md:p-10">
                        {" "}
                        <div className="mt-2 flex flex-col items-center text-center">
                          {" "}
                          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-50">
                            {" "}
                            <CheckCircle className="h-12 w-12 text-green-500" />{" "}
                          </div>{" "}
                          <h3 className="mb-4 text-2xl font-bold text-[#1d2377] md:text-3xl">
                            {" "}
                            Thank You!{" "}
                          </h3>{" "}
                          <p className="mb-8 text-[1.05rem] leading-relaxed text-gray-500">
                            {" "}
                            Your message has been submitted successfully. Our
                            team will contact you within 24 hours.{" "}
                          </p>{" "}
                          <button
                            type="button"
                            onClick={() => setSubmitted(false)}
                            className="w-full rounded-xl border border-[#E7D9B8] bg-[#d4a12f] px-8 py-4 font-semibold text-white shadow-yellow-500/20 transition-all duration-300 hover:bg-yellow-500"
                          >
                            {" "}
                            Done{" "}
                          </button>{" "}
                        </div>{" "}
                      </div>{" "}
                    </BaseModal>
                  )}{" "}
                  <form onSubmit={handleSubmit}>
                    {" "}
                    <div className="grid gap-5 md:grid-cols-2">
                      {" "}
                      {/* Name */}{" "}
                      <div>
                        {" "}
                        <label className="mb-2 block text-sm font-medium text-[#1d2377]">
                          {" "}
                          Full Name{" "}
                        </label>{" "}
                        <input
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Enter your full name"
                          className="h-11 w-full rounded-lg border border-[#E7D9B8] bg-[#fafafa] px-4 text-sm text-gray-700 outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-[#CE9F2D] focus:bg-white focus:outline-none focus:ring-0"
                        />{" "}
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-500">
                            {" "}
                            {errors.name}{" "}
                          </p>
                        )}{" "}
                      </div>{" "}
                      {/* Email */}{" "}
                      <div>
                        {" "}
                        <label className="mb-2 block text-sm font-medium text-[#1d2377]">
                          {" "}
                          Email{" "}
                        </label>{" "}
                        <input
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="Enter your email"
                          className="h-11 w-full rounded-lg border border-[#E7D9B8] bg-[#fafafa] px-4 text-sm text-gray-700 outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-[#CE9F2D] focus:bg-white focus:outline-none focus:ring-0"
                        />{" "}
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-500">
                            {" "}
                            {errors.email}{" "}
                          </p>
                        )}{" "}
                      </div>{" "}
                      {/* Phone */}{" "}
                      <div>
                        {" "}
                        <label className="mb-2 block text-sm font-medium text-[#1d2377]">
                          {" "}
                          Phone Number{" "}
                        </label>{" "}
                        <input
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="Enter your phone number"
                          className="h-11 w-full rounded-lg border border-[#E7D9B8] bg-[#fafafa] px-4 text-sm text-gray-700 outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-[#CE9F2D] focus:bg-white focus:outline-none focus:ring-0"
                        />{" "}
                        {errors.phone && (
                          <p className="mt-1 text-sm text-red-500">
                            {" "}
                            {errors.phone}{" "}
                          </p>
                        )}{" "}
                      </div>{" "}
                      {/* Subject */}{" "}
                      <div>
                        {" "}
                        <label className="mb-2 block text-sm font-medium text-[#1d2377]">
                          {" "}
                          Subject{" "}
                        </label>{" "}
                        <CustomDropdown
                          options={subjectOptions}
                          value={form.subject}
                          onChange={(val) => {
                            setForm((prev) => ({ ...prev, subject: val }));
                            setErrors((prev) => ({ ...prev, subject: "" }));
                          }}
                          placeholder="Select Subject"
                          buttonClassName="!h-11 !rounded-lg !border !border-[#E7D9B8] !bg-[#fafafa] !text-sm !outline-none !shadow-none focus:!border-[#E7D9B8] focus:!outline-none focus:!ring-0 focus:!shadow-none focus-visible:!outline-none focus-visible:!ring-0 focus-visible:!shadow-none"
                          error={errors.subject}
                        />{" "}
                      </div>{" "}
                      {/* Message */}{" "}
                      <div className="md:col-span-2">
                        {" "}
                        <label className="mb-2 block text-sm font-medium text-[#1d2377]">
                          {" "}
                          Message{" "}
                        </label>{" "}
                        <textarea
                          rows="3"
                          name="message"
                          value={form.message}
                          onChange={handleChange}
                          placeholder="Write your message"
                          className="h-[100px] w-full resize-none rounded-lg border border-[#E7D9B8] bg-[#fafafa] p-4 text-sm text-gray-700 outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-[#CE9F2D] focus:bg-white focus:outline-none focus:ring-0"
                        />{" "}
                        {errors.message && (
                          <p className="mt-1 text-sm text-red-500">
                            {" "}
                            {errors.message}{" "}
                          </p>
                        )}{" "}
                      </div>{" "}
                    </div>{" "}
                    {/* Submit */}{" "}
                    <div className="mt-5 flex justify-center">
                      {" "}
                      <button
                        type="submit"
                        disabled={loadingForm}
                        className="flex h-11 min-w-[140px] items-center justify-center gap-2 rounded-xl bg-[#d4a12f] px-6 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {" "}
                        <Send size={17} />{" "}
                        {loadingForm ? "Sending..." : "Send Message"}{" "}
                      </button>{" "}
                    </div>{" "}
                  </form>{" "}
                </div>{" "}
              </div>{" "}
            </PageContainer>{" "}
          </section>{" "}
        </>
      )}{" "}
    </>
  );
}
