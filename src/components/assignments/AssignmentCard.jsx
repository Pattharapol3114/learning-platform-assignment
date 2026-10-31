import { Link } from "react-router-dom";
import { DueStatusBadge } from "../ui/Badge";
import Skeleton from "../ui/Skeleton";
import { formatDateTime, formatRelative, getDueStatus } from "../../utils/date";

const ACCENT = {
  open: "bg-emerald-500",
  "due-soon": "bg-amber-500",
  overdue: "bg-rose-500",
  "no-date": "bg-slate-300",
};

export default function AssignmentCard({ assignment, sectionName, sectionLoading }) {
  const status = getDueStatus(assignment.dueDate);

  return (
    <Link
      to={`/assignments/${assignment.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      <span className={`absolute inset-x-0 top-0 h-1 ${ACCENT[status]}`} aria-hidden="true" />

      <div className="flex items-start justify-between gap-3">
        {sectionLoading ? (
          <Skeleton className="h-5 w-28" />
        ) : (
          <span className="truncate rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {sectionName || "No section"}
          </span>
        )}
        <DueStatusBadge status={status} />
      </div>

      <h3 className="mt-3 line-clamp-2 text-lg font-semibold text-slate-900 group-hover:text-indigo-700">
        {assignment.title}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm text-slate-500">{assignment.description || "—"}</p>

      <div className="mt-auto flex items-end justify-between gap-2 border-t border-slate-100 pt-4 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Due</p>
          <p className="font-medium text-slate-800">{formatDateTime(assignment.dueDate)}</p>
        </div>
        {assignment.dueDate && (
          <p className={`text-xs ${status === "overdue" ? "text-rose-600" : "text-slate-500"}`}>
            {formatRelative(assignment.dueDate)}
          </p>
        )}
      </div>
    </Link>
  );
}

export function AssignmentCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-6 w-3/4" />
      <Skeleton className="mt-2 h-4 w-full" />
      <Skeleton className="mt-1 h-4 w-2/3" />
      <div className="mt-6 border-t border-slate-100 pt-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="mt-2 h-4 w-40" />
      </div>
    </div>
  );
}
