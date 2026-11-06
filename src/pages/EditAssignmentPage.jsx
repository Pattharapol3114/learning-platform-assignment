import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { assignmentApi, cohortApi } from "../services/api";
import { useAsync } from "../hooks/useAsync";
import { useToast } from "../context/ToastContext";
import { CURRENT_INSTRUCTOR_ID } from "../config";
import { toDateTimeLocalValue } from "../utils/date";
import AssignmentForm from "../components/assignments/AssignmentForm";
import ErrorState from "../components/ui/ErrorState";
import Skeleton from "../components/ui/Skeleton";

function FormSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading assignment">
      {[0, 1].map((card) => (
        <div key={card} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Skeleton className="h-5 w-40" />
          <div className="mt-5 space-y-5">
            <Skeleton className="h-10 w-full" />
            <div className="grid gap-5 sm:grid-cols-2">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function EditAssignmentPage() {
  const navigate = useNavigate();
  const { assignmentId } = useParams();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  const assignment = useAsync((signal) => assignmentApi.get(assignmentId, { signal }), [assignmentId]);
  const cohorts = useAsync((signal) => cohortApi.list({ signal }), []);

  const sectionMissing = Boolean(
    assignment.data && cohorts.data && !cohorts.data.some((c) => c.id === assignment.data.cohortId),
  );

  const initialValues = useMemo(() => {
    if (!assignment.data) return null;
    const a = assignment.data;
    return {
      title: a.title,
      // If the stored section no longer exists, start blank so the user has to pick a real one.
      cohortId: sectionMissing ? "" : a.cohortId,
      description: a.description,
      criteria: a.criteria,
      dueDate: a.dueDate ? toDateTimeLocalValue(a.dueDate) : "",
      attachmentUrl: a.attachmentUrl ?? "",
    };
  }, [assignment.data, sectionMissing]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      await assignmentApi.update(assignmentId, {
        cohortId: values.cohortId.trim(),
        instructorId: CURRENT_INSTRUCTOR_ID,
        title: values.title.trim(),
        description: values.description.trim(),
        criteria: values.criteria.trim(),
        dueDate: new Date(values.dueDate).toISOString(),
        attachmentUrl: values.attachmentUrl.trim() || null,
      });

      toast.success(`Updated "${values.title.trim()}"`, { title: "Saved" });
      navigate(`/assignments/${assignmentId}`);
    } catch (err) {
      toast.error(err.message, { title: "Couldn't update assignment", duration: 6000 });
      setSubmitting(false);
    }
  };

  const header = (
    <>
      <Link to={`/assignments/${assignmentId}`} className="text-sm text-slate-500 hover:text-slate-800">
        ← Back to assignment
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">Edit Assignment</h1>
      <p className="mb-6 mt-1 text-sm text-slate-500">
        Fields marked <span className="text-rose-500">*</span> are required
      </p>
    </>
  );

  // Wait for the section list too, so the form mounts once with the right initial section.
  if (assignment.isLoading || cohorts.isLoading) {
    return (
      <div className="mx-auto max-w-3xl">
        {header}
        <FormSkeleton />
      </div>
    );
  }

  if (assignment.isError) {
    const notFound = assignment.error.status === 404;
    return (
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="text-sm text-slate-500 hover:text-slate-800">
          ← Back to dashboard
        </Link>
        <div className="mt-4">
          <ErrorState
            title={notFound ? "Assignment not found" : "Couldn't load assignment"}
            message={notFound ? "It may have been deleted, or the link is incorrect" : assignment.error.message}
            onRetry={notFound ? undefined : assignment.reload}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {header}

      {sectionMissing && (
        <div role="alert" className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          This assignment's section no longer exists. Please choose a section before saving.
        </div>
      )}

      <AssignmentForm
        key={assignment.data.id}
        cohorts={cohorts.isError ? null : cohorts.data}
        cohortsLoading={false}
        submitting={submitting}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/assignments/${assignmentId}`)}
        initialValues={initialValues}
        submitLabel="Save Changes"
      />
    </div>
  );
}
