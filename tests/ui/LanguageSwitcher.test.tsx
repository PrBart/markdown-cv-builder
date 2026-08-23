/** @vitest-environment happy-dom */

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, useLocation } from "react-router-dom";

const loadMarkdownCVsMock = vi.hoisted(() => ({
  defaultLang: "en",
  supportedLanguages: ["en", "xx"],
  cvByLang: {
    en: {
      lang: "en",
      label: "English",
      default: true,
      printLabel: "Print",
      content: "# EN",
    },
  },
}));

vi.mock("../../src/lib/loadMarkdownCVs", () => loadMarkdownCVsMock);

import LanguageSwitcher from "../../src/LanguageSwitcher";

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("LanguageSwitcher", () => {
  it("falls back to the lang code when label metadata is missing", () => {
    render(
      <MemoryRouter>
        <LanguageSwitcher currentLang="en" />
      </MemoryRouter>,
    );

    expect(screen.getByRole("option", { name: "English" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "xx" })).toBeInTheDocument();
  });

  it("navigates to / when selecting the default language", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/xx"]}>
        <LocationDisplay />
        <LanguageSwitcher currentLang="xx" />
      </MemoryRouter>,
    );

    await user.selectOptions(screen.getByRole("combobox"), "en");

    expect(screen.getByTestId("location")).toHaveTextContent("/");
  });
});
