import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RequireAuth from "./RequireAuth";
import { useAuth } from "../../context/AuthContext";

vi.mock("../../context/AuthContext", () => ({ useAuth: vi.fn() }));

function renderAt() {
  render(
    <MemoryRouter initialEntries={["/secret"]}>
      <Routes>
        <Route path="/login" element={<p>login page</p>} />
        <Route
          path="/secret"
          element={
            <RequireAuth>
              <p>private content</p>
            </RequireAuth>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("RequireAuth", () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReset();
  });

  it("sends signed-out visitors to the login page", () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: false });
    renderAt();
    expect(screen.getByText("login page")).toBeInTheDocument();
    expect(screen.queryByText("private content")).not.toBeInTheDocument();
  });

  it("shows nothing private while the session is still loading", () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: true });
    renderAt();
    expect(screen.queryByText("private content")).not.toBeInTheDocument();
    expect(screen.queryByText("login page")).not.toBeInTheDocument();
  });

  it("shows the page to signed-in instructors", () => {
    vi.mocked(useAuth).mockReturnValue({ user: { uid: "u1" }, loading: false });
    renderAt();
    expect(screen.getByText("private content")).toBeInTheDocument();
  });
});
