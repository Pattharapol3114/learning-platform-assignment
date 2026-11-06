// Field rules mirror the PRD data model: everything required except attachmentUrl.
//
// `unchangedDueDate` is the form's original dueDate value when editing. A due
// date the user didn't touch is accepted even if it's already past, so overdue
// assignments can still have typos fixed; a *new* due date must be in the future.
export function validateAssignment(values, { now = new Date(), unchangedDueDate = null } = {}) {
  const errors = {};

  const title = values.title.trim();
  if (!title) errors.title = "Please enter a title";
  else if (title.length > 120) errors.title = "Title must be 120 characters or fewer";

  if (!values.cohortId.trim()) errors.cohortId = "Please select a section";

  if (!values.description.trim()) errors.description = "Please enter a description";

  if (!values.criteria.trim()) errors.criteria = "Please enter the grading criteria";

  if (!values.dueDate) {
    errors.dueDate = "Please choose a due date";
  } else {
    const due = new Date(values.dueDate);
    if (Number.isNaN(due.getTime())) errors.dueDate = "Invalid date";
    else if (due <= now && values.dueDate !== unchangedDueDate) errors.dueDate = "Due date must be in the future";
  }

  const attachmentUrls = Array.isArray(values.attachmentUrls)
    ? values.attachmentUrls.map((item) => String(item ?? "").trim()).filter(Boolean)
    : [];
  const preferredUrl = typeof values.attachmentUrl === "string" ? values.attachmentUrl.trim() : attachmentUrls[0] || "";

  for (const url of attachmentUrls.length ? attachmentUrls : preferredUrl ? [preferredUrl] : []) {
    try {
      const parsed = new URL(url);
      if (!["http:", "https:", "data:", "blob:"].includes(parsed.protocol)) throw new Error();
    } catch {
      if (!url.startsWith("data:") && !url.startsWith("blob:")) {
        errors.attachmentUrl = "Link must start with http://, https://, data:, or blob:";
        break;
      }
    }
  }

  return errors;
}

export function validateSectionName(name) {
  const trimmed = name.trim();
  if (!trimmed) return "Please enter a section name";
  if (trimmed.length > 80) return "Section name must be 80 characters or fewer";
  return null;
}
