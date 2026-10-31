import { Link, useParams } from "react-router-dom";
import { assignmentApi } from "../services/api";
import { useAsync } from "../hooks/useAsync";
import { useSectionName } from "../hooks/useSectionName";
import { formatDateTime, formatRelative, getDueStatus } from "../utils/date";
import { DueStatusBadge } from "../components/ui/Badge";
import Skeleton from "../components/ui/Skeleton";
import ErrorState from "../components/ui/ErrorState";
import SubmissionList from "../components/submissions/SubmissionList";

function DetailSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" aria-busy="true">
      <Skeleton className="h-5 w-24 rounded-full" />
      <Skeleton className="mt-4 h-8 w-2/3" />
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
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

// Never falls back to the raw cohortId — only a name or a friendly placeholder.
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

      {assignment.attachmentUrl && (
        <a
          href={assignment.attachmentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          📎 Open attachment
        </a>
      )}
    </article>
  );
}

export default function AssignmentDetailPage() {
  const { assignmentId } = useParams();
  const { data: assignment, error, isLoading, isError, reload } = useAsync(
    (signal) => assignmentApi.get(assignmentId, { signal }),
    [assignmentId],
  );

  const notFound = isError && error.status === 404;

  return (
    <div className="space-y-6">
      <Link to="/" className="text-sm text-slate-500 hover:text-slate-800">
        ← Back to dashboard
      </Link>

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

      {/* Rendered independently of the assignment request: Team 06 being down must
          never affect Team 05's content, and vice versa. Hidden only on a confirmed 404. */}
      {!notFound && <SubmissionList assignmentId={assignmentId} />}
    </div>
  );
}
