// @vitest-environment node
// (the real fetch/AbortSignal APIs are needed by httpClient; jsdom lacks AbortSignal.any)
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { assignmentApi, cohortApi, submissionApi } from "./api";

let fetchMock;

function respond(status, body) {
  return Promise.resolve(new Response(body === undefined ? "" : JSON.stringify(body), { status }));
}

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => vi.unstubAllGlobals());

describe("submissionApi.listByAssignment (Team 06 integration)", () => {
  it("normalises a healthy Team 06 response", async () => {
    fetchMock.mockReturnValue(
      respond(200, {
        assignment_id: "a1",
        submissions: [
          {
            submission_id: "s1",
            student_id: "stu-1",
            submission_type: "LINK",
            file_name: null,
            external_link: "https://github.com/x",
            submitted_at: "2026-09-20T18:25:31.659+00:00",
            cancelled_at: null,
            status: "ON_TIME",
          },
        ],
      }),
    );

    const result = await submissionApi.listByAssignment("a1");

    expect(fetchMock).toHaveBeenCalledWith("/api/team06/assignments/a1/submissions", expect.any(Object));
    expect(result.degraded).toBe(false);
    expect(result.submissions[0]).toMatchObject({ id: "s1", studentId: "stu-1", status: "ON_TIME" });
    expect(result.submissions[0].submittedAt).toBeInstanceOf(Date);
  });

  it("treats the proxy's 200 + fallback:true as degraded instead of 'no submissions'", async () => {
    fetchMock.mockReturnValue(
      respond(200, { assignment_id: "a1", submissions: [], fallback: true, error_detail: "Team06 returned status 404" }),
    );

    const result = await submissionApi.listByAssignment("a1");

    expect(result).toEqual({ submissions: [], degraded: true, reason: "Team06 returned status 404" });
  });

  it("raises an ApiError when our proxy itself fails", async () => {
    fetchMock.mockReturnValue(respond(500, { error: "boom" }));
    await expect(submissionApi.listByAssignment("a1")).rejects.toMatchObject({ name: "ApiError", status: 500 });
  });
});

describe("assignmentApi", () => {
  it("exposes the HTTP status on 404 so pages can show 'not found'", async () => {
    fetchMock.mockReturnValue(respond(404, { error: "Assignment not found" }));
    await expect(assignmentApi.get("missing")).rejects.toMatchObject({ status: 404, message: "Assignment not found" });
  });

  it("deletes with DELETE /api/assignments/:id", async () => {
    fetchMock.mockReturnValue(respond(200, { id: "a1", deleted: true }));
    await assignmentApi.remove("a1");
    expect(fetchMock).toHaveBeenCalledWith("/api/assignments/a1", expect.objectContaining({ method: "DELETE" }));
  });
});

describe("cohortApi.removeIfEmpty (PRD DA-04: no orphaned assignments)", () => {
  it("refuses to delete a section that still has assignments", async () => {
    fetchMock.mockReturnValue(respond(200, [{ id: "a1" }, { id: "a2" }]));

    await expect(cohortApi.removeIfEmpty("sec-1")).rejects.toMatchObject({ status: 409, kind: "conflict" });
    // Only the count check ran; no DELETE was sent.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("deletes an empty section", async () => {
    fetchMock.mockReturnValueOnce(respond(200, [])).mockReturnValueOnce(respond(200, { id: "sec-1", deleted: true }));

    await cohortApi.removeIfEmpty("sec-1");

    expect(fetchMock).toHaveBeenLastCalledWith("/api/cohorts/sec-1", expect.objectContaining({ method: "DELETE" }));
  });
});
