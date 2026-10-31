const TONES = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  amber: "bg-amber-50 text-amber-800 ring-amber-600/20",
  red: "bg-rose-50 text-rose-700 ring-rose-600/20",
  "red-solid": "bg-rose-600 text-white ring-rose-600",
  blue: "bg-sky-50 text-sky-700 ring-sky-600/20",
  gray: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

export default function Badge({ tone = "gray", children }) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${TONES[tone]}`}>
      {children}
    </span>
  );
}

const DUE_STATUS = {
  open: { tone: "green", label: "Open" },
  "due-soon": { tone: "amber", label: "Due soon" },
  overdue: { tone: "red-solid", label: "Overdue" },
  "no-date": { tone: "gray", label: "No due date" },
};

export function DueStatusBadge({ status }) {
  const { tone, label } = DUE_STATUS[status] ?? DUE_STATUS["no-date"];
  return <Badge tone={tone}>{label}</Badge>;
}
