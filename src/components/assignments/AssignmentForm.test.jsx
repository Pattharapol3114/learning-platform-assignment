import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import AssignmentForm from "./AssignmentForm";

const cohorts = [{ id: "sec-1", name: "CS101 - Section A" }];

function renderForm(props = {}) {
  const onSubmit = vi.fn();
  render(
    <AssignmentForm cohorts={cohorts} cohortsLoading={false} submitting={false} onSubmit={onSubmit} onCancel={vi.fn()} {...props} />,
  );
  return { onSubmit, user: userEvent.setup() };
}

describe("AssignmentForm", () => {
  it("blocks submission and shows errors when required fields are empty", async () => {
    const { onSubmit, user } = renderForm();

    await user.click(screen.getByRole("button", { name: "Create Assignment" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("Please complete all required fields");
    expect(screen.getByText("Please enter a title")).toBeInTheDocument();
  });

  it("submits the values once every required field is valid", async () => {
    const { onSubmit, user } = renderForm();

    await user.type(screen.getByLabelText(/Title/), "Assignment 2");
    await user.selectOptions(screen.getByLabelText(/Section/), "sec-1");
    await user.type(screen.getByLabelText(/Due date/), "2099-12-31T23:59");
    await user.type(screen.getByLabelText(/Description/), "Write tests");
    await user.type(screen.getByLabelText(/Grading criteria/), "Passes CI");
    await user.click(screen.getByRole("button", { name: "Create Assignment" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Assignment 2", cohortId: "sec-1", dueDate: "2099-12-31T23:59" }),
    );
  });

  it("accepts a file attachment and includes it in the submit payload", async () => {
    const { onSubmit, user } = renderForm();
    const file = new File(["hello"], "rubric.pdf", { type: "application/pdf" });

    await user.type(screen.getByLabelText(/Title/), "Assignment 3");
    await user.selectOptions(screen.getByLabelText(/Section/), "sec-1");
    await user.type(screen.getByLabelText(/Due date/), "2099-12-31T23:59");
    await user.type(screen.getByLabelText(/Description/), "Submit report");
    await user.type(screen.getByLabelText(/Grading criteria/), "Passes review");
    await user.upload(screen.getByLabelText(/Attachment file/i), file);
    await user.click(screen.getByRole("button", { name: "Create Assignment" }));

    expect(screen.getByText("rubric.pdf")).toBeInTheDocument();
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ title: "Assignment 3", attachmentFile: file }));
  });

  it("preserves a manually entered attachment link when a file is uploaded afterwards", async () => {
    const { onSubmit, user } = renderForm();
    const file = new File(["hello"], "rubric.pdf", { type: "application/pdf" });

    await user.type(screen.getByLabelText(/Title/), "Assignment 3");
    await user.selectOptions(screen.getByLabelText(/Section/), "sec-1");
    await user.type(screen.getByLabelText(/Due date/), "2099-12-31T23:59");
    await user.type(screen.getByLabelText(/Description/), "Submit report");
    await user.type(screen.getByLabelText(/Grading criteria/), "Passes review");
    await user.type(screen.getByLabelText(/Attachment link/i), "https://example.com/rubric.pdf");
    await user.upload(screen.getByLabelText(/Attachment file/i), file);
    await user.click(screen.getByRole("button", { name: "Create Assignment" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Assignment 3",
        attachmentUrl: "https://example.com/rubric.pdf",
        attachmentFile: file,
      }),
    );
  });

  it("supports multiple attachment links and files in one submission", async () => {
    const { onSubmit, user } = renderForm();
    const fileA = new File(["hello"], "rubric.pdf", { type: "application/pdf" });
    const fileB = new File(["world"], "cover.png", { type: "image/png" });

    await user.type(screen.getByLabelText(/Title/), "Assignment 4");
    await user.selectOptions(screen.getByLabelText(/Section/), "sec-1");
    await user.type(screen.getByLabelText(/Due date/), "2099-12-31T23:59");
    await user.type(screen.getByLabelText(/Description/), "Submit report");
    await user.type(screen.getByLabelText(/Grading criteria/), "Passes review");

    await user.type(screen.getAllByPlaceholderText("https://...")[0], "https://example.com/rubric");
    await user.click(screen.getByRole("button", { name: /Add another link/i }));
    await user.type(screen.getAllByPlaceholderText("https://...")[1], "https://example.com/guide");
    await user.upload(screen.getByLabelText(/Attachment file/i), [fileA, fileB]);
    await user.click(screen.getByRole("button", { name: "Create Assignment" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Assignment 4",
        attachmentUrls: ["https://example.com/rubric", "https://example.com/guide"],
        attachmentFiles: expect.arrayContaining([
          expect.objectContaining({ name: "rubric.pdf" }),
          expect.objectContaining({ name: "cover.png" }),
        ]),
      }),
    );
  });

  it("keeps focus in the attachment link field while typing", async () => {
    const { user } = renderForm();
    const input = screen.getByPlaceholderText("https://...");

    await user.click(input);
    await user.keyboard("https");

    expect(screen.getByPlaceholderText("https://...")).toHaveFocus();
    expect(screen.getByPlaceholderText("https://...")).toHaveValue("https");
  });

  it("shows a second link field on the first click of Add another link", async () => {
    const { user } = renderForm();

    await user.click(screen.getByRole("button", { name: /Add another link/i }));

    expect(screen.getAllByPlaceholderText("https://...")).toHaveLength(2);
  });

  it("blocks submission when attached files are over the size limit", async () => {
    const { user } = renderForm();
    const large = new File([new Uint8Array(700 * 1024 + 1)], "large.pdf", { type: "application/pdf" });

    await user.upload(screen.getByLabelText(/Attachment file/i), large);

    expect(screen.getByText(/700 KB or less in total/)).toBeInTheDocument();
  });

  it("lets an overdue assignment be saved when its due date is left unchanged", async () => {
    const { onSubmit, user } = renderForm({
      submitLabel: "Save Changes",
      initialValues: {
        title: "Old title",
        cohortId: "sec-1",
        description: "d",
        criteria: "c",
        dueDate: "2020-01-01T09:00",
        attachmentUrl: "",
      },
    });

    await user.clear(screen.getByLabelText(/Title/));
    await user.type(screen.getByLabelText(/Title/), "Fixed title");
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ title: "Fixed title", dueDate: "2020-01-01T09:00" }));
  });
});
