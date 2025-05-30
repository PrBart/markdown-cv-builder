import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

import "./index.css";

const theme = import.meta.env.VITE_CV_THEME;
const pageTitle = import.meta.env.VITE_PAGE_TITLE || 'My CV';

const loadThemeStyles = async () => {
  switch (theme) {
    case "retro":
      await import("./themes/retro.css");
      break;
    case "screen":
      await import("./themes/screen.css");
      break;
    case "github":
    default:
      await Promise.all([
        import("github-markdown-css/github-markdown.css"),
        import("./themes/github-markdown-override.css")
      ]);
      break;
  }
};

const init = async () => {
  try {
    await loadThemeStyles();
    document.title = pageTitle;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', pageTitle);
    }
    
    const root = createRoot(document.getElementById("root")!);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } catch (error) {
    console.error("Failed to load styles:", error);
  }
};

init();
