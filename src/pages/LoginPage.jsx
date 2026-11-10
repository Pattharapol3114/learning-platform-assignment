import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authErrorMessage } from "../services/authErrors";
import { validateLogin } from "../utils/validation";
import Spinner from "../components/ui/Spinner";

const inputClass =
  "block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-50";

function Field({ id, label, error, ...inputProps }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={inputClass}
        {...inputProps}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}

export default function LoginPage() {
  const { user, loading, signIn, signUp } = useAuth();
  const location = useLocation();
  const [mode, setMode] = useState("signin");
  const [values, setValues] = useState({ fullName: "", email: "", password: "", consent: false });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to={location.state?.from ?? "/"} replace />;

  const isSignUp = mode === "signup";
  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  const switchMode = () => {
    setMode(isSignUp ? "signin" : "signup");
    setErrors({});
    setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validateLogin(values, { isSignUp });
    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      if (isSignUp) await signUp(values.fullName.trim(), values.email.trim(), values.password);
      else await signIn(values.email.trim(), values.password);
    } catch (err) {
      setFormError(authErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg text-white shadow-sm">📘</span>
          <span className="leading-tight">
            <span className="block font-semibold text-slate-900">Learning Platform</span>
            <span className="block text-xs text-slate-500">Assignment Module · Team 05</span>
          </span>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">{isSignUp ? "Create your account" : "Sign in"}</h1>
            <p className="mt-1 text-sm text-slate-500">For instructors managing assignments and sections.</p>
          </div>

          {formError && (
            <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {formError}
            </div>
          )}

          {isSignUp && (
            <Field
              id="fullName"
              label="Full name"
              autoComplete="name"
              maxLength={100}
              value={values.fullName}
              onChange={set("fullName")}
              disabled={submitting}
              error={errors.fullName}
            />
          )}
          <Field
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={set("email")}
            disabled={submitting}
            error={errors.email}
          />
          <Field
            id="password"
            label="Password"
            type="password"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            value={values.password}
            onChange={set("password")}
            disabled={submitting}
            error={errors.password}
          />

          {isSignUp && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">Privacy notice (PDPA)</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>We collect your full name and email to create your account and sign you in.</li>
                <li>Your name is shown with the assignments you create, including to the partner Submission system (Team 06).</li>
                <li>Your data is stored in Firebase (Google Cloud) and is used only for this course platform.</li>
                <li>You can ask the Team 05 administrators to correct or delete your account at any time.</li>
              </ul>
              <label className="mt-3 flex items-start gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={values.consent}
                  onChange={(e) => setValues((v) => ({ ...v, consent: e.target.checked }))}
                  disabled={submitting}
                  aria-invalid={Boolean(errors.consent)}
                  aria-describedby={errors.consent ? "consent-error" : undefined}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                I have read the privacy notice and agree to the collection and use of my data.
              </label>
              {errors.consent && (
                <p id="consent-error" className="mt-1.5 text-xs text-rose-600">
                  {errors.consent}
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {submitting && <Spinner className="h-4 w-4" label="Please wait" />}
            {isSignUp ? "Create account" : "Sign in"}
          </button>

          <p className="text-center text-sm text-slate-500">
            {isSignUp ? "Already have an account?" : "New instructor?"}{" "}
            <button type="button" onClick={switchMode} disabled={submitting} className="font-medium text-indigo-700 hover:text-indigo-800">
              {isSignUp ? "Sign in" : "Create an account"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
