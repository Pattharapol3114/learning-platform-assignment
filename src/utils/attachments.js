// Firestore limits a document to 1 MiB and files are stored inside the document
// as base64 (about 4/3 of their size), so keep the raw total well below that.
export const MAX_ATTACHMENT_BYTES = 700 * 1024;

function attachmentBytes(entry) {
  if (entry instanceof File) return entry.size;
  if (typeof entry?.url === "string" && entry.url.startsWith("data:")) return Math.ceil((entry.url.length * 3) / 4);
  return 0;
}

export function totalAttachmentBytes(files) {
  return (Array.isArray(files) ? files : []).reduce((sum, entry) => sum + attachmentBytes(entry), 0);
}

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Unable to read the selected file."));
    reader.readAsDataURL(file);
  });
}

// File contents live only in `attachments`. The older copies (fileUrl, fileUrls)
// are cleared because PUT merges fields and would otherwise keep them.
export async function buildAttachmentFields(values) {
  const attachmentUrls = (Array.isArray(values.attachmentUrls) ? values.attachmentUrls : [])
    .map((url) => String(url ?? "").trim())
    .filter(Boolean);

  const files = await Promise.all(
    (Array.isArray(values.attachmentFiles) ? values.attachmentFiles : []).map(async (entry) => ({
      type: "file",
      url: entry instanceof File ? await readAsDataUrl(entry) : entry?.url || null,
      name: entry?.name || "Attachment",
    })),
  );

  return {
    attachments: [...attachmentUrls.map((url) => ({ type: "link", url, name: url })), ...files.filter((file) => file.url)],
    attachmentUrls,
    attachmentUrl: attachmentUrls[0] ?? null,
    fileUrls: [],
    fileUrl: null,
    attachmentNames: [],
    attachmentName: null,
  };
}
