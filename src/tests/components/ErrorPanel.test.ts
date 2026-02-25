import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";
import ErrorPanel from "$lib/components/ErrorPanel.svelte";

describe("ErrorPanel", () => {
  it("renders the title prop", () => {
    render(ErrorPanel, { title: "Something broke" });
    expect(screen.getByText("Something broke")).toBeInTheDocument();
  });

  it("renders the message prop when provided", () => {
    render(ErrorPanel, { title: "Error", message: "Details here" });
    expect(screen.getByText("Details here")).toBeInTheDocument();
  });

  it("does not render a message paragraph when message is empty", () => {
    render(ErrorPanel, { title: "Error", message: "" });
    // Only the title paragraph should exist inside the panel
    const alert = screen.getByRole("alert");
    expect(alert.querySelectorAll("p")).toHaveLength(1);
  });

  it('has role="alert"', () => {
    render(ErrorPanel, { title: "Oops" });
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("applies the error styling class state-panel--error", () => {
    const { container } = render(ErrorPanel, { title: "Oops" });
    expect(container.querySelector(".state-panel--error")).toBeInTheDocument();
  });

  it("falls back to a default title when none is given", () => {
    render(ErrorPanel, {});
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });
});
