import { describe, expect, it } from "vitest";
import { buildAttachmentFields } from "./attachments";

describe("buildAttachmentFields", () => {
  it("stores file contents only once, in attachments", async () => {
    const file = new File(["hello"], "rubric.pdf", { type: "application/pdf" });

    const fields = await buildAttachmentFields({ attachmentUrls: ["https://x.com/a", " "], attachmentFiles: [file] });

    expect(fields.attachments).toEqual([
      { type: "link", url: "https://x.com/a", name: "https://x.com/a" },
      { type: "file", url: expect.stringMatching(/^data:application\/pdf;base64,/), name: "rubric.pdf" },
    ]);
    expect(fields).toMatchObject({ attachmentUrls: ["https://x.com/a"], attachmentUrl: "https://x.com/a", fileUrls: [], fileUrl: null });
    expect(JSON.stringify(fields).match(/base64,/g)).toHaveLength(1);
  });

  it("keeps an already stored file when editing", async () => {
    const fields = await buildAttachmentFields({ attachmentFiles: [{ name: "old.pdf", url: "data:application/pdf;base64,SGk=" }] });

    expect(fields.attachments).toEqual([{ type: "file", url: "data:application/pdf;base64,SGk=", name: "old.pdf" }]);
  });
});
