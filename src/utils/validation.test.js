import { describe, expect, it } from "vitest";
import { validateAssignment, validateLogin, validateSectionName } from "./validation";

const NOW = new Date("2026-11-06T12:00:00");

const valid = {
  title: "Assignment 1",
  cohortId: "sec-1",
  description: "Build the schema",
  criteria: "1. Correct (5 pts)",
  dueDate: "2026-12-01T23:59",
  attachmentUrl: "",
};

describe("validateAssignment", () => {
  it("accepts a complete assignment", () => {
    expect(validateAssignment(valid, { now: NOW })).toEqual({});
  });

  it("requires title, section, description, criteria and due date", () => {
    const errors = validateAssignment(
      { title: " ", cohortId: "", description: "", criteria: "", dueDate: "", attachmentUrl: "" },
      { now: NOW },
    );
    expect(Object.keys(errors).sort()).toEqual(["cohortId", "criteria", "description", "dueDate", "title"]);
  });

  it("rejects a past due date when creating", () => {
    const errors = validateAssignment({ ...valid, dueDate: "2026-10-01T09:00" }, { now: NOW });
    expect(errors.dueDate).toBe("Due date must be in the future");
  });

  it("allows an unchanged past due date when editing (e.g. fixing a typo on an overdue assignment)", () => {
    const past = "2026-10-01T09:00";
    const errors = validateAssignment({ ...valid, dueDate: past }, { now: NOW, unchangedDueDate: past });
    expect(errors.dueDate).toBeUndefined();
  });

  it("rejects changing the due date to another past date when editing", () => {
    const errors = validateAssignment(
      { ...valid, dueDate: "2026-09-01T09:00" },
      { now: NOW, unchangedDueDate: "2026-10-01T09:00" },
    );
    expect(errors.dueDate).toBe("Due date must be in the future");
  });

  it("rejects non-http attachment links but allows an empty one", () => {
    expect(validateAssignment({ ...valid, attachmentUrl: "ftp://x.com/a.pdf" }, { now: NOW }).attachmentUrl).toBeDefined();
    expect(validateAssignment({ ...valid, attachmentUrl: "https://x.com/a.pdf" }, { now: NOW })).toEqual({});
  });
});

describe("attachment rules", () => {
  it("rejects data: and blob: links", () => {
    expect(validateAssignment({ ...valid, attachmentUrls: ["data:text/plain,hi"] }, { now: NOW }).attachmentUrl).toBeDefined();
    expect(validateAssignment({ ...valid, attachmentUrls: ["blob:https://x.com/1"] }, { now: NOW }).attachmentUrl).toBeDefined();
  });

  it("counts existing stored files toward the size limit", () => {
    const stored = { name: "old.pdf", url: `data:application/pdf;base64,${"A".repeat(1000 * 1024)}` };
    expect(validateAssignment({ ...valid, attachmentFiles: [stored] }, { now: NOW }).attachmentFile).toBeDefined();
  });
});

describe("validateLogin", () => {
  const login = { fullName: "", email: "a@mfu.ac.th", password: "secret1" };

  it("needs only email and password to sign in", () => {
    expect(validateLogin(login)).toEqual({});
    expect(Object.keys(validateLogin({ ...login, email: "nope", password: "" })).sort()).toEqual(["email", "password"]);
  });

  it("needs a full name and a 6+ character password to sign up", () => {
    const errors = validateLogin({ ...login, password: "12345" }, { isSignUp: true });
    expect(Object.keys(errors).sort()).toEqual(["consent", "fullName", "password"]);
    expect(validateLogin({ ...login, fullName: "A", consent: true }, { isSignUp: true })).toEqual({});
  });
});

describe("validateSectionName", () => {
  it("requires a non-blank name up to 80 characters", () => {
    expect(validateSectionName("   ")).toBe("Please enter a section name");
    expect(validateSectionName("x".repeat(81))).toMatch(/80 characters/);
    expect(validateSectionName("CS101 - Section A")).toBeNull();
  });
});
