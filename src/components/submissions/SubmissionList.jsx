import { useMemo } from "react";
import { submissionApi } from "../../services/api";
import { useAsync } from "../../hooks/useAsync";
import { formatDateTime } from "../../utils/date";
import Badge from "../ui/Badge";
import Skeleton from "../ui/Skeleton";
import EmptyState from "../ui/EmptyState";
import SubmissionFallback from "./SubmissionFallback";
import SubmissionErrorBoundary from "./SubmissionErrorBoundary";

const STATUS = {
  ON_TIME: { tone: "green", label: "On time" },
  LATE: { tone: "amber", label: "Late" },
  CANCELLED: { tone: "gray", label: "Cancelled" },
};

function SubmissionStatusBadge({ submission }) {
  // A cancelled submission keeps its original status from Team 06, so check cancelledAt first.
  const key = submission.cancelledAt ? "CANCELLED" : submission.status;
  const { tone, label } = STATUS[key] ?? { tone: "blue", label: submission.status || "Unknown" };
  return <Badge tone={tone}>{label}</Badge>;
}

function SubmissionContent({ submission }) {
  if (submission.externalLink) {
    return (
      <a
        href={submission.externalLink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex max-w-xs items-center gap-1 truncate text-indigo-600 hover:text-indigo-800 hover:underline"
        title={submission.externalLink}
      >
        🔗 <span className="truncate">{submission.externalLink.replace(/^https?:\/\//, "")}</span>
      </a>
    );
  }
  if (submission.fileName) return <span className="text-slate-700">📄 {submission.fileName}</span>;
  return <span className="text-slate-400">—</span>;
}

function TableSkeleton() {
  return (
    <div className="space-y-3 p-5" aria-busy="true" aria-label="Loading submissions">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="hidden h-4 flex-1 sm:block" />
        </div>
      ))}
    </div>
  );
}

function SubmissionTable({ submissions }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th scope="col" className="px-5 py-3">#</th>
            <th scope="col" className="px-5 py-3">Student ID</th>
            <th scope="col" className="px-5 py-3">Status</th>
            <th scope="col" className="px-5 py-3">Submitted at</th>
            <th scope="col" className="px-5 py-3">Work</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {submissions.map((s, i) => (
            <tr key={s.id ?? i} className={`hover:bg-slate-50/70 ${s.cancelledAt ? "opacity-60" : ""}`}>
              <td className="whitespace-nowrap px-5 py-3 text-slate-400">{i + 1}</td>
              <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-slate-700" title={s.studentId}>
                {s.studentId ? `${s.studentId.slice(0, 8)}…` : "—"}
              </td>
              <td className="whitespace-nowrap px-5 py-3">
                <SubmissionStatusBadge submission={s} />
              </td>
              <td className="whitespace-nowrap px-5 py-3 text-slate-700">
                {formatDateTime(s.submittedAt)}
                {s.cancelledAt && <div className="text-xs text-slate-400">Cancelled {formatDateTime(s.cancelledAt)}</div>}
              </td>
              <td className="px-5 py-3">
                <SubmissionContent submission={s} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SubmissionListInner({ assignmentId }) {
  const { data, error, isLoading, reload } = useAsync(
    (signal) => submissionApi.listByAssignment(assignmentId, { signal }),
    [assignmentId],
  );

  const sorted = useMemo(
    () => [...(data?.submissions ?? [])].sort((a, b) => (b.submittedAt?.getTime() ?? 0) - (a.submittedAt?.getTime() ?? 0)),
    [data],
  );

  const activeCount = sorted.filter((s) => !s.cancelledAt).length;
  const degraded = Boolean(error) || data?.degraded;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Submissions</h2>
          <p className="text-xs text-slate-500">From the Submission Module (Team 06)</p>
        </div>
        <div className="flex items-center gap-2">
          {!isLoading && !degraded && (
            <Badge tone="blue">
              {activeCount} submitted{sorted.length !== activeCount && ` · ${sorted.length - activeCount} cancelled`}
            </Badge>
          )}
          {!isLoading && (
            <button
              type="button"
              onClick={reload}
              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
              aria-label="Refresh submissions"
            >
              ↻ Refresh
            </button>
          )}
        </div>
      </header>

      {isLoading ? (
        <TableSkeleton />
      ) : degraded ? (
        <div className="p-5">
          <SubmissionFallback reason={error?.message ?? data?.reason} onRetry={reload} />
        </div>
      ) : sorted.length === 0 ? (
        <div className="p-5">
          <EmptyState icon="🗂️" title="No submissions yet" message="Submissions made through Team 06's system will appear here" />
        </div>
      ) : (
        <SubmissionTable submissions={sorted} />
      )}
    </section>
  );
}

export default function SubmissionList({ assignmentId }) {
  return (
    <SubmissionErrorBoundary>
      <SubmissionListInner assignmentId={assignmentId} />
    </SubmissionErrorBoundary>
  );
}
