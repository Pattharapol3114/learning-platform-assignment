import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "./LoginPage";
import { useAuth } from "../context/AuthContext";

vi.mock("../context/AuthContext", () => ({ useAuth: vi.fn() }));

const signIn = vi.fn();
const signUp = vi.fn();

function renderPage() {
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
  return userEvent.setup();
}

beforeEach(() => {
  signIn.mockReset();
  signUp.mockReset();
  vi.mocked(useAuth).mockReturnValue({ user: null, loading: false, signIn, signUp });
});

describe("LoginPage", () => {
  it("does not call Firebase when the form is incomplete", async () => {
    const user = renderPage();

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(signIn).not.toHaveBeenCalled();
    expect(screen.getByText("Please enter your email")).toBeInTheDocument();
  });

  it("signs in with the entered credentials", async () => {
    signIn.mockResolvedValue({});
    const user = renderPage();

    await user.type(screen.getByLabelText("Email"), " a@mfu.ac.th ");
    await user.type(screen.getByLabelText("Password"), "secret1");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(signIn).toHaveBeenCalledWith("a@mfu.ac.th", "secret1");
  });

  it("shows a friendly message for wrong credentials and lets the user retry", async () => {
    signIn.mockImplementation(() => Promise.reject(Object.assign(new Error("x"), { code: "auth/invalid-credential" })));
    const user = renderPage();

    await user.type(screen.getByLabelText("Email"), "a@mfu.ac.th");
    await user.type(screen.getByLabelText("Password"), "wrong12");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Incorrect email or password.");
    expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled();
  });

  it("creates an account with the full name in sign-up mode", async () => {
    signUp.mockResolvedValue({});
    const user = renderPage();

    await user.click(screen.getByRole("button", { name: "Create an account" }));
    await user.type(screen.getByLabelText("Full name"), "Aj. Somchai");
    await user.type(screen.getByLabelText("Email"), "a@mfu.ac.th");
    await user.type(screen.getByLabelText("Password"), "secret1");
    await user.click(screen.getByRole("checkbox", { name: /privacy notice/i }));
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(signUp).toHaveBeenCalledWith("Aj. Somchai", "a@mfu.ac.th", "secret1");
  });

  it("does not create an account until the privacy notice is accepted", async () => {
    const user = renderPage();

    await user.click(screen.getByRole("button", { name: "Create an account" }));
    await user.type(screen.getByLabelText("Full name"), "Aj. Somchai");
    await user.type(screen.getByLabelText("Email"), "a@mfu.ac.th");
    await user.type(screen.getByLabelText("Password"), "secret1");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(signUp).not.toHaveBeenCalled();
    expect(screen.getByText(/accept the privacy notice/)).toBeInTheDocument();
  });
});
