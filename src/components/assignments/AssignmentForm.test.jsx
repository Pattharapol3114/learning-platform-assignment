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
