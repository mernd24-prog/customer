import { Mail, MapPin, Phone } from "lucide-react";

export const getSectionByTitle = (sections, title) => {
  if (!Array.isArray(sections)) return null;

  const normalizedTitle = String(title || "").trim().toLowerCase();

  if (!normalizedTitle) return null;

  return (
    sections.find(
      (section) => String(section?.title || "").trim().toLowerCase() === normalizedTitle,
    ) || null
  );
};

export const getContactIcon = (title = "") => {
  switch (String(title).trim().toLowerCase()) {
    case "email":
      return Mail;
    case "phone":
      return Phone;
    case "address":
    case "office":
      return MapPin;
    default:
      return Mail;
  }
};

export const mapContactInformation = (section) => {
  if (!Array.isArray(section?.points)) return [];

  return section.points
    .map((point) => ({
      icon: getContactIcon(point?.title),
      title: String(point?.title || "").trim(),
      value: String(point?.description || "").trim(),
    }))
    .filter((item) => item.title && item.value);
};

export const getSubjectOptions = (section) => {
  if (!Array.isArray(section?.points)) return [];

  return section.points
    .map((point) => String(point?.title || "").trim())
    .filter(Boolean);
};
