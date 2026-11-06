import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { assignmentApi, cohortApi } from "../services/api";
import { useAsync } from "../hooks/useAsync";
import { useToast } from "../context/ToastContext";
import { CURRENT_INSTRUCTOR_ID } from "../config";
import AssignmentForm from "../components/assignments/AssignmentForm";

export default function CreateAssignmentPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  const cohorts = useAsync((signal) => cohortApi.list({ signal }), []);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const attachmentUrls = (Array.isArray(values.attachmentUrls) ? values.attachmentUrls : [])
        .map((url) => String(url ?? "").trim())
        .filter((url) => url.length > 0);

      const attachmentFiles = Array.isArray(values.attachmentFiles) ? values.attachmentFiles : [];

      const fileUrls = await Promise.all(
        attachmentFiles.map(async (fileEntry) => {
          if (fileEntry && typeof fileEntry === "object" && fileEntry.url) return fileEntry.url;
          if (fileEntry instanceof File) {
            return await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.onerror = () => reject(new Error("Unable to read the selected file."));
              reader.readAsDataURL(fileEntry);
            });
          }
          return null;
        }),
      );

      const attachments = [
        ...attachmentUrls.map((url) => ({ type: "link", url, name: url })),
        ...attachmentFiles.map((fileEntry, index) => ({
          type: "file",
          url: fileUrls[index] || null,
          name: fileEntry instanceof File ? fileEntry.name : fileEntry?.name || "Attachment",
        })),
      ].filter((item) => item.url);

      const payload = {
        cohortId: values.cohortId.trim(),
        instructorId: CURRENT_INSTRUCTOR_ID,
        title: values.title.trim(),
        description: values.description.trim(),
        criteria: values.criteria.trim(),
        dueDate: new Date(values.dueDate).toISOString(),
        attachments,
        attachmentUrls,
        fileUrls: fileUrls.filter(Boolean),
        attachmentNames: attachmentFiles.map((fileEntry) => fileEntry instanceof File ? fileEntry.name : fileEntry?.name || "Attachment"),
        attachmentUrl: attachmentUrls[0] ?? null,
        fileUrl: fileUrls.find(Boolean) ?? null,
        attachmentName: attachmentFiles[0] instanceof File ? attachmentFiles[0].name : attachmentFiles[0]?.name || null,
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
