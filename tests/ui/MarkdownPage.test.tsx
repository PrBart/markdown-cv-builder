/** @vitest-environment happy-dom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import MarkdownPage from "../../src/MarkdownPage";
import { renderMarkdownPage } from "../helpers/renderWithRouter";

const mocks = vi.hoisted(() => ({
  getCV: vi.fn(),
  getDefaultCV: vi.fn(),
  realGetCV: null as null | ((lang: string) => unknown),
  realGetDefaultCV: null as null | (() => unknown),
  realSupportedLanguages: null as string[] | null,
  supportedLanguagesOverride: null as string[] | null,
}));

vi.mock("../../src/lib/loadMarkdownCVs", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../src/lib/loadMarkdownCVs")>();

  mocks.realGetCV = actual.getCV;
  mocks.realGetDefaultCV = actual.getDefaultCV;
  mocks.realSupportedLanguages = actual.supportedLanguages;
  mocks.getCV.mockImplementation(actual.getCV);
  mocks.getDefaultCV.mockImplementation(actual.getDefaultCV);

  return {
    ...actual,
    getCV: (...args: Parameters<typeof actual.getCV>) => mocks.getCV(...args),
    getDefaultCV: (...args: Parameters<typeof actual.getDefaultCV>) =>
      mocks.getDefaultCV(...args),
    get supportedLanguages() {
      return (
        mocks.supportedLanguagesOverride ?? mocks.realSupportedLanguages ?? []
      );
    },
  };
});

const soloCV = {
  lang: "en",
  label: "English",
  default: true,
  printLabel: "Print CV",
  content: "# Solo Developer",
};

afterEach(() => {
  cleanup();
  mocks.supportedLanguagesOverride = null;
  mocks.getCV.mockReset();
  mocks.getDefaultCV.mockReset();
  if (mocks.realGetCV) {
    mocks.getCV.mockImplementation(mocks.realGetCV);
  }
  if (mocks.realGetDefaultCV) {
    mocks.getDefaultCV.mockImplementation(mocks.realGetDefaultCV);
  }
});

describe("MarkdownPage", () => {
  beforeEach(() => {
    if (mocks.realGetCV) {
      mocks.getCV.mockImplementation(mocks.realGetCV);
    }
    if (mocks.realGetDefaultCV) {
      mocks.getDefaultCV.mockImplementation(mocks.realGetDefaultCV);
    }
  });

  it("renders the default English CV at /", () => {
    const { container } = renderMarkdownPage("/");

    expect(container.querySelector("h1")?.textContent).toBe("John Doe");
    expect(container.querySelector(".print-button")?.textContent).toBe(
      "Print / Save PDF",
    );
  });

  it("falls back to defaultLang when rendered without isDefaultLang on /", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<MarkdownPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(container.querySelector("h1")?.textContent).toBe("John Doe");
  });

  it("renders the German CV at /de", () => {
    const { container } = renderMarkdownPage("/de");

    expect(container.querySelector("h1")?.textContent).toBe("Max Mustermann");
    expect(container.querySelector(".print-button")?.textContent).toBe(
      "Drucken / PDF speichern",
    );
  });

  it("renders the Russian CV at /ru", () => {
    const { container } = renderMarkdownPage("/ru");

    expect(container.querySelector("h1")?.textContent).toBe("Иван Петров");
  });

  it("shows a language switcher when multiple languages exist", () => {
    const { container } = renderMarkdownPage("/");

    const options = container.querySelectorAll(".fancy-dropdown option");
    expect(options).toHaveLength(3);
    expect(Array.from(options).map((option) => option.textContent)).toEqual([
      "English",
      "Deutsch",
      "Русский",
    ]);
  });

  it("redirects unsupported language routes to the default CV", () => {
    const { container } = renderMarkdownPage("/fr");

    expect(container.querySelector("h1")?.textContent).toBe("John Doe");
    expect(container.querySelector(".error-container")).toBeNull();
  });

  it("updates document title from the active language", () => {
    renderMarkdownPage("/de");

    expect(document.title).toBe("Max Mustermann — Lebenslauf");
  });

  it("hides the language switcher when only one language exists", () => {
    mocks.supportedLanguagesOverride = ["en"];
    mocks.getCV.mockReturnValue(soloCV);
    mocks.getDefaultCV.mockReturnValue(soloCV);

    const { container } = renderMarkdownPage("/");

    expect(container.querySelector(".fancy-dropdown")).toBeNull();
    expect(
      screen.getByRole("button", { name: "Print CV" }),
    ).toBeInTheDocument();
  });

  it("shows an error state when no CV content is available", () => {
    mocks.getCV.mockReturnValue(undefined);
    mocks.getDefaultCV.mockReturnValue(undefined);

    renderMarkdownPage("/");

    expect(screen.getByText(/CV not found/i)).toBeInTheDocument();
    expect(screen.getByText("markdown-source/")).toBeInTheDocument();
  });

  it("renders markdown tables and GFM content", () => {
    mocks.getCV.mockReturnValue({
      ...soloCV,
      content: `
| Skill | Level |
| --- | --- |
| TypeScript | Expert |
`,
    });
    mocks.getDefaultCV.mockReturnValue(soloCV);

    const { container } = renderMarkdownPage("/");

    expect(container.querySelector("table")).not.toBeNull();
    expect(container.querySelector("th")?.textContent).toBe("Skill");
  });
});
