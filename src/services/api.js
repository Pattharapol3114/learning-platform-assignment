import { request } from "./httpClient";
import { toDate } from "../utils/date";

// The API returns Firestore Timestamps as {_seconds, _nanoseconds} for records
// written by the SDK, and plain ISO strings for records POSTed as JSON.
// Normalise both into Date objects at the boundary so UI code never has to care.
function normalizeAssignment(raw) {
  return {
    id: raw.id,
    cohortId: raw.cohortId ?? "",
    // Not returned by the API today; picked up automatically if it ever is,
    // which lets the UI skip the extra cohort lookup.
    cohortName: raw.cohortName ?? raw.sectionName ?? raw.cohort?.name ?? null,
    instructorId: raw.instructorId ?? "",
    title: raw.title ?? "(Untitled)",
    description: raw.description ?? "",
    criteria: raw.criteria ?? "",
    dueDate: toDate(raw.dueDate),
    attachmentUrl: raw.attachmentUrl || null,
    createdAt: toDate(raw.createdAt),
  };
}

function normalizeSubmission(raw) {
  return {
    id: raw.submission_id,
    studentId: raw.student_id,
    type: raw.submission_type,
    fileName: raw.file_name,
    externalLink: raw.external_link,
    submittedAt: toDate(raw.submitted_at),
    cancelledAt: toDate(raw.cancelled_at),
    status: raw.status,
  };
}

// ---------- Team 05: Assignments ----------

export const assignmentApi = {
  async list({ signal } = {}) {
    const data = await request("/api/assignments", { signal });
    return (Array.isArray(data) ? data : []).map(normalizeAssignment);
  },

  async get(assignmentId, { signal } = {}) {
    const data = await request(`/api/assignments/${encodeURIComponent(assignmentId)}`, { signal });
    return normalizeAssignment(data);
  },

  /** @returns {Promise<{ id: string }>} */
  create(payload) {
    return request("/api/assignments", { method: "POST", body: payload });
  },
};

// ---------- Team 05: Cohorts ----------

export const cohortApi = {
  async list({ signal } = {}) {
    const data = await request("/api/cohorts", { signal });
    return Array.isArray(data) ? data : [];
  },

  get(cohortId, { signal } = {}) {
    return request(`/api/cohorts/${encodeURIComponent(cohortId)}`, { signal });
  },
};

// ---------- Team 06: Submissions (via our proxy) ----------

export const submissionApi = {
  /**
   * The proxy answers 200 with `fallback: true` when Team 06 is down, 404s,
   * or times out — so callers must check `degraded`, not just catch errors.
   * @returns {Promise<{ submissions: object[], degraded: boolean, reason: string | null }>}
   */
  async listByAssignment(assignmentId, { signal } = {}) {
    const data = await request(
      `/api/team06/assignments/${encodeURIComponent(assignmentId)}/submissions`,
      { signal },
    );

    if (!data || data.fallback || !Array.isArray(data.submissions)) {
      return {
        submissions: [],
        degraded: true,
        reason: data?.error_detail || data?.warning || "Unexpected response from Team 06",
      };
    }

    return {
      submissions: data.submissions.map(normalizeSubmission),
      degraded: false,
      reason: null,
    };
  },
};
