import { BrowserRouter, Routes, Route } from "react-router-dom";
import MarkdownPage from "./MarkdownPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default English version at root */}
        <Route index path="/" element={<MarkdownPage isDefaultLang />} />

        {/* Other languages like /fr */}
        <Route path="/:lang" element={<MarkdownPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
