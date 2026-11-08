import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { assignmentApi, cohortApi } from "../services/api";
import { useAsync } from "../hooks/useAsync";
import { useToast } from "../context/ToastContext";
import { buildAttachmentFields } from "../utils/attachments";
import AssignmentForm from "../components/assignments/AssignmentForm";

export default function CreateAssignmentPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  const cohorts = useAsync((signal) => cohortApi.list({ signal }), []);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const attachmentFields = await buildAttachmentFields(values);

      const payload = {
        cohortId: values.cohortId.trim(),
        title: values.title.trim(),
        description: values.description.trim(),
        criteria: values.criteria.trim(),
        dueDate: new Date(values.dueDate).toISOString(),
        ...attachmentFields,
      };

      const { id } = await assignmentApi.create(payload);
      toast.success(`Created "${values.title.trim()}"`, { title: "Saved" });
      navigate(id ? `/assignments/${id}` : "/");
    } catch (err) {
      toast.error(err.message, { title: "Couldn't create assignment", duration: 6000 });
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/" className="text-sm text-slate-500 hover:text-slate-800">
        ← Back to dashboard
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">New Assignment</h1>
      <p className="mb-6 mt-1 text-sm text-slate-500">
        Fields marked <span className="text-rose-500">*</span> are required
      </p>

      <AssignmentForm
        cohorts={cohorts.isError ? null : cohorts.data}
        cohortsLoading={cohorts.isLoading}
        submitting={submitting}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
      />
    </div>
  );
}
