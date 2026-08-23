import { useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Navigate, useParams } from "react-router-dom";

import LanguageSwitcher from "./LanguageSwitcher";
import { applySiteMeta } from "./lib/applySiteMeta";
import {
  defaultLang,
  getCV,
  getDefaultCV,
  supportedLanguages,
} from "./lib/loadMarkdownCVs";

import "./MarkdownPage.css";

type Props = {
  isDefaultLang?: boolean;
};

export default function MarkdownPage({ isDefaultLang }: Props) {
  const { lang } = useParams<{ lang: string }>();
  const currentLang = isDefaultLang ? defaultLang : (lang ?? defaultLang);
  const cv = useMemo(() => getCV(currentLang), [currentLang]);
  const defaultCV = useMemo(() => getDefaultCV(), []);

  useEffect(() => {
    if (cv) {
      applySiteMeta(cv, defaultCV);
    }
  }, [cv, defaultCV]);

  if (lang && !supportedLanguages.includes(lang)) {
    return <Navigate to="/" replace />;
  }

  if (!cv) {
    return (
      <div className="error-container">
        CV not found. Add a markdown file with frontmatter in{" "}
        <code>markdown-source/</code>.
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="markdown-body markdown-page">
        <div className="top-buttons-container no-print">
          <div className="language-selector">
            {supportedLanguages.length > 1 && (
              <LanguageSwitcher currentLang={currentLang} />
            )}
            <div className="print-button-container">
              <button
                className="print-button no-print"
                onClick={() => window.print()}
              >
                {cv.printLabel}
              </button>
            </div>
          </div>
        </div>

        <ReactMarkdown remarkPlugins={[remarkGfm]}>{cv.content}</ReactMarkdown>
      </div>
    </div>
  );
}
