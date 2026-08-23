import { render, type RenderOptions } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { CVRoutes } from "../../src/CVRoutes";

export function renderMarkdownPage(
  initialPath = "/",
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <CVRoutes />
    </MemoryRouter>,
    options,
  );
}
