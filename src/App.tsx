import { BrowserRouter, Routes, Route } from "react-router-dom";
import MarkdownPage from "./MarkdownPage";

function App() {
  const baseUrl = import.meta.env.BASE_URL;

  return (
    <BrowserRouter basename={baseUrl}>
      <Routes>
        {/* Default version at root */}
        <Route index path="/" element={<MarkdownPage isDefaultLang />} />

        {/* Other languages like /fr or /es */}
        <Route path="/:lang" element={<MarkdownPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
