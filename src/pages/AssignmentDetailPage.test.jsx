import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { expect, it, vi } from "vitest";
import AssignmentDetailPage from "./AssignmentDetailPage";
import { ToastProvider } from "../context/ToastContext";
import { assignmentApi } from "../services/api";

vi.mock("../services/api", () => ({
  assignmentApi: { get: vi.fn() },
  cohortApi: { get: vi.fn() },
  submissionApi: { listByAssignment: vi.fn(() => Promise.resolve({ degraded: false, reason: null, submissions: [] })) },
}));

it("shows 'Assignment not found' and no submissions panel for a deleted assignment", async () => {
  vi.mocked(assignmentApi.get).mockRejectedValue(Object.assign(new Error("Assignment not found"), { status: 404 }));

  render(
    <MemoryRouter initialEntries={["/assignments/gone"]}>
      <ToastProvider>
        <Routes>
          <Route path="/assignments/:assignmentId" element={<AssignmentDetailPage />} />
        </Routes>
      </ToastProvider>
    </MemoryRouter>,
  );

  expect(await screen.findByRole("heading", { name: "Assignment not found" })).toBeInTheDocument();
  expect(screen.queryByText("Submissions")).not.toBeInTheDocument();
});
