import { SUPPORT_TOPIC_IMAGE_BY_TITLE } from "../../../data/supportPage";

export function getTopicImage(title = "") {
  const normalized = title.toLowerCase();

  const match = Object.entries(SUPPORT_TOPIC_IMAGE_BY_TITLE).find(([key]) =>
    normalized.includes(key),
  );

  return match?.[1] || "/image/png/default-topic.png";
}

export function parseBodySections(body = "") {
  if (!body) return [];

  const sections = [];
  let current = null;

  body.split(/\n+/).forEach((line) => {
    const value = line.trim();

    if (!value) return;

    if (value.startsWith("## ")) {
      current = {
        title: value.replace(/^##\s+/, "").trim(),
        description: "",
      };

      sections.push(current);
      return;
    }

    if (value.startsWith("# ")) return;

    if (current) {
      current.description = [current.description, value]
        .filter(Boolean)
        .join(" ");
    }
  });

  return sections.filter((section) => section.title);
}

export function normalizeKey(value = "") {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function getSection(page, names) {
  const sections = Array.isArray(page?.sections) ? page.sections : [];
  const normalizedNames = names.map(normalizeKey);

  return sections.find((section) => {
    const sectionKeys = [section?.type, section?.title].map(normalizeKey);

    return sectionKeys.some((key) => normalizedNames.includes(key));
  });
}

export function mapCards(items = []) {
  return items
    .filter((item) => item?.title)
    .map((item) => ({
      title: item.title,
      description: item.description,
      image: getTopicImage(item.title),
      path: item.path || "/contact",
    }));
}

export function normalizeHelpTopics(page) {
  const section = getSection(page, ["All Help Topics"]);
  const points = Array.isArray(section?.points) ? section.points : [];

  if (points.length) {
    return mapCards(points);
  }

  const rootPoints = Array.isArray(page?.points) ? page.points : [];

  return mapCards(rootPoints.filter((item) => !item?.description)).slice(0, 8);
}

export function normalizeCommonQuestions(page) {
  const section = getSection(page, ["Common Question", "Common Questions"]);

  const points = Array.isArray(section?.points) ? section.points : [];

  if (points.length) {
    return mapCards(points);
  }

  const rootPoints = Array.isArray(page?.points) ? page.points : [];

  const questionPoints = rootPoints.filter((item) => item?.description);

  const bodySections = parseBodySections(page?.body);

  return mapCards(questionPoints.length ? questionPoints : bodySections).slice(
    0,
    6,
  );
}

export function formatSupportCategory(category = "") {
  return String(category || "")
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatSupportDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function normalizeSupportQueries(result) {
  const items = Array.isArray(result?.items)
    ? result.items
    : Array.isArray(result)
      ? result
      : [];

  return items.map((item) => {
    const messages = (
      Array.isArray(item.messages)
        ? item.messages
        : Array.isArray(item.metadata?.messages)
          ? item.metadata.messages
          : []
    ).map((m) => {
      const rawTime = m.createdAt || m.created_at || m.sentAt || null;
      return {
        ...m,
        rawCreatedAt: rawTime,
        createdAt: formatSupportDate(rawTime),
      };
    });

    const statusHistory = (
      Array.isArray(item.statusHistory)
        ? item.statusHistory
        : Array.isArray(item.metadata?.statusHistory)
          ? item.metadata.statusHistory
          : []
    ).map((historyItem) => ({
      ...historyItem,
      rawChangedAt: historyItem.changedAt || null,
      changedAt: formatSupportDate(historyItem.changedAt),
    }));

    return {
      id: item.queryId || item.id,
      subject: item.subject || "Support request",
      message: item.message || "",
      messages,
      category: item.category || "OTHER",
      categoryLabel: formatSupportCategory(item.category || "OTHER"),
      status: item.status || "pending",
      adminNotes: item.adminNotes || "",
      statusHistory,
      resolvedAt: item.resolvedAt ? formatSupportDate(item.resolvedAt) : "",
      rawCreatedAt: item.createdAt || null,
      rawUpdatedAt: item.updatedAt || item.createdAt || null,
      createdAt: formatSupportDate(item.createdAt),
      updatedAt: formatSupportDate(item.updatedAt || item.createdAt),
    };
  });
}
