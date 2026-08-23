import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { applySiteMeta } from "./lib/applySiteMeta";
import { getDefaultCV, getSiteTheme } from "./lib/loadMarkdownCVs";

import "./index.css";

const loadThemeStyles = async (theme: ReturnType<typeof getSiteTheme>) => {
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
        import("./themes/github-markdown-override.css"),
      ]);
      break;
  }
};

const init = async () => {
  try {
    const defaultCV = getDefaultCV();
    const theme = getSiteTheme();

    await loadThemeStyles(theme);

    if (defaultCV) {
      applySiteMeta(defaultCV);
    }

    const root = createRoot(document.getElementById("root")!);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } catch (error) {
    console.error("Failed to initialize app:", error);
    const root = document.getElementById("root");
    if (root) {
      const fallback = document.createElement("div");
      fallback.className = "error-container";
      fallback.textContent =
        "Failed to initialize the app. Check the console for details.";
      root.replaceChildren(fallback);
    }
  }
};

init();
