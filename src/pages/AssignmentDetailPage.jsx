import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { assignmentApi } from "../services/api";
import { useAsync } from "../hooks/useAsync";
import { useToast } from "../context/ToastContext";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { useSectionName } from "../hooks/useSectionName";
import { formatDateTime, formatRelative, getDueStatus } from "../utils/date";
import { DueStatusBadge } from "../components/ui/Badge";
import Skeleton from "../components/ui/Skeleton";
import ErrorState from "../components/ui/ErrorState";
import SubmissionList from "../components/submissions/SubmissionList";

function inferAttachmentName(url, fallback = "Attachment") {
  if (!url || typeof url !== "string") return fallback;
  if (url.startsWith("data:") || url.startsWith("blob:")) return "Attachment";

  const lastSegment = url.split(/[?#]/)[0].split("/").pop();
  return lastSegment || fallback;
}

function getAssignmentAttachments(assignment) {
  if (!assignment) return [];

  const items = [];

  const pushItem = (item) => {
    if (!item || !item.url || typeof item.url !== "string") return;

    items.push({
      url: item.url,
      name: item.name || inferAttachmentName(item.url, "Attachment"),
      type: item.type === "link" ? "link" : "file",
    });
  };

  if (Array.isArray(assignment.attachments)) {
    for (const item of assignment.attachments) {
      if (!item) continue;

      if (item.type === "link" || item.kind === "link") {
        pushItem({
          type: "link",
          url: item.url || item.href || item.link,
          name: item.name || item.url || "Link",
        });
      } else if (item.type === "file" || item.kind === "file" || item.url || item.fileUrl) {
        pushItem({
          type: "file",
          url: item.url || item.fileUrl,
          name: item.name || "Document",
        });
      }
    }
  }

  if (Array.isArray(assignment.attachmentUrls)) {
    for (const url of assignment.attachmentUrls) {
      if (typeof url !== "string" || !url.trim()) continue;
      pushItem({ type: "link", url: url.trim(), name: url.trim() });
    }
  }

  if (Array.isArray(assignment.fileUrls)) {
    for (let index = 0; index < assignment.fileUrls.length; index += 1) {
      const url = assignment.fileUrls[index];
      if (typeof url !== "string" || !url.trim()) continue;

      const matchedName = Array.isArray(assignment.attachmentNames)
        ? assignment.attachmentNames[index]
        : undefined;

      pushItem({
        type: "file",
        url: url.trim(),
        name: matchedName || assignment.attachmentName || "Document",
      });
    }
  }

  if (assignment.attachmentUrl && !assignment.attachmentUrl.startsWith("data:") && !assignment.attachmentUrl.startsWith("blob:")) {
    pushItem({
      type: "link",
      url: assignment.attachmentUrl,
      name: assignment.attachmentName || assignment.attachmentUrl,
    });
  }

  if (assignment.fileUrl || assignment.attachmentUrl?.startsWith("data:") || assignment.attachmentUrl?.startsWith("blob:")) {
    pushItem({
      type: "file",
      url: assignment.fileUrl || assignment.attachmentUrl,
      name: assignment.attachmentName || "Document",
    });
  }

  const seen = new Set();
  return items
    .map((item) => {
      const key = `${item.type}:${item.url}`;
      if (seen.has(key)) return null;
      seen.add(key);
      return item;
    })
    .filter(Boolean);
}

function DetailSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <Skeleton className="h-7 w-28" />
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
      </div>
      <Skeleton className="mt-6 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-5/6" />
      <Skeleton className="mt-2 h-4 w-3/4" />
    </div>
  );
}

function SectionValue({ cohortId, knownName }) {
  const { name, isLoading, notFound } = useSectionName(cohortId, knownName);

  if (isLoading) {
    return (
      <span className="flex h-5 items-center" aria-label="Loading section name">
        <Skeleton className="h-4 w-32" />
      </span>
    );
  }

  if (name) return name;

  return (
    <span className="font-normal text-slate-400">
      {notFound ? "Section not found" : "Couldn't load section name"}
    </span>
  );
}

function MetaItem({ label, children }) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-3">
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-slate-900">{children}</dd>
    </div>
  );
}

function AssignmentDetails({ assignment }) {
  const status = getDueStatus(assignment.dueDate);
  const attachments = useMemo(() => getAssignmentAttachments(assignment), [assignment]);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <DueStatusBadge status={status} />
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{assignment.title}</h1>

      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        <MetaItem label="Due date">
          {formatDateTime(assignment.dueDate)}
          {assignment.dueDate && (
            <span className={`block text-xs font-normal ${status === "overdue" ? "text-rose-600" : "text-slate-500"}`}>
              {formatRelative(assignment.dueDate)}
            </span>
          )}
        </MetaItem>
        <MetaItem label="Section">
          <SectionValue cohortId={assignment.cohortId} knownName={assignment.cohortName} />
        </MetaItem>
        <MetaItem label="Created">{formatDateTime(assignment.createdAt)}</MetaItem>
      </dl>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Description</h2>
        <p className="mt-2 whitespace-pre-line text-slate-700">{assignment.description || "—"}</p>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Grading criteria</h2>
        <p className="mt-2 whitespace-pre-line rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-slate-700">
          {assignment.criteria || "—"}
        </p>
      </section>

      {attachments.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Attached files</h2>
          <div className="mt-3 space-y-3">
            {attachments.map((file, index) => {
              const isLinkAttachment = file.type === "link";
              const isImage = !isLinkAttachment && /\.(png|jpe?g|gif|webp|svg)(?:[?#]|$)/i.test(file.name || file.url);

              return (
                <div
                  key={`${file.url}-${index}`}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    {isLinkAttachment ? (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg text-slate-600">
                        🔗
                      </div>
                    ) : isImage ? (
                      <a href={file.url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg border border-slate-200 bg-white">
                        <img src={file.url} alt={file.name} className="h-14 w-14 object-cover" />
                      </a>
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg text-slate-600">
                        📄
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {isLinkAttachment ? file.url : file.name || "Attachment"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {isLinkAttachment ? "Link attachment" : "File attachment"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isLinkAttachment ? (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
                      >
                        Open Link
                      </a>
                    ) : (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={file.name && !file.name.startsWith("data:") && !file.name.startsWith("blob:") ? file.name : undefined}
                        className="inline-flex items-center justify-center rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
                      >
                        Open / Download
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </article>
  );
}

export default function AssignmentDetailPage() {
  const navigate = useNavigate();
  const { assignmentId } = useParams();
  const toast = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { data: assignment, isLoading, isError, error, reload } = useAsync(
    (signal) => assignmentApi.get(assignmentId, { signal }),
    [assignmentId],
  );

  const notFound = isError && error.status === 404;
  const closeConfirm = useCallback(() => setConfirmOpen(false), []);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await assignmentApi.remove(assignmentId);
      toast.success(`Deleted "${assignment.title}"`, { title: "Assignment deleted" });
      navigate("/");
    } catch (err) {
      toast.error(err.message, { title: "Couldn't delete assignment", duration: 6000 });
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link to="/" className="text-sm text-slate-500 hover:text-slate-800">
          ← Back to dashboard
        </Link>
        {!notFound && !isLoading && !isError && (
          <div className="flex gap-2">
            <Link
              to={`/assignments/${assignmentId}/edit`}
              className="inline-flex items-center rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
            >
              Edit Assignment
            </Link>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="inline-flex items-center rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this assignment?"
        message={`"${assignment?.title ?? ""}" will be permanently deleted. This can't be undone.`}
        confirmLabel="Delete assignment"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={closeConfirm}
      />

      {isLoading ? (
        <DetailSkeleton />
      ) : notFound ? (
        <ErrorState title="Assignment not found" message="It may have been deleted, or the link is incorrect">
          <Link to="/" className="mt-5 inline-block text-sm font-medium text-rose-700 underline">
            Back to dashboard
          </Link>
        </ErrorState>
      ) : isError ? (
        <ErrorState title="Couldn't load assignment details" message={error.message} onRetry={reload} />
      ) : (
        <AssignmentDetails assignment={assignment} />
      )}

      {!notFound && <SubmissionList assignmentId={assignmentId} />}
    </div>
  );
}
