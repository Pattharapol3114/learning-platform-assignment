// Field rules mirror the PRD data model: everything required except attachmentUrl.
export function validateAssignment(values, now = new Date()) {
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
    else if (due <= now) errors.dueDate = "Due date must be in the future";
  }

  const url = values.attachmentUrl.trim();
  if (url) {
    try {
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) throw new Error();
    } catch {
      errors.attachmentUrl = "Link must start with http:// or https://";
    }
  }

  return errors;
}
