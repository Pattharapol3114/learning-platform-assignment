import { useEffect, useState } from "react";
import Spinner from "../ui/Spinner";
import { toDateTimeLocalValue } from "../../utils/date";
import { validateAssignment } from "../../utils/validation";

const EMPTY_FORM = {
  title: "",
  cohortId: "",
  description: "",
  criteria: "",
  dueDate: "",
  attachmentUrl: "",
};

const inputBase =
  "block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50";

function inputClass(hasError) {
  return `${inputBase} ${
    hasError ? "border-rose-300 focus:border-rose-400 focus:ring-rose-200" : "border-slate-300 focus:border-indigo-400 focus:ring-indigo-200"
  }`;
}

function Field({ id, label, required, hint, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required ? <span className="ml-0.5 text-rose-500">*</span> : <span className="ml-1 font-normal text-slate-400">(optional)</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-rose-600">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
}

/**
 * @param {{
 *   cohorts: { id: string, name: string }[] | null, // null = cohort list unavailable → free-text input
 *   cohortsLoading: boolean,
 *   submitting: boolean,
 *   onSubmit: (values: typeof EMPTY_FORM) => void,
 *   onCancel: () => void,
 * }} props
 */
export default function AssignmentForm({
  cohorts,
  cohortsLoading,
  submitting,
  onSubmit,
  onCancel,
  initialValues = null,
  submitLabel = "Create Assignment",
}) {
  const [values, setValues] = useState(initialValues ? { ...EMPTY_FORM, ...initialValues } : EMPTY_FORM);
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    setValues(initialValues ? { ...EMPTY_FORM, ...initialValues } : EMPTY_FORM);
    setTouched({});
    setSubmitAttempted(false);
  }, [initialValues]);

  const errors = validateAssignment(values);
  const isValid = Object.keys(errors).length === 0;
  const showError = (name) => (touched[name] || submitAttempted) && errors[name];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };

  const handleBlur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    if (!isValid || submitting) return;
    onSubmit(values);
  };

  const fieldProps = (name) => ({
    id: name,
    name,
    value: values[name],
    onChange: handleChange,
    onBlur: handleBlur,
    disabled: submitting,
    "aria-invalid": Boolean(showError(name)),
    "aria-describedby": showError(name) ? `${name}-error` : undefined,
    className: inputClass(showError(name)),
  });

  const minDue = toDateTimeLocalValue(new Date());

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">General information</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field id="title" label="Title" required error={showError("title")}>
              <input type="text" placeholder="e.g. Assignment 1: Data Modeling" maxLength={120} {...fieldProps("title")} />
            </Field>
          </div>

          <Field
            id="cohortId"
            label="Section"
            required
            error={showError("cohortId")}
            hint={cohorts === null && !cohortsLoading ? "Couldn't load the section list. Please enter the section ID manually." : undefined}
          >
            {cohorts === null && !cohortsLoading ? (
              <input type="text" placeholder="cohort_cs101_demo" {...fieldProps("cohortId")} />
            ) : (
              <select {...fieldProps("cohortId")} disabled={submitting || cohortsLoading}>
                <option value="">{cohortsLoading ? "Loading..." : "— Select a section —"}</option>
                {(cohorts ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name || c.id}
                  </option>
                ))}
              </select>
            )}
          </Field>

          <Field id="dueDate" label="Due date & time" required error={showError("dueDate")}>
            <input type="datetime-local" min={minDue} {...fieldProps("dueDate")} />
          </Field>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Details & criteria</h2>
        <div className="mt-5 space-y-5">
          <Field id="description" label="Description" required error={showError("description")}>
            <textarea rows={4} placeholder="Describe the task and what students need to submit" {...fieldProps("description")} />
          </Field>

          <Field
            id="criteria"
            label="Grading criteria / Rubric"
            required
            error={showError("criteria")}
            hint="Tip: put each criterion on its own line"
          >
            <textarea rows={4} placeholder={"1. Correct structure (5 pts)\n2. Works as expected (5 pts)"} {...fieldProps("criteria")} />
          </Field>

          <Field id="attachmentUrl" label="Attachment link" error={showError("attachmentUrl")} hint="e.g. a link to a rubric PDF or supporting document">
            <input type="url" placeholder="https://..." {...fieldProps("attachmentUrl")} />
          </Field>
        </div>
      </div>

      {submitAttempted && !isValid && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Please complete all required fields before saving ({Object.keys(errors).length} field(s) to fix)
        </div>
      )}

      {/* Sticky so the actions stay reachable without scrolling past the long form. */}
      <div className="sticky bottom-0 z-10 -mx-4 flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50/95 px-4 py-4 backdrop-blur sm:mx-0 sm:flex-row sm:justify-end sm:rounded-2xl sm:border sm:bg-white/95 sm:px-6 sm:shadow-lg">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || (submitAttempted && !isValid)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-indigo-300"
        >
          {submitting && <Spinner className="h-4 w-4" label="Saving" />}
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
