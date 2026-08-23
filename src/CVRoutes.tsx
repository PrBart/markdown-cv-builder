import { Route, Routes } from "react-router-dom";

import MarkdownPage from "./MarkdownPage";

export function CVRoutes() {
  return (
    <Routes>
      <Route index element={<MarkdownPage isDefaultLang />} />
      <Route path="/:lang" element={<MarkdownPage />} />
    </Routes>
  );
}
