/** @vitest-environment happy-dom */

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, useLocation } from "react-router-dom";

import { CVRoutes } from "../../src/CVRoutes";

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

function renderApp(initialPath = "/") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <LocationDisplay />
      <CVRoutes />
    </MemoryRouter>,
  );
}

afterEach(() => {
  cleanup();
});

describe("LanguageSwitcher", () => {
  it("navigates to localized routes when a language is selected", async () => {
    const user = userEvent.setup();
    renderApp("/");

    await user.selectOptions(screen.getByRole("combobox"), "de");

    expect(screen.getByTestId("location")).toHaveTextContent("/de");
    expect(document.title).toBe("Max Mustermann — Lebenslauf");
  });

  it("navigates back to / when selecting the default language", async () => {
    const user = userEvent.setup();
    renderApp("/de");

    await user.selectOptions(screen.getByRole("combobox"), "en");

    expect(screen.getByTestId("location")).toHaveTextContent("/");
  });
});

describe("print action", () => {
  it("calls window.print when the print button is clicked", async () => {
    const user = userEvent.setup();
    const printMock = vi.fn();
    window.print = printMock;

    renderApp("/");
    await user.click(screen.getByRole("button", { name: "Print / Save PDF" }));

    expect(printMock).toHaveBeenCalledOnce();
  });
});

describe("App routing", () => {
  it("renders markdown content for each supported language route", () => {
    const { container, unmount } = renderApp("/ru");
    expect(container.querySelector("h1")?.textContent).toBe("Иван Петров");
    unmount();

    const german = renderApp("/de");
    expect(german.container.querySelector("h1")?.textContent).toBe(
      "Max Mustermann",
    );
  });
});
