import { useNavigate } from "react-router-dom";
import { LanguageNames } from "./consts";
import { defaultLang, supportedLanguages } from "./lib/loadMarkdownCVs";

import "./LanguageSwitcher.css";

type Props = {
  currentLang: string;
};

export default function LanguageSwitcher({ currentLang }: Props) {
  const navigate = useNavigate();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    if (lang === defaultLang) {
      navigate("/");
    } else {
      navigate(`/${lang}`);
    }
  };

  // Ensure defaultLang is listed first
  const orderedLanguages = [
    defaultLang,
    ...supportedLanguages.filter((lang: string) => lang !== defaultLang),
  ];

  return (
    <div className="dropdown-container">
      <select
        className="fancy-dropdown"
        value={currentLang}
        onChange={handleLanguageChange}
      >
        {orderedLanguages.map((lang) => (
          <option key={lang} value={lang}>
            {LanguageNames[lang as keyof typeof LanguageNames] ?? lang}
          </option>
        ))}
      </select>
    </div>
  );
}
