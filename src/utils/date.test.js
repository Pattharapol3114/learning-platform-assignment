import { describe, expect, it } from "vitest";
import { getDueStatus, toDate } from "./date";

describe("toDate", () => {
  it("reads Firestore Timestamp JSON written by the Admin SDK", () => {
    expect(toDate({ _seconds: 1790812740, _nanoseconds: 0 })).toEqual(new Date(1790812740 * 1000));
  });

  it("reads ISO strings written by the REST API", () => {
    expect(toDate("2026-12-12T16:59:00.000Z")?.toISOString()).toBe("2026-12-12T16:59:00.000Z");
  });

  it("returns null for missing or unparseable values", () => {
    expect(toDate(null)).toBeNull();
    expect(toDate("")).toBeNull();
    expect(toDate("not a date")).toBeNull();
    expect(toDate({ foo: 1 })).toBeNull();
  });
});

describe("getDueStatus", () => {
  const now = new Date("2026-11-06T12:00:00Z");

  it("classifies open, due-soon, overdue and undated assignments", () => {
    expect(getDueStatus(new Date("2026-12-01T00:00:00Z"), now)).toBe("open");
    expect(getDueStatus(new Date("2026-11-07T12:00:00Z"), now)).toBe("due-soon");
    expect(getDueStatus(new Date("2026-11-01T00:00:00Z"), now)).toBe("overdue");
    expect(getDueStatus(null, now)).toBe("no-date");
  });
});
