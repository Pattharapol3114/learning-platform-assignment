import { DUE_SOON_WINDOW_MS } from "../config";

// Accepts Firestore Timestamp JSON ({_seconds}/{seconds}), ISO strings,
// epoch numbers, or Dates. Returns null for anything unparseable.
export function toDate(value) {
  if (value == null || value === "") return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  if (typeof value === "object") {
    const seconds = value._seconds ?? value.seconds;
    if (typeof seconds === "number") return new Date(seconds * 1000);
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
});

const relativeFormatter = new Intl.RelativeTimeFormat("en-GB", { numeric: "auto" });

export function formatDateTime(date) {
  return date ? dateTimeFormatter.format(date) : "—";
}

export function formatRelative(date, now = new Date()) {
  if (!date) return "";
  const diffMs = date.getTime() - now.getTime();
  const units = [
    ["day", 86400000],
    ["hour", 3600000],
    ["minute", 60000],
  ];
  for (const [unit, ms] of units) {
    if (Math.abs(diffMs) >= ms || unit === "minute") {
      return relativeFormatter.format(Math.round(diffMs / ms), unit);
    }
  }
  return "";
}

/** @returns {"open" | "due-soon" | "overdue" | "no-date"} */
export function getDueStatus(dueDate, now = new Date()) {
  if (!dueDate) return "no-date";
  const diff = dueDate.getTime() - now.getTime();
  if (diff < 0) return "overdue";
  if (diff <= DUE_SOON_WINDOW_MS) return "due-soon";
  return "open";
}

// Value for <input type="datetime-local"> in the user's local time zone.
export function toDateTimeLocalValue(date) {
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}
