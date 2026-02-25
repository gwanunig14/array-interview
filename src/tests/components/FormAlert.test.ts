import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";
import FormAlert from "$lib/components/FormAlert.svelte";

describe("FormAlert – variant styles", () => {
  it("applies alert--success class for the success variant", () => {
    const { container } = render(FormAlert, {
      variant: "success",
      message: "Done",
    });
    expect(container.querySelector(".alert--success")).toBeInTheDocument();
    expect(container.querySelector(".alert--error")).not.toBeInTheDocument();
  });

  it("applies alert--error class for the error variant", () => {
    const { container } = render(FormAlert, {
      variant: "error",
      message: "Failed",
    });
    expect(container.querySelector(".alert--error")).toBeInTheDocument();
    expect(container.querySelector(".alert--success")).not.toBeInTheDocument();
  });

  it('sets aria-live="polite" for success variant', () => {
    const { container } = render(FormAlert, {
      variant: "success",
      message: "Done",
    });
    const el = container.querySelector(".alert");
    expect(el).toHaveAttribute("aria-live", "polite");
  });

  it('sets aria-live="assertive" for error variant', () => {
    const { container } = render(FormAlert, {
      variant: "error",
      message: "Failed",
    });
    const el = container.querySelector(".alert");
    expect(el).toHaveAttribute("aria-live", "assertive");
  });
});

describe("FormAlert – content", () => {
  it("renders the message text", () => {
    render(FormAlert, { variant: "error", message: "Please fix the errors" });
    expect(screen.getByText("Please fix the errors")).toBeInTheDocument();
  });

  it("renders the title when provided", () => {
    render(FormAlert, {
      variant: "success",
      title: "Transfer complete",
      message: "",
    });
    expect(screen.getByText("Transfer complete")).toBeInTheDocument();
  });

  it("does not render a title paragraph when title is empty", () => {
    const { container } = render(FormAlert, {
      variant: "success",
      title: "",
      message: "ok",
    });
    // Only the message paragraph, no title paragraph
    expect(container.querySelector(".alert__title")).not.toBeInTheDocument();
  });

  it('renders the refId with "Reference:" prefix when provided', () => {
    render(FormAlert, { variant: "success", message: "", refId: "TRF-12345" });
    expect(screen.getByText(/Reference:/)).toBeInTheDocument();
    expect(screen.getByText("TRF-12345")).toBeInTheDocument();
  });

  it("does not render the reference line when refId is empty", () => {
    const { container } = render(FormAlert, {
      variant: "success",
      message: "",
      refId: "",
    });
    expect(container.querySelector(".alert__ref")).not.toBeInTheDocument();
  });

  it("applies the id attribute when provided", () => {
    const { container } = render(FormAlert, {
      variant: "error",
      message: "err",
      id: "form-error",
    });
    const el = container.querySelector("#form-error");
    expect(el).toBeInTheDocument();
  });

  it('has role="alert"', () => {
    render(FormAlert, { variant: "error", message: "x" });
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
