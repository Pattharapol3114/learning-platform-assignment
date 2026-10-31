import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { assignmentApi, cohortApi } from "../services/api";
import { useAsync } from "../hooks/useAsync";
import { useToast } from "../context/ToastContext";
import { CURRENT_INSTRUCTOR_ID } from "../config";
import AssignmentForm from "../components/assignments/AssignmentForm";
import ErrorState from "../components/ui/ErrorState";

export default function EditAssignmentPage() {
  const navigate = useNavigate();
  const { assignmentId } = useParams();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  const assignment = useAsync((signal) => assignmentApi.get(assignmentId, { signal }), [assignmentId]);
  const cohorts = useAsync((signal) => cohortApi.list({ signal }), []);

  const initialValues = useMemo(() => {
    if (!assignment.data) return null;

    const dueDate = assignment.data.dueDate ? new Date(assignment.data.dueDate) : null;

    return {
      title: assignment.data.title ?? "",
      cohortId: assignment.data.cohortId ?? "",
      description: assignment.data.description ?? "",
      criteria: assignment.data.criteria ?? "",
      dueDate: dueDate ? new Date(dueDate.getTime() - dueDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "",
      attachmentUrl: assignment.data.attachmentUrl ?? "",
    };
  }, [assignment.data]);

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

  if (assignment.isLoading) {
    return (
      <div className="mx-auto max-w-3xl">
        <p className="text-sm text-slate-500">Loading assignment...</p>
      </div>
    );
  }

  if (assignment.isError) {
    return (
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="text-sm text-slate-500 hover:text-slate-800">
          ← Back to dashboard
        </Link>
        <ErrorState title="Couldn't load assignment" message={assignment.error.message} onRetry={assignment.reload} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link to={`/assignments/${assignmentId}`} className="text-sm text-slate-500 hover:text-slate-800">
        ← Back to assignment
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">Edit Assignment</h1>
      <p className="mb-6 mt-1 text-sm text-slate-500">
        Fields marked <span className="text-rose-500">*</span> are required
      </p>

      <AssignmentForm
        cohorts={cohorts.isError ? null : cohorts.data}
        cohortsLoading={cohorts.isLoading}
        submitting={submitting}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/assignments/${assignmentId}`)}
        initialValues={initialValues}
        submitLabel="Save Changes"
      />
    </div>
  );
}
