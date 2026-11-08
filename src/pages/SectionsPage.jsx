import { useCallback, useMemo, useState } from "react";
import { assignmentApi, cohortApi } from "../services/api";
import { useAsync } from "../hooks/useAsync";
import { useToast } from "../context/ToastContext";
import { validateSectionName } from "../utils/validation";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import Skeleton from "../components/ui/Skeleton";
import Spinner from "../components/ui/Spinner";

const inputClass =
  "block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-50";

function CreateSectionForm({ onCreated }) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateSectionName(name);
    setError(validationError);
    if (validationError) return;

    setSaving(true);
    try {
      await cohortApi.create({ name: name.trim() });
      toast.success(`Created section "${name.trim()}"`, { title: "Section created" });
      setName("");
      onCreated();
    } catch (err) {
      toast.error(err.message, { title: "Couldn't create section", duration: 6000 });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <label htmlFor="new-section" className="mb-1.5 block text-sm font-medium text-slate-700">
        New section
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="new-section"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. CS101 - Section B"
          maxLength={80}
          disabled={saving}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "new-section-error" : undefined}
          className={inputClass}
        />
        <button
          type="submit"
          disabled={saving}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-300"
        >
          {saving && <Spinner className="h-4 w-4" label="Saving" />}
          {saving ? "Adding..." : "+ Add section"}
        </button>
      </div>
      {error && (
        <p id="new-section-error" className="mt-1.5 text-xs text-rose-600">
          {error}
        </p>
      )}
    </form>
  );
}

function SectionRow({ section, assignmentCount, onRenamed, onDeleteRequest }) {
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(section.name ?? "");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const cancelEdit = () => {
    setEditing(false);
    setName(section.name ?? "");
    setError(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const validationError = validateSectionName(name);
    setError(validationError);
    if (validationError) return;
    if (name.trim() === section.name) return cancelEdit();

    setSaving(true);
    try {
      await cohortApi.rename(section.id, name.trim());
      toast.success(`Renamed to "${name.trim()}"`, { title: "Section updated" });
      setEditing(false);
      onRenamed();
    } catch (err) {
      toast.error(err.message, { title: "Couldn't rename section", duration: 6000 });
    } finally {
      setSaving(false);
    }
  };

  const hasAssignments = assignmentCount > 0;

  return (
    <li className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      {editing ? (
        <form onSubmit={handleSave} noValidate className="flex-1">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              disabled={saving}
              aria-label="Section name"
              aria-invalid={Boolean(error)}
              autoFocus
              onKeyDown={(e) => e.key === "Escape" && cancelEdit()}
              className={inputClass}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:bg-indigo-300"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                disabled={saving}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
          {error && <p className="mt-1.5 text-xs text-rose-600">{error}</p>}
        </form>
      ) : (
        <>
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900">{section.name || "(Unnamed section)"}</p>
            <p className="text-xs text-slate-500">
              {assignmentCount} assignment{assignmentCount === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Rename
            </button>
            <button
              type="button"
              onClick={() => onDeleteRequest(section)}
              disabled={hasAssignments}
              title={hasAssignments ? "Move or delete this section's assignments first" : undefined}
              className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-white"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </li>
  );
}

function ListSkeleton() {
  return (
    <ul className="divide-y divide-slate-100" aria-busy="true" aria-label="Loading sections">
      {[0, 1, 2].map((i) => (
        <li key={i} className="flex items-center justify-between px-5 py-4">
          <div>
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-2 h-3 w-24" />
          </div>
          <Skeleton className="h-8 w-36" />
        </li>
      ))}
    </ul>
  );
}

export default function SectionsPage() {
  const toast = useToast();
  // Load both together so per-section assignment counts need no extra requests.
  const data = useAsync(
    async (signal) => {
      const [sections, assignments] = await Promise.all([
        cohortApi.list({ signal }),
        assignmentApi.list({ signal }),
      ]);
      return { sections, assignments };
    },
    [],
  );

  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const closeConfirm = useCallback(() => setToDelete(null), []);

  const counts = useMemo(() => {
    const map = {};
    for (const a of data.data?.assignments ?? []) map[a.cohortId] = (map[a.cohortId] ?? 0) + 1;
    return map;
  }, [data.data]);

  const sections = useMemo(
    () => [...(data.data?.sections ?? [])].sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "")),
    [data.data],
  );

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await cohortApi.removeIfEmpty(toDelete.id);
      toast.success(`Deleted section "${toDelete.name}"`, { title: "Section deleted" });
      data.reload();
    } catch (err) {
      toast.error(err.message, { title: "Couldn't delete section", duration: 6000 });
      // A 409 means our counts were stale; refresh them.
      if (err.status === 409) data.reload();
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sections</h1>
        <p className="mt-1 text-sm text-slate-500">
          Create and manage the class sections your assignments belong to. A section can only be deleted once it has no
          assignments.
        </p>
      </div>

      <CreateSectionForm onCreated={data.reload} />

      {data.isError ? (
        <ErrorState title="Couldn't load sections" message={data.error.message} onRetry={data.reload} />
      ) : (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {data.isLoading && !data.data ? (
            <ListSkeleton />
          ) : sections.length === 0 ? (
            <div className="p-5">
              <EmptyState icon="🏫" title="No sections yet" message="Add your first section above." />
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {sections.map((s) => (
                <SectionRow
                  key={s.id}
                  section={s}
                  assignmentCount={counts[s.id] ?? 0}
                  onRenamed={data.reload}
                  onDeleteRequest={setToDelete}
                />
              ))}
            </ul>
          )}
        </section>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this section?"
        message={`"${toDelete?.name ?? ""}" will be permanently deleted. This can't be undone.`}
        confirmLabel="Delete section"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={closeConfirm}
      />
    </div>
  );
}
