import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SubmissionList from "./SubmissionList";
import { submissionApi } from "../../services/api";

vi.mock("../../services/api", () => ({
  submissionApi: { listByAssignment: vi.fn() },
}));

// Block body on purpose: a function returned from beforeEach is run by Vitest as a teardown hook.
beforeEach(() => {
  vi.mocked(submissionApi.listByAssignment).mockReset();
});

describe("SubmissionList", () => {
  it("renders Team 06 submissions as a table", async () => {
    vi.mocked(submissionApi.listByAssignment).mockResolvedValue({
      degraded: false,
      reason: null,
      submissions: [
        {
          id: "s1",
          studentId: "be6d2eec-c96e-490f-8149-fe07a30b114f",
          type: "LINK",
          fileName: null,
          externalLink: "https://github.com/team06/demo",
          submittedAt: new Date("2026-09-20T18:25:31Z"),
          cancelledAt: null,
          status: "ON_TIME",
        },
      ],
    });

    render(<SubmissionList assignmentId="a1" />);

    expect(await screen.findByRole("table")).toBeInTheDocument();
    expect(screen.getByText("On time")).toBeInTheDocument();
    expect(screen.getByText("github.com/team06/demo")).toBeInTheDocument();
  });

  it("shows the fallback, not a crash, when Team 06 is degraded", async () => {
    vi.mocked(submissionApi.listByAssignment).mockResolvedValue({ degraded: true, reason: "timeout", submissions: [] });

    render(<SubmissionList assignmentId="a1" />);

    expect(await screen.findByText("Submissions are unavailable right now")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });

  it("shows the fallback when the request fails outright", async () => {
    vi.mocked(submissionApi.listByAssignment).mockRejectedValue(new Error("Unable to connect to the server"));

    render(<SubmissionList assignmentId="a1" />);

    expect(await screen.findByText("Submissions are unavailable right now")).toBeInTheDocument();
  });

  it("contains a render crash from malformed data inside the error boundary", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    // `studentId.slice` throws while rendering the row.
    vi.mocked(submissionApi.listByAssignment).mockResolvedValue({
      degraded: false,
      reason: null,
      submissions: [{ id: "bad", studentId: 12345, submittedAt: null, cancelledAt: null, status: "ON_TIME" }],
    });

    render(
      <div>
        <h1>Assignment details</h1>
        <SubmissionList assignmentId="a1" />
      </div>,
    );

    expect(await screen.findByText("Submissions are unavailable right now")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Assignment details" })).toBeInTheDocument();
  });
});
