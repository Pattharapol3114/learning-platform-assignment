import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { assignmentApi, cohortApi } from "../services/api";
import { useAsync } from "../hooks/useAsync";
import { getDueStatus } from "../utils/date";
import AssignmentCard, { AssignmentCardSkeleton } from "../components/assignments/AssignmentCard";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "due-soon", label: "Due soon" },
  { key: "overdue", label: "Overdue" },
];

// Upcoming deadlines first (soonest at the top), then overdue (most recent first), then undated.
function compareByDeadline(a, b, now) {
  const rank = (x) => (!x.dueDate ? 2 : x.dueDate < now ? 1 : 0);
  const ra = rank(a);
  const rb = rank(b);
  if (ra !== rb) return ra - rb;
  if (ra === 2) return 0;
  return ra === 0 ? a.dueDate - b.dueDate : b.dueDate - a.dueDate;
}

function StatCard({ label, value, tone }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${tone}`}>{value}</p>
    </div>
  );
}

const newAssignmentButton = (
  <Link
    to="/assignments/new"
    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
  >
    + New Assignment
  </Link>
);

export default function DashboardPage() {
  const assignments = useAsync((signal) => assignmentApi.list({ signal }), []);
  // Section names for the cards; if this fails, cards show a placeholder (never the raw ID).
  const cohorts = useAsync((signal) => cohortApi.list({ signal }), []);

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const cohortNames = useMemo(
    () => Object.fromEntries((cohorts.data ?? []).map((c) => [c.id, c.name])),
    [cohorts.data],
  );

  const { visible, counts } = useMemo(() => {
    const now = new Date();
    const list = assignments.data ?? [];
    const counts = { all: list.length, open: 0, "due-soon": 0, overdue: 0 };
    for (const a of list) {
      const s = getDueStatus(a.dueDate, now);
      if (s in counts) counts[s] += 1;
    }

    const q = search.trim().toLowerCase();
    const visible = list
      .filter((a) => filter === "all" || getDueStatus(a.dueDate, now) === filter)
      .filter((a) => !q || a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q))
      .sort((a, b) => compareByDeadline(a, b, now));

    return { visible, counts };
  }, [assignments.data, filter, search]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Assignment Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">All assignments in the system, sorted by nearest deadline</p>
        </div>
        {newAssignmentButton}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total" value={assignments.isLoading ? "–" : counts.all} tone="text-slate-900" />
        <StatCard label="Open" value={assignments.isLoading ? "–" : counts.open} tone="text-emerald-600" />
        <StatCard label="Due soon" value={assignments.isLoading ? "–" : counts["due-soon"]} tone="text-amber-600" />
        <StatCard label="Overdue" value={assignments.isLoading ? "–" : counts.overdue} tone="text-rose-600" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1 rounded-xl bg-slate-200/60 p-1" role="tablist" aria-label="Filter by status">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                filter === f.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search assignments..."
          aria-label="Search assignments"
          className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 sm:w-64"
        />
      </div>

      {assignments.isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {Array.from({ length: 6 }, (_, i) => (
            <AssignmentCardSkeleton key={i} />
          ))}
        </div>
      ) : assignments.isError ? (
        <ErrorState title="Couldn't load assignments" message={assignments.error.message} onRetry={assignments.reload} />
      ) : counts.all === 0 ? (
        <EmptyState
          icon="📝"
          title="No assignments yet"
          message="Get started by creating the first assignment for your section"
          action={newAssignmentButton}
        />
      ) : visible.length === 0 ? (
        <EmptyState icon="🔍" title="No matching assignments" message="Try a different filter or search term" />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((a) => (
            <AssignmentCard
              key={a.id}
              assignment={a}
              sectionName={a.cohortName ?? cohortNames[a.cohortId]}
              sectionLoading={!a.cohortName && cohorts.isLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
}
